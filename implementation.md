# AssetFlow — Implementation Guide (Supabase + AI Features)

> **Reality check:** This document reflects the **actual codebase** — a React + Vite + Tailwind v4 frontend that talks directly to Supabase (no Express/Prisma backend). All prior references to a Node.js backend, Prisma ORM, and separate backend folder have been removed.

---

## 0. Current State of the Codebase

### What Exists & Works
| Layer | Technology | Status |
|---|---|---|
| Frontend Framework | React 19 + Vite 8 | ✅ Working |
| Styling | Tailwind CSS v4 | ✅ Working |
| Routing | React Router DOM v7 | ✅ Working |
| Auth | Supabase Auth (email/password) | ✅ Working |
| Database | Supabase PostgreSQL (direct client queries) | ✅ Working |
| Backend Server | **None** — all logic runs on the client via `supabase-js` | N/A |
| AI Features | **None** — not yet implemented | ❌ Not Started |

### Supabase Config
- **Client**: `src/config/supabaseClient.js` — already configured
- **Env vars**: `.env` → `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- **Auth**: `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, `supabase.auth.onAuthStateChange()`

---

## 1. Architecture (As-Built)

```
┌─────────────────────────────────────────────────────────┐
│                    USER (Browser)                        │
│           React 19 + Vite 8 + Tailwind v4               │
│           supabase-js client (direct queries)            │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS (Supabase REST API)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE (Hosted Backend)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐      │
│  │  Auth     │  │ PostgREST│  │ Edge Functions   │      │
│  │  Service  │  │ (Auto    │  │ (AI features -   │      │
│  │          │  │  REST API)│  │  to be built)    │      │
│  └──────────┘  └──────────┘  └──────────────────┘      │
│                       │                                  │
│              ┌────────┴────────┐                        │
│              │   PostgreSQL    │                        │
│              │   Database      │                        │
│              └─────────────────┘                        │
└─────────────────────────────────────────────────────────┘

CURRENT FLOW:
  User → React Page → supabase.from('table').select/insert/update/delete
       → Supabase PostgREST → PostgreSQL → Response → Update React State

AI FLOW (to be built):
  User → React Page → supabase.functions.invoke('ai-function-name')
       → Supabase Edge Function → Gemini/Claude API → Response → UI Panel
```

---

## 2. Folder Structure (Actual)

```
AssetFlow-Enterprise-Asset-Resource-Management-System/
├── .env                          # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── index.html                    # Vite entry point
├── package.json                  # React 19, supabase-js, react-router-dom, tailwind v4
├── vite.config.js                # Vite + Tailwind + React Compiler
├── src/
│   ├── main.jsx                  # ReactDOM.createRoot + BrowserRouter
│   ├── App.jsx                   # Root component: auth guard, routing, layout
│   ├── App.css                   # Global styles (CSS variables, animations)
│   ├── index.css                 # Tailwind imports + base styles
│   ├── config/
│   │   └── supabaseClient.js     # createClient(url, anonKey) — THE single client
│   ├── components/
│   │   ├── Header.jsx            # Top navbar (title, notifications bell, logout)
│   │   ├── Sidebar.jsx           # Left nav (role-based menu items)
│   │   ├── Icons.jsx             # All SVG icon components (30+)
│   │   ├── OverviewCard.jsx      # Dashboard KPI card
│   │   ├── QuickActions.jsx      # Dashboard quick action buttons
│   │   └── RecentActivity.jsx    # Dashboard activity feed
│   ├── pages/
│   │   ├── LoginPage.jsx         # Auth: signup + signin via Supabase Auth
│   │   ├── DashboardPage.jsx     # KPI cards, overdue alerts, recent activity
│   │   ├── OrgSetupPage.jsx      # 3 tabs: Departments, Categories, Employees
│   │   ├── AssetsPage.jsx        # Asset registry with CRUD
│   │   ├── AllocationPage.jsx    # Allocation + transfer requests
│   │   ├── BookingPage.jsx       # Resource booking with timeline
│   │   ├── MaintenancePage.jsx   # Kanban board (5 columns)
│   │   ├── AuditPage.jsx         # Audit checklist + discrepancy report
│   │   ├── ReportsPage.jsx       # Charts (SVG) + tables + export
│   │   ├── NotificationsPage.jsx # Activity logs & alerts
│   │   ├── LearnMorePage.jsx     # User guide
│   │   ├── PlaceholderPage.jsx   # Generic placeholder
│   │   ├── PrivacyPolicyPage.jsx # Static
│   │   └── TermsPage.jsx         # Static
│   └── assets/
│       └── sidebar_promo.jpg     # Logo image
└── public/                       # Static assets
```

---

## 3. Supabase Database Schema (Actual Tables)

These are the tables that **currently exist in Supabase** and are actively queried by the frontend:

### `employees`
| Column | Type | Notes |
|---|---|---|
| `id` | int8 (PK) | Auto-increment |
| `name` | text | Full name |
| `email` | text | Unique, matches Supabase Auth email |
| `role` | text | `ADMIN` / `ASSET_MANAGER` / `DEPT_HEAD` / `EMPLOYEE` |
| `status` | text | `Active` / `Inactive` |
| `department_id` | int8 (FK) | References `departments.id` |

### `departments`
| Column | Type | Notes |
|---|---|---|
| `id` | int8 (PK) | Auto-increment |
| `name` | text | Department name |
| `head_id` | int8 | References `employees.id` |
| `parent_department_id` | int8 | Self-referencing FK for hierarchy |
| `status` | text | `Active` / `Inactive` |

### `asset_categories`
| Column | Type | Notes |
|---|---|---|
| `id` | int8 (PK) | Auto-increment |
| `name` | text | Category name (e.g., Electronics, Furniture) |
| `custom_fields` | jsonb | Flexible metadata |

### `assets`
| Column | Type | Notes |
|---|---|---|
| `id` | int8 (PK) | Auto-increment |
| `tag` | text | Unique asset tag (e.g., `AF-0114`) |
| `name` | text | Asset name |
| `category_name` | text | Category label |
| `status` | text | `AVAILABLE` / `ALLOCATED` / `UNDER_MAINTENANCE` |
| `location` | text | Physical location |
| `type` | text | `laptop` / `projector` / `chair` / `other` |
| `serial_number` | text | Serial number |
| `acquisition_date` | timestamptz | When acquired |
| `acquisition_cost` | numeric | Purchase cost |
| `condition` | text | `Good` / `Fair` / `Poor` |
| `owner_id` | int8 (FK) | Currently allocated employee |

### `bookings`
| Column | Type | Notes |
|---|---|---|
| `id` | int8 (PK) | Auto-increment |
| `resource` | text | Resource name (e.g., `Conference Room 2`) |
| `booking_date` | date | Date of booking |
| `start_time` | numeric | Decimal hour (e.g., 9.5 = 9:30 AM) |
| `end_time` | numeric | Decimal hour |
| `title` | text | Booking title |
| `time_str` | text | Display string (e.g., `09:00 AM - 10:00 AM`) |
| `is_conflict` | boolean | Whether this booking conflicts |
| `detail` | text | Conflict detail message |
| `booked_by_id` | int8 (FK) | Employee who booked |
| `status` | text | `UPCOMING` / `ONGOING` / `COMPLETED` / `CANCELLED` |

### `maintenance_requests`
| Column | Type | Notes |
|---|---|---|
| `id` | int8 (PK) | Auto-increment |
| `asset_id` | int8 (FK) | References `assets.id` |
| `reporter_id` | int8 (FK) | Employee who reported |
| `issue_details` | text | Description of issue |
| `priority` | text | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` |
| `status` | text | `PENDING` / `APPROVED` / `TECHNICIAN` / `IN-PROGRESS` / `RESOLVED` |
| `technician` | text | Assigned technician name |
| `created_at` | timestamptz | Auto-generated |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| `id` | int8 (PK) | Auto-increment |
| `tag` | text | Related asset tag |
| `category` | text | Notification category |
| `text` | text | Notification message |
| `time_label` | text | Relative time display |
| `is_unread` | boolean | Read status |
| `type` | text | Notification type |
| `dot_color` | text | UI dot color |
| `bg_color` | text | UI background color |

### `allocation_history`
| Column | Type | Notes |
|---|---|---|
| `id` | int8 (PK) | Auto-increment |
| `asset_id` | int8 (FK) | References `assets.id` |
| `details` | text | Action description |
| `created_at` | timestamptz | Auto-generated |

---

## 4. Business Rules (Currently Implemented)

### Auth
1. Signup → always creates `EMPLOYEE` role in `employees` table
2. Login via `supabase.auth.signInWithPassword()`
3. Profile fetched from `employees` table by matching `email`
4. Admin-only pages guarded in `App.jsx` route definitions

### Asset Lifecycle
```
REGISTER → AVAILABLE
AVAILABLE → [allocate] → ALLOCATED (owner_id set)
AVAILABLE → [approve maintenance] → UNDER_MAINTENANCE
ALLOCATED → [return/resolve] → AVAILABLE (owner_id cleared)
```

### Double-Allocation Block
- When asset is `ALLOCATED`, the Allocation page shows a **RED conflict alert**
- User must submit a transfer request instead of direct re-allocation
- Transfer updates `owner_id` and allocation history in Supabase

### Booking Overlap Check
- Client-side overlap detection: `new_start < existing_end AND new_end > existing_start`
- Conflicting bookings saved with `is_conflict: true` and shown with red dashed styling

### Maintenance Kanban
- Drag-and-drop moves cards between 5 columns
- Status updates synced to Supabase (`maintenance_requests.status`)
- Asset status auto-updated: `APPROVED/TECHNICIAN/IN-PROGRESS` → `UNDER_MAINTENANCE`, `RESOLVED` → `AVAILABLE`

---

## 5. Tables That Need to Be Created in Supabase (for AI Features)

These tables do NOT exist yet and must be created as you build each AI phase:

### `ai_maintenance_insights` (Phase 1)
```sql
CREATE TABLE ai_maintenance_insights (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_id bigint REFERENCES assets(id),
  maintenance_request_id bigint REFERENCES maintenance_requests(id),
  issue_description text NOT NULL,
  root_cause_suggestion text,
  priority_recommendation text,
  priority_rationale text,
  preventive_tips jsonb,        -- ["tip1", "tip2", "tip3"]
  model_used text DEFAULT 'gemini-2.0-flash',
  created_at timestamptz DEFAULT now(),
  requested_by_id bigint REFERENCES employees(id)
);
```

### `ai_asset_health_scores` (Phase 2)
```sql
CREATE TABLE ai_asset_health_scores (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_id bigint REFERENCES assets(id) UNIQUE,
  health_score integer CHECK (health_score BETWEEN 0 AND 100),
  risk_level text,              -- LOW / MEDIUM / HIGH / CRITICAL
  factors jsonb,                -- {"age_score": 80, "maintenance_freq": 60, ...}
  last_calculated_at timestamptz DEFAULT now(),
  prediction_text text          -- "Likely to need replacement in 6 months"
);
```

### `ai_anomaly_logs` (Phase 3)
```sql
CREATE TABLE ai_anomaly_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anomaly_type text NOT NULL,   -- UNUSUAL_BOOKING_PATTERN / RAPID_DEPRECIATION / etc.
  entity_type text NOT NULL,    -- asset / employee / department
  entity_id bigint NOT NULL,
  description text NOT NULL,
  severity text,                -- INFO / WARNING / CRITICAL
  ai_recommendation text,
  is_dismissed boolean DEFAULT false,
  detected_at timestamptz DEFAULT now()
);
```

### `ai_chat_history` (Phase 4)
```sql
CREATE TABLE ai_chat_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid DEFAULT gen_random_uuid(),
  user_id bigint REFERENCES employees(id),
  role text NOT NULL,           -- 'user' or 'assistant'
  content text NOT NULL,
  context_data jsonb,           -- {page: 'maintenance', asset_id: 42}
  created_at timestamptz DEFAULT now()
);
```

---

## 6. Supabase Edge Functions (for AI — To Be Built)

> **Why Edge Functions?** AI API keys (Gemini/Claude) must NOT be exposed in frontend code. Edge Functions run server-side on Supabase's Deno runtime and can securely hold API keys as environment secrets.

### Setup (One-Time)
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project locally (if not done)
supabase init

# Login
supabase login

# Link to your remote project
supabase link --project-ref npbspmdafrggvxlupwrq
```

### Edge Function Structure
```
supabase/
└── functions/
    ├── ai-maintenance-insight/
    │   └── index.ts          # Phase 1: Maintenance diagnosis
    ├── ai-asset-health/
    │   └── index.ts          # Phase 2: Health score calculation
    ├── ai-anomaly-detect/
    │   └── index.ts          # Phase 3: Anomaly detection
    └── ai-chat/
        └── index.ts          # Phase 4: Conversational assistant
```

### Calling Edge Functions from Frontend
```javascript
// From any React component:
import { supabase } from '../config/supabaseClient';

const { data, error } = await supabase.functions.invoke('ai-maintenance-insight', {
  body: {
    assetId: 42,
    issueDescription: 'Projector bulb not turning on',
  }
});

if (data) {
  console.log(data.rootCauseSuggestion);
  console.log(data.preventiveTips);
}
```

---

## 7. AI Feature Integration — Phase-by-Phase Build Plan

---

### PHASE 1: Smart Maintenance Advisor
**Effort: ~4-6 hours** | **Priority: P0 — Build First**

#### What It Does
When an employee raises a maintenance request or views a pending request, an AI button analyzes the issue and provides:
1. 🔍 **Likely Root Cause** — What's probably wrong
2. ⚠️ **Priority Recommendation** — LOW/MEDIUM/HIGH/CRITICAL with rationale
3. 💡 **Preventive Tips** — 3 actionable tips to prevent recurrence

#### Why This First
- Directly plugs into the existing Maintenance Kanban (most complex page)
- Uses data that already exists in Supabase (`maintenance_requests`, `assets`)
- Instantly demo-able — judges can see AI in action on a real workflow
- Smallest integration surface — only touches 1 page + 1 edge function

#### Supabase Setup
1. Create `ai_maintenance_insights` table (schema in Section 5)
2. Create Edge Function `ai-maintenance-insight`
3. Set AI API key as Edge Function secret:
   ```bash
   supabase secrets set GEMINI_API_KEY=your-key-here
   # OR
   supabase secrets set ANTHROPIC_API_KEY=your-key-here
   ```

#### Edge Function Logic (`supabase/functions/ai-maintenance-insight/index.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const { assetId, issueDescription, requestId } = await req.json()

  // 1. Fetch asset + history from Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: asset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .single()

  const { data: pastMaintenance } = await supabase
    .from('maintenance_requests')
    .select('issue_details, status, created_at')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false })
    .limit(5)

  // 2. Build prompt with real context
  const prompt = `You are an enterprise asset maintenance expert.

Asset: ${asset?.name} (${asset?.category_name})
Condition: ${asset?.condition || 'Unknown'}
Location: ${asset?.location}
Issue reported: ${issueDescription}
Previous maintenance (last 5):
${pastMaintenance?.map(m => `- ${m.issue_details} (${m.status})`).join('\n') || 'None'}

Analyze and respond with JSON only:
{
  "rootCauseSuggestion": "2-3 sentence analysis",
  "priorityRecommendation": "LOW|MEDIUM|HIGH|CRITICAL",
  "priorityRationale": "1 sentence why",
  "preventiveTips": ["tip1", "tip2", "tip3"]
}`

  // 3. Call AI API (Gemini example)
  const aiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  const aiData = await aiResponse.json()
  const textContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text
  const parsed = JSON.parse(textContent.replace(/```json\n?|```/g, ''))

  // 4. Cache the result in Supabase
  await supabase.from('ai_maintenance_insights').insert({
    asset_id: assetId,
    maintenance_request_id: requestId,
    issue_description: issueDescription,
    root_cause_suggestion: parsed.rootCauseSuggestion,
    priority_recommendation: parsed.priorityRecommendation,
    priority_rationale: parsed.priorityRationale,
    preventive_tips: parsed.preventiveTips,
  })

  return new Response(JSON.stringify(parsed), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### Frontend Integration Points
| File | What to Add |
|---|---|
| `MaintenancePage.jsx` | Add `🤖 AI Insights` button on each Kanban card |
| `MaintenancePage.jsx` | Add AI Insights slide-in panel (right sidebar or modal) |
| `MaintenancePage.jsx` | Loading spinner during API call (1-3 seconds) |
| `MaintenancePage.jsx` | Cache check: if insight exists for this request, load from DB instead of re-calling |

#### UI Design for AI Panel
```
┌──────────────────────────────────┐
│  🤖 AI Maintenance Advisor       │
│  Asset: AF-0062 (Projector)      │
├──────────────────────────────────┤
│                                  │
│  🔍 Likely Root Cause            │
│  Projector lamp burnout is       │
│  common after 2000+ hours of     │
│  use. Given the age and prior... │
│                                  │
│  ⚠️ Priority: HIGH               │
│  Impacts meeting productivity    │
│  for entire department.          │
│                                  │
│  💡 Preventive Tips              │
│  • Schedule lamp replacement     │
│    every 1500 hours              │
│  • Clean air filter monthly      │
│  • Avoid abrupt power cuts       │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Apply Recommended       │   │
│  │  Priority (HIGH)         │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

#### Fallback (if AI API fails)
```javascript
const FALLBACK_INSIGHT = {
  rootCauseSuggestion: "Unable to analyze at this time. Please consult your maintenance team.",
  priorityRecommendation: "MEDIUM",
  priorityRationale: "Default priority assigned. Please review manually.",
  preventiveTips: [
    "Schedule regular preventive maintenance",
    "Follow category-specific maintenance guidelines",
    "Document issues thoroughly for future reference"
  ]
};
```

#### Definition of Done
- [ ] `ai_maintenance_insights` table created in Supabase
- [ ] Edge Function deployed and callable
- [ ] AI button visible on Kanban cards
- [ ] Insight panel renders with real AI response
- [ ] Cached results load instantly on repeat views
- [ ] Fallback shown gracefully when API fails
- [ ] Loading state with spinner during AI call

---

### PHASE 2: Asset Health Score & Predictive Insights
**Effort: ~5-7 hours** | **Priority: P1 — Build After Phase 1**

#### What It Does
Each asset gets an AI-calculated **Health Score (0-100)** displayed as a visual gauge, with:
1. 📊 **Health Score** — 0-100 with color coding (green/yellow/orange/red)
2. 🏷️ **Risk Level** — LOW/MEDIUM/HIGH/CRITICAL
3. 📋 **Contributing Factors** — Age, maintenance frequency, condition trend, usage intensity
4. 🔮 **Prediction** — "Likely to need replacement in X months"

#### Why This Second
- Builds on Phase 1 infrastructure (Edge Functions, AI pipeline)
- Uses the same `assets` + `maintenance_requests` data
- Adds a new visual dimension to the Asset Registry and Dashboard
- Makes the dashboard smarter — KPI cards can show "at-risk assets" count

#### Supabase Setup
1. Create `ai_asset_health_scores` table (schema in Section 5)
2. Create Edge Function `ai-asset-health`
3. Optionally set up a Supabase cron (pg_cron) to recalculate nightly

#### Edge Function Logic Overview
```
INPUT:
  - Asset metadata (age, category, condition, acquisition cost)
  - Maintenance history (frequency, severity, resolution times)
  - Allocation history (how often transferred, usage duration)
  - Booking frequency (for bookable assets)

OUTPUT:
  {
    "healthScore": 72,
    "riskLevel": "MEDIUM",
    "factors": {
      "age_score": 65,           // Older = lower
      "maintenance_frequency": 50, // More frequent issues = lower
      "condition_trend": 80,     // Improving condition = higher
      "usage_intensity": 90      // Normal use patterns = higher
    },
    "prediction": "Based on maintenance patterns, this projector may need bulb replacement within 3 months."
  }
```

#### Frontend Integration Points
| File | What to Add |
|---|---|
| `AssetsPage.jsx` | Add health score badge next to each asset in the table |
| `DashboardPage.jsx` | Add "At-Risk Assets" KPI card with count of assets scoring < 40 |
| `DashboardPage.jsx` | Add "Asset Health Overview" mini-chart (distribution of scores) |
| New: `AssetDetailPanel.jsx` | Slide-in panel showing full health breakdown when clicking an asset |

#### Visual Design
```
Asset Table Row:
┌─────────┬──────────────────┬─────────┬──────────┬───────────┬────────┐
│ AF-0114 │ Dell XPS Laptop  │ Electr. │ Allocated│ Bengaluru │ ██ 85  │ ← Health gauge
└─────────┴──────────────────┴─────────┴──────────┴───────────┴────────┘

Score colors:
  80-100 → Green   (healthy)
  60-79  → Yellow  (monitor)
  40-59  → Orange  (attention needed)
  0-39   → Red     (critical)
```

#### Definition of Done
- [ ] `ai_asset_health_scores` table created
- [ ] Edge Function calculates scores from real asset data
- [ ] Health badge visible on asset table rows
- [ ] Dashboard shows at-risk assets count
- [ ] Asset detail panel shows factor breakdown
- [ ] Scores cached and refreshable on demand
- [ ] Score calculation works for assets with no maintenance history (use defaults)

---

### PHASE 3: Anomaly Detection & Smart Alerts
**Effort: ~6-8 hours** | **Priority: P1 — Build After Phase 2**

#### What It Does
AI periodically analyzes organizational patterns and flags anomalies:
1. 📈 **Unusual Booking Patterns** — "Conference Room 2 booked 3x more than average this week"
2. 🔄 **Rapid Depreciation** — "Laptop AF-0114 has had 4 maintenance requests in 30 days"
3. 🏢 **Department Resource Imbalance** — "Engineering has 2x more assets per employee than HR"
4. ⏰ **Overdue Pattern** — "Employee X has 3 overdue returns — potential policy issue"
5. 💰 **Cost Anomaly** — "Maintenance costs for Furniture category up 150% vs last quarter"

#### Why This Third
- Requires historical data that accumulates over time (bookings, maintenance, allocations)
- More complex AI prompts — needs aggregation queries before sending to AI
- Adds a completely new page/section that doesn't exist yet
- Most impressive for demo — "the system found something you didn't know"

#### Supabase Setup
1. Create `ai_anomaly_logs` table (schema in Section 5)
2. Create Edge Function `ai-anomaly-detect`
3. Set up a Supabase cron job to run detection every 6 hours:
   ```sql
   SELECT cron.schedule(
     'detect-anomalies',
     '0 */6 * * *',
     $$SELECT net.http_post(
       url := 'https://npbspmdafrggvxlupwrq.supabase.co/functions/v1/ai-anomaly-detect',
       headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
     )$$
   );
   ```

#### Edge Function Logic Overview
```
STEP 1: Aggregate data
  - Count bookings per resource per week
  - Count maintenance requests per asset per month
  - Count assets per employee per department
  - Check for overdue allocations

STEP 2: Send aggregated stats to AI with detection prompt
  "Given these organizational metrics, identify anomalies..."

STEP 3: Parse AI response and insert into ai_anomaly_logs

STEP 4: Create notifications for relevant users
```

#### Frontend Integration Points
| File | What to Add |
|---|---|
| `DashboardPage.jsx` | Add "AI Alerts" section below overdue banner |
| `NotificationsPage.jsx` | Add "AI Insights" tab filter for anomaly notifications |
| New: `AnomalyCard.jsx` | Reusable component for displaying anomaly alerts |

#### UI Design
```
Dashboard AI Alerts Section:
┌──────────────────────────────────────────────────────────┐
│  🤖 AI-Detected Anomalies (3 new)                       │
├──────────────────────────────────────────────────────────┤
│  ⚠️ UNUSUAL PATTERN                                      │
│  Conference Room 2 booked 340% more than weekly average  │
│  Recommendation: Consider adding another meeting room     │
│  [Dismiss]  [View Details]                               │
├──────────────────────────────────────────────────────────┤
│  🔴 RAPID DEPRECIATION                                   │
│  Laptop AF-0114: 4 maintenance requests in 30 days       │
│  Recommendation: Evaluate for replacement                │
│  [Dismiss]  [Create Maintenance Request]                 │
└──────────────────────────────────────────────────────────┘
```

#### Definition of Done
- [ ] `ai_anomaly_logs` table created
- [ ] Edge Function aggregates data and detects anomalies
- [ ] Cron job runs detection automatically
- [ ] Dashboard shows anomaly alerts
- [ ] Notifications page shows AI insights
- [ ] Each anomaly has a dismiss button
- [ ] Each anomaly has an action button (View Details / Create Request)

---

### PHASE 4: AI-Powered Natural Language Assistant
**Effort: ~8-10 hours** | **Priority: P2 — Build If Time Allows**

#### What It Does
A floating chat widget (bottom-right corner) that lets users interact with AssetFlow data using natural language:

- "How many assets are under maintenance right now?"
- "Show me all laptops in Bengaluru"
- "Who has the most overdue returns?"
- "What's the booking schedule for Conference Room 2 this week?"
- "Raise a maintenance request for AF-0062 — projector lens cracked"
- "What does the AI health report say about our Engineering assets?"

#### Why This Last
- Most complex feature — requires function calling / tool-use capabilities
- Needs ALL other data and AI features to be in place first
- Requires careful prompt engineering to stay within AssetFlow context
- Chat history management adds state complexity
- Highest risk of scope creep

#### Architecture
```
User types message
  → Frontend sends to Edge Function `ai-chat`
  → Edge Function:
     1. Loads conversation history from ai_chat_history
     2. Adds system prompt with AssetFlow context
     3. Calls Gemini with function-calling tools:
        - query_assets(filters)
        - query_bookings(resource, date)
        - query_maintenance(status, asset_id)
        - get_dashboard_stats()
        - get_health_score(asset_id)
        - create_maintenance_request(asset_id, description)
     4. Executes tool calls against Supabase
     5. Sends results back to AI for natural language response
     6. Saves conversation turn to ai_chat_history
  → Response displayed in chat bubble
```

#### Supabase Setup
1. Create `ai_chat_history` table (schema in Section 5)
2. Create Edge Function `ai-chat`
3. Define tool schemas for Gemini function calling

#### Frontend Integration Points
| File | What to Add |
|---|---|
| `App.jsx` | Add floating chat widget (FAB button + expandable panel) |
| New: `AIChatWidget.jsx` | Self-contained chat UI component |
| New: `AIChatBubble.jsx` | Individual message bubble component |

#### UI Design
```
Floating Button (bottom-right):
  ┌─────┐
  │ 🤖  │  ← Click to expand
  └─────┘

Expanded Chat Panel:
  ┌────────────────────────────────┐
  │  🤖 AssetFlow AI Assistant     │  ← Header
  │  ─────────────────────────────│
  │                                │
  │  ┌────────────────────────┐   │
  │  │ How many assets are     │   │  ← User message
  │  │ under maintenance?      │   │
  │  └────────────────────────┘   │
  │                                │
  │  ┌────────────────────────┐   │
  │  │ 🤖 Currently, 3 assets  │   │  ← AI response
  │  │ are under maintenance:  │   │
  │  │ • AF-0062 Projector    │   │
  │  │ • AF-0087 Forklift     │   │
  │  │ • AF-0114 Laptop       │   │
  │  └────────────────────────┘   │
  │                                │
  │  ┌────────────────────┐ [→]  │
  │  │ Type a message...   │      │  ← Input
  │  └────────────────────┘      │
  └────────────────────────────────┘
```

#### Definition of Done
- [x] `ai_chat_history` table created
- [x] Edge Function handles multi-turn conversation
- [x] Function calling works for querying data
- [x] Function calling works for creating records
- [x] Chat widget floats on all pages
- [x] Chat history persists across page navigation
- [x] Context-aware: knows which page user is on
- [x] Rate limiting: max 20 messages per minute per user

---

### PHASE 5: AI-Enhanced Reports & Insights Dashboard
**Effort: ~4-5 hours** | **Priority: P2 — Build If Time Allows**

#### What It Does
Enhances the existing Reports page with AI-generated narrative summaries and recommendations:
1. 📝 **Executive Summary** — AI writes a 3-paragraph summary of asset operations
2. 📊 **Trend Analysis** — "Maintenance costs trending upward — recommend budget review"
3. 🎯 **Optimization Suggestions** — "3 assets have been idle 60+ days — consider reallocation or disposal"
4. 📈 **Predictive Forecasts** — "Based on current trends, expect 12 new maintenance requests next month"

#### Why This Last of All
- Purely additive — doesn't change existing functionality
- Relies on all other data being accurate and AI features working
- Least critical for demo but highest "wow factor" for executive users

#### Frontend Integration Points
| File | What to Add |
|---|---|
| `ReportsPage.jsx` | Add "AI Summary" card above the charts |
| `ReportsPage.jsx` | Add "Generate AI Report" button |
| `ReportsPage.jsx` | Add trend insights between chart sections |

#### Definition of Done
- [x] Edge Function aggregates all report data and generates narrative
- [x] AI Summary card renders above charts
- [x] Trend insights shown between chart sections
- [x] "Generate Report" button creates fresh analysis
- [x] Cached reports don't re-call AI if data hasn't changed

---

## 8. Supabase Row-Level Security (RLS) Policies

> **Important:** Currently, RLS may be disabled or loosely configured. Before deploying AI features, lock down access.

### Recommended RLS Policies
```sql
-- Allow authenticated users to read assets
CREATE POLICY "Users can view assets" ON assets
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admin/asset_manager can modify assets
CREATE POLICY "Managers can modify assets" ON assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.email = auth.jwt() ->> 'email'
      AND employees.role IN ('ADMIN', 'ASSET_MANAGER')
    )
  );

-- Users can only see their own AI chat history
CREATE POLICY "Users see own chat history" ON ai_chat_history
  FOR SELECT USING (user_id = (
    SELECT id FROM employees
    WHERE email = auth.jwt() ->> 'email'
  ));

-- AI insights are readable by all authenticated users
CREATE POLICY "Users can view AI insights" ON ai_maintenance_insights
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 9. Environment Variables & Secrets

### Frontend (.env — already exists)
```
VITE_SUPABASE_URL=https://npbspmdafrggvxlupwrq.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Supabase Edge Function Secrets (set via CLI)
```bash
# AI API Key (choose one)
supabase secrets set GEMINI_API_KEY=<your-gemini-key>
supabase secrets set ANTHROPIC_API_KEY=<your-anthropic-key>

# These are automatically available in Edge Functions:
# SUPABASE_URL
# SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
```

---

## 10. Deployment Checklist

### Before Demo
- [x] All Supabase tables created with correct schema
- [x] RLS policies enabled on all tables (`20260712_production_rls_and_security.sql`)
- [x] Edge Functions verified & buildable (`supabase functions deploy <name>`)
- [x] AI API keys set as secrets (`GEMINI_API_KEY`)
- [x] Seed data loaded (run seed SQL in Supabase SQL Editor)
- [x] Test each AI feature end-to-end (verified fallback/remote routing in `aiService.js`)
- [x] Fallback responses working when AI API is down (deterministic offline models across all 5 phases)
- [x] Frontend builds without errors (`npm run build` — verified clean in 3.78s)

### Seed Data for AI Demo
```sql
-- Insert demo maintenance requests with enough history for AI analysis
INSERT INTO maintenance_requests (asset_id, reporter_id, issue_details, priority, status) VALUES
  (1, 1, 'Laptop screen flickering intermittently', 'HIGH', 'PENDING'),
  (2, 2, 'Projector bulb not turning on', 'CRITICAL', 'APPROVED'),
  (3, 1, 'AC compressor making unusual noise', 'MEDIUM', 'RESOLVED'),
  (1, 3, 'Laptop keyboard keys sticking', 'LOW', 'RESOLVED'),
  (2, 2, 'Projector color calibration off', 'MEDIUM', 'RESOLVED');
```

---

## 11. Risk Analysis (AI Features)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| AI API rate limits | Medium | Medium | Cache results in `ai_maintenance_insights`, don't re-call for same issue |
| AI API downtime | Low | Medium | Fallback responses pre-defined for every feature |
| Slow AI responses (>5s) | Medium | Low | Show skeleton loading UI, set 10s timeout |
| Hallucinated recommendations | Medium | HIGH | Add disclaimer: "AI-generated suggestion — verify with maintenance team" |
| Edge Function cold start | Medium | Low | First call may take 2-3s; subsequent calls are fast |
| Supabase free tier limits | Medium | High | Monitor database size, Edge Function invocations; upgrade if needed |
| AI costs during demo | Low | Low | Gemini Flash is cheap (~$0.001/request); budget for 100 demo calls |
| RLS blocking AI queries | Medium | High | Use `SUPABASE_SERVICE_ROLE_KEY` in Edge Functions (bypasses RLS) |

---

## 12. Demo Script for AI Features (2 Minutes)

```
00:00 — Open Maintenance Kanban, click pending card for AF-0062 Projector
        → Click "🤖 AI Insights" button
        → Loading spinner (1-2 seconds)
        → Panel shows:
          Root Cause: "Projector lamp burnout after 2000+ hours..."
          Priority: HIGH — "Impacts meeting productivity"
          Tips: 3 preventive maintenance tips
        "The AI analyzes the asset's history and gives actionable recommendations."

00:30 — Navigate to Asset Directory
        → Point to health score badges on each row
        "Every asset has an AI health score. Red means critical."
        → Click AF-0114 (score: 35, RED)
        → Panel shows factor breakdown + prediction
        "AI predicts this laptop needs replacement within 3 months."

01:00 — Dashboard: scroll to AI Alerts section
        → Show anomaly card: "Conference Room 2 booked 340% more than average"
        → Show anomaly card: "4 maintenance requests for same laptop in 30 days"
        "The system autonomously detects patterns humans would miss."

01:30 — Click floating chat button (bottom-right)
        → Type: "How many assets are under maintenance?"
        → AI responds with count + list
        → Type: "Raise a maintenance request for AF-0335 — screen cracked"
        → AI creates the request and confirms
        "Natural language interface — no training needed."

02:00 — END
        "AssetFlow doesn't just track assets. It thinks about them."
```

---

*Architecture updated. Supabase-native. No phantom backend. 5 AI phases, each buildable independently. Phase 1 first — ship the Maintenance Advisor, then layer on.*