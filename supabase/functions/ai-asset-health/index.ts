import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { assetId } = await req.json();

    if (!assetId) {
      return new Response(
        JSON.stringify({ error: 'Missing assetId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch asset metadata from Supabase
    const { data: asset, error: assetErr } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .maybeSingle();

    if (!asset || assetErr) {
      return new Response(
        JSON.stringify({ error: 'Asset not found or database read failure' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch historical maintenance and allocation logs
    const { data: maintenanceLogs } = await supabase
      .from('maintenance_requests')
      .select('id, issue_details, priority, status, created_at')
      .eq('asset_id', assetId);

    const { data: allocLogs } = await supabase
      .from('allocation_history')
      .select('id, details, created_at')
      .eq('asset_id', assetId);

    const maintList = maintenanceLogs || [];
    const allocList = allocLogs || [];

    // 3. Compute baseline deterministic factors (0 - 100)
    // Age score: older = lower score
    let ageScore = 85;
    if (asset.acquisition_date) {
      const yearsOld = (new Date().getTime() - new Date(asset.acquisition_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (yearsOld > 4) ageScore = 45;
      else if (yearsOld > 2) ageScore = 65;
      else if (yearsOld > 1) ageScore = 78;
      else ageScore = 92;
    }

    // Maintenance frequency factor: more issues = lower score
    let maintFreqScore = 95;
    const maintCount = maintList.length;
    if (maintCount >= 4) maintFreqScore = 30;
    else if (maintCount === 3) maintFreqScore = 50;
    else if (maintCount === 2) maintFreqScore = 70;
    else if (maintCount === 1) maintFreqScore = 85;

    // Condition trend factor
    let condScore = 80;
    const conditionUpper = (asset.condition || 'GOOD').toUpperCase();
    if (conditionUpper === 'POOR') condScore = 35;
    else if (conditionUpper === 'FAIR') condScore = 60;
    else if (conditionUpper === 'GOOD' || conditionUpper === 'EXCELLENT') condScore = 90;

    // Usage intensity factor based on allocation frequency and status
    let usageScore = 85;
    if (asset.status === 'UNDER_MAINTENANCE') usageScore = 40;
    else if (allocList.length > 5) usageScore = 65;
    else if (asset.status === 'ALLOCATED') usageScore = 80;

    // Weighted baseline health score calculation
    let calculatedHealth = Math.round(
      (ageScore * 0.25) +
      (maintFreqScore * 0.35) +
      (condScore * 0.25) +
      (usageScore * 0.15)
    );
    calculatedHealth = Math.max(5, Math.min(100, calculatedHealth));

    // Determine Risk Level
    let riskLevel = 'LOW';
    if (calculatedHealth < 40) riskLevel = 'CRITICAL';
    else if (calculatedHealth < 60) riskLevel = 'HIGH';
    else if (calculatedHealth < 80) riskLevel = 'MEDIUM';

    // 4. Call Gemini AI API for predictive forecasting & refined scores if API key exists
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    let predictionText = `Based on current operational metrics (${maintCount} maintenance incidents, condition: ${asset.condition || 'Good'}), this ${asset.category_name || 'asset'} demonstrates expected wear. Continued standard preventative checks recommended.`;

    if (geminiKey) {
      const prompt = `You are a predictive asset reliability engineer analyzing an enterprise asset.
Asset: ${asset.name} (${asset.category_name})
Tag: ${asset.tag} | Condition: ${asset.condition} | Current Status: ${asset.status}
Acquisition Date: ${asset.acquisition_date || 'Unknown'} | Cost: ${asset.acquisition_cost || 'Unknown'}
Maintenance History (${maintCount} records):
${maintList.map(m => `- [${m.priority}] ${m.issue_details} (${m.status})`).join('\n') || 'No maintenance issues recorded.'}
Allocation History (${allocList.length} records):
${allocList.map(a => `- ${a.details}`).join('\n') || 'Standard allocation pattern.'}

Our deterministic model calculated:
- Overall Health Score: ${calculatedHealth}/100
- Risk Level: ${riskLevel}
- Age Score: ${ageScore}/100
- Maintenance Reliability: ${maintFreqScore}/100
- Condition Score: ${condScore}/100
- Usage Intensity Score: ${usageScore}/100

Please verify and adjust these scores slightly if the maintenance history reveals critical chronic faults (e.g. repeated motherboard failures or overheating).
Respond ONLY with valid JSON exactly matching this format:
{
  "healthScore": ${calculatedHealth},
  "riskLevel": "${riskLevel}",
  "factors": {
    "age_score": ${ageScore},
    "maintenance_frequency": ${maintFreqScore},
    "condition_trend": ${condScore},
    "usage_intensity": ${usageScore}
  },
  "prediction": "Concise 2-sentence predictive forecast specifying estimated remaining optimal service life (e.g. 'Likely to require major component overhaul or replacement within 4-6 months given chronic thermal stress.')"
}`;

      try {
        const aiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.25,
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const textContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textContent) {
            const parsed = JSON.parse(textContent.replace(/```json\n?|```/g, '').trim());
            if (typeof parsed.healthScore === 'number') calculatedHealth = Math.max(0, Math.min(100, parsed.healthScore));
            if (parsed.riskLevel) riskLevel = parsed.riskLevel;
            if (parsed.prediction) predictionText = parsed.prediction;
            if (parsed.factors) {
              ageScore = parsed.factors.age_score || ageScore;
              maintFreqScore = parsed.factors.maintenance_frequency || maintFreqScore;
              condScore = parsed.factors.condition_trend || condScore;
              usageScore = parsed.factors.usage_intensity || usageScore;
            }
          }
        } else {
          console.error("Gemini API returned error status:", aiResponse.status);
        }
      } catch (aiErr) {
        console.error("Error during Gemini AI invocation:", aiErr);
      }
    } else {
      // Enhance deterministic prediction text based on specific risk
      if (riskLevel === 'CRITICAL') {
        predictionText = `URGENT: High probability of catastrophic failure or significant downtime within 1-2 months due to repeated maintenance requests and poor condition. Immediate replacement or full overhaul advised.`;
      } else if (riskLevel === 'HIGH') {
        predictionText = `Asset reliability is degrading faster than standard expectations. Likely to require targeted component replacement within 3-4 months to prevent operational disruption.`;
      }
    }

    const finalPayload = {
      asset_id: assetId,
      health_score: calculatedHealth,
      risk_level: riskLevel,
      factors: {
        age_score: ageScore,
        maintenance_frequency: maintFreqScore,
        condition_trend: condScore,
        usage_intensity: usageScore
      },
      prediction_text: predictionText,
      last_calculated_at: new Date().toISOString()
    };

    // 5. Upsert into ai_asset_health_scores table
    if (supabaseUrl) {
      try {
        await supabase
          .from('ai_asset_health_scores')
          .upsert(finalPayload, { onConflict: 'asset_id' });
      } catch (upsertErr) {
        console.warn("Could not upsert health score into Supabase:", upsertErr);
      }
    }

    return new Response(JSON.stringify({
      healthScore: calculatedHealth,
      riskLevel: riskLevel,
      factors: finalPayload.factors,
      prediction: predictionText,
      lastCalculatedAt: finalPayload.last_calculated_at
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error("Unhandled error in ai-asset-health edge function:", err);
    return new Response(JSON.stringify({
      healthScore: 75,
      riskLevel: "MEDIUM",
      factors: { age_score: 75, maintenance_frequency: 75, condition_trend: 75, usage_intensity: 75 },
      prediction: "Asset health baseline estimated during temporary diagnostic service interruption. Standard inspection schedule applies.",
      error: true
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
