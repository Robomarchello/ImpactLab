import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Asteroid Impact Simulator — Damage Overlay Edition
 * - Real Earth photo (editable URL)
 * - Click on Earth to set impact point
 * - Damage heatmap on Earth (Destroyed/Heavy/Light + Thermal/Crater)
 * - Seismic & Tsunami summaries (order‑of‑magnitude)
 */

// ---- Utils ---------------------------------------------------------------
const fmtSI = (x) => {
  if (!isFinite(x)) return "—";
  const units = [
    { v: 1e24, s: "Y" }, { v: 1e21, s: "Z" }, { v: 1e18, s: "E" },
    { v: 1e15, s: "P" }, { v: 1e12, s: "T" }, { v: 1e9, s: "G" },
    { v: 1e6, s: "M" }, { v: 1e3, s: "k" }
  ];
  for (const u of units) if (Math.abs(x) >= u.v) return `${(x / u.v).toFixed(2)} ${u.s}`;
  return x.toFixed(2);
};
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const lerp = (a, b, t) => a + (b - a) * t;

// Rough crater scaling
function estimateCraterDiameterKm(diameter_m, velocity_kms, angle_deg) {
  const d = Math.max(1, diameter_m);
  const v = Math.max(1, velocity_kms);
  const ang = Math.max(5, Math.min(90, angle_deg)) * Math.PI / 180;
  const C = 0.019; // tuned constant
  const km = (C * Math.pow(d, 0.78) * Math.pow(v, 0.44) * Math.pow(Math.sin(ang), 0.3)) / 1000;
  return clamp(km, 0, 3500);
}

// Simplified damage scaling using nuclear-blast analogs (order-of-magnitude)
function computeDamage(yieldMt, target) {
  const Y = Math.max(0.001, yieldMt);
  const fireballKm = 1.2 * Math.pow(Y, 0.4);        // Fireball radius
  const r20psiKm = 3.2 * Math.cbrt(Y);              // Severe/"destroyed"
  const r5psiKm  = 7.4 * Math.cbrt(Y);              // Heavy damage
  const r1psiKm  = 12.0 * Math.cbrt(Y);             // Light damage
  const thermalKm = 13 * Math.pow(Y, 0.41);         // 3rd-degree burns radius
  const E = Y * 4.184e15;                           // J
  const magnitude = 0.67 * Math.log10(E) - 5.87;    // quake-equivalent (very rough)
  const tsunamiM = target === 'ocean' ? 45 * Math.pow(Y / 1000, 0.28) : 0; // near-field wave ht
  const tsunamiQual = target === 'ocean' ? (tsunamiM >= 30 ? 'extreme' : tsunamiM >= 10 ? 'high' : tsunamiM >= 3 ? 'moderate' : 'low') : '—';
  return { fireballKm, r20psiKm, r5psiKm, r1psiKm, thermalKm, magnitude, tsunamiM, tsunamiQual };
}

const ASTEROIDS = {
  apophis: { label: "Apophis (99942)", diameter_m: 370, density: 3000, velocity_kms: 7.4, angle_deg: 45 },
  bennu: { label: "Bennu (101955)", diameter_m: 490, density: 1190, velocity_kms: 12.8, angle_deg: 45 },
  chelyabinsk: { label: "Chelyabinsk (2013)", diameter_m: 17, density: 3300, velocity_kms: 19.0, angle_deg: 20 },
};

function computeMetrics({ diameter_m, density, velocity_kms, angle_deg, target }) {
  const r = diameter_m / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(r, 3);
  const mass = volume * density; // kg
  const v = velocity_kms * 1000; // m/s
  const energy = 0.5 * mass * v * v; // J
  const yieldMt = energy / 4.184e15; // TNT equivalent
  const craterKm = estimateCraterDiameterKm(diameter_m, velocity_kms, angle_deg);
  const dmg = computeDamage(yieldMt, target);
  return { mass, energy, yieldMt, craterKm, ...dmg };
}

// ---- SVG Scene (with damage overlays & click-to-place) --------------------
function SvgScene({ runKey, onImpact, epic, textureUrl, damagePx, impactPos, onPickImpact }) {
  const svgRef = useRef(null);
  const [t, setT] = useState(0); // 0..1 progress for asteroid flight
  const raf = useRef();

  const EARTH = { cx: 300, cy: 200, r: 110 };

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    setT(0);
    const start = performance.now();
    const dur = 3800; // ms
    const loop = (now) => {
      const p = clamp((now - start) / dur, 0, 1);
      setT(p);
      if (p < 1) raf.current = requestAnimationFrame(loop); else onImpact?.();
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [runKey]);

  // Trajectory: from left toward selected impact point
  const sx = 40, sy = 120;
  const ix = impactPos?.x ?? EARTH.cx;
  const iy = impactPos?.y ?? EARTH.cy;
  const qx = (sx + ix) / 2; // simple bezier control
  const qy = Math.min(sy, iy) - 60;
  const x = lerp(lerp(sx, qx, t), lerp(qx, ix, t), t);
  const y = lerp(lerp(sy, qy, t), lerp(qy, iy, t), t);

  // Click picking inside Earth disk
  const handleClick = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (600 / rect.width);
    const py = (e.clientY - rect.top) * (400 / rect.height);
    const dx = px - EARTH.cx, dy = py - EARTH.cy;
    const d = Math.hypot(dx, dy);
    if (d <= EARTH.r) onPickImpact?.({ x: px, y: py });
  };

  // Rays for epic burst
  const rays = Array.from({ length: 22 }).map((_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const L = 120 + (i % 5) * 18;
    return { x2: ix + Math.cos(a) * L, y2: iy + Math.sin(a) * L };
  });

  return (
    <svg ref={svgRef} viewBox="0 0 600 400" className="w-full h-full" onClick={handleClick}>
      <defs>
        <radialGradient id="space" cx="50%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#0f1b2e"/>
          <stop offset="100%" stopColor="#080e1b"/>
        </radialGradient>
        <radialGradient id="flash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7cc"/>
          <stop offset="40%" stopColor="#ffd166"/>
          <stop offset="100%" stopColor="#ff7b00" stopOpacity="0"/>
        </radialGradient>
        <filter id="atmo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <clipPath id="earthClip">
          <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} />
        </clipPath>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
        </filter>
        {/* Heat gradients */}
        <radialGradient id="heat" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.55"/>
          <stop offset="60%" stopColor="#ff8800" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#ffdd00" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="600" height="400" fill="url(#space)"/>

      {/* Stars */}
      {Array.from({ length: 160 }).map((_, i) => (
        <circle key={i} cx={(i*53)%600} cy={(i*97)%400} r={(i%3)+0.4} fill="#bcdcff" opacity="0.45" />
      ))}

      {/* Earth photo disc */}
      <g>
        <image
          href={textureUrl}
          x={EARTH.cx - 125}
          y={EARTH.cy - 125}
          width={250}
          height={250}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#earthClip)"
          filter="url(#shadow)"
        />
        <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r + 8} fill="#68e1fd" opacity=".18" filter="url(#atmo)"/>
      </g>

      {/* Damage overlays (clipped to Earth) */}
      <g clipPath="url(#earthClip)">
        {/* Thermal gradient */}
        {damagePx.thermal > 0 && (
          <circle cx={ix} cy={iy} r={damagePx.thermal} fill="url(#heat)" />
        )}
        {/* Destroyed area (20 psi) */}
        {damagePx.r20 > 0 && (
          <circle cx={ix} cy={iy} r={damagePx.r20} fill="#ef4444" opacity="0.25" />
        )}
        {/* Heavy damage ring (5 psi) */}
        {damagePx.r5 > 0 && (
          <circle cx={ix} cy={iy} r={damagePx.r5} fill="#f59e0b" opacity="0.18" />
        )}
        {/* Light damage ring (1 psi) */}
        {damagePx.r1 > 0 && (
          <circle cx={ix} cy={iy} r={damagePx.r1} fill="#fde68a" opacity="0.12" />
        )}
        {/* Crater */}
        {damagePx.crater > 0 && (
          <circle cx={ix} cy={iy} r={damagePx.crater} fill="#fb923c" stroke="#fdba74" strokeWidth="2" opacity="0.9" />
        )}
      </g>

      {/* Trajectory */}
      <path d={`M ${sx} ${sy} Q ${qx} ${qy} ${ix} ${iy}`} stroke="#75e3ff" strokeDasharray="6 6" opacity=".7" fill="none"/>

      {/* Asteroid */}
      <g>
        <circle cx={x} cy={y} r="7" fill="#ffb703" stroke="#ffd166"/>
      </g>

      {/* Epic collision visuals */}
      {epic && (
        <g>
          <circle cx={ix} cy={iy} r="1" fill="url(#flash)" className="origin-center animate-[flashExpand_1.2s_ease-out_forwards]"/>
          {rays.map((p, i) => (
            <line key={i} x1={ix} y1={iy} x2={p.x2} y2={p.y2} stroke="#ffd166" strokeWidth="2" className="animate-[rayOut_900ms_ease-out_forwards]" opacity=".9" />
          ))}
          <circle cx={ix} cy={iy} r="1" className="origin-center animate-[ring_1.0s_ease-out_forwards]" stroke="#a5b4fc" strokeWidth="3" fill="none"/>
          <circle cx={ix} cy={iy} r="1" className="origin-center animate-[ring_1.5s_ease-out_forwards]" stroke="#93c5fd" strokeWidth="2" fill="none"/>
          <circle cx={ix} cy={iy} r="1" className="origin-center animate-[ring_2.2s_ease-out_forwards]" stroke="#7dd3fc" strokeWidth="1.5" fill="none"/>
          <rect x="0" y="0" width="600" height="400" fill="#fff9" className="animate-[screenFlash_700ms_ease-out_forwards]" />
        </g>
      )}

      {/* Legend */}
      <g transform="translate(12,12)">
        <rect x="0" y="0" width="170" height="78" rx="10" fill="#0008" />
        <g fontSize="10" fill="#d1d5db">
          <circle cx="12" cy="16" r="6" fill="#ef4444" opacity="0.45" />
          <text x="24" y="19">Destroyed (~20 psi)</text>
          <circle cx="12" cy="34" r="6" fill="#f59e0b" opacity="0.35" />
          <text x="24" y="37">Heavy (5 psi)</text>
          <circle cx="12" cy="52" r="6" fill="#fde68a" opacity="0.3" />
          <text x="24" y="55">Light (1 psi)</text>
          <rect x="6" y="62" width="12" height="6" fill="#ff6b6b" opacity="0.5" />
          <text x="24" y="67">Thermal</text>
        </g>
      </g>

      <style>
        {`
        @keyframes flashExpand{0%{r:8;opacity:.95} 100%{r:180;opacity:0}}
        @keyframes ring{0%{r:20;opacity:.9} 100%{r:300;opacity:0}}
        @keyframes rayOut{0%{stroke-opacity:.95} 100%{stroke-opacity:0;transform:scale(1.1)}}
        @keyframes screenFlash{0%{opacity:.8} 100%{opacity:0}}
        `}
      </style>
    </svg>
  );
}

function Pill({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-[12px] font-semibold tracking-wide text-cyan-300">
      {children}
    </div>
  );
}

function NumberField({ label, value, setValue, suffix }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="relative mt-1">
        <input
          className="w-full h-10 rounded-xl bg-slate-900/60 border border-white/10 px-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded-md">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function SelectField({ label, value, setValue, options }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="relative mt-1">
        <select
          className="w-full h-10 rounded-xl bg-slate-900/60 border border-white/10 px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400 appearance-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} className="text-black">{o.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
      </div>
    </label>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-xl shadow-black/10">
      <div className="text-[13px] font-semibold text-slate-200 tracking-wide">{title}</div>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

function Step({ n, active, children }) {
  return (
    <div className={`px-3 py-2 rounded-full border text-[12px] font-semibold ${
      active
        ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
        : "border-white/10 text-slate-400"
    }`}>
      {n}. {children}
    </div>
  );
}

function Tab({ item, tab, setTab, children }) {
  const active = tab === item;
  return (
    <button
      onClick={() => setTab(item)}
      className={`px-3 py-1.5 rounded-lg border ${
        active
          ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
          : "border-white/10 text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState("map");
  const [asteroidKey, setAsteroidKey] = useState("apophis");
  const [diameter, setDiameter] = useState(ASTEROIDS.apophis.diameter_m.toString());
  const [density, setDensity] = useState(ASTEROIDS.apophis.density.toString());
  const [velocity, setVelocity] = useState(ASTEROIDS.apophis.velocity_kms.toString());
  const [angle, setAngle] = useState(ASTEROIDS.apophis.angle_deg.toString());
  const [target, setTarget] = useState('land');
  const [textureUrl, setTextureUrl] = useState('https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg');

  const [runKey, setRunKey] = useState(0);
  const [epic, setEpic] = useState(false);
  const [shake, setShake] = useState(false);
  const [impactPos, setImpactPos] = useState({ x: 300, y: 200 });

  // Metrics
  const metrics = useMemo(() => {
    const d = parseFloat(diameter) || 0;
    const rho = parseFloat(density) || 0;
    const v = parseFloat(velocity) || 0;
    const ang = parseFloat(angle) || 45;
    return computeMetrics({ diameter_m: d, density: rho, velocity_kms: v, angle_deg: ang, target });
  }, [diameter, density, velocity, angle, target]);

  const EARTH_R_KM = 6371;
  const EARTH_R_PX = 110; // must match SvgScene
  const pxPerKm = EARTH_R_PX / EARTH_R_KM;

  const damagePx = useMemo(() => ({
    crater: (metrics.craterKm / 2) * pxPerKm,
    r20: metrics.r20psiKm * pxPerKm,
    r5: metrics.r5psiKm * pxPerKm,
    r1: metrics.r1psiKm * pxPerKm,
    thermal: metrics.thermalKm * pxPerKm,
  }), [metrics]);

  // Areas (km²)
  const areaDestroyed = Math.PI * Math.pow(metrics.r20psiKm, 2);
  const areaHeavy = Math.PI * (Math.pow(metrics.r5psiKm, 2) - Math.pow(metrics.r20psiKm, 2));
  const areaLight = Math.PI * (Math.pow(metrics.r1psiKm, 2) - Math.pow(metrics.r5psiKm, 2));

  useEffect(() => {
    const a = ASTEROIDS[asteroidKey];
    if (!a) return;
    setDiameter(String(a.diameter_m));
    setDensity(String(a.density));
    setVelocity(String(a.velocity_kms));
    setAngle(String(a.angle_deg));
  }, [asteroidKey]);

  const onRun = () => {
    setEpic(false);
    setShake(false);
    setRunKey((k) => k + 1);
    setTab("simulate");
  };

  const handleImpact = () => {
    setEpic(true);
    setShake(true);
    setTimeout(() => setShake(false), 600);
    setTimeout(() => setTab("results"), 1800);
  };

  return (
    <div className="min-h-screen text-slate-100 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 backdrop-blur bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <div className="text-xl font-black tracking-tight">Impact<span className="text-cyan-300">Lab</span></div>
            <nav className="hidden sm:flex items-center gap-2 text-sm">
              <Tab item="map" tab={tab} setTab={setTab}>Map</Tab>
              <Tab item="simulate" tab={tab} setTab={setTab}>Simulate</Tab>
              <Tab item="results" tab={tab} setTab={setTab}>Results</Tab>
            </nav>
          </div>
          <button onClick={onRun} className="h-10 rounded-xl px-4 font-semibold bg-gradient-to-r from-cyan-300 to-violet-300 text-slate-900 shadow-lg shadow-cyan-500/20">Run simulation</button>
        </div>
      </div>

      {/* Grid */}
      <div className={`max-w-7xl mx-auto grid lg:grid-cols-[360px_1fr_360px] gap-4 p-4 ${shake ? 'animate-[shake_600ms_linear]' : ''}`}>
        {/* Left: Setup */}
        <Card title="Initial conditions">
          <SelectField label="Preset asteroid" value={asteroidKey} setValue={setAsteroidKey} options={[
            { value:'apophis', label: ASTEROIDS.apophis.label },
            { value:'bennu', label: ASTEROIDS.bennu.label },
            { value:'chelyabinsk', label: ASTEROIDS.chelyabinsk.label },
            { value:'custom', label: 'Custom…' },
          ]} />
          <div className="grid grid-cols-2 gap-3 mt-1">
            <NumberField label="Diameter" value={diameter} setValue={setDiameter} suffix="m" />
            <NumberField label="Density" value={density} setValue={setDensity} suffix="kg/m³" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <NumberField label="Velocity" value={velocity} setValue={setVelocity} suffix="km/s" />
            <NumberField label="Impact angle" value={angle} setValue={setAngle} suffix="°" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <SelectField label="Target" value={target} setValue={setTarget} options={[{ value:'land', label:'Land' }, { value:'ocean', label:'Ocean' }]} />
            <NumberField label="Texture URL (Earth photo)" value={textureUrl} setValue={setTextureUrl} />
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Tip: Click directly on Earth to place the impact point.
          </div>
        </Card>

        {/* Center: SVG canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[radial-gradient(80%_60%_at_50%_30%,#12203a,transparent),#0b1222] min-h-[520px]">
          <SvgScene
            runKey={runKey}
            onImpact={handleImpact}
            epic={epic}
            textureUrl={textureUrl}
            damagePx={damagePx}
            impactPos={impactPos}
            onPickImpact={setImpactPos}
          />
          <div className="absolute top-2 right-2 text-xs bg-black/30 backdrop-blur px-2 py-1 rounded-lg text-slate-300 font-medium">
            {tab === "simulate" ? "Simulating…" : tab === "results" ? "Results ready" : "Click Earth to set impact"}
          </div>
          <div className="absolute bottom-2 left-2 text-[11px] text-slate-400">Run → watch burst → open Results</div>
          <style>{`
            @keyframes shake{0%,100%{transform:translate(0,0)}20%{transform:translate(-4px,3px)}40%{transform:translate(4px,-3px)}60%{transform:translate(-3px,2px)}80%{transform:translate(2px,-2px)}}
          `}</style>
        </div>

        {/* Right: Readout */}
        <Card title="Impact damage estimates">
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">Kinetic energy</div><Pill>{fmtSI(metrics.energy)} J • {(metrics.yieldMt).toFixed(1)} Mt TNT</Pill></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">Crater diameter</div><Pill>{metrics.craterKm.toFixed(2)} km</Pill></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">Fireball radius</div><Pill>{metrics.fireballKm.toFixed(1)} km</Pill></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">20 psi (destroyed)</div><Pill>{metrics.r20psiKm.toFixed(1)} km</Pill></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">5 psi (heavy)</div><Pill>{metrics.r5psiKm.toFixed(1)} km</Pill></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">1 psi (light)</div><Pill>{metrics.r1psiKm.toFixed(1)} km</Pill></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">Thermal burns (3°)</div><Pill>{metrics.thermalKm.toFixed(1)} km</Pill></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">Seismic equivalent</div><Pill>M {metrics.magnitude.toFixed(1)}</Pill></div>
            {target === 'ocean' && (<div className="grid grid-cols-[1fr_auto] items-center gap-2"><div className="text-xs text-slate-400">Tsunami near-field</div><Pill>{metrics.tsunamiM.toFixed(0)} m • {metrics.tsunamiQual}</Pill></div>)}
          </div>
        </Card>

        {/* Stepper */}
        <div className="lg:col-span-3 flex items-center justify-center gap-3 mt-1">
          <Step n={1} active={tab === "map"}>Conditions</Step>
          <Step n={2} active={tab === "simulate"}>Impact</Step>
          <Step n={3} active={tab === "results"}>Aftermath Map</Step>
        </div>

        {tab === "results" && (
          <div className="lg:col-span-3 rounded-2xl border border-white/10 p-4 bg-slate-900/60">
            <div className="text-sm text-slate-300 mb-3 font-semibold">Damage map on Earth</div>
            <div className="grid sm:grid-cols-3 gap-3 text-[12px] text-slate-300">
              <div className="rounded-lg bg-slate-800/50 p-2">Destroyed area (20 psi): <span className="font-semibold text-white">{Math.round(areaDestroyed).toLocaleString()} km²</span></div>
              <div className="rounded-lg bg-slate-800/50 p-2">Heavy damage ring (5→20 psi): <span className="font-semibold text-white">{Math.round(areaHeavy).toLocaleString()} km²</span></div>
              <div className="rounded-lg bg-slate-800/50 p-2">Light damage ring (1→5 psi): <span className="font-semibold text-white">{Math.round(areaLight).toLocaleString()} km²</span></div>
              <div className="rounded-lg bg-slate-800/50 p-2 sm:col-span-3">Seismic: global waves; local shaking comparable to M <span className="font-semibold text-white">{metrics.magnitude.toFixed(1)}</span> earthquake; aftershocks possible.</div>
              {target === 'ocean' && (
                <div className="rounded-lg bg-slate-800/50 p-2 sm:col-span-3">Tsunami (near-field 30–50 km): estimated wave height <span className="font-semibold text-white">{metrics.tsunamiM.toFixed(0)} m</span> (<span className="font-semibold text-white">{metrics.tsunamiQual}</span>). Far‑field propagation depends on bathymetry and coastline shape.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Force native dropdown items to black text */}
      <style>{`select option{ color:#000; }`}</style>
    </div>
  );
}
