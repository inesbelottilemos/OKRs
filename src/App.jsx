import { useState, useRef, useEffect } from "react";
import { INITIAL_OKR_DATA, DEPARTMENTS, COMPANY_KRS, STATUSES } from "./data";

const A = {
  // Main palette
  blue:        "#5C8EF1",
  blueLight:   "#EBF1FE",
  blueDark:    "#28628E",
  white:       "#FFFFFF",
  gold:        "#F3D780",
  goldDeep:    "#F3C231",
  // Secondary palette
  blueSky:     "#8EDDED",
  blueSkyLight:"#E8F9FD",
  copper:      "#E18B63",
  copperLight: "#FBF0EA",
  pink:        "#DF8CBA",
  pinkLight:   "#FBF0F7",
  surfGreen:   "#70E0A3",
  surfLight:   "#EDFBF4",
  invernessGreen: "#00838A",
  sageGreen:   "#00AD4A",
  sageLight:   "#E6F9EE",
  // Neutrals
  black:       "#1A1A2E",
  gray100:     "#F8F9FC",
  gray200:     "#EEEEF4",
  gray300:     "#DDDDE8",
  gray400:     "#B8B8CC",
  gray500:     "#8888A0",
  gray700:     "#444460",
};

const STATUS_CFG = {
  "On Track":    { bg: A.sageLight,    color: "#006B2E", dot: A.sageGreen },
  "At Risk":     { bg: "#FEF9E7",      color: "#7A5C00", dot: A.goldDeep },
  "Off Track":   { bg: A.copperLight,  color: "#7A3A18", dot: A.copper },
  "Completed":   { bg: A.blueSkyLight, color: A.invernessGreen, dot: A.invernessGreen },
  "Not Started": { bg: A.gray200,      color: A.gray700, dot: A.gray400 },
};

function Badge({ status, small }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG["Not Started"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding: small?"2px 8px":"4px 10px", borderRadius:20, fontSize: small?10:11, fontWeight:600, background:cfg.bg, color:cfg.color, fontFamily:"'Montserrat',sans-serif", whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot }} />
      {status}
    </span>
  );
}

function ProgressBar({ pct, status, height=5 }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG["On Track"];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height, background:A.gray200, borderRadius:height }}>
        <div style={{ width:`${Math.min(pct,100)}%`, height:"100%", background:cfg.dot, borderRadius:height, transition:"width 0.4s" }} />
      </div>
      <span style={{ fontSize:11, color:A.gray500, fontFamily:"'Montserrat',sans-serif", minWidth:28, textAlign:"right" }}>{pct}%</span>
    </div>
  );
}

function DonutChart({ segments, size=150 }) {
  const r=50, cx=size/2, cy=size/2, circ=2*Math.PI*r;
  let offset=0;
  const total = segments.reduce((a,s)=>a+s.value,0)||1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={A.gray200} strokeWidth={18}/>
      {segments.map((s,i)=>{
        const dash=(s.value/total)*circ, gap=circ-dash;
        const el=(<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={18} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} transform={`rotate(-90 ${cx} ${cy})`}/>);
        offset+=dash; return el;
      })}
      <text x={cx} y={cy-6} textAnchor="middle" fontSize={24} fontWeight={800} fill={A.black} fontFamily="Montserrat,sans-serif">{total}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize={9} fill={A.gray500} fontFamily="Montserrat,sans-serif">KEY RESULTS</text>
    </svg>
  );
}

function BarChart({ data, height=140 }) {
  if(!data||!data.length) return null;
  const max=Math.max(...data.map(d=>d.value),1);
  const barW=36, gap=8, total=data.length;
  const svgW=total*(barW+gap);
  return (
    <svg viewBox={`0 0 ${svgW} ${height+30}`} style={{ width:"100%", overflow:"visible" }}>
      {data.map((d,i)=>{
        const cfg=STATUS_CFG[d.status]||STATUS_CFG["On Track"];
        const barH=Math.max((d.value/max)*height,2);
        const x=i*(barW+gap), y=height-barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={cfg.dot} opacity={0.9}/>
            <text x={x+barW/2} y={height+12} textAnchor="middle" fontSize={8.5} fill={A.gray500} fontFamily="Montserrat,sans-serif">{d.label}</text>
            <text x={x+barW/2} y={y-4} textAnchor="middle" fontSize={9} fill={A.gray700} fontFamily="Montserrat,sans-serif">{d.value}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function Dashboard({ okrs }) {
  const total=okrs.length;
  const onTrack=okrs.filter(o=>o.status==="On Track").length;
  const atRisk=okrs.filter(o=>o.status==="At Risk").length;
  const offTrack=okrs.filter(o=>o.status==="Off Track").length;
  const completed=okrs.filter(o=>o.status==="Completed").length;

  const deptData=DEPARTMENTS.map(d=>{
    const items=okrs.filter(o=>o.dept===d);
    if(!items.length) return null;
    const avg=Math.round(items.reduce((a,o)=>a+o.pct,0)/items.length);
    const worst=items.find(o=>o.status==="Off Track")?"Off Track":items.find(o=>o.status==="At Risk")?"At Risk":items.find(o=>o.status==="Completed")?"Completed":"On Track";
    const lbl=d.length>10?d.slice(0,9)+"…":d;
    return { label:lbl, fullName:d, value:avg, status:worst, count:items.length, atRisk:items.filter(o=>o.status==="At Risk"||o.status==="Off Track").length };
  }).filter(Boolean);

  const mostAtRisk=[...okrs].filter(o=>o.status==="At Risk"||o.status==="Off Track").sort((a,b)=>a.pct-b.pct).slice(0,5);

  const ckrSummary=COMPANY_KRS.map(ckr=>{
    const items=okrs.filter(o=>o.companyKR===ckr);
    if(!items.length) return null;
    const avg=Math.round(items.reduce((a,o)=>a+o.pct,0)/items.length);
    const s=avg>=80?"Completed":avg>=50?"On Track":avg>=20?"At Risk":"Off Track";
    return { fullLabel:ckr, avg, count:items.length, status:s };
  }).filter(Boolean);

  const card=(children,style={})=>(
    <div style={{ background:A.white, border:`1px solid ${A.gray300}`, borderRadius:12, padding:"20px 22px", ...style }}>{children}</div>
  );
  const cardTitle=(t,sub)=>(
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:A.black }}>{t}</div>
      {sub&&<div style={{ fontSize:11, color:A.gray500, marginTop:2, fontFamily:"'Montserrat',sans-serif" }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
        {[
          { label:"Total KRs",  value:total,     color:A.blue,           sub:`${DEPARTMENTS.length} depts` },
          { label:"On Track",   value:onTrack,   color:A.sageGreen,      sub:`${total?Math.round(onTrack/total*100):0}%` },
          { label:"At Risk",    value:atRisk,    color:A.goldDeep,       sub:`${total?Math.round(atRisk/total*100):0}%` },
          { label:"Off Track",  value:offTrack,  color:A.copper,         sub:`${total?Math.round(offTrack/total*100):0}%` },
          { label:"Completed",  value:completed, color:A.invernessGreen, sub:`${total?Math.round(completed/total*100):0}%` },
        ].map(s=>(
          <div key={s.label} style={{ background:A.white, border:`1px solid ${A.gray300}`, borderRadius:12, padding:"16px 18px", borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:10, color:A.gray500, textTransform:"uppercase", letterSpacing:"0.1em", fontFamily:"'Montserrat',sans-serif", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:30, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:11, color:A.gray400, marginTop:5, fontFamily:"'Montserrat',sans-serif" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2: donut + bar chart */}
      <div style={{ display:"grid", gridTemplateColumns:"250px 1fr", gap:12 }}>
        {card(
          <>
            {cardTitle("Status breakdown","Q1 2026 · all KRs")}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
              <DonutChart size={150} segments={[
                { value:onTrack,   color:A.sageGreen },
                { value:atRisk,    color:A.goldDeep },
                { value:offTrack,  color:A.copper },
                { value:completed, color:A.invernessGreen },
              ]}/>
            </div>
            {[
              { label:"On Track",  value:onTrack,   color:A.sageGreen },
              { label:"At Risk",   value:atRisk,    color:A.goldDeep },
              { label:"Off Track", value:offTrack,  color:A.copper },
              { label:"Completed", value:completed, color:A.invernessGreen },
            ].map(s=>(
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                <span style={{ fontSize:12, color:A.gray700, flex:1 }}>{s.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:A.black, fontFamily:"'Montserrat',sans-serif" }}>{s.value}</span>
                <span style={{ fontSize:11, color:A.gray400, fontFamily:"'Montserrat',sans-serif", minWidth:28, textAlign:"right" }}>{total?Math.round(s.value/total*100):0}%</span>
              </div>
            ))}
          </>
        )}
        {card(
          <>
            {cardTitle("Average progress by department","% — lower bars need more attention")}
            <BarChart data={deptData} height={130}/>
          </>
        )}
      </div>

      {/* Row 3: at-risk + company KRs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {card(
          <>
            {cardTitle("Needs attention",`${mostAtRisk.length} KRs at risk or off track`)}
            {mostAtRisk.length===0
              ? <div style={{ fontSize:13, color:A.gray400 }}>All KRs are on track 🎉</div>
              : mostAtRisk.map(o=>(
                <div key={o.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${A.gray200}` }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:4 }}>
                    <div style={{ fontSize:12, color:A.black, lineHeight:1.4, flex:1 }}>{o.kr}</div>
                    <Badge status={o.status} small/>
                  </div>
                  <div style={{ fontSize:11, color:A.gray400, fontFamily:"'Montserrat',sans-serif", marginBottom:5 }}>{o.dept} · {o.owner}</div>
                  <ProgressBar pct={o.pct} status={o.status} height={4}/>
                </div>
              ))
            }
          </>
        )}
        {card(
          <>
            {cardTitle("Company KR progress","avg across all department KRs")}
            {ckrSummary.map(ckr=>(
              <div key={ckr.fullLabel} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ fontSize:12, color:A.black, lineHeight:1.3, flex:1, paddingRight:8 }}>{ckr.fullLabel}</div>
                  <span style={{ fontSize:11, fontFamily:"'Montserrat',sans-serif", color:A.gray400, whiteSpace:"nowrap" }}>{ckr.count} KRs</span>
                </div>
                <ProgressBar pct={ckr.avg} status={ckr.status} height={4}/>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Row 4: dept table */}
      {card(
        <>
          {cardTitle("Department health")}
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${A.gray300}` }}>
                {["Department","KRs","At risk","Avg progress","Overall"].map(h=>(
                  <th key={h} style={{ textAlign:h==="Department"||h==="Overall"?"left":"center", padding:"6px 10px", fontSize:10, color:A.gray500, fontWeight:600, fontFamily:"'Montserrat',sans-serif", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptData.map(d=>(
                <tr key={d.fullName} style={{ borderBottom:`1px solid ${A.gray200}` }}>
                  <td style={{ padding:"10px 10px", fontWeight:700, color:A.black }}>{d.fullName}</td>
                  <td style={{ padding:"10px 10px", textAlign:"center", color:A.gray500, fontFamily:"'Montserrat',sans-serif" }}>{d.count}</td>
                  <td style={{ padding:"10px 10px", textAlign:"center" }}>
                    {d.atRisk>0?<span style={{ color:A.copper, fontWeight:700, fontFamily:"'Montserrat',sans-serif" }}>{d.atRisk}</span>:<span style={{ color:A.gray300 }}>—</span>}
                  </td>
                  <td style={{ padding:"10px 10px", minWidth:160 }}><ProgressBar pct={d.value} status={d.status} height={5}/></td>
                  <td style={{ padding:"10px 10px" }}><Badge status={d.status} small/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function AIChat({ okrs, onClose }) {
  const [messages, setMessages]=useState([{ role:"assistant", content:"Hi! I have full context on all 55 Q1 OKRs. Ask me about risks, department summaries, what needs leadership attention, or anything else." }]);
  const [input, setInput]=useState("");
  const [loading, setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages]);

  const sp=`You are an OKR analyst for Amenitiz. Q1 2026 data (Jan 26–Apr 10, now March 9, timeline 71.6% elapsed):
${JSON.stringify(okrs.map(o=>({ dept:o.dept, kr:o.kr, owner:o.owner, progress:o.pct+"%", status:o.status, current:o.current, target:o.target, update:o.update, wow:o.wow })),null,2)}
Stats: ${okrs.length} total · ${okrs.filter(o=>o.status==="On Track").length} On Track · ${okrs.filter(o=>o.status==="At Risk").length} At Risk · ${okrs.filter(o=>o.status==="Off Track").length} Off Track · ${okrs.filter(o=>o.status==="Completed").length} Completed.
Be concise and action-oriented. Use bullets. Reference owners by name.`;

  async function send() {
    if(!input.trim()||loading) return;
    const userMsg={ role:"user", content:input.trim() };
    setMessages(m=>[...m,userMsg]); setInput(""); setLoading(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sp, messages:[...messages.slice(1),userMsg].map(m=>({ role:m.role, content:m.content })) }) });
      const data=await res.json();
      setMessages(m=>[...m,{ role:"assistant", content:data.content?.[0]?.text||"Error." }]);
    } catch { setMessages(m=>[...m,{ role:"assistant", content:"Connection error. Check your API key." }]); }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:400, background:A.white, borderLeft:`1px solid ${A.gray300}`, display:"flex", flexDirection:"column", zIndex:200, fontFamily:"'Montserrat',sans-serif" }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${A.gray300}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:A.blue }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:A.white }}>AI Assistant</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontFamily:"'Montserrat',sans-serif", marginTop:1 }}>{okrs.length} KRs in context</div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:A.white, cursor:"pointer", borderRadius:6, padding:"5px 12px", fontSize:12 }}>✕</button>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:14, display:"flex", flexDirection:"column", gap:10, background:A.gray100 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"88%" }}>
            <div style={{ padding:"10px 14px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?A.blue:A.white, color:m.role==="user"?A.white:A.black, fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap", border:m.role==="assistant"?`1px solid ${A.gray300}`:"none" }}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{ alignSelf:"flex-start", padding:"10px 14px", background:A.white, borderRadius:"14px 14px 14px 4px", color:A.gray400, fontSize:13, border:`1px solid ${A.gray300}` }}>Thinking…</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{ padding:14, borderTop:`1px solid ${A.gray300}`, background:A.white }}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask about your OKRs…" style={{ flex:1, background:A.gray100, border:`1px solid ${A.gray300}`, borderRadius:8, padding:"9px 12px", color:A.black, fontSize:13, outline:"none", fontFamily:"'Montserrat',sans-serif" }}/>
          <button onClick={send} disabled={loading||!input.trim()} style={{ background:A.blue, border:"none", color:A.white, borderRadius:8, padding:"9px 16px", cursor:"pointer", fontSize:16, opacity:loading||!input.trim()?0.5:1 }}>↑</button>
        </div>
        <div style={{ fontSize:10, color:A.gray400, marginTop:7, textAlign:"center", fontFamily:"'Montserrat',sans-serif" }}>Powered by Claude · key stored locally</div>
      </div>
    </div>
  );
}

function EditModal({ okr, onSave, onClose }) {
  const [form, setForm]=useState({ current:okr.current, pct:okr.pct, status:okr.status, update:okr.update, wow:okr.wow });
  const inp=(style={})=>({ width:"100%", padding:"8px 10px", borderRadius:7, border:`1px solid ${A.gray300}`, fontSize:13, fontFamily:"'Montserrat',sans-serif", outline:"none", boxSizing:"border-box", background:A.white, color:A.black, ...style });
  const lbl=t=><div style={{ fontSize:10, color:A.gray500, fontFamily:"'Montserrat',sans-serif", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, marginTop:12 }}>{t}</div>;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:A.white, borderRadius:14, padding:28, width:480, maxWidth:"92vw", boxShadow:"0 20px 60px rgba(0,0,0,0.12)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:A.gray400, fontFamily:"'Montserrat',sans-serif", marginBottom:5, textTransform:"uppercase" }}>{okr.dept} · {okr.owner}</div>
          <div style={{ fontSize:14, fontWeight:700, color:A.black, lineHeight:1.4 }}>{okr.kr}</div>
        </div>
        {lbl("Current value")}
        <input value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))} style={inp()}/>
        {lbl("Progress %")}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:2 }}>
          <input type="range" min={0} max={100} value={form.pct} onChange={e=>setForm(f=>({...f,pct:+e.target.value}))} style={{ flex:1, accentColor:A.blue }}/>
          <span style={{ fontSize:15, fontWeight:800, color:A.blue, fontFamily:"'Montserrat',sans-serif", minWidth:36 }}>{form.pct}%</span>
        </div>
        {lbl("Status")}
        <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inp()}>
          {STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        {lbl("Week-on-week")}
        <input value={form.wow} onChange={e=>setForm(f=>({...f,wow:e.target.value}))} placeholder="+5% or -2%" style={inp()}/>
        {lbl("Weekly update")}
        <textarea value={form.update} onChange={e=>setForm(f=>({...f,update:e.target.value}))} rows={3} style={inp({ resize:"vertical" })}/>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
          <button onClick={onClose} style={{ padding:"9px 20px", borderRadius:7, border:`1px solid ${A.gray300}`, background:A.white, cursor:"pointer", fontSize:13, color:A.gray700 }}>Cancel</button>
          <button onClick={()=>onSave(form)} style={{ padding:"9px 22px", borderRadius:7, border:"none", background:A.blue, color:A.white, cursor:"pointer", fontSize:13, fontWeight:700 }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [okrs, setOkrs]=useState(INITIAL_OKR_DATA);
  const [view, setView]=useState("dashboard");
  const [deptFilter, setDeptFilter]=useState("");
  const [statusFilter, setStatusFilter]=useState("");
  const [krFilter, setKrFilter]=useState("");
  const [search, setSearch]=useState("");
  const [editing, setEditing]=useState(null);
  const [aiOpen, setAiOpen]=useState(false);
  const [showApiPrompt, setShowApiPrompt]=useState(false);
  const [apiKeyInput, setApiKeyInput]=useState("");
  const [collapsed, setCollapsed]=useState({});
  const [expandedKR, setExpandedKR]=useState(null);

  const filtered=okrs.filter(r=>{
    if(deptFilter&&r.dept!==deptFilter) return false;
    if(statusFilter&&r.status!==statusFilter) return false;
    if(krFilter&&r.companyKR!==krFilter) return false;
    if(search&&!r.kr.toLowerCase().includes(search.toLowerCase())&&!r.owner.toLowerCase().includes(search.toLowerCase())&&!r.dept.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byDept={};
  filtered.forEach(r=>{ if(!byDept[r.dept]) byDept[r.dept]=[]; byDept[r.dept].push(r); });

  function saveEdit(form) { setOkrs(prev=>prev.map(o=>o.id===editing.id?{...o,...form}:o)); setEditing(null); }

  function openAI() {
    if(!localStorage.getItem("okr_api_key")){ setShowApiPrompt(true); return; }
    setAiOpen(true);
  }

  const wowColor=w=>!w||w==="0%"?A.gray400:w.startsWith("+")?A.blue:A.copper;
  const sel={ padding:"8px 12px", borderRadius:8, border:`1px solid ${A.gray300}`, fontSize:12, fontFamily:"'Montserrat',sans-serif", background:A.white, outline:"none", color:A.black, cursor:"pointer" };

  return (
    <div style={{ fontFamily:"'Montserrat',sans-serif", minHeight:"100vh", background:A.gray100, color:A.black }}>
      <header style={{ background:A.blue, borderBottom:`1px solid ${A.blueDark}`, padding:"0 28px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, background:A.white, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:A.blue, fontSize:14, fontWeight:800 }}>A</span>
            </div>
            <span style={{ fontSize:15, fontWeight:800, color:A.white, letterSpacing:"-0.01em" }}>OKR Tracker</span>
          </div>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,0.3)" }}/>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontFamily:"'Montserrat',sans-serif" }}>Q1 2026 · 53/74 days</span>
          <div style={{ width:72, height:4, background:"rgba(255,255,255,0.3)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ width:"71.6%", height:"100%", background:A.gold }}/>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.15)", borderRadius:8, padding:3 }}>
            {[["dashboard","Dashboard"],["list","All KRs"]].map(([v,label])=>(
              <button key={v} onClick={()=>setView(v)} style={{ padding:"5px 14px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:view===v?A.white:"transparent", color:view===v?A.blue:"rgba(255,255,255,0.8)", boxShadow:view===v?"0 1px 3px rgba(0,0,0,0.12)":"none", transition:"all 0.15s" }}>{label}</button>
            ))}
          </div>
          <button onClick={openAI} style={{ padding:"7px 16px", borderRadius:8, border:`2px solid rgba(255,255,255,0.4)`, background:aiOpen?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.15)", color:A.white, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:12 }}>✦</span> AI Assistant
          </button>
        </div>
      </header>

      <main style={{ padding: aiOpen?"22px 420px 22px 22px":"22px", transition:"padding 0.3s", maxWidth: aiOpen?"none":1200, margin: aiOpen?0:"0 auto" }}>
        {view==="dashboard" && <Dashboard okrs={okrs}/>}

        {view==="list" && (
          <>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search KRs, owners…" style={{ ...sel, width:220, cursor:"text" }}/>
              <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} style={sel}>
                <option value="">All departments</option>
                {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
              </select>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={sel}>
                <option value="">All statuses</option>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
              <select value={krFilter} onChange={e=>setKrFilter(e.target.value)} style={{ ...sel, maxWidth:220 }}>
                <option value="">All company KRs</option>
                {COMPANY_KRS.map(k=><option key={k} value={k}>{k.length>42?k.slice(0,39)+"…":k}</option>)}
              </select>
              {(deptFilter||statusFilter||krFilter||search)&&(
                <button onClick={()=>{ setDeptFilter(""); setStatusFilter(""); setKrFilter(""); setSearch(""); }} style={{ ...sel, color:A.copper, borderColor:"#fecaca", background:A.copperLight }}>✕ Clear</button>
              )}
              <span style={{ marginLeft:"auto", fontSize:12, color:A.gray500, fontFamily:"'Montserrat',sans-serif" }}>{filtered.length} results</span>
            </div>

            {Object.keys(byDept).sort().map(dept=>{
              const items=byDept[dept];
              const isOpen=collapsed[dept]!==true;
              const risks=items.filter(r=>r.status==="At Risk"||r.status==="Off Track").length;
              const done=items.filter(r=>r.status==="Completed").length;
              const avgPct=Math.round(items.reduce((a,r)=>a+r.pct,0)/items.length);
              return (
                <div key={dept} style={{ marginBottom:10 }}>
                  <div onClick={()=>setCollapsed(c=>({...c,[dept]:isOpen}))} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px", background:A.white, borderRadius:10, cursor:"pointer", marginBottom:3, border:`1px solid ${A.gray300}`, userSelect:"none" }}>
                    <span style={{ fontSize:10, color:isOpen?A.blue:A.gray400, display:"inline-block", transform:isOpen?"rotate(90deg)":"none", transition:"transform 0.2s" }}>▶</span>
                    <span style={{ fontSize:13, fontWeight:700, color:A.black, flex:1 }}>{dept}</span>
                    <span style={{ fontSize:11, color:A.gray400, fontFamily:"'Montserrat',sans-serif" }}>{items.length} KRs · {avgPct}%</span>
                    {risks>0&&<Badge status="At Risk" small/>}
                    {done>0&&<Badge status="Completed" small/>}
                  </div>
                  {isOpen&&items.map(okr=>{
                    const isExpanded=expandedKR===okr.id;
                    return (
                      <div key={okr.id} onClick={()=>setExpandedKR(isExpanded?null:okr.id)} style={{ background:A.white, borderRadius:8, padding:"13px 16px", marginBottom:3, border:`1px solid ${isExpanded?A.gray400:A.gray200}`, cursor:"pointer", marginLeft:12 }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, color:A.black, lineHeight:1.45, fontWeight:500, marginBottom:5 }}>{okr.kr}</div>
                            <div style={{ fontSize:11, color:A.gray500, fontFamily:"'Montserrat',sans-serif", display:"flex", gap:14, marginBottom:7, flexWrap:"wrap" }}>
                              <span>👤 {okr.owner}</span>
                              <span>{okr.start} → {okr.target} · now {okr.current}</span>
                              {okr.wow&&<span style={{ color:wowColor(okr.wow), fontWeight:600 }}>{okr.wow}</span>}
                            </div>
                            <ProgressBar pct={okr.pct} status={okr.status}/>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:7, minWidth:100 }}>
                            <Badge status={okr.status}/>
                            <button onClick={e=>{ e.stopPropagation(); setEditing(okr); }} style={{ padding:"4px 12px", borderRadius:5, border:`1px solid ${A.gray300}`, background:A.white, cursor:"pointer", fontSize:11, color:A.gray700, fontFamily:"'Montserrat',sans-serif" }}>Edit ↗</button>
                          </div>
                        </div>
                        {isExpanded&&(
                          <div style={{ marginTop:10 }}>
                            <div style={{ fontSize:12, color:A.gray700, lineHeight:1.55, padding:"10px 12px", background:A.gray100, borderRadius:7, borderLeft:`3px solid ${A.blue}` }}>{okr.update}</div>
                            <div style={{ marginTop:7, fontSize:11, color:A.gray400, fontFamily:"'Montserrat',sans-serif" }}>🎯 {okr.companyKR} &nbsp;·&nbsp; 📌 {okr.obj}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {filtered.length===0&&<div style={{ textAlign:"center", padding:"60px 20px", color:A.gray400, fontSize:13 }}>No KRs match the current filters.</div>}
          </>
        )}
      </main>

      {editing&&<EditModal okr={editing} onSave={saveEdit} onClose={()=>setEditing(null)}/>}

      {showApiPrompt&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setShowApiPrompt(false)}>
          <div style={{ background:A.white, borderRadius:14, padding:32, width:440, boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:36, height:36, background:A.blue, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
              <span style={{ color:A.white, fontSize:18, fontWeight:800 }}>A</span>
            </div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:8, color:A.black }}>Connect AI Assistant</div>
            <div style={{ fontSize:13, color:A.gray500, marginBottom:20, lineHeight:1.6 }}>Enter your Anthropic API key. Stored only in your browser, sent directly to Anthropic's API.</div>
            <input type="password" value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"){ localStorage.setItem("okr_api_key",apiKeyInput); setShowApiPrompt(false); setAiOpen(true); }}} placeholder="sk-ant-..." style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${A.gray300}`, fontSize:13, fontFamily:"'Montserrat',sans-serif", boxSizing:"border-box", marginBottom:16, outline:"none" }}/>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowApiPrompt(false)} style={{ padding:"9px 20px", borderRadius:7, border:`1px solid ${A.gray300}`, background:A.white, cursor:"pointer", fontSize:13 }}>Cancel</button>
              <button onClick={()=>{ localStorage.setItem("okr_api_key",apiKeyInput); setShowApiPrompt(false); setAiOpen(true); }} style={{ padding:"9px 22px", borderRadius:7, border:"none", background:A.blue, color:A.white, cursor:"pointer", fontSize:13, fontWeight:700 }}>Connect</button>
            </div>
          </div>
        </div>
      )}

      {aiOpen&&<AIChat okrs={filtered.length>0?filtered:okrs} onClose={()=>setAiOpen(false)}/>}
    </div>
  );
}
