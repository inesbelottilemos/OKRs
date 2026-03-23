import { useState, useRef, useEffect } from "react";
import { INITIAL_OKR_DATA, DEPARTMENTS, COMPANY_KRS, STATUSES } from "./data";

// ─── Brand tokens ────────────────────────────────────────────────────────────
const A = {
  blue:"#5C8EF1", blueLight:"#EBF1FE", blueDark:"#28628E", blueMid:"#4A7DE8",
  white:"#FFFFFF", gold:"#F3D780", goldDeep:"#F3C231",
  blueSky:"#8EDDED", blueSkyLight:"#E8F9FD",
  copper:"#E18B63", copperLight:"#FBF0EA",
  pink:"#DF8CBA", pinkLight:"#FBF0F7",
  surfGreen:"#70E0A3", surfLight:"#EDFBF4",
  invernessGreen:"#00838A", sageGreen:"#00AD4A", sageLight:"#E6F9EE",
  black:"#1A1A2E", gray100:"#F8F9FC", gray200:"#EEEEF4",
  gray300:"#DDDDE8", gray400:"#B8B8CC", gray500:"#8888A0", gray700:"#444460",
};

const STATUS_CFG = {
  "On Track":    { bg:A.sageLight,    color:"#006B2E",         dot:A.sageGreen },
  "At Risk":     { bg:"#FEF9E7",      color:"#7A5C00",         dot:A.goldDeep },
  "Off Track":   { bg:A.copperLight,  color:"#7A3A18",         dot:A.copper },
  "Completed":   { bg:A.blueSkyLight, color:A.invernessGreen,  dot:A.invernessGreen },
  "Not Started": { bg:A.gray200,      color:A.gray700,         dot:A.gray400 },
};

const FONT = "'Montserrat', sans-serif";
const COMPANY_OBJECTIVES = [
  { id:"O1", title:"Win upmarket", color:A.blue },
  { id:"O2", title:"Retain & grow revenue", color:A.invernessGreen },
  { id:"O3", title:"Operational excellence", color:A.copper },
  { id:"O4", title:"Engaged, high-performing team", color:A.pink },
];

// ─── Amenitiz SVG Logo ───────────────────────────────────────────────────────
function AmenitizLogo({ height = 22, white = false }) {
  const color = white ? "#FFFFFF" : A.blue;
  return (
    <svg height={height} viewBox="0 0 200 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="42" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="46" fill={color} letterSpacing="-2">amenitiz</text>
    </svg>
  );
}

// ─── UI primitives ───────────────────────────────────────────────────────────
function Badge({ status, small }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG["Not Started"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:small?"2px 8px":"4px 10px", borderRadius:20, fontSize:small?10:11, fontWeight:700, background:cfg.bg, color:cfg.color, fontFamily:FONT, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
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
      <span style={{ fontSize:11, color:A.gray500, fontFamily:FONT, minWidth:28, textAlign:"right", fontWeight:600 }}>{pct}%</span>
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:A.white, border:`1px solid ${A.gray300}`, borderRadius:12, padding:"20px 22px", ...style }}>{children}</div>;
}

function CardTitle({ title, sub }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:13, fontWeight:700, color:A.black, fontFamily:FONT }}>{title}</div>
      {sub && <div style={{ fontSize:11, color:A.gray500, marginTop:2, fontFamily:FONT }}>{sub}</div>}
    </div>
  );
}

function Input({ value, onChange, placeholder, style={} }) {
  return <input value={value} onChange={onChange} placeholder={placeholder} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${A.gray300}`, fontSize:12, fontFamily:FONT, background:A.white, outline:"none", color:A.black, width:"100%", boxSizing:"border-box", ...style }} />;
}

function Btn({ children, onClick, variant="primary", small=false, disabled=false, style={} }) {
  const base = { padding:small?"5px 12px":"8px 18px", borderRadius:8, border:"none", fontSize:small?11:12, fontWeight:700, fontFamily:FONT, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1, transition:"opacity 0.15s", ...style };
  if (variant==="primary") return <button onClick={onClick} disabled={disabled} style={{ ...base, background:A.blue, color:A.white }}>{children}</button>;
  if (variant==="ghost")   return <button onClick={onClick} disabled={disabled} style={{ ...base, background:"transparent", color:A.gray700, border:`1px solid ${A.gray300}` }}>{children}</button>;
  if (variant==="danger")  return <button onClick={onClick} disabled={disabled} style={{ ...base, background:A.copperLight, color:"#7A3A18", border:`1px solid ${A.copper}` }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}

// ─── Charts ──────────────────────────────────────────────────────────────────
function DonutChart({ segments, size=150 }) {
  const r=50,cx=size/2,cy=size/2,circ=2*Math.PI*r;
  let offset=0;
  const total=segments.reduce((a,s)=>a+s.value,0)||1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={A.gray200} strokeWidth={18}/>
      {segments.map((s,i)=>{
        const dash=(s.value/total)*circ,gap=circ-dash;
        const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={18} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} transform={`rotate(-90 ${cx} ${cy})`}/>;
        offset+=dash; return el;
      })}
      <text x={cx} y={cy-6} textAnchor="middle" fontSize={22} fontWeight={800} fill={A.black} fontFamily="Montserrat,sans-serif">{total}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize={8} fill={A.gray500} fontFamily="Montserrat,sans-serif">KEY RESULTS</text>
    </svg>
  );
}

function BarChart({ data, height=130 }) {
  if (!data||!data.length) return null;
  const max=Math.max(...data.map(d=>d.value),1);
  const barW=34,gap=8,svgW=data.length*(barW+gap);
  return (
    <svg viewBox={`0 0 ${svgW} ${height+32}`} style={{ width:"100%", overflow:"visible" }}>
      {data.map((d,i)=>{
        const cfg=STATUS_CFG[d.status]||STATUS_CFG["On Track"];
        const barH=Math.max((d.value/max)*height,2),x=i*(barW+gap),y=height-barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={cfg.dot} opacity={0.9}/>
            <text x={x+barW/2} y={height+13} textAnchor="middle" fontSize={8} fill={A.gray500} fontFamily="Montserrat,sans-serif">{d.label}</text>
            <text x={x+barW/2} y={y-4} textAnchor="middle" fontSize={8} fill={A.gray700} fontFamily="Montserrat,sans-serif" fontWeight={600}>{d.value}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function TrendLine({ values, color=A.blue, width=80, height=28 }) {
  if (!values||values.length<2) return <span style={{ fontSize:11, color:A.gray400 }}>—</span>;
  const max=Math.max(...values,1),min=Math.min(...values),range=max-min||1;
  const pts=values.map((v,i)=>`${(i/(values.length-1))*width},${height-((v-min)/range)*height}`).join(" ");
  const last=values[values.length-1],prev=values[values.length-2];
  const diff=last-prev;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow:"visible" }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r={2.5} fill={color}/>
      </svg>
      <span style={{ fontSize:10, fontWeight:700, fontFamily:FONT, color:diff>0?A.sageGreen:diff<0?A.copper:A.gray400 }}>
        {diff>0?"+":""}{diff !== 0 ? diff.toFixed(0)+"%" : "—"}
      </span>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ okrs }) {
  const total=okrs.length;
  const onTrack=okrs.filter(o=>o.status==="On Track").length;
  const atRisk=okrs.filter(o=>o.status==="At Risk").length;
  const offTrack=okrs.filter(o=>o.status==="Off Track").length;
  const completed=okrs.filter(o=>o.status==="Completed").length;

  // Priority: Off Track (worst) > At Risk > On Track > Completed (only if ALL done)
  const worstStatus = (items) => {
    if (items.some(o=>o.status==="Off Track")) return "Off Track";
    if (items.some(o=>o.status==="At Risk"))   return "At Risk";
    if (items.every(o=>o.status==="Completed")) return "Completed";
    return "On Track";
  };

  const deptData=DEPARTMENTS.map(d=>{
    const items=okrs.filter(o=>o.dept===d);
    if(!items.length) return null;
    const avg=Math.round(items.reduce((a,o)=>a+o.pct,0)/items.length);
    return { label:d.length>9?d.slice(0,8)+"…":d, fullName:d, value:avg, status:worstStatus(items), count:items.length, atRisk:items.filter(o=>o.status==="At Risk"||o.status==="Off Track").length };
  }).filter(Boolean);

  const atRiskList=[...okrs].filter(o=>o.status==="At Risk"||o.status==="Off Track").sort((a,b)=>a.pct-b.pct).slice(0,6);

  const objProgress=COMPANY_OBJECTIVES.map(obj=>{
    const items=okrs.filter(o=>o.companyKR&&o.companyKR.toLowerCase().includes(obj.id.toLowerCase().replace("o","kr ")));
    const fallback=okrs.filter((_,i)=>i%COMPANY_OBJECTIVES.indexOf(obj)===0).slice(0,8);
    const use=items.length?items:fallback;
    const avg=use.length?Math.round(use.reduce((a,o)=>a+o.pct,0)/use.length):0;
    return { ...obj, avg, count:use.length };
  });

  const ckrSummary=COMPANY_KRS.map(ckr=>{
    const items=okrs.filter(o=>o.companyKR===ckr);
    if(!items.length) return null;
    const avg=Math.round(items.reduce((a,o)=>a+o.pct,0)/items.length);
    return { fullLabel:ckr, avg, count:items.length, status:worstStatus(items) };
  }).filter(Boolean);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* KPI summary row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
        {[
          { label:"Total KRs",  value:total,     color:A.blue,           sub:`${deptData.length} departments` },
          { label:"On Track",   value:onTrack,   color:A.sageGreen,      sub:`${total?Math.round(onTrack/total*100):0}% of KRs` },
          { label:"At Risk",    value:atRisk,    color:A.goldDeep,       sub:`${total?Math.round(atRisk/total*100):0}% of KRs` },
          { label:"Off Track",  value:offTrack,  color:A.copper,         sub:`${total?Math.round(offTrack/total*100):0}% of KRs` },
          { label:"Completed",  value:completed, color:A.invernessGreen, sub:`${total?Math.round(completed/total*100):0}% of KRs` },
        ].map(s=>(
          <div key={s.label} style={{ background:A.white, border:`1px solid ${A.gray300}`, borderRadius:12, padding:"16px 18px", borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:10, color:A.gray500, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:FONT, marginBottom:8, fontWeight:600 }}>{s.label}</div>
            <div style={{ fontSize:30, fontWeight:800, color:s.color, lineHeight:1, fontFamily:FONT }}>{s.value}</div>
            <div style={{ fontSize:11, color:A.gray400, marginTop:5, fontFamily:FONT }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Timeline progress banner */}
      <div style={{ background:`linear-gradient(135deg, ${A.blue} 0%, ${A.blueDark} 100%)`, borderRadius:12, padding:"16px 22px", display:"flex", alignItems:"center", gap:20 }}>
        <div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontFamily:FONT, fontWeight:600, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>Quarter timeline</div>
          <div style={{ fontSize:20, fontWeight:800, color:A.white, fontFamily:FONT }}>Q1 2026 — 71.6% elapsed</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontFamily:FONT, marginTop:2 }}>53 of 74 days · ends April 10</div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ height:8, background:"rgba(255,255,255,0.2)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ width:"71.6%", height:"100%", background:A.gold, borderRadius:4 }}/>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontFamily:FONT, fontWeight:600, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>Avg progress</div>
          <div style={{ fontSize:20, fontWeight:800, color:A.gold, fontFamily:FONT }}>{total?Math.round(okrs.reduce((a,o)=>a+o.pct,0)/total):0}%</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontFamily:FONT, marginTop:2 }}>across all KRs</div>
        </div>
      </div>

      {/* Row 2: donut + bar chart */}
      <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:12 }}>
        <Card>
          <CardTitle title="Status breakdown" sub="Q1 2026 · all key results" />
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
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
              <span style={{ fontSize:12, color:A.gray700, flex:1, fontFamily:FONT }}>{s.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color:A.black, fontFamily:FONT }}>{s.value}</span>
              <span style={{ fontSize:11, color:A.gray400, fontFamily:FONT, minWidth:30, textAlign:"right" }}>{total?Math.round(s.value/total*100):0}%</span>
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle title="Progress by department" sub="Average % completion — lower bars need attention" />
          <BarChart data={deptData} height={130}/>
        </Card>
      </div>

      {/* Row 3: At risk + Company KR alignment */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Card>
          <CardTitle title="⚠️ Needs attention" sub={`${atRiskList.length} KRs at risk or off track`} />
          {atRiskList.length===0
            ? <div style={{ fontSize:13, color:A.gray400, fontFamily:FONT }}>All KRs are on track 🎉</div>
            : atRiskList.map(o=>(
              <div key={o.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${A.gray200}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:4 }}>
                  <div style={{ fontSize:12, color:A.black, lineHeight:1.4, flex:1, fontFamily:FONT, fontWeight:500 }}>{o.kr}</div>
                  <Badge status={o.status} small/>
                </div>
                <div style={{ fontSize:11, color:A.gray400, fontFamily:FONT, marginBottom:5 }}>{o.dept} · {o.owner}</div>
                <ProgressBar pct={o.pct} status={o.status} height={4}/>
              </div>
            ))
          }
        </Card>
        <Card>
          <CardTitle title="Company KR progress" sub="Average across all department KRs" />
          {ckrSummary.map(ckr=>(
            <div key={ckr.fullLabel} style={{ marginBottom:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div style={{ fontSize:12, color:A.black, fontFamily:FONT, flex:1, paddingRight:8, fontWeight:500, lineHeight:1.35 }}>{ckr.fullLabel}</div>
                <span style={{ fontSize:11, fontFamily:FONT, color:A.gray400, whiteSpace:"nowrap" }}>{ckr.count} KRs</span>
              </div>
              <ProgressBar pct={ckr.avg} status={ckr.status} height={4}/>
            </div>
          ))}
        </Card>
      </div>

      {/* Department health table */}
      <Card>
        <CardTitle title="Department health overview" />
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:FONT }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${A.gray300}` }}>
              {["Department","KRs","At risk","Avg progress","Overall status"].map(h=>(
                <th key={h} style={{ textAlign:["Department","Overall status"].includes(h)?"left":"center", padding:"7px 12px", fontSize:10, color:A.gray500, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deptData.map(d=>(
              <tr key={d.fullName} style={{ borderBottom:`1px solid ${A.gray200}` }}>
                <td style={{ padding:"11px 12px", fontWeight:700, color:A.black }}>{d.fullName}</td>
                <td style={{ padding:"11px 12px", textAlign:"center", color:A.gray500, fontWeight:600 }}>{d.count}</td>
                <td style={{ padding:"11px 12px", textAlign:"center" }}>
                  {d.atRisk>0?<span style={{ color:A.copper, fontWeight:700 }}>{d.atRisk}</span>:<span style={{ color:A.gray300 }}>—</span>}
                </td>
                <td style={{ padding:"11px 12px", minWidth:160 }}><ProgressBar pct={d.value} status={d.status} height={5}/></td>
                <td style={{ padding:"11px 12px" }}><Badge status={d.status} small/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Check-ins panel ─────────────────────────────────────────────────────────
function CheckIns({ okrs, checkins, onAddCheckin }) {
  const [selected, setSelected]=useState(null);
  const [form, setForm]=useState({ update:"", blocker:"", nextWeek:"", status:"" });
  const [filter, setFilter]=useState("all");

  const grouped=okrs.filter(o=>{
    if(filter==="at-risk") return o.status==="At Risk"||o.status==="Off Track";
    if(filter==="not-updated") return !checkins[o.id]||checkins[o.id].length===0;
    return true;
  }).reduce((acc,o)=>{ if(!acc[o.dept]) acc[o.dept]=[]; acc[o.dept].push(o); return acc; },{});

  function submit() {
    if(!selected||!form.update.trim()) return;
    onAddCheckin(selected.id, { ...form, status:form.status||selected.status, date:new Date().toISOString().split("T")[0], owner:selected.owner });
    setForm({ update:"", blocker:"", nextWeek:"", status:"" });
    setSelected(null);
  }

  const sel={ padding:"7px 10px", borderRadius:7, border:`1px solid ${A.gray300}`, fontSize:11, fontFamily:FONT, background:A.white, outline:"none", color:A.black, cursor:"pointer" };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:16 }}>
      {/* KR list */}
      <div>
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          {[["all","All KRs"],["at-risk","At Risk / Off Track"],["not-updated","Not Updated"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{ ...sel, background:filter===v?A.blue:A.white, color:filter===v?A.white:A.gray700, fontWeight:filter===v?700:500, borderColor:filter===v?A.blue:A.gray300 }}>{l}</button>
          ))}
        </div>
        {Object.keys(grouped).sort().map(dept=>(
          <div key={dept} style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:A.gray500, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:FONT, marginBottom:6, paddingLeft:4 }}>{dept}</div>
            {grouped[dept].map(okr=>{
              const lastCI=checkins[okr.id]?.[checkins[okr.id].length-1];
              const isSelected=selected?.id===okr.id;
              return (
                <div key={okr.id} onClick={()=>setSelected(isSelected?null:okr)} style={{ background:isSelected?A.blueLight:A.white, border:`1px solid ${isSelected?A.blue:A.gray300}`, borderRadius:10, padding:"12px 14px", marginBottom:6, cursor:"pointer", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:A.black, fontFamily:FONT, lineHeight:1.4, marginBottom:4 }}>{okr.kr}</div>
                      <div style={{ fontSize:11, color:A.gray400, fontFamily:FONT }}>👤 {okr.owner}</div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                      <Badge status={okr.status} small/>
                      {lastCI
                        ? <span style={{ fontSize:10, color:A.gray400, fontFamily:FONT }}>{lastCI.date}</span>
                        : <span style={{ fontSize:10, color:A.copper, fontFamily:FONT, fontWeight:600 }}>No check-in</span>
                      }
                    </div>
                  </div>
                  <div style={{ marginTop:8 }}><ProgressBar pct={okr.pct} status={okr.status} height={4}/></div>
                  {lastCI&&<div style={{ marginTop:8, fontSize:11, color:A.gray600, fontFamily:FONT, lineHeight:1.5, padding:"7px 10px", background:A.gray100, borderRadius:6, borderLeft:`3px solid ${A.blue}` }}>{lastCI.update}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Check-in form */}
      <div>
        <div style={{ position:"sticky", top:76 }}>
          {selected ? (
            <Card>
              <div style={{ marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${A.gray200}` }}>
                <div style={{ fontSize:10, color:A.gray400, fontFamily:FONT, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{selected.dept} · {selected.owner}</div>
                <div style={{ fontSize:13, fontWeight:700, color:A.black, fontFamily:FONT, lineHeight:1.4 }}>{selected.kr}</div>
                <div style={{ marginTop:10 }}><ProgressBar pct={selected.pct} status={selected.status}/></div>
              </div>

              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:A.gray700, fontFamily:FONT, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Status</div>
                <select value={form.status||selected.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:`1px solid ${A.gray300}`, fontSize:12, fontFamily:FONT, outline:"none" }}>
                  {STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:A.gray700, fontFamily:FONT, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Progress & wins this week *</div>
                <textarea value={form.update} onChange={e=>setForm(f=>({...f,update:e.target.value}))} placeholder="What progress was made? What wins can you share?" rows={3} style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:`1px solid ${A.gray300}`, fontSize:12, fontFamily:FONT, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
              </div>

              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:A.gray700, fontFamily:FONT, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Blockers</div>
                <textarea value={form.blocker} onChange={e=>setForm(f=>({...f,blocker:e.target.value}))} placeholder="Any blockers or risks? What do you need?" rows={2} style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:`1px solid ${A.gray300}`, fontSize:12, fontFamily:FONT, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:A.gray700, fontFamily:FONT, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" }}>Plan for next week</div>
                <textarea value={form.nextWeek} onChange={e=>setForm(f=>({...f,nextWeek:e.target.value}))} placeholder="What will you focus on next week?" rows={2} style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:`1px solid ${A.gray300}`, fontSize:12, fontFamily:FONT, outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={submit} disabled={!form.update.trim()}>Submit check-in</Btn>
                <Btn variant="ghost" onClick={()=>setSelected(null)}>Cancel</Btn>
              </div>

              {/* History */}
              {checkins[selected.id]?.length>0&&(
                <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${A.gray200}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:A.gray500, fontFamily:FONT, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>History</div>
                  {[...checkins[selected.id]].reverse().map((ci,i)=>(
                    <div key={i} style={{ marginBottom:10, padding:"10px 12px", background:A.gray100, borderRadius:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:A.gray500, fontFamily:FONT, textTransform:"uppercase" }}>{ci.date}</span>
                        <Badge status={ci.status} small/>
                      </div>
                      <div style={{ fontSize:12, color:A.black, fontFamily:FONT, lineHeight:1.5 }}>{ci.update}</div>
                      {ci.blocker&&<div style={{ fontSize:11, color:A.copper, fontFamily:FONT, marginTop:4 }}>🚧 {ci.blocker}</div>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>💬</div>
              <div style={{ fontSize:13, fontWeight:700, color:A.black, fontFamily:FONT, marginBottom:6 }}>Select a KR to check in</div>
              <div style={{ fontSize:12, color:A.gray400, fontFamily:FONT, lineHeight:1.6 }}>Click any key result on the left to add a weekly update, log blockers, and track progress.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── All KRs list ─────────────────────────────────────────────────────────────
function KRList({ okrs, onEdit }) {
  const [deptFilter,setDeptFilter]=useState("");
  const [statusFilter,setStatusFilter]=useState("");
  const [krFilter,setKrFilter]=useState("");
  const [search,setSearch]=useState("");
  const [collapsed,setCollapsed]=useState({});
  const [expandedKR,setExpandedKR]=useState(null);

  const filtered=okrs.filter(r=>{
    if(deptFilter&&r.dept!==deptFilter) return false;
    if(statusFilter&&r.status!==statusFilter) return false;
    if(krFilter&&r.companyKR!==krFilter) return false;
    if(search&&!r.kr.toLowerCase().includes(search.toLowerCase())&&!r.owner.toLowerCase().includes(search.toLowerCase())&&!r.dept.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byDept={};
  filtered.forEach(r=>{ if(!byDept[r.dept]) byDept[r.dept]=[]; byDept[r.dept].push(r); });
  const wowColor=w=>!w||w==="0%"?A.gray400:w.startsWith("+")?A.sageGreen:A.copper;
  const sel={ padding:"7px 12px", borderRadius:8, border:`1px solid ${A.gray300}`, fontSize:12, fontFamily:FONT, background:A.white, outline:"none", color:A.black, cursor:"pointer" };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search KRs, owners…" style={{ ...sel, cursor:"text", width:220 }}/>
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
          <button onClick={()=>{ setDeptFilter(""); setStatusFilter(""); setKrFilter(""); setSearch(""); }} style={{ ...sel, color:A.copper, borderColor:A.copper, background:A.copperLight }}>✕ Clear</button>
        )}
        <span style={{ marginLeft:"auto", fontSize:12, color:A.gray500, fontFamily:FONT }}>{filtered.length} results</span>
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
              <span style={{ fontSize:13, fontWeight:700, color:A.black, flex:1, fontFamily:FONT }}>{dept}</span>
              <span style={{ fontSize:11, color:A.gray400, fontFamily:FONT }}>{items.length} KRs · {avgPct}%</span>
              {risks>0&&<Badge status="At Risk" small/>}
              {done>0&&<Badge status="Completed" small/>}
            </div>
            {isOpen&&items.map(okr=>{
              const isExpanded=expandedKR===okr.id;
              return (
                <div key={okr.id} onClick={()=>setExpandedKR(isExpanded?null:okr.id)} style={{ background:A.white, borderRadius:8, padding:"13px 16px", marginBottom:3, border:`1px solid ${isExpanded?A.blue:A.gray200}`, cursor:"pointer", marginLeft:12, transition:"border-color 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:A.black, lineHeight:1.45, fontWeight:600, marginBottom:5, fontFamily:FONT }}>{okr.kr}</div>
                      <div style={{ fontSize:11, color:A.gray500, fontFamily:FONT, display:"flex", gap:14, marginBottom:7, flexWrap:"wrap" }}>
                        <span>👤 {okr.owner}</span>
                        <span>{okr.start} → {okr.target} · now {okr.current}</span>
                        {okr.wow&&<span style={{ color:wowColor(okr.wow), fontWeight:700 }}>{okr.wow}</span>}
                      </div>
                      <ProgressBar pct={okr.pct} status={okr.status}/>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:7, minWidth:100 }}>
                      <Badge status={okr.status}/>
                      <button onClick={e=>{ e.stopPropagation(); onEdit(okr); }} style={{ padding:"4px 12px", borderRadius:5, border:`1px solid ${A.gray300}`, background:A.white, cursor:"pointer", fontSize:11, color:A.gray700, fontFamily:FONT, fontWeight:600 }}>Edit ↗</button>
                    </div>
                  </div>
                  {isExpanded&&(
                    <div style={{ marginTop:10 }}>
                      <div style={{ fontSize:12, color:A.gray700, lineHeight:1.55, padding:"10px 12px", background:A.gray100, borderRadius:7, borderLeft:`3px solid ${A.blue}`, fontFamily:FONT }}>{okr.update}</div>
                      <div style={{ marginTop:7, fontSize:11, color:A.gray400, fontFamily:FONT }}>🎯 {okr.companyKR} &nbsp;·&nbsp; 📌 {okr.obj}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
      {filtered.length===0&&<div style={{ textAlign:"center", padding:"60px 20px", color:A.gray400, fontSize:13, fontFamily:FONT }}>No KRs match the current filters.</div>}
    </div>
  );
}

// ─── Alignment map ────────────────────────────────────────────────────────────
function AlignmentView({ okrs }) {
  const [selected,setSelected]=useState(null);
  return (
    <div>
      <div style={{ marginBottom:16, fontSize:13, color:A.gray500, fontFamily:FONT, lineHeight:1.6 }}>
        Each company KR is supported by department key results. Click a company KR to see which teams own it and how they're progressing.
      </div>
      {COMPANY_KRS.map(ckr=>{
        const items=okrs.filter(o=>o.companyKR===ckr);
        if(!items.length) return null;
        const avg=Math.round(items.reduce((a,o)=>a+o.pct,0)/items.length);
        const worst=items.some(o=>o.status==="Off Track")?"Off Track":items.some(o=>o.status==="At Risk")?"At Risk":items.every(o=>o.status==="Completed")?"Completed":"On Track";
        const isOpen=selected===ckr;
        return (
          <div key={ckr} style={{ marginBottom:8 }}>
            <div onClick={()=>setSelected(isOpen?null:ckr)} style={{ background:A.white, border:`1px solid ${isOpen?A.blue:A.gray300}`, borderRadius:10, padding:"14px 18px", cursor:"pointer", transition:"all 0.15s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:10, color:isOpen?A.blue:A.gray400, display:"inline-block", transform:isOpen?"rotate(90deg)":"none", transition:"transform 0.2s" }}>▶</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:A.black, fontFamily:FONT, marginBottom:6 }}>{ckr}</div>
                  <ProgressBar pct={avg} status={worst} height={5}/>
                </div>
                <div style={{ textAlign:"right", minWidth:80 }}>
                  <Badge status={worst} small/>
                  <div style={{ fontSize:11, color:A.gray400, fontFamily:FONT, marginTop:4 }}>{items.length} KRs · {[...new Set(items.map(o=>o.dept))].length} depts</div>
                </div>
              </div>
            </div>

            {isOpen&&(
              <div style={{ marginLeft:20, marginTop:4, display:"flex", flexDirection:"column", gap:4 }}>
                {[...new Set(items.map(o=>o.dept))].map(dept=>{
                  const dItems=items.filter(o=>o.dept===dept);
                  const dAvg=Math.round(dItems.reduce((a,o)=>a+o.pct,0)/dItems.length);
                  const dStatus=dItems.some(o=>o.status==="Off Track")?"Off Track":dItems.some(o=>o.status==="At Risk")?"At Risk":dItems.every(o=>o.status==="Completed")?"Completed":"On Track";
                  return (
                    <div key={dept} style={{ background:A.gray100, borderRadius:8, padding:"10px 14px", borderLeft:`3px solid ${A.blue}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:A.black, fontFamily:FONT, flex:1 }}>{dept}</span>
                        <Badge status={dStatus} small/>
                      </div>
                      {dItems.map(o=>(
                        <div key={o.id} style={{ marginBottom:8 }}>
                          <div style={{ fontSize:11, color:A.gray700, fontFamily:FONT, marginBottom:4, fontWeight:500 }}>{o.kr}</div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ flex:1 }}><ProgressBar pct={o.pct} status={o.status} height={3}/></div>
                            <span style={{ fontSize:10, color:A.gray400, fontFamily:FONT }}>👤 {o.owner}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ okr, onSave, onClose }) {
  const [form,setForm]=useState({ current:okr.current, pct:okr.pct, status:okr.status, update:okr.update, wow:okr.wow });
  const inp=(s={})=>({ width:"100%", padding:"8px 10px", borderRadius:7, border:`1px solid ${A.gray300}`, fontSize:12, fontFamily:FONT, outline:"none", boxSizing:"border-box", background:A.white, color:A.black, ...s });
  const lbl=t=><div style={{ fontSize:10, color:A.gray500, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, marginTop:12, fontWeight:700 }}>{t}</div>;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:A.white, borderRadius:14, padding:28, width:480, maxWidth:"92vw", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:A.gray400, fontFamily:FONT, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700 }}>{okr.dept} · {okr.owner}</div>
          <div style={{ fontSize:14, fontWeight:700, color:A.black, lineHeight:1.4, fontFamily:FONT }}>{okr.kr}</div>
        </div>
        {lbl("Current value")}
        <input value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))} style={inp()}/>
        {lbl("Progress %")}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:2 }}>
          <input type="range" min={0} max={100} value={form.pct} onChange={e=>setForm(f=>({...f,pct:+e.target.value}))} style={{ flex:1, accentColor:A.blue }}/>
          <span style={{ fontSize:15, fontWeight:800, color:A.blue, fontFamily:FONT, minWidth:36 }}>{form.pct}%</span>
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
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={()=>onSave(form)}>Save changes</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat({ okrs, checkins, onClose }) {
  const [messages,setMessages]=useState([{ role:"assistant", content:"Hi! I have full context on all Q1 2026 OKRs and check-ins. Ask me about risks, what needs attention, department summaries, or what to present to leadership." }]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages]);

  const ciSummary=Object.entries(checkins).map(([id,cis])=>({ id, latest:cis[cis.length-1] })).filter(x=>x.latest);
  const sp=`You are an OKR analyst for Amenitiz (hotel management SaaS). Q1 2026 (Jan 26–Apr 10, now March 9, 71.6% elapsed).
OKR DATA: ${JSON.stringify(okrs.map(o=>({ dept:o.dept, kr:o.kr, owner:o.owner, progress:o.pct+"%", status:o.status, current:o.current, target:o.target, update:o.update, wow:o.wow })))}
RECENT CHECK-INS: ${JSON.stringify(ciSummary)}
Stats: ${okrs.length} total · ${okrs.filter(o=>o.status==="On Track").length} On Track · ${okrs.filter(o=>o.status==="At Risk").length} At Risk · ${okrs.filter(o=>o.status==="Off Track").length} Off Track · ${okrs.filter(o=>o.status==="Completed").length} Completed.
Be concise, data-driven, action-oriented. Use bullets. Reference owners by name. Surface patterns across departments.`;

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
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:420, background:A.white, borderLeft:`1px solid ${A.gray300}`, display:"flex", flexDirection:"column", zIndex:200, fontFamily:FONT }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${A.gray300}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:A.blue }}>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:A.white, fontFamily:FONT }}>AI Assistant</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", marginTop:1 }}>{okrs.length} KRs · {Object.keys(checkins).length} check-ins in context</div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:A.white, cursor:"pointer", borderRadius:6, padding:"5px 12px", fontSize:12, fontFamily:FONT }}>✕</button>
      </div>

      {/* Suggested prompts */}
      <div style={{ padding:"10px 14px", background:A.blueLight, borderBottom:`1px solid ${A.gray300}`, display:"flex", gap:6, flexWrap:"wrap" }}>
        {["Which KRs need LT attention?","Summarize Revenue dept","What's off track this week?","Draft a board update"].map(p=>(
          <button key={p} onClick={()=>{ setInput(p); }} style={{ fontSize:10, padding:"4px 10px", borderRadius:20, border:`1px solid ${A.blue}`, background:A.white, color:A.blue, cursor:"pointer", fontFamily:FONT, fontWeight:600 }}>{p}</button>
        ))}
      </div>

      <div style={{ flex:1, overflow:"auto", padding:14, display:"flex", flexDirection:"column", gap:10, background:A.gray100 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"90%" }}>
            <div style={{ padding:"10px 14px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?A.blue:A.white, color:m.role==="user"?A.white:A.black, fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap", border:m.role==="assistant"?`1px solid ${A.gray300}`:"none", fontFamily:FONT }}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{ alignSelf:"flex-start", padding:"10px 14px", background:A.white, borderRadius:"14px 14px 14px 4px", color:A.gray400, fontSize:13, border:`1px solid ${A.gray300}` }}>Thinking…</div>}
        <div ref={bottomRef}/>
      </div>

      <div style={{ padding:14, borderTop:`1px solid ${A.gray300}`, background:A.white }}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask about your OKRs…" style={{ flex:1, background:A.gray100, border:`1px solid ${A.gray300}`, borderRadius:8, padding:"9px 12px", color:A.black, fontSize:13, outline:"none", fontFamily:FONT }}/>
          <button onClick={send} disabled={loading||!input.trim()} style={{ background:A.blue, border:"none", color:A.white, borderRadius:8, padding:"9px 16px", cursor:"pointer", fontSize:16, opacity:loading||!input.trim()?0.5:1 }}>↑</button>
        </div>
        <div style={{ fontSize:10, color:A.gray400, marginTop:7, textAlign:"center", fontFamily:FONT }}>Powered by Claude · key stored locally</div>
      </div>
    </div>
  );
}

// ─── Glossary ─────────────────────────────────────────────────────────────────
const GLOSSARY_DATA = {
  shared: {
    title: "Status colour coding",
    items: [
      { dot: A.sageGreen,      bg: "#E6F9EE", color: "#006B2E", label: "On Track",    desc: "Progress is aligned with or ahead of the timeline. No intervention needed." },
      { dot: A.goldDeep,       bg: "#FEF9E7", color: "#7A5C00", label: "At Risk",     desc: "Progress is falling behind. Action is needed to prevent missing the target." },
      { dot: A.copper,         bg: "#FBF0EA", color: "#7A3A18", label: "Off Track",   desc: "Significantly behind target. Recovery plan is required immediately." },
      { dot: A.invernessGreen, bg: "#E8F9FD", color: "#00838A", label: "Completed",   desc: "Target has been fully achieved before or at the end of the quarter." },
      { dot: A.gray400,        bg: A.gray200, color: A.gray700, label: "Not Started", desc: "No progress has been recorded yet for this key result." },
    ],
  },
  dashboard: {
    title: "Dashboard — what you're looking at",
    items: [
      { icon: "📊", label: "KPI cards (top row)",       desc: "A snapshot of all key results this quarter. The coloured top border matches the status it represents." },
      { icon: "🍩", label: "Donut chart",               desc: "Each segment shows the proportion of KRs in that status. Larger segments = more KRs in that state." },
      { icon: "📶", label: "Bar chart (by department)", desc: "Each bar = the average progress % for that department. Shorter bars need more attention." },
      { icon: "⚠️", label: "Needs attention list",      desc: "The at-risk and off-track KRs with the lowest progress, ranked from worst to best." },
      { icon: "🏢", label: "Department health table",   desc: "'At risk' column counts KRs that are At Risk or Off Track. 'Avg progress' uses the same colour coding as status badges." },
      { icon: "🟡", label: "Gold bar (timeline)",       desc: "The gold fill in the header progress bar shows how much of the quarter has elapsed (71.6%)." },
    ],
  },
  alignment: {
    title: "Alignment — how to read this view",
    items: [
      { icon: "🔵", label: "Blue left border",          desc: "Each indented block represents a department contributing to that company KR. The border connects it visually to the parent." },
      { icon: "📏", label: "Progress bar colour",       desc: "Same status colour coding as badges — green = on track, yellow = at risk, orange = off track, teal = completed." },
      { icon: "🔢", label: "KRs · Depts counter",       desc: "Shows how many department KRs are linked to that company objective, and across how many departments." },
      { icon: "▶",  label: "Expand arrow",              desc: "Click any company KR row to expand and see every department and individual KR supporting it." },
    ],
  },
  checkins: {
    title: "Check-ins — how it works",
    items: [
      { icon: "🟠", label: "No check-in (orange text)", desc: "This KR has never had a weekly update submitted. It should be prioritised for a check-in." },
      { icon: "📅", label: "Date stamp",                desc: "Shows when the last check-in was submitted. Aim for at least once per week." },
      { icon: "🚧", label: "Orange blocker text",       desc: "A blocker logged in the check-in form. Visible in the history to track whether it was resolved." },
      { icon: "🔵", label: "Blue left border (update)", desc: "The latest check-in update is shown directly on the KR card for quick visibility without opening it." },
      { icon: "⬆️", label: "Green trend arrow",        desc: "Week-on-week change is positive — progress increased since last check-in." },
      { icon: "⬇️", label: "Orange trend arrow",       desc: "Week-on-week change is negative — progress decreased or a value worsened since last check-in." },
    ],
  },
  list: {
    title: "All KRs — what the numbers mean",
    items: [
      { icon: "→",  label: "Start → Target · now X",  desc: "Shows the baseline value, the goal, and the current measured value. Example: 17.8% → 20.0% · now 7.3%." },
      { icon: "📈", label: "Week-on-week (WoW)",       desc: "The percentage change since last week. Green = improving, orange = declining." },
      { icon: "▶",  label: "Click to expand",          desc: "Clicking a KR row reveals the full weekly update, the company KR it supports, and the department objective." },
      { icon: "✏️", label: "Edit ↗ button",            desc: "Opens the edit form to update the current value, progress %, status, WoW change, and weekly notes." },
      { icon: "🔵", label: "Blue border on expand",    desc: "The selected KR is highlighted with a blue border so you always know which one is open." },
    ],
  },
};

function Glossary({ currentView }) {
  const [open, setOpen] = useState(false);
  const shared = GLOSSARY_DATA.shared;
  const page = GLOSSARY_DATA[currentView];

  return (
    <div style={{ marginTop: 40, borderTop: `1px solid ${A.gray300}`, paddingTop: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: FONT, width: "100%" }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: A.gray500, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          📖 Colour & legend glossary
        </span>
        <div style={{ flex: 1, height: 1, background: A.gray300 }} />
        <span style={{ fontSize: 11, color: A.gray400, fontFamily: FONT }}>{open ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Status colour coding — always shown */}
          <div style={{ background: A.white, border: `1px solid ${A.gray300}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: A.black, fontFamily: FONT, marginBottom: 14 }}>{shared.title}</div>
            {shared.items.map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: item.bg, color: item.color, fontFamily: FONT, whiteSpace: "nowrap", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.dot }} />
                  {item.label}
                </span>
                <span style={{ fontSize: 12, color: A.gray700, fontFamily: FONT, lineHeight: 1.5 }}>{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Page-specific legend */}
          {page && (
            <div style={{ background: A.white, border: `1px solid ${A.gray300}`, borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: A.black, fontFamily: FONT, marginBottom: 14 }}>{page.title}</div>
              {page.items.map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center", lineHeight: "20px" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: A.black, fontFamily: FONT, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: A.gray500, fontFamily: FONT, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar key — full width */}
          <div style={{ gridColumn: "1 / -1", background: A.white, border: `1px solid ${A.gray300}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: A.black, fontFamily: FONT, marginBottom: 14 }}>Progress bars — colour reference</div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              {[
                { color: A.sageGreen,      label: "On Track — progressing as expected" },
                { color: A.goldDeep,       label: "At Risk — falling behind" },
                { color: A.copper,         label: "Off Track — significant gap to target" },
                { color: A.invernessGreen, label: "Completed — target reached" },
                { color: A.gray300,        label: "Empty bar — no progress recorded" },
              ].map(b => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 48, height: 6, borderRadius: 3, background: A.gray200, overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ width: b.color === A.gray300 ? "0%" : "65%", height: "100%", background: b.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: A.gray700, fontFamily: FONT }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const VIEWS = [
  { id:"dashboard", label:"Dashboard", icon:"📊" },
  { id:"alignment", label:"Alignment", icon:"🔗" },
  { id:"checkins",  label:"Check-ins", icon:"💬" },
  { id:"list",      label:"All KRs",   icon:"🎯" },
];

const PASSWORD = "amenitiz2025";

function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function attempt() {
    if (value === PASSWORD) {
      sessionStorage.setItem("okr_unlocked", "1");
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setValue("");
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, ${A.blue} 0%, ${A.blueDark} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT }}>
      <div style={{ animation: shake ? "shake 0.4s ease" : "none" }}>
        <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`}</style>
        <div style={{ background:A.white, borderRadius:20, padding:"40px 44px", width:380, maxWidth:"90vw", boxShadow:"0 32px 80px rgba(0,0,0,0.25)", textAlign:"center" }}>

          {/* Logo */}
          <div style={{ marginBottom:28 }}>
            <div style={{ width:56, height:56, background:A.blue, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <span style={{ color:A.white, fontSize:28, fontWeight:900 }}>A</span>
            </div>
            <div style={{ fontSize:20, fontWeight:900, color:A.black, letterSpacing:"-0.02em" }}>amenitiz</div>
            <div style={{ fontSize:12, color:A.gray400, marginTop:4, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>OKR Tracker · Q1 2026</div>
          </div>

          <div style={{ fontSize:14, color:A.gray700, marginBottom:22, lineHeight:1.5 }}>
            This tool is for internal use only.<br/>Enter the team password to continue.
          </div>

          <input
            type="password"
            value={value}
            onChange={e=>{ setValue(e.target.value); setError(false); }}
            onKeyDown={e=>e.key==="Enter"&&attempt()}
            placeholder="Enter password"
            autoFocus
            style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:`2px solid ${error?A.copper:A.gray300}`, fontSize:14, fontFamily:FONT, outline:"none", boxSizing:"border-box", textAlign:"center", letterSpacing:"0.1em", transition:"border-color 0.2s", marginBottom:8 }}
          />

          {error && (
            <div style={{ fontSize:12, color:A.copper, fontWeight:600, marginBottom:10 }}>
              Incorrect password. Please try again.
            </div>
          )}

          <button
            onClick={attempt}
            style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", background:A.blue, color:A.white, fontSize:14, fontWeight:700, fontFamily:FONT, cursor:"pointer", marginTop:4, transition:"opacity 0.15s" }}
            onMouseOver={e=>e.target.style.opacity="0.88"}
            onMouseOut={e=>e.target.style.opacity="1"}
          >
            Enter →
          </button>

          <div style={{ fontSize:11, color:A.gray400, marginTop:18, fontFamily:FONT }}>
            Need access? Contact your OKR champion.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem("okr_unlocked")==="1");
  const [okrs,setOkrs]=useState(INITIAL_OKR_DATA);
  const [view,setView]=useState("dashboard");
  const [editing,setEditing]=useState(null);
  const [aiOpen,setAiOpen]=useState(false);
  const [showApiPrompt,setShowApiPrompt]=useState(false);
  const [apiKeyInput,setApiKeyInput]=useState("");
  const [checkins,setCheckins]=useState({});

  if (!unlocked) return <PasswordGate onUnlock={()=>setUnlocked(true)} />;

  function saveEdit(form) { setOkrs(prev=>prev.map(o=>o.id===editing.id?{...o,...form}:o)); setEditing(null); }

  function addCheckin(krId, ci) {
    setOkrs(prev=>prev.map(o=>o.id===krId?{...o, status:ci.status, update:ci.update}:o));
    setCheckins(prev=>({ ...prev, [krId]:[...(prev[krId]||[]),ci] }));
  }

  function openAI() {
    if(!localStorage.getItem("okr_api_key")){ setShowApiPrompt(true); return; }
    setAiOpen(true);
  }

  const mainPad = aiOpen ? "22px 440px 22px 22px" : "22px";

  return (
    <div style={{ fontFamily:FONT, minHeight:"100vh", background:A.gray100, color:A.black }}>

      {/* Header */}
      <header style={{ background:A.blue, padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <svg height="26" viewBox="0 0 240 52" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26" cy="26" r="26" fill="white" fillOpacity="0.2"/>
              <text x="26" y="35" textAnchor="middle" fontFamily="Montserrat,sans-serif" fontWeight="900" fontSize="26" fill="white">A</text>
              <text x="60" y="37" fontFamily="Montserrat,sans-serif" fontWeight="800" fontSize="32" fill="white" letterSpacing="-1">amenitiz</text>
            </svg>
          </div>
          <div style={{ width:1, height:20, background:"rgba(255,255,255,0.25)" }}/>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:600, letterSpacing:"0.04em" }}>OKR TRACKER · Q1 2026</span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Nav tabs */}
          <div style={{ display:"flex", background:"rgba(255,255,255,0.12)", borderRadius:10, padding:3, gap:2 }}>
            {VIEWS.map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{ padding:"5px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:FONT, background:view===v.id?"rgba(255,255,255,0.95)":"transparent", color:view===v.id?A.blue:"rgba(255,255,255,0.75)", transition:"all 0.15s" }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          <button onClick={openAI} style={{ padding:"7px 16px", borderRadius:8, border:"2px solid rgba(255,255,255,0.35)", background:aiOpen?"rgba(255,255,255,0.25)":"transparent", color:A.white, fontSize:12, fontWeight:700, fontFamily:FONT, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            ✦ AI Assistant
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding:mainPad, transition:"padding 0.3s", maxWidth:aiOpen?"none":1280, margin:aiOpen?0:"0 auto" }}>
        {view==="dashboard" && <Dashboard okrs={okrs}/>}
        {view==="alignment" && <AlignmentView okrs={okrs}/>}
        {view==="checkins"  && <CheckIns okrs={okrs} checkins={checkins} onAddCheckin={addCheckin}/>}
        {view==="list"      && <KRList okrs={okrs} onEdit={setEditing}/>}
        <Glossary currentView={view} />
      </main>

      {editing&&<EditModal okr={editing} onSave={saveEdit} onClose={()=>setEditing(null)}/>}

      {/* API key prompt */}
      {showApiPrompt&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setShowApiPrompt(false)}>
          <div style={{ background:A.white, borderRadius:14, padding:32, width:440, boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:44, height:44, background:A.blue, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <span style={{ color:A.white, fontSize:20, fontWeight:900 }}>A</span>
            </div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:8, color:A.black, fontFamily:FONT }}>Connect AI Assistant</div>
            <div style={{ fontSize:13, color:A.gray500, marginBottom:20, lineHeight:1.6, fontFamily:FONT }}>Enter your Anthropic API key. Stored only in your browser and sent directly to Anthropic's API — never to any other server.</div>
            <input type="password" value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"){ localStorage.setItem("okr_api_key",apiKeyInput); setShowApiPrompt(false); setAiOpen(true); }}} placeholder="sk-ant-..." style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${A.gray300}`, fontSize:13, fontFamily:FONT, boxSizing:"border-box", marginBottom:16, outline:"none" }}/>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn variant="ghost" onClick={()=>setShowApiPrompt(false)}>Cancel</Btn>
              <Btn onClick={()=>{ localStorage.setItem("okr_api_key",apiKeyInput); setShowApiPrompt(false); setAiOpen(true); }}>Connect</Btn>
            </div>
          </div>
        </div>
      )}

      {aiOpen&&<AIChat okrs={okrs} checkins={checkins} onClose={()=>setAiOpen(false)}/>}
    </div>
  );
}
