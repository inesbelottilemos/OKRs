import { useState, useRef, useEffect, useCallback } from "react";
import { INITIAL_OKR_DATA, DEPARTMENTS, COMPANY_KRS, STATUSES } from "./data";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "On Track":   { bg: "#e8f5e9", color: "#2e7d32", dot: "#4caf50" },
  "At Risk":    { bg: "#fff8e1", color: "#e65100", dot: "#ff9800" },
  "Off Track":  { bg: "#fce4ec", color: "#b71c1c", dot: "#f44336" },
  "Completed":  { bg: "#e0f2f1", color: "#004d40", dot: "#009688" },
  "Not Started":{ bg: "#f5f5f5", color: "#616161", dot: "#9e9e9e" },
};

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Not Started"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      background: cfg.bg, color: cfg.color,
      fontFamily: "'DM Mono', monospace",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function ProgressBar({ pct, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["On Track"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "#f0f0f0", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`, height: "100%",
          background: cfg.dot, borderRadius: 2,
          transition: "width 0.4s ease",
        }} />
      </div>
      <span style={{ fontSize: 11, color: "#888", fontFamily: "'DM Mono', monospace", minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

// ─── AI Chat Panel ───────────────────────────────────────────────────────────

function AIChat({ okrs, apiKey, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I have full context on your Q1 2026 OKRs. Ask me anything — which KRs are most at risk, summaries by department, trends, or what needs attention this week." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const systemPrompt = `You are an OKR analyst assistant. You have full access to the company's Q1 2026 OKR data. Here is the complete dataset:

${JSON.stringify(okrs.map(o => ({
  id: o.id,
  dept: o.dept,
  kr: o.kr,
  objective: o.obj,
  companyKR: o.companyKR,
  owner: o.owner,
  start: o.start,
  target: o.target,
  current: o.current,
  progress: o.pct + "%",
  status: o.status,
  weeklyUpdate: o.update,
  wow: o.wow,
})), null, 2)}

Quarter: Q1 2026 (Jan 26 – Apr 10, 2026). Current date: March 9, 2026. Timeline: 71.6% elapsed (53/74 days).

Total KRs: ${okrs.length}
On Track: ${okrs.filter(o => o.status === "On Track").length}
At Risk: ${okrs.filter(o => o.status === "At Risk").length}
Off Track: ${okrs.filter(o => o.status === "Off Track").length}
Completed: ${okrs.filter(o => o.status === "Completed").length}

Be concise, insightful, and action-oriented. Use bullet points when listing multiple items. Reference specific KRs and owners by name. When asked for risk analysis, prioritize At Risk and Off Track items. Format numbers clearly.`;

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...messages.slice(1), userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that.";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Error connecting to AI. Check your API key and network." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 400,
      background: "#0d0d0d", borderLeft: "1px solid #222",
      display: "flex", flexDirection: "column", zIndex: 1000,
      fontFamily: "'Syne', sans-serif",
    }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>OKR AI Assistant</div>
          <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{okrs.length} key results in context</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "1px solid #2a2a2a", color: "#666", cursor: "pointer", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%",
          }}>
            <div style={{
              padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? "#1a6b3c" : "#1a1a1a",
              color: "#e8e8e8", fontSize: 13, lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", padding: "10px 14px", background: "#1a1a1a", borderRadius: "14px 14px 14px 4px", color: "#555", fontSize: 13 }}>
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: 16, borderTop: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Which KRs need attention this week?"
            style={{
              flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 8, padding: "10px 12px", color: "#e0e0e0",
              fontSize: 13, outline: "none", fontFamily: "'Syne', sans-serif",
            }}
          />
          <button onClick={send} disabled={loading || !input.trim()} style={{
            background: "#1a6b3c", border: "none", color: "#fff",
            borderRadius: 8, padding: "10px 16px", cursor: "pointer",
            fontSize: 13, fontWeight: 600, opacity: loading || !input.trim() ? 0.5 : 1,
          }}>↑</button>
        </div>
        <div style={{ fontSize: 10, color: "#333", marginTop: 8, textAlign: "center", fontFamily: "'DM Mono', monospace" }}>
          Powered by Claude · Your API key is used client-side only
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({ okr, onSave, onClose }) {
  const [form, setForm] = useState({
    current: okr.current,
    pct: okr.pct,
    status: okr.status,
    update: okr.update,
    wow: okr.wow,
  });

  const field = (key, label, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 4, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      {key === "status" ? (
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #e0e0e0", fontSize: 13, background: "#fff", fontFamily: "'Syne', sans-serif" }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      ) : key === "update" ? (
        <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={4} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #e0e0e0", fontSize: 13, fontFamily: "'Syne', sans-serif", resize: "vertical" }} />
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #e0e0e0", fontSize: 13, fontFamily: "'Syne', sans-serif", boxSizing: "border-box" }} />
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase" }}>{okr.dept} · {okr.owner}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111", lineHeight: 1.4 }}>{okr.kr}</div>
        </div>
        {field("current", "Current value")}
        {field("pct", "Progress %", "number")}
        {field("status", "Status")}
        {field("wow", "Week-on-week change")}
        {field("update", "Weekly update")}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [okrs, setOkrs] = useState(INITIAL_OKR_DATA);
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [krFilter, setKrFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("okr_api_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiPrompt, setShowApiPrompt] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [expandedKR, setExpandedKR] = useState(null);

  const filtered = okrs.filter(r => {
    if (deptFilter && r.dept !== deptFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (krFilter && r.companyKR !== krFilter) return false;
    if (search && !r.kr.toLowerCase().includes(search.toLowerCase()) && !r.owner.toLowerCase().includes(search.toLowerCase()) && !r.dept.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byDept = {};
  filtered.forEach(r => { if (!byDept[r.dept]) byDept[r.dept] = []; byDept[r.dept].push(r); });

  const stats = {
    total: filtered.length,
    onTrack: filtered.filter(r => r.status === "On Track").length,
    atRisk: filtered.filter(r => r.status === "At Risk").length,
    offTrack: filtered.filter(r => r.status === "Off Track").length,
    completed: filtered.filter(r => r.status === "Completed").length,
    avg: filtered.length ? Math.round(filtered.reduce((a, r) => a + r.pct, 0) / filtered.length) : 0,
  };

  function saveEdit(form) {
    setOkrs(prev => prev.map(o => o.id === editing.id ? { ...o, ...form } : o));
    setEditing(null);
  }

  function openAI() {
    if (!apiKey) { setShowApiPrompt(true); return; }
    setAiOpen(true);
  }

  function saveApiKey() {
    localStorage.setItem("okr_api_key", apiKeyInput);
    setApiKey(apiKeyInput);
    setShowApiPrompt(false);
    setAiOpen(true);
  }

  const S = {
    app: { fontFamily: "'Syne', sans-serif", minHeight: "100vh", background: "#f7f7f5", color: "#111" },
    header: { background: "#0d0d0d", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 },
    headerTitle: { fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" },
    headerSub: { fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace", marginTop: 1 },
    main: { padding: aiOpen ? "28px 432px 28px 28px" : "28px 28px 28px 28px", transition: "padding 0.3s ease" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 },
    statCard: (accent) => ({
      background: "#fff", borderRadius: 10, padding: "16px 18px",
      borderTop: `3px solid ${accent}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }),
    statLabel: { fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", marginBottom: 6 },
    statValue: { fontSize: 26, fontWeight: 700, color: "#111", lineHeight: 1 },
    statSub: { fontSize: 10, color: "#bbb", marginTop: 4, fontFamily: "'DM Mono', monospace" },
    toolbar: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
    input: { padding: "8px 12px", borderRadius: 7, border: "1px solid #e4e4e4", fontSize: 13, fontFamily: "'Syne', sans-serif", background: "#fff", outline: "none", color: "#111" },
    select: { padding: "8px 12px", borderRadius: 7, border: "1px solid #e4e4e4", fontSize: 13, fontFamily: "'Syne', sans-serif", background: "#fff", outline: "none", color: "#111", cursor: "pointer" },
    aiBtn: { marginLeft: "auto", padding: "8px 18px", borderRadius: 7, border: "none", background: "#0d0d0d", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.02em" },
    section: { marginBottom: 16 },
    sectionHeader: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", borderRadius: 8, cursor: "pointer", marginBottom: 2, border: "1px solid #ebebeb", userSelect: "none" },
    sectionTitle: { fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: "0.04em", flex: 1 },
    sectionMeta: { fontSize: 11, color: "#aaa", fontFamily: "'DM Mono', monospace" },
    krRow: { background: "#fff", borderRadius: 8, padding: "14px 16px", marginBottom: 4, border: "1px solid #ebebeb", cursor: "pointer", transition: "border-color 0.15s" },
    krRowExpanded: { background: "#fff", borderRadius: 8, padding: "14px 16px", marginBottom: 4, border: "1px solid #d0d0d0" },
    krTop: { display: "flex", alignItems: "flex-start", gap: 12 },
    krName: { flex: 1, fontSize: 13, color: "#111", lineHeight: 1.45, fontWeight: 500 },
    krMeta: { fontSize: 11, color: "#aaa", fontFamily: "'DM Mono', monospace", marginTop: 5, display: "flex", gap: 14 },
    krUpdate: { fontSize: 12, color: "#555", lineHeight: 1.5, marginTop: 10, padding: "10px 12px", background: "#f9f9f9", borderRadius: 6, borderLeft: "3px solid #e0e0e0" },
    editBtn: { padding: "5px 12px", borderRadius: 5, border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: 11, color: "#666", fontFamily: "'DM Mono', monospace" },
  };

  const wowColor = w => !w || w === "0%" ? "#aaa" : w.startsWith("+") ? "#2e7d32" : "#c62828";

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div>
          <div style={S.headerTitle}>OKR Tracker</div>
          <div style={S.headerSub}>Q1 2026 · 53/74 days · 71.6% elapsed</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#666", fontFamily: "'DM Mono', monospace" }}>Timeline</div>
            <div style={{ width: 120, height: 4, background: "#222", borderRadius: 2, overflow: "hidden", marginTop: 3 }}>
              <div style={{ width: "71.6%", height: "100%", background: "#3a8a5a" }} />
            </div>
          </div>
          <button onClick={openAI} style={{ ...S.aiBtn, background: aiOpen ? "#1a6b3c" : "#0d0d0d" }}>
            <span style={{ fontSize: 14 }}>✦</span> AI Assistant
          </button>
        </div>
      </header>

      <main style={S.main}>
        {/* Stats */}
        <div style={S.statsRow}>
          {[
            { label: "Total KRs", value: stats.total, sub: `${Object.keys(byDept).length} depts`, accent: "#e0e0e0" },
            { label: "On Track", value: stats.onTrack, sub: `${stats.total ? Math.round(stats.onTrack / stats.total * 100) : 0}%`, accent: "#4caf50" },
            { label: "At Risk", value: stats.atRisk, sub: `${stats.total ? Math.round(stats.atRisk / stats.total * 100) : 0}%`, accent: "#ff9800" },
            { label: "Off Track", value: stats.offTrack, sub: `${stats.total ? Math.round(stats.offTrack / stats.total * 100) : 0}%`, accent: "#f44336" },
            { label: "Completed", value: stats.completed, sub: `${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}%`, accent: "#009688" },
            { label: "Avg Progress", value: `${stats.avg}%`, sub: "across all KRs", accent: "#1565c0" },
          ].map(s => (
            <div key={s.label} style={S.statCard(s.accent)}>
              <div style={S.statLabel}>{s.label}</div>
              <div style={S.statValue}>{s.value}</div>
              <div style={S.statSub}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={S.toolbar}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search KRs, owners…" style={{ ...S.input, width: 200 }} />
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={S.select}>
            <option value="">All departments</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={S.select}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={krFilter} onChange={e => setKrFilter(e.target.value)} style={{ ...S.select, maxWidth: 240 }}>
            <option value="">All company KRs</option>
            {COMPANY_KRS.map(k => <option key={k} value={k}>{k.length > 45 ? k.slice(0, 42) + "…" : k}</option>)}
          </select>
          {(deptFilter || statusFilter || krFilter || search) && (
            <button onClick={() => { setDeptFilter(""); setStatusFilter(""); setKrFilter(""); setSearch(""); }}
              style={{ ...S.input, cursor: "pointer", color: "#e53935", borderColor: "#fecdd3", background: "#fff5f5" }}>
              Clear filters
            </button>
          )}
        </div>

        {/* KR List */}
        {Object.keys(byDept).sort().map(dept => {
          const items = byDept[dept];
          const isOpen = collapsed[dept] !== true;
          const risks = items.filter(r => r.status === "At Risk" || r.status === "Off Track").length;
          const done = items.filter(r => r.status === "Completed").length;
          const avgPct = Math.round(items.reduce((a, r) => a + r.pct, 0) / items.length);

          return (
            <div key={dept} style={S.section}>
              <div style={S.sectionHeader} onClick={() => setCollapsed(c => ({ ...c, [dept]: isOpen }))}>
                <span style={{ fontSize: 10, color: isOpen ? "#aaa" : "#666", transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none" }}>▶</span>
                <span style={S.sectionTitle}>{dept}</span>
                <span style={S.sectionMeta}>{items.length} KRs · {avgPct}% avg</span>
                {risks > 0 && <span style={{ fontSize: 11, background: "#fff8e1", color: "#e65100", padding: "2px 8px", borderRadius: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{risks} at risk</span>}
                {done > 0 && <span style={{ fontSize: 11, background: "#e0f2f1", color: "#004d40", padding: "2px 8px", borderRadius: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{done} done</span>}
              </div>

              {isOpen && items.map(okr => {
                const isExpanded = expandedKR === okr.id;
                return (
                  <div key={okr.id}
                    style={{ ...(isExpanded ? S.krRowExpanded : S.krRow) }}
                    onClick={() => setExpandedKR(isExpanded ? null : okr.id)}
                  >
                    <div style={S.krTop}>
                      <div style={{ flex: 1 }}>
                        <div style={S.krName}>{okr.kr}</div>
                        <div style={S.krMeta}>
                          <span>👤 {okr.owner}</span>
                          <span>{okr.start} → {okr.target}</span>
                          <span style={{ color: "#bbb" }}>now: {okr.current}</span>
                          {okr.wow && <span style={{ color: wowColor(okr.wow) }}>{okr.wow.startsWith("+") ? "↑" : okr.wow.startsWith("-") && okr.wow !== "0%" ? "↓" : ""} {okr.wow}</span>}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <ProgressBar pct={okr.pct} status={okr.status} />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 90 }}>
                        <Badge status={okr.status} />
                        <button onClick={e => { e.stopPropagation(); setEditing(okr); }} style={S.editBtn}>Edit ↗</button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div>
                        <div style={S.krUpdate}>{okr.update}</div>
                        <div style={{ marginTop: 8, fontSize: 11, color: "#bbb", fontFamily: "'DM Mono', monospace" }}>
                          🎯 {okr.companyKR} &nbsp;·&nbsp; 📌 {okr.obj}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa", fontSize: 14 }}>
            No key results match the current filters.
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editing && <EditModal okr={editing} onSave={saveEdit} onClose={() => setEditing(null)} />}

      {/* API Key prompt */}
      {showApiPrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowApiPrompt(false)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Connect AI Assistant</div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
              Enter your Anthropic API key to enable the AI assistant. Your key is stored locally in your browser and never sent to any server other than Anthropic's API.
            </div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveApiKey()}
              placeholder="sk-ant-..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, fontFamily: "'DM Mono', monospace", boxSizing: "border-box", marginBottom: 16, outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowApiPrompt(false)} style={{ padding: "9px 20px", borderRadius: 6, border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button onClick={saveApiKey} style={{ padding: "9px 20px", borderRadius: 6, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Connect</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Panel */}
      {aiOpen && <AIChat okrs={filtered.length > 0 ? filtered : okrs} apiKey={apiKey} onClose={() => setAiOpen(false)} />}
    </div>
  );
}
