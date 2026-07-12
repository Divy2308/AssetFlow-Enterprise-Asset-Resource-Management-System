import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { assetId, issueDescription, requestId } = await req.json();

    if (!assetId && !issueDescription) {
      return new Response(
        JSON.stringify({ error: 'Missing assetId or issueDescription' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check database cache first
    if (requestId && supabaseUrl) {
      const { data: cached } = await supabase
        .from('ai_maintenance_insights')
        .select('*')
        .eq('maintenance_request_id', requestId)
        .maybeSingle();

      if (cached) {
        return new Response(JSON.stringify({
          rootCauseSuggestion: cached.root_cause_suggestion,
          priorityRecommendation: cached.priority_recommendation,
          priorityRationale: cached.priority_rationale,
          preventiveTips: cached.preventive_tips || [],
          isCached: true
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // 2. Fetch asset + past maintenance history from Supabase
    let asset = null;
    let pastMaintenance = [];
    if (assetId && supabaseUrl) {
      const { data: assetData } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .maybeSingle();
      asset = assetData;

      const { data: maintData } = await supabase
        .from('maintenance_requests')
        .select('issue_details, status, created_at')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false })
        .limit(5);
      pastMaintenance = maintData || [];
    }

    // 3. Prepare AI Prompt
    const prompt = `You are an enterprise asset maintenance expert and diagnostic engineer.

Asset Name: ${asset?.name || 'Enterprise Asset'} (${asset?.category_name || 'General Category'})
Tag: ${asset?.tag || 'N/A'}
Condition: ${asset?.condition || 'Unknown'}
Location: ${asset?.location || 'Unknown'}
Reported Issue / Symptom: ${issueDescription}
Previous Maintenance Records (last 5):
${pastMaintenance.map(m => `- ${m.issue_details} (${m.status})`).join('\n') || 'None recorded'}

Analyze the reported issue and provide a structured JSON response EXACTLY matching this format (no markdown formatting, purely valid JSON string):
{
  "rootCauseSuggestion": "Detailed 2-3 sentence technical analysis explaining likely failure mechanism and component stress factors.",
  "priorityRecommendation": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "priorityRationale": "Clear 1 sentence justification for the assigned priority level based on business impact and safety/degradation risk.",
  "preventiveTips": [
    "Specific actionable tip 1 to prevent recurrence",
    "Specific actionable tip 2 regarding maintenance intervals or operation",
    "Specific actionable tip 3 regarding inspection or environmental checks"
  ]
}`;

    // 4. Call Gemini AI API if key is present
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    let parsedResult = null;

    if (geminiKey) {
      try {
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const textContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textContent) {
            parsedResult = JSON.parse(textContent.replace(/```json\n?|```/g, '').trim());
          }
        } else {
          console.error("Gemini API error status:", aiResponse.status, await aiResponse.text());
        }
      } catch (aiErr) {
        console.error("Failed to parse or invoke Gemini API:", aiErr);
      }
    }

    // 5. Fallback diagnostic calculation if AI API is unavailable/unconfigured
    if (!parsedResult) {
      const issueLower = (issueDescription || '').toLowerCase();
      let priority = 'MEDIUM';
      let rationale = 'Default operational priority assigned to ensure timely assessment and resolution.';
      let rootCause = `Diagnostic analysis indicates component wear or operational stress related to: "${issueDescription}". Given the asset's history and classification, mechanical/electrical fatigue or environmental exposure is the primary suspected root cause.`;
      
      if (issueLower.includes('bulb') || issueLower.includes('screen') || issueLower.includes('power') || issueLower.includes('smoke') || issueLower.includes('leak') || issueLower.includes('broken')) {
        priority = 'HIGH';
        rationale = 'Issue directly impacts device functionality and workflow productivity, requiring urgent technical intervention.';
      }
      if (issueLower.includes('fire') || issueLower.includes('hazard') || issueLower.includes('spark') || issueLower.includes('critical') || issueLower.includes('server down')) {
        priority = 'CRITICAL';
        rationale = 'Potential safety hazard or complete operational stoppage necessitating immediate emergency maintenance.';
      }
      if (issueLower.includes('scratch') || issueLower.includes('loose') || issueLower.includes('noise') || issueLower.includes('flicker') || issueLower.includes('slow')) {
        priority = 'LOW';
        rationale = 'Minor cosmetic or early performance symptom with low immediate risk to primary departmental operations.';
      }

      parsedResult = {
        rootCauseSuggestion: rootCause,
        priorityRecommendation: priority,
        priorityRationale: rationale,
        preventiveTips: [
          `Implement bi-weekly diagnostic checks for ${asset?.category_name || 'this asset category'} to detect early wear.`,
          "Ensure operating environment meets manufacturer temperature and ventilation specifications.",
          "Document all component replacements and stress indicators in the asset allocation history."
        ]
      };
    }

    // 6. Cache result in Supabase table for future instant queries
    if (requestId && supabaseUrl) {
      try {
        await supabase.from('ai_maintenance_insights').insert({
          asset_id: assetId || null,
          maintenance_request_id: requestId,
          issue_description: issueDescription,
          root_cause_suggestion: parsedResult.rootCauseSuggestion,
          priority_recommendation: parsedResult.priorityRecommendation,
          priority_rationale: parsedResult.priorityRationale,
          preventive_tips: parsedResult.preventiveTips
        });
      } catch (cacheErr) {
        console.warn("Could not cache insight into database:", cacheErr);
      }
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Unhandled error in ai-maintenance-insight edge function:", err);
    return new Response(JSON.stringify({
      rootCauseSuggestion: "System experienced a diagnostic processing error. Please inspect the asset manually.",
      priorityRecommendation: "MEDIUM",
      priorityRationale: "Fallback priority assigned during diagnostic interruption.",
      preventiveTips: [
        "Perform standard inspection protocol.",
        "Verify power connections and hardware integrity.",
        "Contact site supervisor or IT helpdesk if issue persists."
      ],
      error: true
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
