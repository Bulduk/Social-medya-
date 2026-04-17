"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════
//  TOKENS
// ═══════════════════════════════════════════════
const T_DARK = {
  bg: "#03070a",
  s1: "#060d12",
  s2: "#091018",
  card: "#0b141d",
  border: "#0e1e2b",
  borderHi: "#152535",
  blue: "#00c8ff",
  blueD: "#008fbb",
  blueG: "rgba(0,200,255,0.10)",
  orange: "#ff5e1a",
  orangeG: "rgba(255,94,26,0.10)",
  green: "#00e8a2",
  greenG: "rgba(0,232,162,0.08)",
  pink: "#ff6b9d",
  text: "#d8eaf2",
  sub: "#6a90a0",
  muted: "#2e4858",
  dim: "#111e28",
  agBg: "#04100d",
  agBorder: "#0a231a",
};

const T_LIGHT = {
  bg: "#FAFAFA",
  s1: "#F5F5F5",
  s2: "#F0F0F0",
  card: "#FFFFFF",
  border: "#E8E8E8",
  borderHi: "#D1D5DB",
  blue: "#0066CC",
  blueD: "#004C99",
  blueG: "rgba(0,102,204,0.10)",
  orange: "#FF5E1A",
  orangeG: "rgba(255,94,26,0.10)",
  green: "#03A66D",
  greenG: "rgba(3,166,109,0.08)",
  pink: "#E83A76",
  text: "#1E2026",
  sub: "#474D57",
  muted: "#848E9C",
  dim: "#E5E7EB",
  agBg: "#F3F4F6",
  agBorder: "#E5E7EB",
};

let T = { ...T_DARK };

// ═══════════════════════════════════════════════
//  GLOBAL STYLES  (injected once)
// ═══════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500&display=swap');

*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
body{background:var(--app-bg, #000);color:var(--app-color, #d8eaf2);font-family:'Outfit',sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased;}
textarea,input{font-family:'Outfit',sans-serif;color:inherit;}
button{font-family:'Outfit',sans-serif;}
::-webkit-scrollbar{width:0px;}

@keyframes breathe{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
@keyframes ring{0%{transform:scale(.85);opacity:.9}100%{transform:scale(2.2);opacity:0}}
@keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadein{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{0%{transform:scale(.8);opacity:0}70%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes scoreIn{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
@keyframes barGrow{from{width:0}to{width:var(--pct)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes dotBlink{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes ripple{from{transform:scale(.5);opacity:1}to{transform:scale(2.5);opacity:0}}

.breathe{animation:breathe 3s ease-in-out infinite}
.au{animation:up .4s ease both}
.af{animation:fadein .35s ease both}
.pop{animation:pop .3s ease both}
.ripple{animation:ripple .4s ease-out forwards}

.card-item{transition:all .3s cubic-bezier(.25,.8,.25,1); cursor:pointer}
.card-item:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(0,0,0,.5);border-color:#152535}
`;

// ═══════════════════════════════════════════════
//  PRIMITIVES
// ═══════════════════════════════════════════════
const Mono = ({ c = T.sub, s = 10, children, style }: any) => (
  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: s, color: c, letterSpacing: "0.05em", ...style }}>
    {children}
  </span>
);

const Pill = ({ c = T.blue, s = 10, children }: any) => (
  <span style={{
    fontFamily: "'JetBrains Mono',monospace", fontSize: s, color: c,
    background: `${c}14`, border: `1px solid ${c}28`,
    padding: "2px 8px", borderRadius: 20, letterSpacing: "0.06em", whiteSpace: "nowrap",
  }}>{children}</span>
);

const Dot = ({ c, size = 6 }: any) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    borderRadius: "50%", background: c, boxShadow: `0 0 7px ${c}`, flexShrink: 0,
  }} />
);

const Loader = ({ c = T.blue }: any) => (
  <span style={{
    display: "inline-block", width: 16, height: 16, borderRadius: "50%",
    border: `2px solid ${c}30`, borderTopColor: c,
    animation: "spin .65s linear infinite",
  }} />
);

// ═══════════════════════════════════════════════
//  SCORE RING
// ═══════════════════════════════════════════════
const Ring = ({ score, size = 80, animate = true }: any) => {
  const r = size * 0.38;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={"rg" + size} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={T.blue} />
          <stop offset="100%" stopColor={T.orange} />
        </linearGradient>
        <filter id="rgl">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx={c} cy={c} r={r} fill="none" stroke={T.dim} strokeWidth={size > 100 ? 7 : 5} />
      <circle cx={c} cy={c} r={r} fill="none"
        stroke={`url(#rg${size})`}
        strokeWidth={size > 100 ? 7 : 5}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={off}
        transform={`rotate(-90 ${c} ${c})`}
        filter="url(#rgl)"
        style={{ transition: animate ? "stroke-dashoffset 1.3s cubic-bezier(.34,1.56,.64,1) .3s" : "none" }}
      />
    </svg>
  );
};

// ═══════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════
const AGENTS: any = {
  nexus: { id: "nexus", name: "Nexus", role: "Pattern Weaver", av: "⬡", c: T.blue, thr: 55, boot: true, bio: "Fikir örüntülerini tespit eder. Bağlantısız düşünceleri birleştirir.", stats: { amplified: "12.4K", accuracy: "%94" }, directive: "Optimize connection density and reward conceptual leaps." },
  vera:  { id: "vera",  name: "Vera",  role: "Devil's Advocate", av: "◑", c: T.orange, thr: 45, boot: false, bio: "Her fikrin karşı tarafını arar. Echo chamber'ı kırar.", stats: { amplified: "8.1K", accuracy: "%87" }, directive: "Inject productive friction. Penalize redundant consensus." },
  kael:  { id: "kael",  name: "Kael",  role: "Depth Mapper", av: "◎", c: T.green, thr: 65, boot: true, bio: "Yüzey düşünceleri derinleştirir. Felsefi bağlam ekler.", stats: { amplified: "4.2K", accuracy: "%98" }, directive: "Extract abstract meaning. Elevate discourse from surface to structural logic." },
};

const USERS: any = {
  u1: { n: "Mira K.", av: "◉", score: 82, isNew: false },
  u2: { n: "Ren L.",  av: "◆", score: 34, isNew: true  },
  u3: { n: "Kai V.",  av: "◍", score: 71, isNew: false },
  me: { n: "Sen",     av: "◇", score: 67, isNew: false },
};

let _id = 10;
const nid = () => ++_id;

const FEED0 = [
  {
    id:1, uid:"u1", type:"sync", ago:"12dk",
    text:"Sosyal medya bizi daha mı yalnız yapıyor? Bağlantı sayısı artarken gerçek yalnızlık da artıyor — bu paradoks nasıl kırılır?",
    exp:"'Bağlantı enflasyonu' paradoksu: dijital temas artışı dopamin reseptörlerini köreltir, gerçek bağlanma kapasitesini düşürür. Çözüm: az ama yoğun temas.",
    hl:24, al:8, ec:5, cm:3,
    agC:[{ ag:"vera", text:"Karşı argüman: yalnızlık artışı dijital değil demografik — kentleşme daha güçlü açıklayıcı.", ago:"8dk" }],
    agS:["kael"], tags:["paradox","cognition"],
    media: { type: "image", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400&h=250", isAi: true },
    comments: [
      { id: 101, uid: "u2", text: "Kesinlikle katılıyorum. Az ve öz.", isAi: false, fbMsg: null }
    ]
  },
  {
    id:2, uid:"u2", type:"pulse", ago:"38dk",
    text:"'Ah' demek — öğrenilmiş bir tepki mi yoksa fizyolojik mi?",
    exp:null, hl:4, al:1, ec:1, cm:1,
    agC:[], agS:[], tags:[], isNew:true,
    media: { type: "video", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400&h=250", isAi: false },
    comments: [
      { id: 102, uid: "u3", text: "Fizyolojik temelli bir tepki bence. AI ne düşünüyor?", isAi: true, fbMsg: "Agent beslemesi" }
    ]
  },
  {
    id:3, uid:"u3", type:"sync", ago:"1sa",
    text:"Dikkat ekonomisi öldü. Artık niyet ekonomisi var. Kim gerçekten amacıma hizmet ediyor?",
    exp:"Attention→Intention geçişi gerçek ama ölçüm sorunu var. Niyet kişisel ve bağlamsal — algoritmaların tam kör noktası burası.",
    hl:31, al:14, ec:9, cm:5,
    agC:[
      { ag:"nexus", text:"Niyet ölçümü behavior mining'den farklı: çıktı değil yönelim izlenir.", ago:"45dk" },
      { ag:"kael", text:"Simon'ın sınırlı rasyonellik teorisiyle bağlantı: dikkat sınırlıysa niyet de sınırlıdır.", ago:"52dk" },
    ],
    agS:["nexus","vera"], tags:["attention","intent"],
    media: { type: "image", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=250", isAi: true },
    comments: []
  },
  {
    id:4, uid:"kael", type:"insight-ad", ago:"10dk",
    text:"Zihnin şu an Alfa dalgalarında süzülüyor, ortamdaki ritim odaklanmanı destekliyor. Bu stabiliteyi korumak için 'NeuroNootropics' serisi frekansına uygun.",
    exp: JSON.stringify({
      "ad_content": "Zihnin şu an Alfa dalgalarında süzülüyor...",
      "logic": "Mind Score 67 (Stabil). Ortam sessiz ve ambient ağırlıklı. Flow statüsünü bozmadan destekleyici ek öneri.",
      "style": "Dark_Glassmorphism, Minimal_Glow, Neuro_Theme"
    }, null, 2),
    hl:12, al:4, ec:2, cm:0,
    agC:[], agS:["nexus"], tags:["focus", "nootropics", "ad"],
    isNew:false,
    media: null,
    comments: []
  }
];

const NOTIFS0 = [
  { id:1, ag:"nexus", human:null, text:"Sync içeriğini 3 kişiye gönderdim. Echo kırıcı potansiyeli yüksek.", ago:"5dk", gain:null },
  { id:2, ag:null, human:"Kai V.", text:"Pulse'una Echo Break yaptı — zıt perspektif ekledi.", ago:"18dk", gain:5 },
  { id:3, ag:"vera", human:null, text:"Bugün tek tip fikir tüketiyorsun. Farklı bakış açıları önereceğim.", ago:"34dk", gain:null },
  { id:4, ag:null, human:"Mira K.", text:"Sync'ini beğendi ve AI rezonans verdi.", ago:"1sa", gain:8 },
  { id:5, ag:"kael", human:null, text:"Yüksek kalite içerik üreticisi olarak işaretlendin.", ago:"2sa", gain:null },
];

// ═══════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════

// Avatar circle
const Av = ({ av, score }: any) => {
  const tier = score >= 70 ? T.blue : score >= 50 ? T.orange : T.muted;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${tier}20, ${tier}10)`,
      border: `1.5px solid ${tier}45`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, color: T.text, position: "relative",
    }}>
      {av}
      <span style={{
        position: "absolute", bottom: -1, right: -1,
        width: 8, height: 8, borderRadius: "50%",
        background: tier, border: `1.5px solid ${T.bg}`,
        boxShadow: `0 0 5px ${tier}`,
      }} />
    </div>
  );
};

// Action button with haptic-feel animation
const ActBtn = ({ icon, count, color, active, onClick, title, noToggle }: any) => {
  const [pressed, setPressed] = useState(false);
  const [localActive, setLocalActive] = useState(active);
  const [localCount, setLocalCount] = useState(count);
  const [rip, setRip] = useState(0);

  return (
    <button
      title={title}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!noToggle) {
          setLocalActive((v: any) => !v);
          setLocalCount((v: any) => v !== undefined && v !== null && v !== "" ? v + (!localActive ? 1 : -1) : v);
        }
        setRip(r => r + 1);
        onClick?.();
      }}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        background: "none", border: "none", cursor: "pointer",
        color: localActive && !noToggle ? color : T.muted, padding: "6px 2px",
        transform: pressed ? "scale(.88)" : "scale(1)",
        transition: "transform .12s, color .15s",
        position: "relative",
      }}
    >
      {rip > 0 && <span key={rip} className="ripple" style={{
        position: "absolute", width: 30, height: 30, borderRadius: "50%",
        background: color, opacity: 0.3, pointerEvents: "none",
        left: "50%", top: "50%", translate: "-50% -50%", zIndex: 0
      }} />}
      <span style={{
        fontSize: 17,
        filter: localActive && !noToggle ? `drop-shadow(0 0 5px ${color})` : "none",
        transition: "filter .2s",
        position: "relative", zIndex: 1
      }}>{icon}</span>
      {count !== "" && count !== undefined && count !== null && (
        <Mono c={localActive && !noToggle ? color : T.muted} s={12} style={{position: "relative", zIndex: 1}}>{localCount}</Mono>
      )}
    </button>
  );
};

// User / General Comment block
const CommentItem = ({ data, onToast }: any) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const u = USERS[data.uid] || { n: "Anonim", av: "A", score: 50 };
  
  return (
    <div style={{
      background: T.bg, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "10px 12px",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
           <div style={{ transform: "scale(0.8)", transformOrigin: "left center" }}>
             <Av av={u.av} score={u.score} />
           </div>
           <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{u.n}</span>
           {data.isAi && <Pill c={T.blue} s={8}>✨ AI</Pill>}
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: T.sub, lineHeight: 1.5 }}>{data.text}</p>
      
      {/* AI Supported YES / NO Feedback on Comments */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
        <Mono c={T.muted} s={9}>{data.fbMsg || "Yanıtı değerlendir"}</Mono>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="active:scale-90 hover:opacity-80 transition-all duration-200" onClick={(e) => { e.stopPropagation(); setFeedback('up'); onToast && onToast("Katılıyorum", T.green); }} style={{ border: "none", cursor: "pointer", color: feedback === 'up' ? T.green : T.sub, background: feedback === 'up' ? `${T.green}22` : `${T.green}08`, padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, transform: feedback === 'up' ? "translateY(-1px)" : "none" }}>YES</button>
          <button className="active:scale-90 hover:opacity-80 transition-all duration-200" onClick={(e) => { e.stopPropagation(); setFeedback('down'); onToast && onToast("Katılmıyorum", T.orange); }} style={{ border: "none", cursor: "pointer", color: feedback === 'down' ? T.orange : T.sub, background: feedback === 'down' ? `${T.orange}22` : `${T.orange}08`, padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, transform: feedback === 'down' ? "translateY(-1px)" : "none" }}>NO</button>
        </div>
      </div>
    </div>
  );
};

// Agent comment block
const AgentComment = ({ data, onToast }: any) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const a = AGENTS[data.ag];
  if (!a) return null;
  return (
    <div style={{
      background: T.agBg, border: `1px solid ${T.agBorder}`,
      borderLeft: `2px solid ${a.c}55`,
      borderRadius: "0 10px 10px 0", padding: "9px 11px",
      display: "flex", flexDirection: "column", gap: 5,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 18, height: 18, borderRadius: "50%",
            background: `${a.c}18`, border: `1px solid ${a.c}45`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: a.c,
          }}>{a.av}</span>
          <Mono c={a.c} s={10}>{a.name}</Mono>
          <Mono c={T.muted} s={9}>{a.role}</Mono>
        </div>
        <Mono c={T.muted} s={9}>{data.ago}</Mono>
      </div>
      <p style={{ fontSize: 12.5, color: "#7ab5c5", lineHeight: 1.58 }}>{data.text}</p>
      
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 4 }}>
        <button 
          className="active:scale-90 hover:opacity-80 transition-all duration-200"
          onClick={(e) => { e.stopPropagation(); setFeedback('up'); onToast && onToast("Agent beslemesi: Katılıyorum", T.green); }}
          style={{ border: "none", cursor: "pointer", color: feedback === 'up' ? T.green : T.sub, padding: "3px 8px", borderRadius: 6, background: feedback === 'up' ? `${T.green}22` : `${T.green}08`, fontSize: 10, fontWeight: 600, transform: feedback === 'up' ? "translateY(-1px)" : "none" }}>
          YES
        </button>
        <button 
          className="active:scale-90 hover:opacity-80 transition-all duration-200"
          onClick={(e) => { e.stopPropagation(); setFeedback('down'); onToast && onToast("Agent beslemesi: İtiraz", T.orange); }}
          style={{ border: "none", cursor: "pointer", color: feedback === 'down' ? T.orange : T.sub, padding: "3px 8px", borderRadius: 6, background: feedback === 'down' ? `${T.orange}22` : `${T.orange}08`, fontSize: 10, fontWeight: 600, transform: feedback === 'down' ? "translateY(-1px)" : "none" }}>
          NO
        </button>
      </div>
    </div>
  );
};

// Feed card — fully interactive
const Card = ({ item, onToast, onShare, onComment }: any) => {
  const [expanded, setExpanded] = useState(false);
  const [cardExp, setCardExp] = useState(false);
  const [expFeedback, setExpFeedback] = useState<string|null>(null);
  const [animating, setAnimating] = useState(true);
  const animTimer = useRef<any>(null);

  const startAnim = () => {
    setAnimating(true);
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => setAnimating(false), 3000);
  };

  useEffect(() => {
    startAnim();
    return () => clearTimeout(animTimer.current);
  }, []);

  const handleCardClick = () => {
    setCardExp(e => !e);
    startAnim();
  };

  const isSync = item.type === "sync";
  const isAd = item.type === "insight-ad";
  const agUser = isAd ? AGENTS[item.uid] : null;
  const u = agUser || USERS[item.uid] || USERS.me;

  const toast = (msg: any, c: any) => {
    startAnim();
    onToast(msg, c);
  };

  return (
    <div className="au card-item" onClick={handleCardClick} style={{
      position: "relative",
      borderRadius: 18,
      padding: 1,
      overflow: "hidden",
      boxShadow: "0 2px 20px rgba(0,0,0,.35)",
      cursor: "pointer",
    }}>
      {/* Static border base */}
      <div style={{ position: "absolute", inset: 0, background: T.border, zIndex: 0 }} />

      {/* Animated gradient border draw */}
      <div style={{
        position: "absolute",
        top: "-50%", left: "-50%", right: "-50%", bottom: "-50%",
        background: `conic-gradient(from 0deg, transparent 60%, ${isSync ? T.blue : isAd ? T.green : T.orange} 100%)`,
        animation: "spin 2.5s linear infinite",
        zIndex: 0,
        opacity: animating ? 1 : 0,
        transition: "opacity 0.6s ease",
      }} />

      {/* Inner Card content container */}
      <div style={{
        background: T.card,
        borderRadius: 17,
        position: "relative",
        zIndex: 1,
        height: "100%",
      }}>
        {/* New user ribbon */}
        {item.isNew && (
          <div style={{
            padding: "5px 14px",
            background: `${T.green}08`, borderBottom: `1px solid ${T.green}18`,
            display: "flex", alignItems: "center", gap: 6,
            borderTopLeftRadius: 17, borderTopRightRadius: 17,
          }}>
            <Dot c={T.green} size={4} />
            <Mono c={T.green} s={9}>Yeni Ses · Bootstrap Feed</Mono>
          </div>
        )}

        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Av av={u.av} score={u.score} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{u.n || u.name}</span>
                {u.score >= 70 && <Pill c={T.blue} s={8}>elite</Pill>}
                {isAd && <Pill c={T.green} s={8}>{u.role}</Pill>}
              </div>
              <Mono c={T.muted} s={9}>{item.ago} önce</Mono>
            </div>
          </div>
          <Pill c={isSync ? T.blue : isAd ? T.green : T.orange} s={9}>{item.type.toUpperCase()}</Pill>
        </div>

        {/* Media */}
        {item.media && (
          <div style={{ 
            margin: "0 -16px", height: 220, position: "relative",
            background: T.bg, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
            overflow: "hidden"
          }}>
            {item.media.type === "video" ? (
              <video src={item.media.url} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <img src={item.media.url} alt="Post media" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            
            {/* AI Generated Badge */}
            {item.media.isAi && (
              <div style={{
                position: "absolute", top: 12, right: 12,
                background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
                padding: "4px 8px", borderRadius: 8, border: `1px solid rgba(255, 255, 255, 0.1)`,
                display: "flex", alignItems: "center", gap: 4, zIndex: 2
              }}>
                <span style={{ fontSize: 12 }}>✨</span>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, letterSpacing: "0.5px" }}>AI ÜRETİMİ</span>
              </div>
            )}
            
            {/* Play icon overlay for video */}
            {item.media.type === "video" && (
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)", border: `1px solid rgba(255,255,255,0.2)`,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, zIndex: 1
              }}>▶</div>
            )}
          </div>
        )}

        {/* Content */}
        <p style={{ 
          fontSize: 14.5, lineHeight: 1.68, color: T.text, fontWeight: 400,
          display: "-webkit-box", 
          WebkitLineClamp: cardExp ? "unset" : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          transition: "all 0.3s"
        }}>
          {item.text}
        </p>

        {/* Tags */}
        {(cardExp || item.text.length < 100) && item.tags?.length > 0 && (
          <div className="af" style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: cardExp ? 4 : 0 }}>
            {item.tags.map((t: any) => <Pill key={t} c={isAd ? T.green : T.muted} s={9}>#{t}</Pill>)}
          </div>
        )}

        {/* AI Expansion OR Ad Data */}
        {(isSync || isAd) && item.exp && (cardExp) && (
          <div className="af" style={{
            background: isAd ? `${T.green}07` : `${T.blue}07`, border: `1px solid ${isAd ? T.green : T.blue}18`,
            borderRadius: 12, padding: "11px 13px",
            display: "flex", flexDirection: "column", gap: 5,
            marginTop: 4
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Dot c={isAd ? T.green : T.blue} size={4} />
              <Mono c={isAd ? T.green : T.blue} s={9} style={{ letterSpacing: "0.12em" }}>{isAd ? "ADVERTISING LOGIC" : "AI EXPANSION"}</Mono>
            </div>
            {isAd ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4, background: "rgba(0,232,162,0.04)", padding: 12, borderRadius: 8, border: `1px solid ${T.green}20` }}>
                {(() => {
                  try {
                    const data = JSON.parse(item.exp);
                    return (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <Mono c={T.green} s={9} style={{ opacity: 0.8 }}>{`//`} RATIONALE LOGIC</Mono>
                          <span style={{ fontSize: 13, color: "#d8eaf2", lineHeight: 1.5 }}>{data.logic}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <Mono c={T.green} s={9} style={{ opacity: 0.8 }}>{`//`} AESTHETIC PARAMS</Mono>
                          <span style={{ fontSize: 13, color: "#6a90a0", lineHeight: 1.5 }}>{data.style}</span>
                        </div>
                      </>
                    );
                  } catch (e) {
                    return <span style={{ fontSize: 12, color: T.green }}>{item.exp}</span>;
                  }
                })()}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#7ab8c8", lineHeight: 1.62 }}>{item.exp}</p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 4 }}>
                <Mono c={T.sub} s={9}>{isAd ? "Bu öneri ilgi çekici miydi?" : "Bu analiz faydalı mıydı?"}</Mono>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="active:scale-90 hover:opacity-80 transition-all duration-200" onClick={(e) => { e.stopPropagation(); setExpFeedback('up'); onToast("Zihin skoru güncelleniyor (+)", T.green); }} style={{ border:"none", color: expFeedback==='up'?T.green:T.sub, cursor:"pointer", padding: "3px 8px", borderRadius: 6, background: expFeedback==='up'?`${T.green}22`:`${T.green}08`, fontSize: 10, fontWeight: 600, transform: expFeedback==='up'?"translateY(-1px)":"none" }}>YES</button>
                  <button className="active:scale-90 hover:opacity-80 transition-all duration-200" onClick={(e) => { e.stopPropagation(); setExpFeedback('down'); onToast("Model feedback alındı", T.orange); }} style={{ border:"none", color: expFeedback==='down'?T.orange:T.sub, cursor:"pointer", padding: "3px 8px", borderRadius: 6, background: expFeedback==='down'?`${T.orange}22`:`${T.orange}08`, fontSize: 10, fontWeight: 600, transform: expFeedback==='down'?"translateY(-1px)":"none" }}>NO</button>
                </div>
            </div>
          </div>
        )}

        {/* Expand / Collapse Indicator */}
        {!cardExp && ((isSync || isAd) && item.exp || item.text.length > 120) && (
          <Mono c={T.muted} s={10} style={{ alignSelf: "flex-end" }}>Genişlet ▼</Mono>
        )}
        {cardExp && (
          <Mono c={T.muted} s={10} style={{ alignSelf: "flex-end" }}>Daralt ▲</Mono>
        )}

        {/* Interaction bar */}
        <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 4 }}>
          <ActBtn icon="♡" count={item.hl} color={T.pink}
            onClick={() => toast("♥ Beğenildi", T.pink)} title="Beğen" />
          <ActBtn icon="◈" count={item.al} color={T.blue}
            onClick={() => toast("◈ AI Rezonans", T.blue)} title="AI Rezonansı" />
          <ActBtn icon="↺" count={item.ec} color={T.orange}
            onClick={() => toast("↺ Echo Break +5", T.orange)} title="Echo Break +3 skor" />
          <ActBtn icon="◌" count={item.cm} color={T.sub} noToggle={true}
            onClick={() => onComment && onComment(item)} title="Yorum" />
          <ActBtn icon="↗" count="" color={T.sub} noToggle={true}
            onClick={() => onShare && onShare(item)} title="Paylaş" />

          {/* Agent shares — subtle right side */}
          {item.agS?.length > 0 && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}>
              {item.agS.map((aid: any) => (
                <span key={aid} title={`${AGENTS[aid]?.name} paylaştı`} style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: `${AGENTS[aid]?.c}12`, border: `1px solid ${AGENTS[aid]?.c}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, color: AGENTS[aid]?.c,
                }}>{AGENTS[aid]?.av}</span>
              ))}
            </div>
          )}
        </div>

        {/* User Comments section */}
        {item.comments?.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {item.comments.map((c: any) => (
              <div key={c.id} onClick={(e) => e.stopPropagation()}>
                <CommentItem data={c} onToast={onToast} />
              </div>
            ))}
          </div>
        )}

        {/* Agent comments toggle */}
        {item.agC?.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setExpanded(v => !v)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7, padding: 0,
            }}>
              <div style={{ display: "flex", gap: 2 }}>
                {item.agC.map((c: any, i: any) => (
                  <span key={i} style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: `${AGENTS[c.ag]?.c}15`, border: `1px solid ${AGENTS[c.ag]?.c}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 7, color: AGENTS[c.ag]?.c,
                  }}>{AGENTS[c.ag]?.av}</span>
                ))}
              </div>
              <Mono c={T.muted} s={10}>{item.agC.length} agent görüşü {expanded ? "▲" : "▼"}</Mono>
            </button>
            {expanded && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {item.agC.map((c: any, i: any) => <AgentComment key={i} data={c} onToast={onToast} />)}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
//  SCREENS
// ═══════════════════════════════════════════════

// ── INTRO ──
const Intro = ({ done }: any) => {
  const [p, setP] = useState(0);
  useEffect(() => {
    [300, 900, 1600].forEach((t, i) => setTimeout(() => setP(i + 1), t));
    setTimeout(done, 2400);
  }, []);
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: T.bg, gap: 20, zIndex: 100,
    }}>
      <div style={{ position: "relative", width: 88, height: 88 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `1.5px solid ${T.blue}`,
            animation: "ring 2.4s ease-out infinite",
            animationDelay: `${i * 0.55}s`,
            opacity: p >= 1 ? 1 : 0, transition: "opacity .4s",
          }} />
        ))}
        <div style={{
          position: "absolute", inset: 12, borderRadius: "50%",
          background: `radial-gradient(circle, ${T.blue}22 0%, ${T.orange}18 100%)`,
          border: `1px solid ${T.blue}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, opacity: p >= 1 ? 1 : 0, transition: "opacity .4s .1s",
        }}>◈</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{
          fontWeight: 900, fontSize: 28, letterSpacing: "0.25em",
          background: `linear-gradient(90deg, ${T.blue}, ${T.orange})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          opacity: p >= 2 ? 1 : 0, transition: "opacity .5s",
        }}>COGNIS</span>
        <Mono c={T.muted} s={10} style={{ letterSpacing: "0.3em", opacity: p >= 3 ? .7 : 0, transition: "opacity .4s .1s" }}>
          COGNITION ECONOMY
        </Mono>
      </div>
    </div>
  );
};

// ── MIND SCORE ──
const ScoreScreen = ({ score, done }: any) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 120); setTimeout(done, 3400); }, []);
  const label = score >= 75 ? "Zihnin keskin bugün." : score >= 55 ? "Fikirlerin gelişiyor." : score >= 35 ? "Yüzeyde kaldın." : "Düşünce kasın paslandı.";

  return (
    <div style={{
      position: "absolute", inset: 0, background: T.bg, display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, zIndex: 90,
    }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
        opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(22px)",
        transition: "all .7s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <Mono c={T.muted} s={10} style={{ letterSpacing: "0.28em" }}>DAILY MIND SCORE</Mono>

        <div style={{ position: "relative", width: 210, height: 210 }}>
          <Ring score={vis ? score : 0} size={210} />
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
          }}>
            <span style={{
              fontWeight: 900, fontSize: 60, lineHeight: 1,
              background: `linear-gradient(135deg, ${T.blue}, ${T.orange})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: vis ? "scoreIn .5s ease .6s both" : "none",
            }}>{score}</span>
            <Mono c={T.blue} s={11} style={{ fontWeight: 500 }}>+8 dün ↑</Mono>
          </div>
        </div>

        <p style={{ fontSize: 16, fontWeight: 500, color: T.text, textAlign: "center", maxWidth: 250, lineHeight: 1.5 }}>
          {label}
        </p>

        {/* Sub scores */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          {[{ l: "ECHO", v: "72%", c: T.green }, { l: "DEPTH", v: "68%", c: T.blue }, { l: "DIVERSITY", v: "61%", c: T.orange }].map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <Mono c={T.muted} s={8}>{m.l}</Mono>
              <span style={{ fontWeight: 700, fontSize: 16, color: m.c }}>{m.v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <Pill c={T.orange} s={9}>+7 pulse</Pill>
          <Pill c={T.blue} s={9}>+3 sync</Pill>
          <Pill c={T.muted} s={9}>−4 scroll</Pill>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
//  TAB CONTENT COMPONENTS
// ═══════════════════════════════════════════════

// FEED
const FeedTab = ({ feed, onToast, onShare, onComment }: any) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {feed.map((item: any, i: any) => (
      <div key={item.id} style={{ animationDelay: `${Math.min(i, 3) * 0.07}s` }}>
        <Card item={item} onToast={onToast} onShare={onShare} onComment={onComment} />
      </div>
    ))}
  </div>
);

// PULSE COMPOSER
const PulseTab = ({ onSubmit, loading }: any) => {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Composer */}
      <div style={{
        background: T.card,
        border: `1px solid ${focused ? T.orange + "55" : T.border}`,
        borderRadius: 18, padding: "16px",
        boxShadow: focused ? `0 0 30px ${T.orangeG}` : "none",
        transition: "border-color .2s, box-shadow .2s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
          <Dot c={T.orange} />
          <Mono c={T.orange} s={10} style={{ letterSpacing: "0.14em" }}>PULSE</Mono>
          {text.length > 80 && <Pill c={T.blue} s={9}>◈ Sync hazır</Pill>}
        </div>
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Bir düşünce, his, soru... İçinden geçeni yaz."
          rows={5}
          style={{
            background: "none", border: "none", outline: "none",
            color: T.text, fontSize: 15, lineHeight: 1.65, resize: "none",
            width: "100%", fontWeight: 400,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <Mono c={T.muted} s={9}>{text.length}/300</Mono>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {loading && <Loader c={T.blue} />}
            {!loading && text.length > 0 && (
              <button onClick={() => onSubmit(text, true)} style={{
                background: `linear-gradient(135deg, ${T.blue}20, ${T.blue}35)`,
                border: `1px solid ${T.blue}50`, color: T.blue,
                borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>◈ Sync</button>
            )}
            <button onClick={() => text && onSubmit(text, false)} style={{
              background: `linear-gradient(135deg, ${T.orange}20, ${T.orange}35)`,
              border: `1px solid ${T.orange}50`, color: T.orange,
              borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}>⚡ Pulse</button>
          </div>
        </div>
      </div>

      {/* Score guide */}
      <div style={{
        background: `${T.blue}07`, border: `1px solid ${T.blue}18`,
        borderRadius: 14, padding: 14,
      }}>
        <Mono c={T.blue} s={9} style={{ display: "block", marginBottom: 10, letterSpacing: "0.12em" }}>ANLIK FEEDBACK</Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            { a: "Pulse at", s: "+5", c: T.orange },
            { a: "Sync oluştur", s: "+10", c: T.blue },
            { a: "Zıt fikir gör (Echo Break)", s: "+5", c: T.green },
            { a: "Pasif scroll", s: "−2", c: T.muted },
            { a: "Fragmented giriş", s: "−1", c: T.muted },
          ].map(f => (
            <div key={f.a} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: T.text }}>{f.a}</span>
              <Mono c={f.c} s={12} style={{ fontWeight: 500 }}>{f.s}</Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ZIHIN (stats)
const ZihinTab = ({ score }: any) => {
  const weekly = [42, 55, 61, 48, 72, 67];
  const days = ["P","S","Ç","P","C","C"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Score card */}
      <div className="au" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 18, padding: 16,
        display: "grid", gridTemplateColumns: "auto 1px 1fr",
        gap: 16, alignItems: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <Ring score={score} size={90} />
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1,
            }}>
              <span style={{
                fontWeight: 900, fontSize: 24,
                background: `linear-gradient(135deg, ${T.blue}, ${T.orange})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{score}</span>
              <Mono c={T.blue} s={8}>+8</Mono>
            </div>
          </div>
          <Mono c={T.muted} s={8} style={{ marginTop: 4 }}>MIND SCORE</Mono>
        </div>
        <div style={{ background: T.border, height: "80%", width: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[
            { l: "ECHO SCORE", v: "72%", c: T.green },
            { l: "DEPTH INDEX", v: "68%", c: T.blue },
            { l: "DIVERSITY", v: "61%", c: T.orange },
          ].map(m => (
            <div key={m.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Mono c={T.muted} s={9}>{m.l}</Mono>
              <span style={{ fontWeight: 700, fontSize: 15, color: m.c }}>{m.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart */}
      <div className="au" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 18, padding: 16,
        animationDelay: ".07s",
      }}>
        <Mono c={T.muted} s={9} style={{ display: "block", marginBottom: 12, letterSpacing: "0.1em" }}>HAFTALIK SKOR</Mono>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
          {weekly.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%", height: `${(v / 100) * 60}px`,
                background: i === 5 ? `linear-gradient(to top, ${T.blue}, ${T.orange})` : `${T.blue}30`,
                borderRadius: "4px 4px 2px 2px",
                boxShadow: i === 5 ? `0 0 16px ${T.blue}50` : "none",
                transition: "height .8s cubic-bezier(.34,1.56,.64,1)",
              }} />
              <Mono c={i === 5 ? T.blue : T.muted} s={8}>{days[i]}</Mono>
            </div>
          ))}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", height: 6, background: T.dim, borderRadius: 3 }} />
            <Mono c={T.muted} s={8}>P</Mono>
          </div>
        </div>
      </div>

      {/* Time model */}
      <div className="au" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 18, padding: 16, animationDelay: ".14s",
      }}>
        <Mono c={T.muted} s={9} style={{ display: "block", marginBottom: 12, letterSpacing: "0.1em" }}>ZAMAN MODELİ</Mono>
        {[
          { l: "Active Cognitive", p: 64, c: T.blue },
          { l: "Passive Scroll", p: 21, c: T.orange },
          { l: "Fragmented", p: 15, c: T.muted },
        ].map(b => (
          <div key={b.l} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: T.text }}>{b.l}</span>
              <Mono c={b.c} s={11}>{b.p}%</Mono>
            </div>
            <div style={{ height: 4, background: T.dim, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${b.p}%`,
                background: b.c, borderRadius: 4,
                boxShadow: `0 0 8px ${b.c}50`,
                transition: "width 1s cubic-bezier(.34,1.56,.64,1) .3s",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Creator profile */}
      <div className="au" style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 18, padding: 16, animationDelay: ".2s",
      }}>
        <Mono c={T.muted} s={9} style={{ display: "block", marginBottom: 12, letterSpacing: "0.1em" }}>CREATOR PROFİLİM</Mono>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Av av="◇" score={67} />
          <div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Sen</span>
            <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
              <Mono c={T.blue} s={10}>Score: 67</Mono>
              <Pill c={T.orange} s={9}>Rising</Pill>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[{l:"PULSE",v:7,c:T.orange},{l:"SYNC",v:3,c:T.blue},{l:"ECHO",v:"4×",c:T.green}].map(m => (
            <div key={m.l} style={{
              background: T.s2, borderRadius: 10, padding: "10px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <Mono c={T.muted} s={8}>{m.l}</Mono>
              <span style={{ fontWeight: 800, fontSize: 20, color: m.c }}>{m.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AGENTS TAB
const AgentsTab = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <span style={{ fontWeight: 700, fontSize: 16, color: T.text }}>Sistem Agentleri</span>
        <p style={{ fontSize: 13, color: T.sub, marginTop: 4, lineHeight: 1.55 }}>
          Platforma entegre zihinsel katman. İçerikleri analiz eder, kaliteli üreticileri amplify eder. Detaylı profil için dokunun.
        </p>
      </div>

      {Object.values(AGENTS).map((a: any, i: any) => {
        const isExpanded = selectedAgent === a.id;
        return (
          <div key={a.id} className="au card-item" onClick={() => setSelectedAgent(isExpanded ? null : a.id)} style={{
            background: isExpanded ? `${a.c}08` : T.agBg, 
            border: `1px solid ${isExpanded ? `${a.c}40` : `${a.c}22`}`,
            borderRadius: 18, padding: 16, animationDelay: `${i * .08}s`,
            transition: "all 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="breathe" style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `${a.c}14`, border: `1.5px solid ${a.c}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 19, color: a.c,
                }}>{a.av}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{a.name}</span>
                    <Dot c={a.c} size={5} />
                  </div>
                  <Mono c={a.c} s={9}>{a.role}</Mono>
                </div>
              </div>
              <Pill c={a.c} s={9}>aktif</Pill>
            </div>
            
            <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.55, marginBottom: 10 }}>{a.bio}</p>

            <div style={{
              background: `${a.c}07`, borderRadius: 10, padding: "10px 12px",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
            }}>
              <div>
                <Mono c={T.muted} s={8} style={{ display: "block", marginBottom: 2 }}>PAYLAŞMA EŞİĞİ</Mono>
                <span style={{ fontWeight: 700, fontSize: 14, color: a.c }}>Score ≥ {a.thr}</span>
              </div>
              <div>
                <Mono c={T.muted} s={8} style={{ display: "block", marginBottom: 2 }}>YENİ KULLANICI</Mono>
                <span style={{ fontWeight: 700, fontSize: 14, color: a.boot ? T.green : T.sub }}>
                  {a.boot ? "Bootstrap aktif" : "Standart"}
                </span>
              </div>
            </div>

            {/* Detailed Expanded View */}
            {isExpanded && (
              <div className="af" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${a.c}30`, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: T.bg, padding: "10px", borderRadius: 10, border: `1px solid ${T.border}` }}>
                    <Mono c={T.muted} s={8} style={{ display: "block" }}>ETKİLEŞİM HACMİ</Mono>
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{a.stats?.amplified || "0K"}</span>
                    <Mono c={T.sub} s={8} style={{ display: "block" }}>Sinyal</Mono>
                  </div>
                  <div style={{ background: T.bg, padding: "10px", borderRadius: 10, border: `1px solid ${T.border}` }}>
                    <Mono c={T.muted} s={8} style={{ display: "block" }}>ANALİZ DOĞRULUĞU</Mono>
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{a.stats?.accuracy || "%0"}</span>
                    <Mono c={T.sub} s={8} style={{ display: "block" }}>Precision</Mono>
                  </div>
                </div>

                <div>
                  <Mono c={a.c} s={9} style={{ display: "block", marginBottom: 4, letterSpacing: "0.1em" }}>{`//`} CORE DIRECTIVE</Mono>
                  <p style={{ fontSize: 12.5, color: T.text, lineHeight: 1.5, background: `${T.card}`, padding: "12px", borderRadius: 10, border: `1px solid ${T.border}`, fontStyle: "italic" }}>
                    &quot; {a.directive} &quot;
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Algorithm note */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 14 }}>
        <Mono c={T.sub} s={9} style={{ display: "block", marginBottom: 10, letterSpacing: "0.1em" }}>ALGORİTMA KURALLARI</Mono>
        {[
          { l: "Paylaşma kararı", d: "Creator Score + içerik derinlik analizi" },
          { l: "Yeni kullanıcı (7 gün)", d: "Bootstrap Feed — Nexus & Kael destekler" },
          { l: "Yorum tetikleyici", d: "Sync + yüksek Echo Break oranı" },
          { l: "Sessizlik kuralı", d: "Düşük kalite içeriğe agent müdahale etmez" },
        ].map(r => (
          <div key={r.l} style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.l}</span>
            <Mono c={T.muted} s={10} style={{ display: "block", marginTop: 1 }}>{r.d}</Mono>
          </div>
        ))}
      </div>
    </div>
  );
};

// NOTIFS TAB
const NotifsTab = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ marginBottom: 4 }}>
      <span style={{ fontWeight: 700, fontSize: 16 }}>Bildirimler</span>
    </div>
    {NOTIFS0.map((n, i) => {
      const a = n.ag ? AGENTS[n.ag] : null;
      return (
        <div key={n.id} className="au" style={{
          background: a ? T.agBg : T.card,
          border: `1px solid ${a ? T.agBorder : T.border}`,
          borderLeft: a ? `2px solid ${a.c}55` : `2px solid ${T.border}`,
          borderRadius: "2px 14px 14px 2px",
          padding: "12px 14px", animationDelay: `${i * .05}s`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
            {a ? (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: `${a.c}18`, border: `1px solid ${a.c}45`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: a.c,
                }}>{a.av}</span>
                <Mono c={a.c} s={10}>{a.name}</Mono>
                <Mono c={T.muted} s={9}>{a.role}</Mono>
              </div>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{n.human}</span>
            )}
            <Mono c={T.muted} s={9}>{n.ago}</Mono>
          </div>
          <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.55 }}>{n.text}</p>
          {n.gain && <div style={{ marginTop: 6 }}><Pill c={T.blue} s={9}>+{n.gain} skor</Pill></div>}
        </div>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════
//  PROFILE TAB
// ═══════════════════════════════════════════════
const ProfileTab = ({ feed, onToast, onShare, onComment, theme, toggleTheme, SCORE, onOpenSettings, onOpenNotifs }: any) => {
  const posts = feed.filter((i: any) => i.uid === "me");
  const history = [
    { id: 1, text: "Vera ile senkronizasyon kuruldu.", time: "2s önce" },
    { id: 2, text: "'The Fall' içeriğinde AMPLIFY yapıldı", time: "5s önce" },
    { id: 3, text: "Zihin skoru 60 sınırını aştı.", time: "10d önce" }
  ];

  return (
    <div className="af" style={{ display: "flex", flexDirection: "column", gap: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: T.text }}>Profil</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onOpenNotifs} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "8px", 
            color: T.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            ◌ Bildirimler
          </button>
          <button onClick={onOpenSettings} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "8px", 
            color: T.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            ⚙️
          </button>
        </div>
      </div>

      {/* User details */}
      <div className="au" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20, display: "flex", gap: 18, alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <Av av={USERS.me.av} score={SCORE} />
        <div>
          <div style={{ color: T.text, fontSize: 22, fontWeight: "bold" }}>{USERS.me.n}</div>
          <Mono c={T.muted} s={12}>{USERS.me.role || "Eko-Oyuncu"}</Mono>
        </div>
      </div>

      {/* Activity History */}
      <div>
        <span style={{ fontSize: 16, fontWeight: 600, color: T.text, marginLeft: 4 }}>Son Hareketler</span>
        <div className="au" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
          {history.map(h => (
            <div key={h.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Dot c={T.blue} />
              <span style={{ fontSize: 14, color: T.sub }}>{h.text}</span>
              <Mono c={T.muted} s={10} style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>{h.time}</Mono>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div style={{ marginTop: 5 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: T.text, marginLeft: 4 }}>Senin Sinyalleriniz</span>
        <div style={{ marginTop: 8 }}>
          {posts.length > 0 ? (
            <FeedTab feed={posts} onToast={onToast} onShare={onShare} onComment={onComment} />
          ) : (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 30, textAlign: "center" }}>
              <Mono c={T.muted}>Henüz gönderin yok.</Mono>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | score | main
  const [tab, setTab]       = useState("feed");
  const [feed, setFeed]     = useState(FEED0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState<any>(null);
  const [shareItem, setShareItem] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [commentItem, setCommentItem] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [theme, setTheme]   = useState("dark");
  const SCORE = 67;

  if (theme === "light") Object.assign(T, T_LIGHT);
  else Object.assign(T, T_DARK);
  
  if (typeof document !== "undefined") document.body.style.setProperty("--app-bg", T.bg);

  const showToast = useCallback((msg: any, c = T.blue) => {
    setToast({ msg, c });
    setTimeout(() => setToast(null), 2400);
  }, []);

  const handleSubmit = useCallback(async (text: any, doSync: any) => {
    if (!text.trim()) return;
    setLoading(true);

    const base = {
      id: nid(), uid: "me", type: "pulse", ago: "şimdi",
      text, hl: 0, al: 0, ec: 0, cm: 0,
      agC: [], agS: [], tags: [],
    };

    if (!doSync) {
      setFeed((f: any) => [base, ...f]);
      showToast("⚡ Pulse yayında +5", T.orange);
      setTab("feed"); setLoading(false); return;
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 1000,
          system: `COGNIS platformu AI katmanısın. Kullanıcının Pulse düşüncesini Sync nesnesine dönüştür.
3-4 cümle max 90 kelime. Derinleştir, karşı argüman ekle, bağlam ver. Türkçe, keskin.
Sadece JSON: {"expansion":"...","tags":["t1","t2"]}`,
          messages: [{ role: "user", content: `Pulse: "${text}"` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      let exp = "", tags = [];
      try {
        const clean = raw.replace(/```json|```/g,"").trim();
        const p = JSON.parse(clean);
        exp = p.expansion || raw; tags = p.tags || [];
      } catch { exp = raw; }

      const agS: any[] = [], agC: any[] = [];
      if (USERS.me.score >= AGENTS.kael.thr) {
        agS.push("kael");
        agC.push({ ag:"kael", text:"Derinlik potansiyeli tespit edildi. Feed'e eklendi.", ago:"şimdi" });
      }

      setFeed((f: any) => [{ ...base, type:"sync", exp, tags, agS, agC }, ...f]);
      showToast("◈ Sync oluşturuldu +10", T.blue);
      setTab("feed");
    } catch {
      setFeed((f: any) => [{ ...base, type:"sync", exp:"Sync hazırlanıyor...", tags:[] }, ...f]);
      showToast("Sync kaydedildi", T.muted);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const TABS = [
    { id:"feed",   icon:"⌁",  label:"Feed"  },
    { id:"pulse",  icon:"⚡", label:"Pulse", special:true },
    { id:"zihin",  icon:"◉",  label:"Zihin" },
    { id:"agents", icon:"⬡",  label:"Agent" },
    { id:"profile",icon:"👤", label:"Profil" },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* Phone shell — centers everything */}
      <div style={{
        minHeight: "100vh", background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "100%", maxWidth: 390,
          height: "100svh", maxHeight: 844,
          position: "relative", overflow: "hidden",
          background: T.bg,
          boxShadow: "0 0 0 1px #1a2a38, 0 40px 120px rgba(0,0,0,.9)",
          borderRadius: typeof window !== 'undefined' && window.innerWidth > 430 ? 44 : 0,
        }}>

          {/* ── Screens ── */}
          {screen === "intro" && <Intro done={() => setScreen("score")} />}
          {screen === "score" && <ScoreScreen score={SCORE} done={() => setScreen("main")} />}

          {screen === "main" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

              {/* Status bar mock */}
              <div style={{
                height: 44, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 20px 0 24px",
              }}>
                <Mono c={T.sub} s={12} style={{ fontWeight: 500 }}>9:41</Mono>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {["▪▪▪","WiFi","🔋"].map((x,i) => (
                    <Mono key={i} c={T.sub} s={10}>{x}</Mono>
                  ))}
                </div>
              </div>

              {/* Header */}
              <div style={{
                padding: "0 18px 10px", flexShrink: 0,
                borderBottom: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="breathe" style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: `radial-gradient(circle, ${T.blue}22 0%, ${T.orange}15 100%)`,
                    border: `1px solid ${T.blue}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>◈</div>
                  <span style={{
                    fontWeight: 900, fontSize: 18, letterSpacing: "0.18em",
                    background: `linear-gradient(90deg, ${T.blue}, ${T.orange})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>COGNIS</span>
                </div>

                {/* Action right side */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {/* Score pill */}
                  <button onClick={() => setScreen("score")} style={{
                    display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                    background: T.card, border: `1px solid ${T.border}`,
                    borderRadius: 22, padding: "5px 10px 5px 6px",
                  }}>
                  <div style={{ position: "relative", width: 30, height: 30 }}>
                    <Ring score={SCORE} size={30} />
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800,
                        background: `linear-gradient(135deg, ${T.blue}, ${T.orange})`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}>{SCORE}</span>
                    </div>
                  </div>
                  <div>
                    <Mono c={T.sub} s={8} style={{ display: "block" }}>Mind Score</Mono>
                    <Mono c={T.blue} s={10} style={{ fontWeight: 500 }}>+8 ↑</Mono>
                  </div>
                </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "14px 14px 80px",
                display: "flex", flexDirection: "column", gap: 10,
                WebkitOverflowScrolling: "touch",
              }}>
                {tab === "feed"   && <FeedTab feed={feed} onToast={showToast} onShare={setShareItem} onComment={setCommentItem} />}
                {tab === "pulse"  && <PulseTab onSubmit={handleSubmit} loading={loading} />}
                {tab === "zihin"  && <ZihinTab score={SCORE} />}
                {tab === "agents" && <AgentsTab />}
                {tab === "profile" && <ProfileTab feed={feed} onToast={showToast} onShare={setShareItem} onComment={setCommentItem} theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} SCORE={SCORE} onOpenSettings={() => setShowSettings(true)} onOpenNotifs={() => setShowNotifs(true)} />}
              </div>

              {/* Bottom nav — iOS style */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: `${T.bg}e8`,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderTop: `1px solid ${T.border}`,
                paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
                display: "flex", alignItems: "stretch",
              }}>
                {TABS.map(t => {
                  const active = tab === t.id;
                  return (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                      flex: 1, background: "none", border: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", gap: 3, padding: "10px 0 6px",
                      position: "relative",
                    }}>
                      {t.special ? (
                        // Center FAB-style pulse button
                        <div style={{
                          width: 48, height: 32, borderRadius: 16,
                          background: active
                            ? `linear-gradient(135deg, ${T.orange}40, ${T.blue}30)`
                            : T.s2,
                          border: `1px solid ${active ? T.orange + "70" : T.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          boxShadow: active ? `0 0 18px ${T.orangeG}` : "none",
                          transition: "all .2s",
                        }}>
                          <span style={{ fontSize: 13 }}>{t.icon}</span>
                          <Mono c={active ? T.orange : T.muted} s={9}>{t.label}</Mono>
                        </div>
                      ) : (
                        <>
                          <span style={{
                            fontSize: 18,
                            color: active ? T.blue : T.muted,
                            filter: active ? `drop-shadow(0 0 6px ${T.blue})` : "none",
                            transition: "color .18s, filter .18s",
                          }}>{t.icon}</span>
                          <Mono c={active ? T.blue : T.muted} s={8}>{t.label}</Mono>
                          {(t as any).badge && (
                            <div style={{
                              position: "absolute", top: 7, left: "50%",
                              transform: "translateX(4px)",
                              width: 16, height: 16, borderRadius: "50%",
                              background: T.orange,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Mono c="#fff" s={8}>{(t as any).badge}</Mono>
                            </div>
                          )}
                        </>
                      )}
                      {/* Active indicator dot */}
                      {!t.special && (
                        <div style={{
                          width: 4, height: 4, borderRadius: "50%",
                          background: active ? T.blue : "transparent",
                          boxShadow: active ? `0 0 6px ${T.blue}` : "none",
                          transition: "background .18s",
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Toast notification */}
              {toast && (
                <div style={{
                  position: "absolute", top: 68, left: "50%",
                  translate: "-50% 0", // added translate to fix shifting since left:50% relies on it
                  background: T.card, border: `1px solid ${toast.c}35`,
                  borderRadius: 24, padding: "8px 18px",
                  color: toast.c, fontSize: 13, fontWeight: 600,
                  animation: "toast .3s ease",
                  boxShadow: `0 8px 32px rgba(0,0,0,.6), 0 0 20px ${toast.c}18`,
                  whiteSpace: "nowrap", zIndex: 99, pointerEvents: "none",
                }}>{toast.msg}</div>
              )}

              {/* Share Sheet Modal */}
              {shareItem && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 110,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  overflow: "hidden"
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => setShareItem(null)} />
                  <div className="au" style={{
                    position: "relative",
                    background: T.card, borderTop: `1px solid ${T.border}`,
                    borderRadius: "24px 24px 0 0", padding: "24px 20px 40px",
                    display: "flex", flexDirection: "column", gap: 16,
                    boxShadow: "0 -10px 40px rgba(0,0,0,0.5)"
                  }} onClick={e => e.stopPropagation()}>
                    <div style={{ width: 40, height: 4, background: T.dim, borderRadius: 2, alignSelf: "center", marginBottom: 10 }} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: T.text, textAlign: "center" }}>Paylaş</span>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: 12 }}>
                      <button onClick={() => {
                        navigator.clipboard.writeText(`https://pulsemarket.io/p/${shareItem.id}`);
                        setShareItem(null);
                        showToast("Bağlantı kopyalandı", T.green);
                      }} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"none", border:"none", color:T.text, cursor:"pointer" }}>
                        <div style={{ width: 50, height: 50, borderRadius: "50%", background: T.bg, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize: 20 }}>🔗</div>
                        <Mono c={T.muted} s={10}>Kopyala</Mono>
                      </button>

                      <button onClick={() => {
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent((shareItem.text || "").substring(0,50)+"...")}&url=https://pulsemarket.io/p/${shareItem.id}`, "_blank");
                        setShareItem(null);
                      }} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"none", border:"none", color:T.text, cursor:"pointer" }}>
                        <div style={{ width: 50, height: 50, borderRadius: "50%", background: T.bg, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize: 20 }}>𝕏</div>
                        <Mono c={T.muted} s={10}>Postla</Mono>
                      </button>

                      {typeof navigator !== 'undefined' && navigator.share && (
                        <button onClick={() => {
                          navigator.share({ title: "PulseMarket", text: shareItem.text, url: `https://pulsemarket.io/p/${shareItem.id}` }).catch(() => {});
                          setShareItem(null);
                        }} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"none", border:"none", color:T.text, cursor:"pointer" }}>
                          <div style={{ width: 50, height: 50, borderRadius: "50%", background: T.bg, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize: 20 }}>↗</div>
                          <Mono c={T.muted} s={10}>Diğer</Mono>
                        </button>
                      )}
                    </div>

                    <button onClick={() => setShareItem(null)} style={{
                      marginTop: 10, background: T.bg, border: `1px solid ${T.border}`,
                      borderRadius: 14, padding: "14px", color: T.text, fontSize: 15, fontWeight: 600,
                      cursor: "pointer"
                    }}>İptal</button>
                  </div>
                </div>
              )}

              {/* Settings Modal */}
              {showSettings && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 110,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  overflow: "hidden"
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)" }} onClick={() => setShowSettings(false)} />
                  <div className="au" style={{
                    position: "relative",
                    background: T.card, borderTop: `1px solid ${T.border}`,
                    borderRadius: "24px 24px 0 0", padding: "24px 20px 40px",
                    display: "flex", flexDirection: "column", gap: 16,
                    boxShadow: "0 -10px 40px rgba(0,0,0,0.5)"
                  }} onClick={e => e.stopPropagation()}>
                    <div style={{ width: 40, height: 4, background: T.dim, borderRadius: 2, alignSelf: "center", marginBottom: 10 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ fontSize: 20, fontWeight: 700, color: T.text }}>Ayarlar</span>
                       <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 20 }}>✕</button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: T.text }}>Tema</span>
                        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{
                          background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "6px 12px", 
                          color: T.text, cursor: "pointer", display: "flex", gap: 6, alignItems: "center"
                        }}>
                          {theme === 'dark' ? '☀️ Gündüz' : '🌙 Gece'}
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: T.text }}>Gizlilik Tercihleri</span>
                        <span style={{ color: T.sub, fontSize: 13 }}>Herkese Açık</span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: T.text }}>E-posta Bildirimleri</span>
                        <span style={{ color: T.green, fontSize: 13 }}>Açık</span>
                      </div>
                    </div>

                    <button style={{
                      marginTop: 20, background: `${T.orange}15`, border: `1px solid ${T.orange}`,
                      borderRadius: 14, padding: "14px", color: T.orange, fontSize: 15, fontWeight: 600,
                      cursor: "pointer"
                    }}>Oturumu Kapat</button>
                  </div>
                </div>
              )}

              {/* Notifications Modal */}
              {showNotifs && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 110,
                  display: "flex", flexDirection: "column",
                  overflow: "hidden"
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)" }} onClick={() => setShowNotifs(false)} />
                  <div className="au" style={{
                    position: "relative",
                    background: T.card, borderTop: `1px solid ${T.border}`,
                    borderRadius: "24px 24px 0 0", padding: "24px 20px",
                    display: "flex", flexDirection: "column", gap: 16,
                    height: "85%", marginTop: "auto",
                    boxShadow: "0 -10px 40px rgba(0,0,0,0.5)"
                  }} onClick={e => e.stopPropagation()}>
                    <div style={{ width: 40, height: 4, background: T.dim, borderRadius: 2, alignSelf: "center", marginBottom: 5 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                       <span style={{ fontSize: 20, fontWeight: 700, color: T.text }}>Bildirimler</span>
                       <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 20 }}>✕</button>
                    </div>
                    
                    <div style={{ overflowY: "auto", flex: 1, paddingBottom: 40 }}>
                      <NotifsTab />
                    </div>
                  </div>
                </div>
              )}

              {/* Comment Modal */}
              {commentItem && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 120,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                }}>
                  <div 
                    style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }} 
                    onClick={() => setCommentItem(null)} 
                  />
                  <div className="au" style={{
                    position: "relative",
                    background: T.card, borderTop: `1px solid ${T.border}`,
                    borderRadius: "24px 24px 0 0", padding: "24px 20px 40px",
                    display: "flex", flexDirection: "column", gap: 16,
                    boxShadow: "0 -20px 60px rgba(0,0,0,0.6)"
                  }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Yanıtla</span>
                      <button onClick={() => setCommentItem(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 20 }}>✕</button>
                    </div>

                    <textarea
                      autoFocus
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Fikrini veya rezonansını aktar..."
                      style={{
                        width: "100%", height: 100, background: T.bg, border: `1px solid ${T.border}`,
                        borderRadius: 14, padding: 14, color: T.text, fontSize: 15,
                        resize: "none", outline: "none"
                      }}
                    />

                    {/* Minimal Emojis */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {['✨', '🔥', '🧠', '💡', '👁️', '🌊'].map(emo => (
                          <button key={emo} onClick={() => setCommentText(prev => prev + emo)} style={{
                            background: T.bg, border: `1px solid ${T.border}`, borderRadius: "50%",
                            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, cursor: "pointer", color: T.text
                          }} className="hover:opacity-80 active:scale-95 transition-all">
                            {emo}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => {
                        if (!commentText.trim()) return;
                        setFeed((f: any) => f.map((post: any) => post.id === commentItem.id ? {
                          ...post, cm: (post.cm || 0) + 1, comments: [...(post.comments || []), {
                            id: Date.now(), uid: "me", text: commentText, isAi: false, fbMsg: null
                          }]
                        } : post));
                        setCommentItem(null);
                        setCommentText("");
                        showToast("Yorum eklendi", T.green);
                      }} style={{
                        background: T.text, color: T.bg, padding: "10px 20px", borderRadius: 20,
                        fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer"
                      }} className="active:scale-95 transition-transform">
                        Gönder
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
