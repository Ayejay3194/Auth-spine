"use client";
import { useEffect, useState } from "react";

type VerticalSummary = { vertical: string; label: string };
type VerticalConfig = {
  vertical: string;
  label: string;
  serviceTemplates: any[];
  requiredProfessionalFields: string[];
  conversation: { intakeQuestions: any[] };
};

export default function Onboarding() {
  const [verticals, setVerticals] = useState<VerticalSummary[]>([]);
  const [vertical, setVertical] = useState<string>("beauty");
  const [config, setConfig] = useState<VerticalConfig | null>(null);

  const [professional, setProfessional] = useState<any>({
    id: "pro_1",
    businessName: "",
    region: { state: "", city: "", zip: "" },
    license: { number: "", expiresAt: "" },
    policies: { hipaaAcknowledged: false, ndaOffered: false },
  });

  useEffect(() => {
    fetch("/api/verticals").then(r => r.json()).then(d => setVerticals(d.verticals ?? []));
  }, []);

  useEffect(() => {
    fetch(`/api/verticals/${vertical}`).then(r => r.json()).then(d => setConfig(d.config ?? null));
  }, [vertical]);

  const required = config?.requiredProfessionalFields ?? [];
  const templates = config?.serviceTemplates ?? [];

  async function evaluateActivate() {
    const res = await fetch("/api/compliance/evaluate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        vertical,
        event: { type: "professional.activate", payload: {} },
        consents: [],
        professional
      })
    });
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <main className="card">
      <h1>Onboarding</h1>
      <p className="small">Same flow for every vertical. Swap config, not code.</p>

      <div className="grid">
        <div className="col6 card">
          <h3>1) Choose vertical</h3>
          <label>Vertical</label>
          <select value={vertical} onChange={(e)=>setVertical(e.target.value)}>
            {verticals.map(v => <option key={v.vertical} value={v.vertical}>{v.label}</option>)}
          </select>
          <p className="small">Loaded config: <span className="badge">{config?.vertical ?? "…"}</span></p>
        </div>

        <div className="col6 card">
          <h3>2) Required fields</h3>

          <div style={{display:"flex", flexDirection:"column", gap: 10}}>
            <div>
              <label>Business name</label>
              <input value={professional.businessName} onChange={(e)=>setProfessional({...professional, businessName: e.target.value})}/>
            </div>

            {required.map((path) => {
              if (path === "businessName") return null;

              if (path === "policies.hipaaAcknowledged" || path === "policies.ndaOffered") {
                const key = path.split(".")[1];
                const checked = !!professional.policies?.[key];
                return (
                  <div key={path}>
                    <label>{path}</label>
                    <select
                      value={checked ? "true" : "false"}
                      onChange={(e) => {
                        const val = e.target.value === "true";
                        setProfessional({ ...professional, policies: { ...professional.policies, [key]: val } });
                      }}
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  </div>
                );
              }

              const [top, key] = path.split(".");
              return (
                <div key={path}>
                  <label>{path}</label>
                  <input
                    value={professional?.[top]?.[key] ?? ""}
                    onChange={(e) => setProfessional({ ...professional, [top]: { ...professional[top], [key]: e.target.value } })}
                  />
                </div>
              );
            })}
          </div>

          <div style={{display:"flex", gap: 12, marginTop: 12, flexWrap:"wrap"}}>
            <button onClick={evaluateActivate}>Evaluate compliance: activate</button>
            <a href="/test"><button>Go to Test Console</button></a>
          </div>
        </div>

        <div className="col12 card">
          <h3>3) Service templates (defaults)</h3>
          <p className="small">In real life: these become editable DB rows. Here: you see what the vertical config preloads.</p>
          <pre>{JSON.stringify(templates, null, 2)}</pre>
        </div>

        <div className="col12 card">
          <h3>4) Intake questions</h3>
          <pre>{JSON.stringify(config?.conversation?.intakeQuestions ?? [], null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}
