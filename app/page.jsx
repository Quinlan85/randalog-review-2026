// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

const CQ_LOGO = "/logo.png";
const SUPABASE_URL = "https://ccornucfqjfxhjurpbcu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb3JudWNmcWpmeGhqdXJwYmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTgwODQsImV4cCI6MjA5Mjg5NDA4NH0.EuVR4lUVniFAomiv2o9cAysMqmiCmQrMrWmxyaG96PA";
const TEAM = "randalog";
const STORAGE_KEY = "randalog_game_reviews";
const COACH_PIN = "1234";

const DESTROYERS = ["Mistakes","Going behind on the scoreboard","Sledging from opposition","Injury break / long stoppage","Stress from off the pitch","Too outcome focused","Unhelpful thoughts","The crowd","My coaches on the sideline","My teammates"];
const INTENSITY_LEVELS = [
  { id: "zone", label: "In the Zone", color: "#2ECC71", emoji: "⚡", desc: "Physically active, mentally sharp — I was up for it" },
  { id: "inconsistent", label: "Inconsistent", color: "#F4C542", emoji: "〰", desc: "Had moments but dipped in and out" },
  { id: "flat", label: "Flat", color: "#E74C3C", emoji: "▽", desc: "Heavy legs, going through the motions" },
];
const MINDSET_LEVELS = [
  { id: "challenge", label: "Challenge Mindset", color: "#2ECC71", emoji: "🔥", desc: "Excited, taking risks, playing freely — What do I stand to gain?" },
  { id: "mixed", label: "Mixed", color: "#F4C542", emoji: "〰", desc: "Had moments of both — shifted between the two" },
  { id: "threat", label: "Threat Mindset", color: "#E74C3C", emoji: "🔒", desc: "Anxious, hiding, tense — What do I stand to lose?" },
];
const CHALLENGE_FACTORS = ["Excited","Taking Appropriate Risks","Focused","Clear Decisions","Hurling & Moving Freely","Seeing the Game as a Challenge","Focusing on My Strengths","Good Preparation","Positive Body Language","Positive Self-Talk"];
const THREAT_FACTORS = ["Anxious","Playing Safe / Hiding","Distracted","Confused Decisions","Body Overly Tensed","Fear of Making Mistakes","Disjointed Preparation","Negative Self-Talk"];
const ZONE_FACTORS = ["Pre-match routine","Good warm-up","Cue phrases / self-talk","Stayed focused after mistakes","Positive body language","Support from teammates","Slept well / good preparation","High energy from throw-in"];
const RATINGS = [
  { key: "Preparation", desc: "Pre-match routine, nutrition, sleep, mental rehearsal" },
  { key: "Mindset", desc: "Challenge vs threat, self-belief, playing on the front foot" },
  { key: "Intensity", desc: "Physical activation, work rate, mental alertness for 70 mins" },
];
const RATING_LABELS = { 1:"Poor",2:"Poor",3:"Needs Work",4:"Needs Work",5:"Average",6:"Average",7:"Good",8:"Good",9:"Very Good",10:"Outstanding" };

const loadReviews = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e) { return []; } };
const saveReview = (review) => {
  try { const e = loadReviews(); e.unshift(review); localStorage.setItem(STORAGE_KEY, JSON.stringify(e.slice(0, 20))); } catch {}
};

const logCompletion = async (name, opposition, date) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ team: TEAM, name, opposition, date, timestamp: Date.now() }),
    });
  } catch {}
};

const loadCompletions = async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/completions?team=eq.${TEAM}&order=timestamp.desc`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    });
    return await res.json();
  } catch { return []; }
};

const getWeekKey = (timestamp) => {
  const d = new Date(timestamp);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
};

const STEP_LABELS = ["", "Intensity", "Mindset", "Went Well", "Development", "Ratings", "Action Plan", ""];
const TOTAL_STEPS = 7;

function ProgressBar({ step }) {
  const steps = ["Went Well", "Development", "Intensity", "Mindset", "Ratings", "Action Plan"];
  const current = step - 1;
  return (
    <div style={{ margin: "14px 0 24px" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i < current ? "#2ECC71" : i === current ? "#2ECC7166" : "#1E2D3D", transition: "background 0.3s ease" }} />
        ))}
      </div>
      {step > 0 && step < 7 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#2ECC71", fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 2 }}>{STEP_LABELS[step].toUpperCase()}</span>
          <span style={{ color: "#3D5166", fontFamily: "'Courier New', monospace", fontSize: 10 }}>{step} of {TOTAL_STEPS - 1}</span>
        </div>
      )}
    </div>
  );
}

function RatingRow({ label, desc, value, onChange }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#BDC3C7", fontFamily: "'Courier New', monospace", fontSize: 11, letterSpacing: 2 }}>{label.toUpperCase()}</span>
          {value > 0 && <span style={{ color: value >= 8 ? "#2ECC71" : value >= 5 ? "#F4C542" : "#E74C3C", fontSize: 11, fontFamily: "'Courier New', monospace" }}>{value} — {RATING_LABELS[value]}</span>}
        </div>
        <div style={{ color: "#3D5166", fontSize: 11, fontFamily: "Georgia, serif", marginTop: 3, fontStyle: "italic" }}>{desc}</div>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => onChange(n)} style={{ flex: 1, height: 38, borderRadius: 6, border: "none", background: value === n ? (n >= 8 ? "#2ECC71" : n >= 5 ? "#F4C542" : "#E74C3C") : value > 0 && n <= value ? (n >= 8 ? "#2ECC7122" : n >= 5 ? "#F4C54222" : "#E74C3C22") : "#1A2535", color: value === n ? "#0D1B2A" : "#7F8C8D", fontWeight: "bold", fontSize: 12, cursor: "pointer", transition: "all 0.15s ease", fontFamily: "'Courier New', monospace", transform: value === n ? "scale(1.1)" : "scale(1)" }}>{n}</button>
        ))}
      </div>
    </div>
  );
}

function ChipSelector({ items, selected, onToggle, color }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {items.map(d => {
        const isSelected = selected.includes(d);
        return (
          <button key={d} onClick={() => onToggle(d)} style={{ padding: "10px 14px", borderRadius: 30, border: `1.5px solid ${isSelected ? color : "#1E2D3D"}`, background: isSelected ? `${color}22` : "#111D2C", color: isSelected ? color : "#7F8C8D", fontFamily: "'Courier New', monospace", fontSize: 12, cursor: "pointer", transition: "all 0.15s ease" }}>{d}</button>
        );
      })}
    </div>
  );
}

function SelectedSummary({ items, color, bg }) {
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 16, padding: "10px 14px", background: bg, borderRadius: 10, border: `1px solid ${color}22` }}>
      <div style={{ color, fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>SELECTED</div>
      <div style={{ color: "#BDC3C7", fontSize: 12, fontFamily: "Georgia, serif" }}>{items.join(" · ")}</div>
    </div>
  );
}

function ActionField({ label, sublabel, value, onChange, placeholder, rows = 2 }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: "#ECF0F1", fontFamily: "'Courier New', monospace", fontWeight: "bold", fontSize: 11, letterSpacing: 1 }}>{label}</span>
        {sublabel && <div style={{ color: "#3D5166", fontSize: 11, fontFamily: "Georgia, serif", marginTop: 2, fontStyle: "italic" }}>{sublabel}</div>}
      </div>
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#1A2535", border: "1.5px solid #2C3E50", borderRadius: 10, color: "#ECF0F1", padding: "12px 14px", fontSize: 13, fontFamily: "Georgia, serif", outline: "none", resize: "none", lineHeight: 1.6 }}
        onFocus={e => e.target.style.borderColor = "#E74C3C"} onBlur={e => e.target.style.borderColor = "#1E2D3D"} />
    </div>
  );
}

function CoachDashboard({ onBack }) {
  const [completions, setCompletions] = useState(null);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => { if (unlocked) loadCompletions().then(setCompletions); }, [unlocked]);

  const tryPin = () => {
    if (pin === COACH_PIN) { setUnlocked(true); setPinError(false); }
    else { setPinError(true); setPin(""); }
  };

  if (!unlocked) return (
    <div style={{ padding: "40px 22px", maxWidth: 500, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#7F8C8D", fontFamily: "'Courier New', monospace", fontSize: 11, cursor: "pointer", marginBottom: 30 }}>← BACK</button>
      <div style={{ color: "#ECF0F1", fontFamily: "Georgia, serif", fontWeight: "bold", fontSize: 24, marginBottom: 6 }}>Coach Access</div>
      <div style={{ color: "#7F8C8D", fontSize: 14, marginBottom: 30, fontFamily: "Georgia, serif" }}>Enter your PIN to view squad completions.</div>
      <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && tryPin()} placeholder="Enter PIN"
        style={{ width: "100%", background: "#111D2C", border: `1.5px solid ${pinError ? "#E74C3C" : "#1E2D3D"}`, borderRadius: 10, color: "#ECF0F1", padding: "14px 16px", fontSize: 18, fontFamily: "'Courier New', monospace", outline: "none", letterSpacing: 4, marginBottom: 12 }} />
      {pinError && <div style={{ color: "#E74C3C", fontSize: 12, fontFamily: "'Courier New', monospace", marginBottom: 12 }}>Incorrect PIN. Try again.</div>}
      <button onClick={tryPin} style={{ width: "100%", padding: 14, background: "#2ECC71", border: "none", borderRadius: 10, color: "#0D1B2A", fontFamily: "'Courier New', monospace", fontWeight: "bold", fontSize: 13, cursor: "pointer", letterSpacing: 2 }}>UNLOCK →</button>
    </div>
  );

  if (!completions) return <div style={{ padding: "40px 22px", textAlign: "center" }}><div style={{ color: "#7F8C8D", fontFamily: "'Courier New', monospace", fontSize: 13 }}>Loading...</div></div>;

  const byWeek = {};
  completions.forEach(c => { const wk = getWeekKey(c.timestamp); if (!byWeek[wk]) byWeek[wk] = []; byWeek[wk].push(c); });
  const weeks = Object.keys(byWeek).sort().reverse();
  const thisWeek = weeks[0] ? byWeek[weeks[0]] : [];
  const lastWeek = weeks[1] ? byWeek[weeks[1]] : [];
  const allPlayers = [...new Set(completions.map(c => c.name))].sort();
  const playerTotals = {};
  completions.forEach(c => { playerTotals[c.name] = (playerTotals[c.name] || 0) + 1; });

  return (
    <div style={{ padding: "20px 22px 60px", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ color: "#2ECC71", fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: 3, marginBottom: 2 }}>RANDAL ÓG</div>
          <div style={{ color: "#ECF0F1", fontFamily: "'Courier New', monospace", fontWeight: "bold", fontSize: 15, letterSpacing: 1 }}>SQUAD DASHBOARD</div>
        </div>
        <img src={CQ_LOGO} alt="CQ" style={{ height: 44, width: "auto", opacity: 0.9 }} />
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#7F8C8D", fontFamily: "'Courier New', monospace", fontSize: 11, cursor: "pointer" }}>← BACK</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[{val:thisWeek.length,label:"THIS WEEK",col:"#2ECC71",border:"#2ECC7144"},{val:lastWeek.length,label:"LAST WEEK",col:"#F4C542",border:"#1E2D3D"},{val:completions.length,label:"ALL TIME",col:"#BDC3C7",border:"#1E2D3D"}].map(({val,label,col,border}) => (
          <div key={label} style={{ flex:1, background:"#111D2C", borderRadius:12, padding:"16px", border:`1px solid ${border}`, textAlign:"center" }}>
            <div style={{ color:col, fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:36 }}>{val}</div>
            <div style={{ color:"#7F8C8D", fontFamily:"'Courier New', monospace", fontSize:10, letterSpacing:2, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"#111D2C", borderRadius:12, padding:"14px 16px", marginBottom:16, border:"1px solid #1E2D3D" }}>
        <div style={{ color:"#2ECC71", fontFamily:"'Courier New', monospace", fontSize:10, letterSpacing:2, marginBottom:14 }}>✓ COMPLETED THIS WEEK</div>
        {thisWeek.length === 0 ? <div style={{ color:"#3D5166", fontFamily:"Georgia, serif", fontSize:14 }}>No completions yet this week.</div> :
          thisWeek.map((c, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:10, marginBottom:10, borderBottom: i < thisWeek.length-1 ? "1px solid #1E2D3D" : "none" }}>
              <div>
                <div style={{ color:"#ECF0F1", fontFamily:"Georgia, serif", fontSize:14 }}>{c.name}</div>
                <div style={{ color:"#3D5166", fontFamily:"'Courier New', monospace", fontSize:10, marginTop:2 }}>vs {c.opposition}</div>
              </div>
              <div style={{ color:"#3D5166", fontFamily:"'Courier New', monospace", fontSize:10 }}>{c.date}</div>
            </div>
          ))
        }
      </div>
      {allPlayers.length > 0 && (
        <div style={{ background:"#111D2C", borderRadius:12, padding:"14px 16px", border:"1px solid #1E2D3D" }}>
          <div style={{ color:"#7F8C8D", fontFamily:"'Courier New', monospace", fontSize:10, letterSpacing:2, marginBottom:14 }}>ALL PLAYERS — TOTAL REVIEWS</div>
          {allPlayers.map((p, i) => {
            const total = playerTotals[p] || 0;
            const pct = Math.min((total / Math.max(...Object.values(playerTotals))) * 100, 100);
            return (
              <div key={p} style={{ marginBottom: i < allPlayers.length-1 ? 12 : 0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ color:"#ECF0F1", fontFamily:"Georgia, serif", fontSize:13 }}>{p}</span>
                  <span style={{ color: total>=5?"#2ECC71":total>=2?"#F4C542":"#E74C3C", fontFamily:"'Courier New', monospace", fontSize:12, fontWeight:"bold" }}>{total}</span>
                </div>
                <div style={{ height:4, background:"#1E2D3D", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background: total>=5?"#2ECC71":total>=2?"#F4C542":"#E74C3C", borderRadius:2, transition:"width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {completions.length === 0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#3D5166", fontFamily:"Georgia, serif", fontSize:14 }}>No completions logged yet.</div>}
    </div>
  );
}

function HistoryView({ reviews, onBack, onDelete }) {
  const [expanded, setExpanded] = useState(null);
  if (reviews.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
      <div style={{ color: "#7F8C8D", fontFamily: "Georgia, serif", fontSize: 15 }}>No reviews yet.</div>
      <button onClick={onBack} style={{ marginTop: 28, padding: "12px 24px", background: "#2ECC71", border: "none", borderRadius: 10, color: "#0D1B2A", fontFamily: "'Courier New', monospace", fontWeight: "bold", fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>← BACK</button>
    </div>
  );
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ color:"#ECF0F1", fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:14, letterSpacing:1 }}>MY REVIEWS</div>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#7F8C8D", fontFamily:"'Courier New', monospace", fontSize:11, cursor:"pointer" }}>← BACK</button>
      </div>
      {reviews.map((rev, idx) => (
        <div key={idx} style={{ background:"#111D2C", borderRadius:12, marginBottom:10, border:"1px solid #1E2D3D", overflow:"hidden" }}>
          <div onClick={() => setExpanded(expanded===idx?null:idx)} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ color:"#ECF0F1", fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:13 }}>vs {rev.opposition}</div>
              <div style={{ color:"#3D5166", fontSize:12, fontFamily:"'Courier New', monospace", marginTop:3 }}>{rev.date}</div>
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {RATINGS.map(r => { const v=rev.ratings[r.key]||0; const col=v>=8?"#2ECC71":v>=5?"#F4C542":"#E74C3C"; return <div key={r.key} style={{color:col,fontFamily:"'Courier New',monospace",fontWeight:"bold",fontSize:14}}>{v}</div>; })}
              <span style={{ color:"#3D5166", marginLeft:4 }}>{expanded===idx?"▴":"▾"}</span>
            </div>
          </div>
          {expanded === idx && (
            <div style={{ padding:"0 16px 16px", borderTop:"1px solid #1E2D3D", paddingTop:14 }}>
              {rev.answers?.went_well && <div style={{ marginBottom:12, borderLeft:"2px solid #2ECC71", paddingLeft:12 }}><div style={{ color:"#2ECC71", fontFamily:"'Courier New', monospace", fontSize:9, letterSpacing:2, marginBottom:4 }}>✓ WENT WELL</div><div style={{ color:"#BDC3C7", fontSize:13, fontFamily:"Georgia, serif", lineHeight:1.5 }}>{rev.answers.went_well}</div></div>}
              {rev.answers?.development && <div style={{ marginBottom:12, borderLeft:"2px solid #3498DB", paddingLeft:12 }}><div style={{ color:"#3498DB", fontFamily:"'Courier New', monospace", fontSize:9, letterSpacing:2, marginBottom:4 }}>△ DEVELOPMENT</div><div style={{ color:"#BDC3C7", fontSize:13, fontFamily:"Georgia, serif", lineHeight:1.5 }}>{rev.answers.development}</div></div>}
              {rev.action?.will_change && <div style={{ marginBottom:12, borderLeft:"2px solid #E74C3C", paddingLeft:12 }}><div style={{ color:"#E74C3C", fontFamily:"'Courier New', monospace", fontSize:9, letterSpacing:2, marginBottom:4 }}>→ WILL CHANGE</div><div style={{ color:"#BDC3C7", fontSize:13, fontFamily:"Georgia, serif", lineHeight:1.5 }}>{rev.action.will_change}</div></div>}
              <button onClick={() => onDelete(idx)} style={{ marginTop:8, padding:"8px 14px", background:"transparent", border:"1px solid #2C3E50", borderRadius:8, color:"#7F8C8D", fontFamily:"'Courier New', monospace", fontSize:10, cursor:"pointer", letterSpacing:1 }}>DELETE</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [step, setStep] = useState(0);
  const [intensityPhase, setIntensityPhase] = useState("pick");
  const [mindsetPhase, setMindsetPhase] = useState("pick");
  const [info, setInfo] = useState({ name: "", opposition: "" });
  const [answers, setAnswers] = useState({});
  const [intensityLevel, setIntensityLevel] = useState(null);
  const [destroyers, setDestroyers] = useState([]);
  const [zoneFactors, setZoneFactors] = useState([]);
  const [mindsetLevel, setMindsetLevel] = useState(null);
  const [mindsetFactors, setMindsetFactors] = useState([]);
  const [ratings, setRatings] = useState({});
  const [action, setAction] = useState({ keep_doing: "", will_change: "", focus_what: "", focus_how: "", focus_when: "" });
  const [summaryOpen, setSummaryOpen] = useState({});
  const [animDir, setAnimDir] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [savedName, setSavedName] = useState("");

  useEffect(() => { const s = loadReviews(); setReviews(s); if (s.length > 0) setSavedName(s[0].name || ""); }, []);

  const goStep = (n) => { setAnimDir(n > step ? 1 : -1); setStep(n); };

  const canProceed = () => {
    if (step === 0) return info.name.trim() && info.opposition.trim();
    if (step === 1) { if (intensityPhase === "pick") return intensityLevel !== null; if (intensityLevel === "zone") return zoneFactors.length > 0; return destroyers.length > 0; }
    if (step === 2) { if (mindsetPhase === "pick") return mindsetLevel !== null; return mindsetFactors.length > 0; }
    if (step === 3) return (answers.went_well || "").trim().length > 0;
    if (step === 4) return (answers.development || "").trim().length > 0;
    if (step === 5) return RATINGS.every(r => (ratings[r.key] || 0) > 0);
    if (step === 6) return action.keep_doing.trim().length > 0 && action.will_change.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step === 1 && intensityPhase === "pick") { setIntensityPhase("followup"); return; }
    if (step === 2 && mindsetPhase === "pick") { setMindsetPhase("followup"); return; }
    if (step === 6) {
      const date = new Date().toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
      const review = { name: info.name, opposition: info.opposition, date, answers, intensityLevel, destroyers, zoneFactors, mindsetLevel, mindsetFactors, ratings, action };
      saveReview(review); setReviews(loadReviews()); setSavedName(info.name);
      logCompletion(info.name, info.opposition, date);
    }
    goStep(step + 1);
    if (step === 1) setIntensityPhase("pick");
    if (step === 2) setMindsetPhase("pick");
  };

  const handleBack = () => {
    if (step === 1 && intensityPhase === "followup") { setIntensityPhase("pick"); return; }
    if (step === 2 && mindsetPhase === "followup") { setMindsetPhase("pick"); return; }
    if (step === 0) { setScreen("home"); return; }
    goStep(step - 1);
    if (step === 2) setIntensityPhase("followup");
    if (step === 3) setMindsetPhase("followup");
    if (step === 1) setIntensityPhase("pick");
  };

  const startNew = () => {
    setStep(0); setIntensityPhase("pick"); setMindsetPhase("pick");
    setInfo({ name: savedName, opposition: "" });
    setAnswers({}); setIntensityLevel(null); setDestroyers([]); setZoneFactors([]);
    setMindsetLevel(null); setMindsetFactors([]); setRatings({});
    setAction({ keep_doing: "", will_change: "", focus_what: "", focus_how: "", focus_when: "" });
    setSummaryOpen({}); setScreen("review");
  };

  const toggleItem = (list, setList, item) => setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);

  const Header = () => (
    <div style={{ background: "#0D1B2A", borderBottom: "2px solid #2ECC71", padding: "10px 20px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ color: "#2ECC71", fontSize: 12, fontFamily: "'Courier New', monospace", letterSpacing: 3, marginBottom: 2 }}>RANDAL ÓG</div>
        <div style={{ color: "#ECF0F1", fontFamily: "'Courier New', monospace", fontWeight: "bold", fontSize: 15, letterSpacing: 1 }}>GAME REFLECTION</div>
      </div>
      <img src={CQ_LOGO} alt="CQ" style={{ height: 44, width: "auto", opacity: 0.9 }} />
    </div>
  );

  if (screen === "coach") return <div style={{ minHeight:"100vh", background:"#0A1520" }}><style>{`* { box-sizing: border-box; }`}</style><Header /><CoachDashboard onBack={() => setScreen("home")} /></div>;

  if (screen === "home") return (
    <div style={{ minHeight:"100vh", background:"#0A1520", display:"flex", flexDirection:"column" }}>
      <style>{`* { box-sizing: border-box; } button:active { opacity: 0.8; }`}</style>
      <Header />
      <div style={{ flex:1, padding:"40px 22px", maxWidth:500, margin:"0 auto", width:"100%" }}>
        <div style={{ color:"#ECF0F1", fontFamily:"Georgia, serif", fontWeight:"bold", fontSize:26, marginBottom:6 }}>{savedName ? `Welcome back, ${savedName.split(" ")[0]}.` : "Time to review."}</div>
        <div style={{ color:"#7F8C8D", fontSize:14, marginBottom:40, fontFamily:"Georgia, serif", lineHeight:1.6 }}>2 minutes. Honest answers. Better performance.</div>
        <button onClick={startNew} style={{ width:"100%", padding:18, background:"#2ECC71", border:"none", borderRadius:12, color:"#0D1B2A", fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:14, cursor:"pointer", letterSpacing:2, marginBottom:12 }}>START REVIEW →</button>
        <button onClick={() => setScreen("history")} style={{ width:"100%", padding:16, background:"transparent", border:"1.5px solid #1E2D3D", borderRadius:12, color: reviews.length > 0 ? "#BDC3C7" : "#3D5166", fontFamily:"'Courier New', monospace", fontSize:14, cursor:"pointer", letterSpacing:1, display:"flex", justifyContent:"center", alignItems:"center", gap:10, marginBottom:12 }}>
          <span>MY REVIEWS</span>
          {reviews.length > 0 && <span style={{ background:"#1E2D3D", color:"#2ECC71", borderRadius:20, padding:"2px 10px", fontSize:11 }}>{reviews.length}</span>}
        </button>
        <button onClick={() => setScreen("coach")} style={{ width:"100%", padding:12, background:"transparent", border:"none", borderRadius:12, color:"#2C3E50", fontFamily:"'Courier New', monospace", fontSize:12, cursor:"pointer", letterSpacing:2, marginTop:8 }}>COACH ACCESS</button>
        {reviews.length > 0 && (
          <div style={{ marginTop:24 }}>
            <div style={{ color:"#7F8C8D", fontFamily:"'Courier New', monospace", fontSize:12, letterSpacing:2, marginBottom:14 }}>LAST 3 GAMES</div>
            {reviews.slice(0,3).map((rev,i) => {
              const ilvl = INTENSITY_LEVELS.find(l => l.id === rev.intensityLevel);
              const mlvl = MINDSET_LEVELS.find(l => l.id === rev.mindsetLevel);
              return (
                <div key={i} style={{ background:"#111D2C", borderRadius:10, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ color:"#ECF0F1", fontSize:13, fontFamily:"Georgia, serif" }}>vs {rev.opposition}</div>
                    <div style={{ display:"flex", gap:8, marginTop:3 }}>
                      <span style={{ color:"#3D5166", fontSize:12, fontFamily:"'Courier New', monospace" }}>{rev.date}</span>
                      {ilvl && <span style={{ color:ilvl.color, fontSize:10 }}>{ilvl.emoji}</span>}
                      {mlvl && <span style={{ color:mlvl.color, fontSize:10 }}>{mlvl.emoji}</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {RATINGS.map(r => { const v=rev.ratings[r.key]||0; const col=v>=8?"#2ECC71":v>=5?"#F4C542":"#E74C3C"; return <div key={r.key} style={{textAlign:"center"}}><div style={{color:col,fontFamily:"'Courier New',monospace",fontWeight:"bold",fontSize:15}}>{v}</div><div style={{color:"#3D5166",fontSize:8,fontFamily:"'Courier New',monospace"}}>{r.key.slice(0,3).toUpperCase()}</div></div>; })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (screen === "history") return (
    <div style={{ minHeight:"100vh", background:"#0A1520" }}>
      <style>{`* { box-sizing: border-box; }`}</style>
      <Header />
      <div style={{ padding:"20px 22px 40px", maxWidth:500, margin:"0 auto" }}>
        <HistoryView reviews={reviews} onBack={() => setScreen("home")} onDelete={(idx) => { const u = reviews.filter((_,i)=>i!==idx); localStorage.setItem(STORAGE_KEY,JSON.stringify(u)); setReviews(u); }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0A1520", display:"flex", flexDirection:"column" }}>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(${animDir*20}px); } to { opacity:1; transform:translateX(0); } } .slide { animation: slideIn 0.22s ease; } textarea::placeholder, input::placeholder { color: #2C3E50; } * { box-sizing: border-box; } button:active { opacity: 0.85; }`}</style>
      <Header />
      <div style={{ flex:1, padding:"0 22px 110px", maxWidth:500, margin:"0 auto", width:"100%" }}>
        {step < 7 && <ProgressBar step={step} />}
        <div className="slide" key={`${step}-${intensityPhase}-${mindsetPhase}-view`}>

          {step === 0 && (
            <div>
              <div style={{ color:"#ECF0F1", fontFamily:"Georgia, serif", fontWeight:"bold", fontSize:24, marginBottom:6 }}>Let's get started.</div>
              <div style={{ color:"#7F8C8D", fontSize:14, marginBottom:30, fontFamily:"Georgia, serif" }}>Takes about 2 minutes. Be honest with yourself.</div>
              {[{key:"name",label:"YOUR NAME",placeholder:"Enter your name"},{key:"opposition",label:"OPPOSITION",placeholder:"Who did you play today?"}].map(f => (
                <div key={f.key} style={{ marginBottom:20 }}>
                  <div style={{ color:"#7F8C8D", fontSize:12, fontFamily:"'Courier New', monospace", letterSpacing:2, marginBottom:8 }}>{f.label}</div>
                  <input value={info[f.key]} onChange={e=>setInfo(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{ width:"100%", background:"#1A2535", border:"1.5px solid #2C3E50", borderRadius:10, color:"#ECF0F1", padding:"14px 16px", fontSize:16, fontFamily:"Georgia, serif", outline:"none" }}
                    onFocus={e=>e.target.style.borderColor="#2ECC71"} onBlur={e=>e.target.style.borderColor="#1E2D3D"} />
                </div>
              ))}
              <div style={{ background:"#0D1B2A", borderRadius:10, padding:"10px 14px", border:"1px solid #1E2D3D" }}>
                <div style={{ color:"#3D5166", fontSize:13, fontFamily:"Georgia, serif", lineHeight:1.5 }}>📋 Your name and completion date are logged so squad engagement can be observed. Your answers stay confidential and only you can view them.</div>
              </div>
            </div>
          )}

          {step === 1 && intensityPhase === "pick" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#F4C542"}}>⚡</span><span style={{color:"#F4C542",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>INTENSITY</span></div>
              <div style={{ color:"#ECF0F1", fontSize:22, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:8 }}>Where were you today?</div>
              <div style={{ color:"#7F8C8D", fontSize:13, fontFamily:"Georgia, serif", marginBottom:24 }}>Physical activity and mental alertness — were you 'up for it'?</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {INTENSITY_LEVELS.map(lvl => (
                  <button key={lvl.id} onClick={() => setIntensityLevel(lvl.id)} style={{ padding:"16px 18px", borderRadius:12, border:`2px solid ${intensityLevel===lvl.id?lvl.color:"#1E2D3D"}`, background:intensityLevel===lvl.id?`${lvl.color}18`:"#111D2C", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}><span style={{fontSize:22}}>{lvl.emoji}</span><div><div style={{ color:intensityLevel===lvl.id?lvl.color:"#ECF0F1", fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:13 }}>{lvl.label}</div><div style={{ color:"#7F8C8D", fontSize:12, fontFamily:"Georgia, serif", marginTop:3 }}>{lvl.desc}</div></div></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && intensityPhase === "followup" && intensityLevel === "zone" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#2ECC71"}}>⚡</span><span style={{color:"#2ECC71",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>IN THE ZONE</span></div>
              <div style={{ color:"#ECF0F1", fontSize:20, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:8 }}>What kept you there?</div>
              <div style={{ color:"#7F8C8D", fontSize:13, fontFamily:"Georgia, serif", marginBottom:20 }}>Select all that apply.</div>
              <ChipSelector items={ZONE_FACTORS} selected={zoneFactors} onToggle={(d) => toggleItem(zoneFactors,setZoneFactors,d)} color="#2ECC71" />
              <SelectedSummary items={zoneFactors} color="#2ECC71" bg="#0D1A0D" />
            </div>
          )}

          {step === 1 && intensityPhase === "followup" && (intensityLevel === "inconsistent" || intensityLevel === "flat") && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#E74C3C"}}>⚡</span><span style={{color:"#E74C3C",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>INTENSITY DESTROYERS</span></div>
              <div style={{ color:"#ECF0F1", fontSize:20, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:8 }}>What knocked you out of your zone?</div>
              <div style={{ color:"#7F8C8D", fontSize:13, fontFamily:"Georgia, serif", marginBottom:20 }}>Select all that apply.</div>
              <ChipSelector items={DESTROYERS} selected={destroyers} onToggle={(d) => toggleItem(destroyers,setDestroyers,d)} color="#E74C3C" />
              <SelectedSummary items={destroyers} color="#E74C3C" bg="#1A0D0D" />
            </div>
          )}

          {step === 2 && mindsetPhase === "pick" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#9B59B6"}}>🧠</span><span style={{color:"#9B59B6",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>MINDSET</span></div>
              <div style={{ color:"#ECF0F1", fontSize:22, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:8 }}>Which mindset showed up today?</div>
              <div style={{ color:"#7F8C8D", fontSize:13, fontFamily:"Georgia, serif", marginBottom:24 }}>Were you playing to gain or playing not to lose?</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {MINDSET_LEVELS.map(lvl => (
                  <button key={lvl.id} onClick={() => setMindsetLevel(lvl.id)} style={{ padding:"16px 18px", borderRadius:12, border:`2px solid ${mindsetLevel===lvl.id?lvl.color:"#1E2D3D"}`, background:mindsetLevel===lvl.id?`${lvl.color}18`:"#111D2C", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}><span style={{fontSize:22}}>{lvl.emoji}</span><div><div style={{ color:mindsetLevel===lvl.id?lvl.color:"#ECF0F1", fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:13 }}>{lvl.label}</div><div style={{ color:"#7F8C8D", fontSize:12, fontFamily:"Georgia, serif", marginTop:3 }}>{lvl.desc}</div></div></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && mindsetPhase === "followup" && mindsetLevel === "challenge" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#2ECC71"}}>🔥</span><span style={{color:"#2ECC71",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>CHALLENGE MINDSET</span></div>
              <div style={{ color:"#ECF0F1", fontSize:20, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:8 }}>What drove that today?</div>
              <div style={{ color:"#7F8C8D", fontSize:13, fontFamily:"Georgia, serif", marginBottom:20 }}>Select all that applied to you.</div>
              <ChipSelector items={CHALLENGE_FACTORS} selected={mindsetFactors} onToggle={(d) => toggleItem(mindsetFactors,setMindsetFactors,d)} color="#2ECC71" />
              <SelectedSummary items={mindsetFactors} color="#2ECC71" bg="#0D1A0D" />
            </div>
          )}

          {step === 2 && mindsetPhase === "followup" && mindsetLevel === "mixed" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#F4C542"}}>〰</span><span style={{color:"#F4C542",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>MIXED MINDSET</span></div>
              <div style={{ color:"#ECF0F1", fontSize:20, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:8 }}>What crept in at times?</div>
              <div style={{ color:"#7F8C8D", fontSize:13, fontFamily:"Georgia, serif", marginBottom:20 }}>Select any threat factors that showed up.</div>
              <ChipSelector items={THREAT_FACTORS} selected={mindsetFactors} onToggle={(d) => toggleItem(mindsetFactors,setMindsetFactors,d)} color="#F4C542" />
              <SelectedSummary items={mindsetFactors} color="#F4C542" bg="#1A1500" />
            </div>
          )}

          {step === 2 && mindsetPhase === "followup" && mindsetLevel === "threat" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#E74C3C"}}>🔒</span><span style={{color:"#E74C3C",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>THREAT MINDSET</span></div>
              <div style={{ color:"#ECF0F1", fontSize:20, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:8 }}>What crept in today?</div>
              <div style={{ color:"#7F8C8D", fontSize:13, fontFamily:"Georgia, serif", marginBottom:20 }}>Select all that applied to you.</div>
              <ChipSelector items={THREAT_FACTORS} selected={mindsetFactors} onToggle={(d) => toggleItem(mindsetFactors,setMindsetFactors,d)} color="#E74C3C" />
              <SelectedSummary items={mindsetFactors} color="#E74C3C" bg="#1A0D0D" />
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#2ECC71"}}>✓</span><span style={{color:"#2ECC71",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>WENT WELL</span></div>
              <div style={{ color:"#ECF0F1", fontSize:22, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:22 }}>What went well today?</div>
              <textarea rows={5} value={answers.went_well||""} onChange={e=>setAnswers(p=>({...p,went_well:e.target.value}))} placeholder="e.g. High work rate, won my battles, started with confidence..." autoFocus
                style={{ width:"100%", background:"#1A2535", border:"1.5px solid #2ECC7144", borderRadius:10, color:"#ECF0F1", padding:"14px 16px", fontSize:14, fontFamily:"Georgia, serif", outline:"none", resize:"none", lineHeight:1.7 }}
                onFocus={e=>e.target.style.borderColor="#2ECC71"} onBlur={e=>e.target.style.borderColor="#2ECC7144"} />
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#3498DB"}}>△</span><span style={{color:"#3498DB",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>DEVELOPMENT</span></div>
              <div style={{ color:"#ECF0F1", fontSize:22, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:22 }}>What needs work?</div>
              <textarea rows={5} value={answers.development||""} onChange={e=>setAnswers(p=>({...p,development:e.target.value}))} placeholder="e.g. Fitness late on, concentration dropped after a setback..." autoFocus
                style={{ width:"100%", background:"#1A2535", border:"1.5px solid #3498DB44", borderRadius:10, color:"#ECF0F1", padding:"14px 16px", fontSize:14, fontFamily:"Georgia, serif", outline:"none", resize:"none", lineHeight:1.7 }}
                onFocus={e=>e.target.style.borderColor="#3498DB"} onBlur={e=>e.target.style.borderColor="#3498DB44"} />
            </div>
          )}

          {step === 5 && (
            <div>
              <div style={{ color:"#ECF0F1", fontSize:22, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:6 }}>Rate yourself.</div>
              <div style={{ color:"#7F8C8D", fontSize:14, marginBottom:26, fontFamily:"Georgia, serif" }}>Honest scores only — 1 poor, 10 outstanding.</div>
              {RATINGS.map(r => <RatingRow key={r.key} label={r.key} desc={r.desc} value={ratings[r.key]||0} onChange={v=>setRatings(p=>({...p,[r.key]:v}))} />)}
            </div>
          )}

          {step === 6 && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{fontSize:20,color:"#E74C3C"}}>▶</span><span style={{color:"#E74C3C",fontFamily:"'Courier New', monospace",fontWeight:"bold",fontSize:11,letterSpacing:2}}>ACTION PLAN</span></div>
              <div style={{ color:"#ECF0F1", fontSize:22, fontFamily:"Georgia, serif", fontWeight:"bold", marginBottom:6 }}>What will you do about it?</div>
              <div style={{ color:"#7F8C8D", fontSize:13, fontFamily:"Georgia, serif", marginBottom:24 }}>You're far more likely to follow through when you write it down.</div>
              <div style={{ background:"#111D2C", borderRadius:12, padding:"16px", marginBottom:16, border:"1px solid #1E2D3D" }}>
                <ActionField label="✓ KEEP DOING" sublabel="What must you maintain to keep improving?" value={action.keep_doing} onChange={v=>setAction(p=>({...p,keep_doing:v}))} placeholder="e.g. Pre-match routine, mental rehearsal the night before..." />
                <ActionField label="→ WILL CHANGE" sublabel="What area will you work on this week?" value={action.will_change} onChange={v=>setAction(p=>({...p,will_change:v}))} placeholder="e.g. Fitness work, staying composed after mistakes..." />
              </div>
              <div style={{ background:"#111D2C", borderRadius:12, padding:"16px", border:"1px solid #E74C3C33" }}>
                <div style={{ color:"#E74C3C", fontFamily:"'Courier New', monospace", fontSize:10, letterSpacing:2, marginBottom:14 }}>◆ MY #1 FOCUS THIS WEEK <span style={{ color:"#3D5166", fontSize:9 }}>(optional)</span></div>
                <ActionField label="WHAT" sublabel="Your single most important focus" value={action.focus_what} onChange={v=>setAction(p=>({...p,focus_what:v}))} placeholder="e.g. Improving my first touch under pressure" rows={2} />
                <ActionField label="HOW" sublabel="Exactly how will you work on it?" value={action.focus_how} onChange={v=>setAction(p=>({...p,focus_how:v}))} placeholder="e.g. 15 mins extra practice after Tuesday training" rows={2} />
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <div style={{ textAlign:"center", padding:"10px 0 28px" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>✓</div>
                <div style={{ color:"#2ECC71", fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:18, letterSpacing:2 }}>DONE, {info.name.split(" ")[0].toUpperCase()}.</div>
                <div style={{ color:"#7F8C8D", fontSize:13, marginTop:6, fontFamily:"Georgia, serif" }}>vs {info.opposition} · saved to your reviews</div>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                {RATINGS.map(r => { const v=ratings[r.key]||0; const col=v>=8?"#2ECC71":v>=5?"#F4C542":"#E74C3C"; return <div key={r.key} style={{flex:1,background:"#111D2C",borderRadius:10,padding:"14px 8px",textAlign:"center",border:`1px solid ${col}44`}}><div style={{color:col,fontFamily:"'Courier New',monospace",fontWeight:"bold",fontSize:28}}>{v}</div><div style={{color:"#7F8C8D",fontSize:9,marginTop:4,fontFamily:"'Courier New',monospace",letterSpacing:1}}>{r.key.toUpperCase()}</div></div>; })}
              </div>
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button onClick={() => setScreen("history")} style={{ flex:1, padding:14, background:"transparent", border:"1.5px solid #1E2D3D", borderRadius:10, color:"#BDC3C7", fontFamily:"'Courier New', monospace", fontSize:11, cursor:"pointer", letterSpacing:1 }}>MY REVIEWS</button>
                <button onClick={() => setScreen("home")} style={{ flex:1, padding:14, background:"#2ECC71", border:"none", borderRadius:10, color:"#0D1B2A", fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:11, cursor:"pointer", letterSpacing:1 }}>HOME</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {step < 7 && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#0D1B2A", borderTop:"1px solid #1E2D3D", padding:"14px 22px", display:"flex", gap:10 }}>
          <button onClick={handleBack} style={{ flex:1, padding:14, background:"transparent", border:"1px solid #1E2D3D", borderRadius:10, color:"#7F8C8D", fontFamily:"'Courier New', monospace", fontSize:13, cursor:"pointer" }}>← Back</button>
          <button onClick={handleNext} disabled={!canProceed()} style={{ flex:2, padding:14, background:canProceed()?"#2ECC71":"#1A2535", border:"none", borderRadius:10, color:canProceed()?"#0D1B2A":"#3D5166", fontFamily:"'Courier New', monospace", fontWeight:"bold", fontSize:13, cursor:canProceed()?"pointer":"not-allowed", letterSpacing:1, transition:"all 0.2s ease" }}>
            {step === 6 ? "See My Review →" : step === 0 ? "Start →" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
