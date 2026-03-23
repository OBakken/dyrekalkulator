import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// ── Data: Animalia 2024, spiselig kjøtt per dyr FØR svinn ───────────────────
const ANIMALS = [
  { id: "kylling", name: "Kylling", kgPer: 1.04, yearlyKg: 17.5, color: "#D85A30", hz: 980, wave: "sine", dur: 0.12 },
  { id: "fisk", name: "Fisk", kgPer: 2.8, yearlyKg: 18.0, color: "#185FA5", hz: 620, wave: "sine", dur: 0.2 },
  { id: "gris", name: "Gris", kgPer: 69.5, yearlyKg: 20.7, color: "#D4537E", hz: 260, wave: "triangle", dur: 0.3 },
  { id: "sau", name: "Sau/lam", kgPer: 14.3, yearlyKg: 3.2, color: "#854F0B", hz: 420, wave: "sine", dur: 0.25 },
  { id: "storfe", name: "Storfe", kgPer: 223, yearlyKg: 14.1, color: "#5F5E5A", hz: 140, wave: "sawtooth", dur: 0.45 },
];

const GENDERS = [
  { id: "mann", label: "Mann", mMeat: 1.25, mFish: 1.15, deathAge: 82 },
  { id: "kvinne", label: "Kvinne", mMeat: 0.78, mFish: 0.88, deathAge: 85 },
];
const APPETITES = [
  { id: "glad", label: "Storspiser", mult: 1.35 },
  { id: "normal", label: "Gjennomsnitt", mult: 1.0 },
  { id: "lav", label: "Lite kjøtt/fisk", mult: 0.6 },
];

// Age-adjusted consumption multiplier
function ageMult(age) {
  if (age < 2) return 0.15;
  if (age < 6) return 0.35;
  if (age < 10) return 0.5;
  if (age < 14) return 0.7;
  if (age < 18) return 0.85;
  if (age < 70) return 1.0;
  if (age < 80) return 0.85;
  return 0.7;
}

// Cumulative kg eaten from birth to a given age, for one animal type
function cumulativeKg(animal, genderData, appetiteData, toAge) {
  const isFish = animal.id === "fisk";
  const baseMult = (isFish ? genderData.mFish : genderData.mMeat) * appetiteData.mult;
  const dailyKgAdult = (animal.yearlyKg * baseMult) / 365;
  let totalKg = 0;
  for (let y = 0; y < toAge; y++) {
    totalKg += dailyKgAdult * ageMult(y) * 365;
  }
  // partial year
  const frac = toAge - Math.floor(toAge);
  if (frac > 0) {
    totalKg += dailyKgAdult * ageMult(Math.floor(toAge)) * 365 * frac;
  }
  return totalKg;
}

// ── Audio ────────────────────────────────────────────────────────────────────
let _ac = null;
function ping(hz, wave, dur) {
  try {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === "suspended") _ac.resume();
    const o = _ac.createOscillator(), g = _ac.createGain();
    o.connect(g); g.connect(_ac.destination);
    o.frequency.value = hz; o.type = wave;
    g.gain.setValueAtTime(0.09, _ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _ac.currentTime + dur);
    o.start(); o.stop(_ac.currentTime + dur);
  } catch (e) {}
}
function deathChime(a) {
  ping(a.hz, a.wave, a.dur);
  setTimeout(() => ping(a.hz * 0.75, a.wave, a.dur * 1.4), 120);
}
function humanDeathBell() {
  try {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    const play = () => {
      const t = _ac.currentTime;
      // Master compressor + gain to push volume hard
      const comp = _ac.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-10, t);
      comp.knee.setValueAtTime(5, t);
      comp.ratio.setValueAtTime(4, t);
      comp.attack.setValueAtTime(0.003, t);
      comp.release.setValueAtTime(0.25, t);
      const master = _ac.createGain();
      master.gain.setValueAtTime(3.0, t);
      comp.connect(master);
      master.connect(_ac.destination);

      function bell(hz, type, vol, start, dur) {
        const o = _ac.createOscillator(), g = _ac.createGain();
        o.connect(g); g.connect(comp);
        o.frequency.value = hz; o.type = type;
        g.gain.setValueAtTime(vol, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        o.start(start); o.stop(start + dur);
      }

      // HIT 1 — big church bell chord
      bell(82, "sine", 0.8, t, 3.0);       // low fundamental
      bell(110, "sine", 0.6, t, 2.5);       // A2
      bell(165, "sine", 0.4, t, 2.0);       // overtone
      bell(55, "sine", 0.7, t, 2.0);        // sub bass thud
      bell(82, "triangle", 0.3, t, 1.5);    // attack texture

      // HIT 2 — delayed, deeper
      bell(65, "sine", 0.7, t + 1.0, 3.5);
      bell(98, "sine", 0.5, t + 1.0, 3.0);
      bell(44, "sine", 0.6, t + 1.0, 2.5);
    };
    if (_ac.state === "suspended") { _ac.resume().then(play); } else { play(); }
  } catch (e) {}
}

// ── SVG Animals ──────────────────────────────────────────────────────────────
function Kylling({ c }) {
  return (<svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
    <ellipse cx="42" cy="46" rx="17" ry="14" fill={c}/>
    <circle cx="30" cy="30" r="10" fill={c}/>
    <polygon points="20,30 13,33 20,36" fill="#EF9F27"/>
    <circle cx="27" cy="28" r="2.5" fill="white"/><circle cx="27.5" cy="27.5" r="1.2" fill="#222"/>
    <path d="M55,40 Q64,33 60,46" fill={c} opacity="0.85"/>
    <line x1="34" y1="58" x2="31" y2="72" stroke="#EF9F27" strokeWidth="3" strokeLinecap="round"/>
    <line x1="46" y1="58" x2="49" y2="72" stroke="#EF9F27" strokeWidth="3" strokeLinecap="round"/>
    <path d="M30,20 Q32,10 34,20" fill="#E24B4A"/>
  </svg>);
}
function Fisk({ c }) {
  return (<svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
    <ellipse cx="36" cy="40" rx="22" ry="13" fill={c}/>
    <polygon points="58,40 72,26 72,54" fill={c}/>
    <circle cx="22" cy="37" r="3" fill="white"/><circle cx="22.5" cy="36.5" r="1.5" fill="#222"/>
    <path d="M30,30 Q36,27 42,30" stroke="white" strokeWidth="1" fill="none" opacity="0.4"/>
    <path d="M30,35 Q36,32 42,35" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
  </svg>);
}
function Gris({ c }) {
  return (<svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
    <ellipse cx="42" cy="42" rx="20" ry="16" fill={c}/>
    <circle cx="22" cy="36" r="9" fill={c}/>
    <ellipse cx="22" cy="38" rx="5" ry="3.5" fill="#993556"/>
    <circle cx="19" cy="37" r="1.2" fill="#333"/><circle cx="25" cy="37" r="1.2" fill="#333"/>
    <circle cx="17" cy="30" r="2" fill="white"/><circle cx="17.3" cy="29.5" r="1" fill="#222"/>
    <ellipse cx="14" cy="28" rx="4" ry="5" fill={c} transform="rotate(-20,14,28)"/>
    <ellipse cx="28" cy="28" rx="4" ry="5" fill={c} transform="rotate(20,28,28)"/>
    <path d="M60,36 Q66,30 64,42 Q62,48 60,44" fill={c}/>
    <line x1="30" y1="56" x2="28" y2="68" stroke={c} strokeWidth="4" strokeLinecap="round"/>
    <line x1="42" y1="57" x2="42" y2="69" stroke={c} strokeWidth="4" strokeLinecap="round"/>
    <line x1="54" y1="56" x2="56" y2="68" stroke={c} strokeWidth="4" strokeLinecap="round"/>
  </svg>);
}
function Sau({ c }) {
  return (<svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
    <circle cx="40" cy="38" r="12" fill={c}/>
    <circle cx="30" cy="32" r="9" fill={c}/><circle cx="50" cy="32" r="9" fill={c}/>
    <circle cx="34" cy="44" r="8" fill={c}/><circle cx="46" cy="44" r="8" fill={c}/>
    <rect x="16" y="34" width="12" height="10" rx="4" fill="#633806"/>
    <circle cx="20" cy="37" r="2" fill="white"/><circle cx="20.4" cy="36.6" r="1" fill="#222"/>
    <line x1="32" y1="52" x2="30" y2="66" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="48" y1="52" x2="50" y2="66" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>);
}
function Storfe({ c }) {
  return (<svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
    <ellipse cx="44" cy="42" rx="22" ry="16" fill={c}/>
    <rect x="14" y="30" width="16" height="14" rx="5" fill={c}/>
    <ellipse cx="22" cy="40" rx="6" ry="3.5" fill="#D4537E" opacity="0.7"/>
    <circle cx="17" cy="33" r="2" fill="white"/><circle cx="17.4" cy="32.6" r="1" fill="#222"/>
    <path d="M12,26 Q7,18 12,22" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M30,26 Q35,18 30,22" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round"/>
    <ellipse cx="10" cy="28" rx="4" ry="3" fill={c}/>
    <ellipse cx="32" cy="28" rx="4" ry="3" fill={c}/>
    <line x1="30" y1="56" x2="28" y2="70" stroke={c} strokeWidth="4" strokeLinecap="round"/>
    <line x1="44" y1="57" x2="44" y2="71" stroke={c} strokeWidth="4" strokeLinecap="round"/>
    <line x1="56" y1="56" x2="58" y2="70" stroke={c} strokeWidth="4" strokeLinecap="round"/>
  </svg>);
}
const SVG_MAP = { kylling: Kylling, fisk: Fisk, gris: Gris, sau: Sau, storfe: Storfe };

function CrossMark() {
  return (<svg viewBox="0 0 40 40" style={{ width: 32, height: 32 }}>
    <line x1="8" y1="8" x2="32" y2="32" stroke="#E24B4A" strokeWidth="5" strokeLinecap="round"/>
    <line x1="32" y1="8" x2="8" y2="32" stroke="#E24B4A" strokeWidth="5" strokeLinecap="round"/>
  </svg>);
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DyrDorForDeg() {
  const [gender, setGender] = useState("mann");
  const [appetite, setAppetite] = useState("normal");
  const [myAge, setMyAge] = useState(30);
  const [sliderAge, setSliderAge] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [flashes, setFlashes] = useState({});
  const prevCounts = useRef({});
  const rafRef = useRef(null);
  const lastTick = useRef(0);
  const humanDied = useRef(false);

  const gData = GENDERS.find(g => g.id === gender);
  const aData = APPETITES.find(a => a.id === appetite);
  const deathAge = gData.deathAge;
  const yearsLeft = Math.max(0, deathAge - myAge);

  // Detect human death
  useEffect(() => {
    if (sliderAge >= deathAge && !humanDied.current) {
      humanDied.current = true;
      humanDeathBell();
    } else if (sliderAge < deathAge) {
      humanDied.current = false;
    }
  }, [sliderAge, deathAge]);

  // Stats at current slider position
  const stats = useMemo(() => {
    return ANIMALS.map(a => {
      const kgNow = cumulativeKg(a, gData, aData, sliderAge);
      const kgAtDeath = cumulativeKg(a, gData, aData, deathAge);
      const countNow = Math.floor(kgNow / a.kgPer);
      const countAtDeath = Math.floor(kgAtDeath / a.kgPer);
      const progress = (kgNow % a.kgPer) / a.kgPer;
      return { ...a, kgNow, kgAtDeath, countNow, countAtDeath, progress };
    });
  }, [sliderAge, gender, appetite, deathAge]);

  const totalNow = stats.reduce((s, a) => s + a.countNow, 0);
  const totalAtDeath = stats.reduce((s, a) => s + a.countAtDeath, 0);
  const totalKg = stats.reduce((s, a) => s + a.kgNow, 0);
  const alreadyEaten = useMemo(() => {
    return ANIMALS.map(a => ({
      ...a,
      count: Math.floor(cumulativeKg(a, gData, aData, myAge) / a.kgPer)
    }));
  }, [myAge, gender, appetite]);
  const alreadyTotal = alreadyEaten.reduce((s, a) => s + a.count, 0);

  // Detect new deaths for sound
  useEffect(() => {
    stats.forEach(s => {
      const prev = prevCounts.current[s.id] || 0;
      if (s.countNow > prev && prev !== undefined) {
        deathChime(s);
        setFlashes(f => ({ ...f, [s.id]: Date.now() }));
        setTimeout(() => setFlashes(f => { const n = { ...f }; delete n[s.id]; return n; }), 700);
      }
      prevCounts.current[s.id] = s.countNow;
    });
  }, [stats]);

  useEffect(() => {
    prevCounts.current = {};
    stats.forEach(s => { prevCounts.current[s.id] = s.countNow; });
  }, [gender, appetite, myAge]);

  // Auto-play
  const tick = useCallback((ts) => {
    if (!lastTick.current) lastTick.current = ts;
    const dt = ts - lastTick.current;
    lastTick.current = ts;
    const speed = Math.max(1, deathAge / 30); // traverse full life in ~30 secs
    setSliderAge(a => {
      const next = a + (dt / 1000) * speed;
      if (next >= deathAge) {
        setPlaying(false);
        if (!humanDied.current) { humanDied.current = true; setTimeout(humanDeathBell, 50); }
        return deathAge;
      }
      return next;
    });
    rafRef.current = requestAnimationFrame(tick);
  }, [deathAge]);

  useEffect(() => {
    if (playing) { lastTick.current = 0; rafRef.current = requestAnimationFrame(tick); }
    else if (rafRef.current) cancelAnimationFrame(rafRef.current);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, tick]);

  const Toggle = ({ items, value, onChange, wide }) => (
    <div style={{ display: "flex", gap: 2, background: "#1a1a1a", borderRadius: 10, padding: 2, ...(wide ? { width: "100%" } : {}) }}>
      {items.map(it => (
        <button key={it.id} onClick={() => { onChange(it.id); _ac && _ac.resume?.(); }}
          style={{ flex: wide ? 1 : "0 0 auto", padding: "8px 14px", fontSize: 13, fontWeight: 500,
            border: "none", borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
            background: value === it.id ? "#333" : "transparent",
            color: value === it.id ? "#fff" : "#888" }}>
          {it.label}
        </button>
      ))}
    </div>
  );

  const pctLife = deathAge > 0 ? Math.round((sliderAge / deathAge) * 100) : 0;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#111", color: "#eee",
      minHeight: "100vh", padding: "20px 16px 40px", maxWidth: 520, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.5px", color: "#fff" }}>
          Hvor mange dyr dør før deg?
        </h1>
        <p style={{ fontSize: 13, color: "#777", margin: 0 }}>
          Fra fødsel til gjennomsnittlig dødsalder. Inkludert svinn.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Toggle items={GENDERS} value={gender}
            onChange={v => { setGender(v); const g = GENDERS.find(x=>x.id===v); setSliderAge(myAge); setPlaying(false); }} />
          <Toggle items={APPETITES} value={appetite}
            onChange={v => { setAppetite(v); setSliderAge(myAge); setPlaying(false); }} />
        </div>

        {/* Age input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#1a1a1a",
          borderRadius: 10, padding: "8px 14px" }}>
          <span style={{ fontSize: 13, color: "#777", whiteSpace: "nowrap" }}>Din alder</span>
          <input type="range" min={0} max={Math.min(deathAge, 95)} step={1} value={myAge}
            onChange={e => { const v = Number(e.target.value); setMyAge(v); setSliderAge(v); setPlaying(false); }}
            style={{ flex: 1, height: 6, appearance: "none", background: "#2a2a2a",
              borderRadius: 3, outline: "none", cursor: "pointer", accentColor: "#85B7EB" }} />
          <span style={{ fontSize: 18, fontWeight: 600, minWidth: 32, textAlign: "right" }}>{myAge}</span>
        </div>
      </div>

      {/* Key stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 1 }}>Døde så langt</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#E24B4A" }}>{totalNow}</div>
          <div style={{ fontSize: 11, color: "#555" }}>0–{Math.floor(sliderAge)} år</div>
        </div>
        <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 1 }}>Gjenstår</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#999" }}>{Math.max(0, totalAtDeath - totalNow)}</div>
          <div style={{ fontSize: 11, color: "#555" }}>{Math.floor(sliderAge)}–{deathAge} år</div>
        </div>
        <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 1 }}>Totalt i livet</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>{totalAtDeath}</div>
          <div style={{ fontSize: 11, color: "#555" }}>0–{deathAge} år</div>
        </div>
      </div>

      {/* Animal cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {stats.map(a => {
          const Icon = SVG_MAP[a.id];
          const isFlashing = flashes[a.id];
          const alreadyCount = alreadyEaten.find(x => x.id === a.id)?.count || 0;
          const remaining = a.countAtDeath - alreadyCount;
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12,
              background: isFlashing ? "rgba(226,75,74,0.15)" : "#1a1a1a",
              borderRadius: 14, padding: "10px 14px",
              border: isFlashing ? "1px solid rgba(226,75,74,0.4)" : "1px solid transparent",
              transition: "all 0.3s ease" }}>
              <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
                <svg viewBox="0 0 60 60" style={{ position: "absolute", inset: -2, width: 60, height: 60 }}>
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#2a2a2a" strokeWidth="3"/>
                  <circle cx="30" cy="30" r="26" fill="none" stroke={a.color} strokeWidth="3"
                    strokeDasharray={163.4} strokeDashoffset={163.4 * (1 - a.progress)}
                    transform="rotate(-90 30 30)" style={{ transition: "stroke-dashoffset 0.15s" }}/>
                </svg>
                <div style={{ width: 44, height: 44, margin: "6px",
                  opacity: isFlashing ? 0.3 : 1, transition: "opacity 0.3s",
                  filter: isFlashing ? "grayscale(1)" : "none" }}>
                  <Icon c={a.color} />
                </div>
                {isFlashing && (
                  <div style={{ position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center", animation: "popIn 0.3s ease" }}>
                    <CrossMark />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#ddd" }}>{a.name}</span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#E24B4A" }}>{a.countNow}</span>
                    <span style={{ fontSize: 12, color: "#555", marginLeft: 4 }}>/ {a.countAtDeath}</span>
                  </div>
                </div>
                <div style={{ height: 5, background: "#2a2a2a", borderRadius: 3, margin: "5px 0", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3,
                    background: a.color,
                    width: `${(a.countNow / Math.max(a.countAtDeath, 1)) * 100}%`,
                    transition: "width 0.15s" }}/>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#666" }}>{Math.round(a.kgNow)} kg så langt</span>
                  <span style={{ color: "#555" }}>{Math.round(a.kgAtDeath)} kg totalt</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Life timeline */}
      <div style={{ background: "#1a1a1a", borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: "#777" }}>Fødsel</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {Math.floor(sliderAge)} år
            {sliderAge >= deathAge && <span style={{ color: "#E24B4A" }}> ✝</span>}
          </span>
          <span style={{ fontSize: 12, color: "#777" }}>{deathAge} år</span>
        </div>

        {/* Life bar with markers */}
        <div style={{ position: "relative", height: 28, marginBottom: 6 }}>
          <div style={{ position: "absolute", top: 10, left: 0, right: 0, height: 8,
            background: "#2a2a2a", borderRadius: 4 }}/>
          {/* Lived portion */}
          <div style={{ position: "absolute", top: 10, left: 0, height: 8, borderRadius: 4,
            background: "#555", width: `${(myAge / deathAge) * 100}%` }}/>
          {/* Playing portion */}
          <div style={{ position: "absolute", top: 10, left: 0, height: 8, borderRadius: 4,
            background: "#E24B4A", width: `${Math.min(100, (sliderAge / deathAge) * 100)}%`,
            transition: "width 0.1s" }}/>
          {/* Current age marker */}
          <div style={{ position: "absolute", top: 3, left: `${(myAge / deathAge) * 100}%`,
            transform: "translateX(-50%)", fontSize: 9, color: "#85B7EB", fontWeight: 600,
            whiteSpace: "nowrap" }}>▼ nå</div>
        </div>

        <input type="range" min={0} max={deathAge} step={0.1}
          value={Math.min(sliderAge, deathAge)}
          onChange={e => { setSliderAge(Number(e.target.value)); setPlaying(false); }}
          style={{ width: "100%", height: 8, appearance: "none", background: "transparent",
            borderRadius: 4, outline: "none", cursor: "pointer", accentColor: "#E24B4A",
            marginTop: 4 }} />

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
          <button onClick={() => { setSliderAge(myAge); setPlaying(false); humanDied.current = false; }}
            style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500, border: "none",
              borderRadius: 8, cursor: "pointer", background: "#222", color: "#999" }}>
            ↺ Fra nå
          </button>
          <button onClick={() => {
              if (sliderAge >= deathAge) { setSliderAge(myAge); humanDied.current = false; }
              setPlaying(p => !p);
              if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
              _ac.resume?.();
              // Silent ping to prime audio — keeps context alive
              ping(1, "sine", 0.01);
            }}
            style={{ padding: "9px 24px", fontSize: 14, fontWeight: 600, border: "none",
              borderRadius: 10, cursor: "pointer", letterSpacing: "0.5px",
              background: playing ? "#E24B4A" : "#333", color: "#fff", transition: "all 0.2s" }}>
            {playing ? "⏸  Pause" : sliderAge >= deathAge ? "↻  Start på nytt" : "▶  Spill av livet"}
          </button>
          <button onClick={() => { setSliderAge(0); setPlaying(false); humanDied.current = false; }}
            style={{ padding: "9px 18px", fontSize: 13, fontWeight: 500, border: "none",
              borderRadius: 8, cursor: "pointer", background: "#222", color: "#999" }}>
            ↺ Fra 0
          </button>
        </div>
      </div>

      {/* Human figure */}
      {(() => {
        const lifePct = Math.min(sliderAge / deathAge, 1);
        const isDying = lifePct > 0.92;
        const isDead = sliderAge >= deathAge;
        const tilt = isDead ? 90 : isDying ? (lifePct - 0.92) / 0.08 * 90 : 0;
        const fade = isDead ? 0.25 : isDying ? 1 - (lifePct - 0.92) / 0.08 * 0.75 : 1;
        const heartRate = isDead ? 0 : isDying ? 0.3 + (1 - (lifePct - 0.92) / 0.08) * 0.7 : 1;
        const skinColor = gender === "kvinne" ? "#e8b89d" : "#d4a07a";
        const hairColor = sliderAge > 55 ? "#bbb" : sliderAge > 40 ? "#8a7a6a" : (gender === "kvinne" ? "#5a3520" : "#3a2a1a");
        const clothColor = gender === "kvinne" ? "#7F77DD" : "#378ADD";

        return (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 120, height: 200, opacity: fade,
              transform: `rotate(${tilt}deg)`, transformOrigin: "50% 90%",
              transition: "transform 1.2s ease-in, opacity 1s" }}>
              <svg viewBox="0 0 120 200" style={{ width: "100%", height: "100%" }}>
                {/* Head */}
                <circle cx="60" cy="32" r="20" fill={skinColor}/>
                {/* Hair */}
                {gender === "kvinne" ? (
                  <path d="M40,28 Q40,10 60,12 Q80,10 80,28 Q78,18 60,16 Q42,18 40,28Z" fill={hairColor}/>
                ) : (
                  <path d="M42,30 Q42,14 60,12 Q78,14 78,30 Q76,20 60,18 Q44,20 42,30Z" fill={hairColor}/>
                )}
                {/* Eyes */}
                {isDead ? (
                  <>
                    <line x1="51" y1="28" x2="57" y2="34" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="57" y1="28" x2="51" y2="34" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="63" y1="28" x2="69" y2="34" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="69" y1="28" x2="63" y2="34" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
                  </>
                ) : (
                  <>
                    <circle cx="52" cy="31" r="2.5" fill="white"/><circle cx="52.3" cy="30.5" r="1.3" fill="#333"/>
                    <circle cx="68" cy="31" r="2.5" fill="white"/><circle cx="68.3" cy="30.5" r="1.3" fill="#333"/>
                  </>
                )}
                {/* Mouth */}
                {isDead ? (
                  <line x1="54" y1="42" x2="66" y2="42" stroke="#999" strokeWidth="1.2"/>
                ) : (
                  <path d="M54,40 Q60,46 66,40" stroke="#c96" strokeWidth="1.2" fill="none"/>
                )}
                {/* Body / torso */}
                <rect x="44" y="52" width="32" height="44" rx="6" fill={clothColor}/>
                {/* Arms */}
                <rect x="26" y="56" width="18" height="10" rx="5" fill={clothColor}/>
                <rect x="76" y="56" width="18" height="10" rx="5" fill={clothColor}/>
                <circle cx="28" cy="61" r="5" fill={skinColor}/>
                <circle cx="92" cy="61" r="5" fill={skinColor}/>
                {/* Legs */}
                <rect x="46" y="96" width="12" height="42" rx="5" fill="#444"/>
                <rect x="62" y="96" width="12" height="42" rx="5" fill="#444"/>
                {/* Feet */}
                <ellipse cx="52" cy="140" rx="8" ry="5" fill="#555"/>
                <ellipse cx="68" cy="140" rx="8" ry="5" fill="#555"/>
                {/* Heart pulse */}
                {!isDead && heartRate > 0 && (
                  <circle cx="56" cy="68" r={3} fill="#E24B4A" opacity={heartRate * 0.7}>
                    <animate attributeName="r" values="2;4;2" dur={`${0.4 + (1 - heartRate) * 1.2}s`} repeatCount="indefinite"/>
                    <animate attributeName="opacity" values={`${heartRate*0.4};${heartRate*0.8};${heartRate*0.4}`} dur={`${0.4 + (1 - heartRate) * 1.2}s`} repeatCount="indefinite"/>
                  </circle>
                )}
              </svg>
            </div>
            {isDead && (
              <div style={{ textAlign: "center", animation: "fadeUp 1s ease", marginTop: -8 }}>
                <div style={{ fontSize: 12, color: "#777", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  {gender === "mann" ? "Mann" : "Kvinne"}, {deathAge} år
                </div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  {totalAtDeath} dyr døde for deg
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Summary at end of life */}
      {sliderAge >= deathAge - 1 && (
        <div style={{ marginTop: 16, background: "#1a1a1a", borderRadius: 14,
          padding: "20px 18px", textAlign: "center",
          border: "1px solid rgba(226,75,74,0.25)" }}>
          <div style={{ fontSize: 11, color: "#777", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
            I løpet av {deathAge} år dør
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: "#E24B4A", lineHeight: 1 }}>
            {totalAtDeath}
          </div>
          <div style={{ fontSize: 14, color: "#999", marginTop: 2, marginBottom: 10 }}>dyr for deg</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {stats.map(s => (
              <span key={s.id} style={{ fontSize: 12, color: "#777", background: "#222",
                padding: "4px 10px", borderRadius: 6 }}>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.countAtDeath}</span> {s.name.toLowerCase()}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 12 }}>
            Totalt {Math.round(stats.reduce((s, a) => s + a.kgAtDeath, 0))} kg kjøtt og fisk produsert
          </div>
        </div>
      )}

      <p style={{ fontSize: 10, color: "#444", textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
        Kilder: Animalia 2024-tall, Norkost 4, Sjømatrådet, SSB (forventet levealder 2024:
        menn 81,6 år, kvinner 84,8 år). Svinn (~9 %) er inkludert — dyret dør uansett.
        Forbruk aldersjustert (barn/eldre spiser mindre).
      </p>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: #E24B4A;
          border: 3px solid #111; cursor: pointer;
          box-shadow: 0 0 8px rgba(226,75,74,0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px; height: 20px;
          border-radius: 50%; background: #E24B4A;
          border: 3px solid #111; cursor: pointer;
        }
      `}</style>
    </div>
  );
}
