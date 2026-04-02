import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_TEAM_SIZE = 10;
const SESSION_ID = "default";

const createId = () =>
  globalThis.crypto?.randomUUID?.() || `member-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptyMember = (index) => ({
  id: createId(),
  name: `Member ${index + 1}`,
  dietaryPreference: "either",
  cuisinePreferences: ["south-indian"],
  vibePreferences: ["relaxed"],
  travelToleranceKm: 30
});

const createDefaultDraft = () => ({
  teamName: "Friday Escape Squad",
  budgetPerPerson: 800,
  distanceLimitKm: 40,
  members: Array.from({ length: DEFAULT_TEAM_SIZE }, (_, index) => emptyMember(index))
});

function normalizeMember(member, index) {
  return {
    id: member?.id || createId(),
    name: member?.name || `Member ${index + 1}`,
    dietaryPreference: member?.dietaryPreference || "either",
    cuisinePreferences:
      Array.isArray(member?.cuisinePreferences) && member.cuisinePreferences.length > 0
        ? member.cuisinePreferences
        : ["south-indian"],
    vibePreferences:
      Array.isArray(member?.vibePreferences) && member.vibePreferences.length > 0
        ? member.vibePreferences
        : ["relaxed"],
    travelToleranceKm: Number(member?.travelToleranceKm) || 30
  };
}

function normalizeDraft(draft) {
  const baseDraft = draft && typeof draft === "object" ? draft : createDefaultDraft();
  const members =
    Array.isArray(baseDraft.members) && baseDraft.members.length > 0
      ? baseDraft.members.map(normalizeMember)
      : createDefaultDraft().members;

  return {
    teamName: baseDraft.teamName || "Friday Escape Squad",
    budgetPerPerson: Number(baseDraft.budgetPerPerson) || 800,
    distanceLimitKm: Number(baseDraft.distanceLimitKm) || 40,
    members
  };
}

function TagPicker({ label, options, values, onChange }) {
  const toggle = (option) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    onChange([...values, option]);
  };

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="chip-grid">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`chip ${values.includes(option) ? "chip-active" : ""}`}
            onClick={() => toggle(option)}
          >
            {option.replaceAll("-", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlannerForm({ meta, draft, setDraft, onSubmit, loading, saveState }) {
  const updateMember = (memberId, updates) => {
    setDraft((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === memberId ? { ...member, ...updates } : member
      )
    }));
  };

  const members = draft.members;

  const changeDraft = (updates) => {
    setDraft((current) => ({
      ...current,
      ...updates
    }));
  };

  const changeTeamSize = (nextSize) => {
    const safeSize = Math.max(1, Math.min(20, Number(nextSize) || 1));
    setDraft((current) => {
      if (safeSize > current.members.length) {
        const additions = Array.from({ length: safeSize - current.members.length }, (_, index) =>
          emptyMember(current.members.length + index)
        );

        return {
          ...current,
          members: [...current.members, ...additions]
        };
      }

      return {
        ...current,
        members: current.members.slice(0, safeSize)
      };
    });
  };

  const sanitizedPayload = useMemo(
    () => ({
      teamName: draft.teamName,
      teamSize: draft.members.length,
      budgetPerPerson: Number(draft.budgetPerPerson),
      distanceLimitKm: Number(draft.distanceLimitKm),
      members: draft.members.map((member) => ({
        ...member,
        cuisinePreferences:
          member.cuisinePreferences.length > 0 ? member.cuisinePreferences : ["south-indian"],
        vibePreferences: member.vibePreferences.length > 0 ? member.vibePreferences : ["relaxed"]
      }))
    }),
    [draft]
  );

  const submit = (event) => {
    event.preventDefault();
    onSubmit(sanitizedPayload);
  };

  return (
    <form className="planner-card" onSubmit={submit}>
      <div className="planner-header">
        <div>
          <p className="eyebrow">Input preferences</p>
          <h2>Collect the whole team’s choices in one place</h2>
          <p className="muted-text">
            {saveState === "saving"
              ? "Saving draft..."
              : saveState === "saved"
                ? "Draft saved to the database."
                : saveState === "error"
                  ? "Draft could not be saved."
                  : "Your draft reloads automatically from the database."}
          </p>
        </div>
        <button type="submit" className="primary-button" disabled={loading || !meta}>
          {loading ? "Working..." : !meta ? "Loading planner..." : "Generate outing plans"}
        </button>
      </div>

      <div className="overview-grid">
        <label className="field">
          <span className="field-label">Team name</span>
          <input
            value={draft.teamName}
            onChange={(event) => changeDraft({ teamName: event.target.value })}
          />
        </label>
        <label className="field">
          <span className="field-label">Team size</span>
          <input
            type="number"
            min="1"
            max="20"
            value={members.length}
            onChange={(event) => changeTeamSize(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Budget per person (Rs.)</span>
          <input
            type="number"
            min="300"
            step="50"
            value={draft.budgetPerPerson}
            onChange={(event) => changeDraft({ budgetPerPerson: event.target.value })}
          />
        </label>
        <label className="field">
          <span className="field-label">Max distance from office (km)</span>
          <input
            type="number"
            min="5"
            max={meta?.officeDefaults?.maxDistanceKm || 40}
            value={draft.distanceLimitKm}
            onChange={(event) => changeDraft({ distanceLimitKm: event.target.value })}
          />
        </label>
      </div>

      <div className="members-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Member preferences</p>
            <h3>Mix dietary, cuisine, and vibe preferences</h3>
          </div>
          <p className="muted-text">The planner scores venues that satisfy the widest portion of the group.</p>
        </div>

        <div className="member-list">
          {members.map((member, index) => (
            <article className="member-card" key={member.id}>
              <div className="member-header">
                <span className="member-index">{String(index + 1).padStart(2, "0")}</span>
                <input
                  className="member-name"
                  value={member.name}
                  onChange={(event) => updateMember(member.id, { name: event.target.value })}
                />
              </div>

              <div className="member-grid">
                <label className="field">
                  <span className="field-label">Food preference</span>
                  <select
                    value={member.dietaryPreference}
                    onChange={(event) =>
                      updateMember(member.id, { dietaryPreference: event.target.value })
                    }
                  >
                    {meta?.dietaryOptions?.map((option) => (
                      <option value={option} key={option}>
                        {option.replaceAll("-", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Travel tolerance (km)</span>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={member.travelToleranceKm}
                    onChange={(event) =>
                      updateMember(member.id, { travelToleranceKm: Number(event.target.value) })
                    }
                  />
                </label>
              </div>

              <TagPicker
                label="Cuisine choices"
                options={meta?.cuisineOptions || []}
                values={member.cuisinePreferences}
                onChange={(value) => updateMember(member.id, { cuisinePreferences: value })}
              />

              <TagPicker
                label="Outing vibe"
                options={meta?.vibeOptions || []}
                values={member.vibePreferences}
                onChange={(value) => updateMember(member.id, { vibePreferences: value })}
              />
            </article>
          ))}
        </div>
      </div>
    </form>
  );
}

function SummaryBar({ summary, updatedAt }) {
  if (!summary) return null;

  const dietaryParts = Object.entries(summary.dietarySplit || {})
    .map(([key, value]) => `${value} ${key.replaceAll("-", " ")}`)
    .join(" • ");

  return (
    <section className="summary-bar">
      <div>
        <p className="eyebrow">Planner summary</p>
        <strong>{summary.teamSize} members analyzed</strong>
      </div>
      <div>{dietaryParts}</div>
      <div>Top cuisines: {(summary.topCuisines || []).join(", ") || "Flexible"}</div>
      <div>Top vibes: {(summary.topVibes || []).join(", ") || "Flexible"}</div>
      <div>{updatedAt ? `Saved ${new Date(updatedAt).toLocaleString()}` : "Not saved yet"}</div>
    </section>
  );
}

function PlanCard({ plan }) {
  return (
    <article className={`plan-card ${plan.rank === 1 ? "plan-card-featured" : ""}`}>
      <div className="plan-topline">
        <span className="plan-badge">Option {plan.rank}</span>
        <span className="plan-score">Match score {plan.score}</span>
      </div>
      <h3>{plan.title}</h3>
      <p className="plan-venue">
        {plan.venue.name}, {plan.venue.area} • {plan.venue.distanceKm} km from office
      </p>

      <div className="detail-grid">
        <div className="detail-card">
          <span className="detail-label">Venue</span>
          <p>{plan.venue.highlights.join(" · ")}</p>
        </div>
        <div className="detail-card">
          <span className="detail-label">Food option</span>
          <p>{plan.food.recommendation}</p>
          <small>{plan.food.cuisinesSupported.join(", ")}</small>
        </div>
        <div className="detail-card">
          <span className="detail-label">Estimated cost</span>
          <p>Rs. {plan.costBreakdown.perPerson} / person</p>
          <small>Total Rs. {plan.costBreakdown.totalEstimated}</small>
        </div>
      </div>

      <div className="cost-row">
        <span>Entry: Rs. {plan.costBreakdown.entryTotal}</span>
        <span>Food: Rs. {plan.costBreakdown.foodTotal}</span>
        <span>Travel: Rs. {plan.costBreakdown.transportTotal}</span>
      </div>

      <div className="reason-list">
        {plan.reasons.map((reason) => (
          <p key={reason}>{reason}</p>
        ))}
      </div>

      <div className="agenda-list">
        {plan.agenda.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </article>
  );
}

export default function App() {
  const [meta, setMeta] = useState(null);
  const [draft, setDraft] = useState(createDefaultDraft);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [saveState, setSaveState] = useState("idle");
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState("");
  const hydratedRef = useRef(false);
  const lastSavedPayloadRef = useRef("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [metaResponse, sessionResponse] = await Promise.all([
          fetch("/api/meta"),
          fetch(`/api/session/${SESSION_ID}`)
        ]);

        const metaData = await metaResponse.json();
        const sessionData = await sessionResponse.json();

        if (!metaResponse.ok) {
          throw new Error(metaData.message || "Unable to load planner metadata.");
        }

        if (!sessionResponse.ok) {
          throw new Error(sessionData.message || "Unable to load saved planner session.");
        }

        setMeta(metaData);
        if (sessionData.draft) {
          setDraft(normalizeDraft(sessionData.draft));
        }
        if (sessionData.result) {
          setResult(sessionData.result);
        }
        if (sessionData.updatedAt) {
          setSavedAt(sessionData.updatedAt);
        }
      } catch (loadError) {
        setError(loadError.message || "Unable to load planner data.");
      } finally {
        hydratedRef.current = true;
        setHydrating(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) {
      return undefined;
    }

    const payload = JSON.stringify({ draft, result });
    if (payload === lastSavedPayloadRef.current) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setSaveState("saving");
        const response = await fetch(`/api/session/${SESSION_ID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ draft, result })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to save planner session.");
        }

        lastSavedPayloadRef.current = payload;
        setSavedAt(data.updatedAt || null);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draft, result]);

  const generatePlans = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Planner request failed.");
      }

      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || "Something went wrong while generating plans.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI-powered outing planner</p>
          <h1>Turn a messy team chat into 3 clear Hyderabad outing options.</h1>
          <p className="hero-text">
            Capture every teammate’s budget, food, and vibe preferences, then generate outing plans
            that stay within 40 km, support vegetarian and non-vegetarian needs, and show the cost
            breakdown up front.
          </p>
        </div>
        <div className="hero-panel">
          <span className="hero-stat">Budget aware</span>
          <strong>Rs. 800/person ready</strong>
          <span className="hero-stat">Distance capped</span>
          <strong>Only nearby Hyderabad venues</strong>
          <span className="hero-stat">Food balanced</span>
          <strong>Vegetarian + non-vegetarian friendly</strong>
        </div>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      <PlannerForm
        meta={meta}
        draft={draft}
        setDraft={setDraft}
        onSubmit={generatePlans}
        loading={loading || hydrating}
        saveState={saveState}
      />

      <SummaryBar summary={result?.summary} updatedAt={savedAt} />

      <section className="results-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recommended plans</p>
            <h2>2-3 outing ideas that the team can actually say yes to</h2>
          </div>
          <p className="muted-text">Each recommendation balances distance, budget, and food fit.</p>
        </div>

        <div className="plans-grid">
          {result?.plans?.length ? (
            result.plans.map((plan) => <PlanCard plan={plan} key={plan.id} />)
          ) : (
            <div className="empty-state">
              Submit the team preferences to see AI-ranked outing options with venue, meal, and
              pricing recommendations.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
