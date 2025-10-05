import React, { useEffect, useMemo, useRef, useState } from "react";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

function solveKepler(M, e, tol = 1e-6, maxIt = 30) {
  let m = ((M + Math.PI) % TAU) - Math.PI;
  let E = e < 0.8 ? m : Math.PI;
  for (let i = 0; i < maxIt; i++) {
    const f = E - e * Math.sin(E) - m;
    const fp = 1 - e * Math.cos(E);
    const dE = -f / fp;
    E += dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}

function perifocalPosition(a, e, M) {
  const E = solveKepler(M, e);
  const r = a * (1 - e * Math.cos(E));
  const nu = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(E), Math.cos(E) - e);
  return [r * Math.cos(nu), r * Math.sin(nu), 0];
}

function rotZ(v, ang) {
  const c = Math.cos(ang), s = Math.sin(ang); const [x, y, z] = v; return [c * x - s * y, s * x + c * y, z];
}
function rotX(v, ang) {
  const c = Math.cos(ang), s = Math.sin(ang); const [x, y, z] = v; return [x, c * y - s * z, s * y + c * z];
}

function stateVector3D(a, e, iDeg, omegaDeg, OmegaDeg, M) {
  let r = perifocalPosition(a, e, M);
  r = rotZ(r, omegaDeg * DEG);
  r = rotX(r, iDeg * DEG);
  r = rotZ(r, OmegaDeg * DEG);
  return r;
}

function projectOrthographic([x, y, z], tiltDeg) {
  const t = tiltDeg * DEG;
  const ct = Math.cos(t), st = Math.sin(t);
  const y2 = ct * y - st * z;
  return [x, y2, z];
}

function colorHash(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const r = 100 + (h & 0xff) % 156; const g = 100 + ((h >> 8) & 0xff) % 156; const b = 100 + ((h >> 16) & 0xff) % 156;
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

const bodies = [
  { name: "Mercury", a: 0.3871, e: 0.2056, period: 87.969, color: "#c084fc", i: 7.0, omega: 29.1, Omega: 48.3 },
  { name: "Venus", a: 0.7233, e: 0.0068, period: 224.701, color: "#fbbf24", i: 3.4, omega: 54.9, Omega: 76.7 },
  { name: "Earth", a: 1.0, e: 0.0167, period: 365.256, color: "#22c55e", i: 0.0, omega: 114.2, Omega: -11.3 },
  { name: "Mars", a: 1.5237, e: 0.0934, period: 686.98, color: "#ef4444", i: 1.85, omega: 286.5, Omega: 49.6 },
];

const presetAsteroids = [
  { name: "Apophis", a: 0.922, e: 0.191, period: 323.6, color: "#f97316", i: 3.3, omega: 35, Omega: 250 },
  { name: "Itokawa", a: 1.324, e: 0.28, period: 556.5, color: "#9ca3af", i: 1.6, omega: 120, Omega: 69 },
  { name: "Bennu", a: 1.126, e: 0.203, period: 436.5, color: "#fde047", i: 6.0, omega: -20, Omega: 2 },
  { name: "Ryugu", a: 1.189, e: 0.19, period: 473.9, color: "#60a5fa", i: 5.9, omega: 60, Omega: 251 },
  { name: "Eros", a: 1.458, e: 0.223, period: 643.2, color: "#fb7185", i: 10.8, omega: 15, Omega: 305 },
  { name: "Didymos", a: 1.644, e: 0.38, period: 771.0, color: "#34d399", i: 3.4, omega: 140, Omega: 73 },
  { name: "16 Psyche", a: 2.92, e: 0.14, period: 1825, color: "#22d3ee", i: 3.1, omega: 75, Omega: 150 },
];

const EPOCH = new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime();

function formatDateUTC(ms) {
  const d = new Date(ms);
  return d.toUTCString().replace("GMT", "UTC");
}

export default function SolarSystemCanvas() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(86400);
  const [simTime, setSimTime] = useState(Date.now());
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [highlights, setHighlights] = useState(new Set());
  const [tiltDeg, setTiltDeg] = useState(20);
  const [zoom, setZoom] = useState(150);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [customAsteroids, setCustomAsteroids] = useState([]);
  const [form, setForm] = useState({ name: "Custom", a: 1.2, e: 0.1, period: 500, omega: 0, Omega: 0, i: 0, mass: 1e12, density: 2000 });
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const isPlayingRef = useRef(isPlaying);
  const timeScaleRef = useRef(timeScale);
  const simTimeRef = useRef(simTime);
  const zoomRef = useRef(zoom);
  const offsetRef = useRef(offset);
  const showAsteroidsRef = useRef(showAsteroids);
  const highlightsRef = useRef(highlights);
  const tiltDegRef = useRef(tiltDeg);
  const customAsteroidsRef = useRef(customAsteroids);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { timeScaleRef.current = timeScale; }, [timeScale]);
  useEffect(() => { simTimeRef.current = simTime; }, [simTime]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { showAsteroidsRef.current = showAsteroids; }, [showAsteroids]);
  useEffect(() => { highlightsRef.current = highlights; }, [highlights]);
  useEffect(() => { tiltDegRef.current = tiltDeg; }, [tiltDeg]);
  useEffect(() => { customAsteroidsRef.current = customAsteroids; }, [customAsteroids]);

  const belt = useMemo(() => {
    const N = 4000;
    const pts = [];
    const rand = (seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32)(9);
    for (let i = 0; i < N; i++) {
      let r; for (;;) { r = Math.sqrt(2.2 ** 2 + (3.3 ** 2 - 2.2 ** 2) * rand()); if (!(r > 2.48 && r < 2.54)) break; }
      const ang = rand() * TAU;
      const inc = (rand() - 0.5) * 2 * 0.25; // ~±7.2° in rad (small inclinations)
      const y = r * Math.sin(ang);
      const z = r * Math.cos(ang) * Math.sin(inc);
      const x = r * Math.cos(ang);
      pts.push([x, y, z]);
    }
    return pts;
  }, []);

  const drawRef = useRef(() => {});

  useEffect(() => {
    let raf = 0; let last = performance.now();
    const loop = (t) => { const dt = (t - last) / 1000; last = t; if (isPlayingRef.current) setSimTime((s) => s + dt * 1000 * timeScaleRef.current); drawRef.current(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function draw() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = (canvas.width = canvas.clientWidth * dpr);
    const h = (canvas.height = canvas.clientHeight * dpr);
    ctx.save(); ctx.scale(dpr, dpr);

    const zoom = zoomRef.current; const offset = offsetRef.current; const tilt = tiltDegRef.current;
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, w / dpr, h / dpr);
    const cx = w / dpr / 2 + offset.x; const cy = h / dpr / 2 + offset.y;

    

    ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill();

    if (showAsteroidsRef.current) {
      ctx.fillStyle = "rgba(96,165,250,0.53)";
      for (const p3 of belt) { const [x, y] = projectOrthographic(p3, tilt); ctx.fillRect(cx + x * zoom, cy + y * zoom, 1, 1); }
    }

    const tDays = (simTimeRef.current - EPOCH) / 86400000;

    const drawOrbitIfHighlighted = (obj) => {
      if (!highlightsRef.current.has(obj.name)) return;
      ctx.strokeStyle = obj.color; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let j = 0; j <= 720; j++) {
        const M = (j / 720) * TAU; const r3 = stateVector3D(obj.a, obj.e, obj.i || 0, obj.omega || 0, obj.Omega || 0, M);
        const [X, Y] = projectOrthographic(r3, tilt);
        const sx = cx + X * zoom, sy = cy + Y * zoom; if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    };

    const drawBody = (b, size = 3) => {
      drawOrbitIfHighlighted(b);
      const n = TAU / b.period; const M = n * tDays; const r3 = stateVector3D(b.a, b.e, b.i || 0, b.omega || 0, b.Omega || 0, M);
      const [X, Y, Z] = projectOrthographic(r3, tilt);
      const sx = cx + X * zoom, sy = cy + Y * zoom;
      const trailDays = Math.min(0.8 * b.period, 90); ctx.strokeStyle = `${b.color}55`; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = -trailDays; k <= 0; k += 1) { const Mk = n * (tDays + k); const p3 = stateVector3D(b.a, b.e, b.i || 0, b.omega || 0, b.Omega || 0, Mk); const [tx, ty] = projectOrthographic(p3, tilt); const px = cx + tx * zoom, py = cy + ty * zoom; if (k === -trailDays) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
      ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(sx, sy, size, 0, TAU); ctx.fill();
      ctx.fillStyle = "#e5e7eb"; ctx.font = "11px Inter, ui-sans-serif"; ctx.fillText(b.name, sx + 6, sy - 6);
    };

    bodies.forEach((b, i) => drawBody(b, i === 2 ? 3.8 : 3));

    const allAsteroids = [...presetAsteroids, ...customAsteroidsRef.current];
    allAsteroids.forEach((a) => {
      drawOrbitIfHighlighted(a);
      const n = TAU / a.period; const M = n * tDays; const r3 = stateVector3D(a.a, a.e, a.i || 0, a.omega || 0, a.Omega || 0, M);
      const [X, Y] = projectOrthographic(r3, tilt);
      let radiusPx = 2.4; const mass = a.mass || 0; const density = a.density || 0;
      if (mass > 0 && density > 0) { const volume = mass / density; const r = Math.cbrt((3 * volume) / (4 * Math.PI)); radiusPx = Math.max(2, Math.min(8, (r / 1000) ** 0.4)); }
      ctx.fillStyle = a.color; ctx.beginPath(); ctx.arc(cx + X * zoom, cy + Y * zoom, radiusPx, 0, TAU); ctx.fill();
      ctx.fillStyle = "#9ca3af"; ctx.font = "10px Inter, ui-sans-serif"; ctx.fillText(a.name, cx + X * zoom + 5, cy + Y * zoom + 10);
    });

    ctx.fillStyle = "#cbd5e1"; ctx.font = "14px Inter, ui-sans-serif"; ctx.fillText("Inner Solar System — pseudo‑3D", 12, 24); ctx.font = "12px Inter, ui-sans-serif"; ctx.fillText(formatDateUTC(simTimeRef.current), 12, 44);
    ctx.restore();
  }

  useEffect(() => { drawRef.current = draw; });

  function onWheel(e) { e.preventDefault(); const factor = e.deltaY < 0 ? 1.1 : 0.9; setZoom((z) => Math.min(700, Math.max(40, z * factor))); }
  function onMouseDown(e) { dragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; }
  function onMouseMove(e) { if (!dragging.current) return; const dx = e.clientX - lastMouse.current.x; const dy = e.clientY - lastMouse.current.y; lastMouse.current = { x: e.clientX, y: e.clientY }; setOffset((o) => ({ x: o.x + dx, y: o.y + dy })); }
  function onMouseUp() { dragging.current = false; }

  const speeds = [3600, 43200, 86400, 604800, 2592000, 31557600];

  function addCustomAsteroid() {
    const name = String(form.name || "Custom").trim();
    const a = Math.max(0.2, Number(form.a));
    const e = Math.min(0.95, Math.max(0, Number(form.e)));
    const period = Math.max(10, Number(form.period));
    const omega = Number(form.omega) || 0;
    const Omega = Number(form.Omega) || 0;
    const i = Number(form.i) || 0;
    const mass = Math.max(0, Number(form.mass));
    const density = Math.max(0, Number(form.density));
    const color = colorHash(name + Date.now());
    const item = { name, a, e, period, omega, Omega, i, mass, density, color };
    setCustomAsteroids((arr) => [...arr.filter(x => x.name !== name), item]);
    setHighlights((prev) => { const p = new Set(prev); p.add(name); return p; });
  }

  function removeCustom(name) {
    setCustomAsteroids((arr) => arr.filter((x) => x.name !== name));
    setHighlights((prev) => { const p = new Set(prev); p.delete(name); return p; });
  }

  return (
    <div className="w-full h-full min-h-[640px] bg-slate-950 text-slate-100">
      <div className="max-w-[1280px] mx-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-900/70 ring-1 ring-slate-800 px-4 py-3 shadow-lg">
            <button className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition" onClick={() => setIsPlaying((p) => !p)} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? "Pause" : "Play"}</button>
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-xl px-2 py-1">
              <button className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600" onClick={() => setTimeScale((s) => Math.max(3600, s / 2))}>½×</button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600" onClick={() => setTimeScale((s) => Math.min(31557600 * 8, s * 2))}>2×</button>
              <select className="px-2 py-1.5 rounded-lg bg-slate-700" value={timeScale} onChange={(e) => setTimeScale(parseInt(e.target.value))}>
                {speeds.map((s) => (<option key={s} value={s}>{s === 3600 && "1 hour/s"}{s === 43200 && "12 hours/s"}{s === 86400 && "1 day/s"}{s === 604800 && "1 week/s"}{s === 2592000 && "1 month/s"}{s === 31557600 && "1 year/s"}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-xl px-2 py-1">
              <button className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600" onClick={() => setSimTime((t) => t - 86400000)}>−1d</button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600" onClick={() => setSimTime((t) => t + 86400000)}>+1d</button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600" onClick={() => setSimTime(Date.now())}>Now</button>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <label className="flex items-center gap-2 text-sm bg-slate-800/60 rounded-xl px-2 py-1">
                <input type="checkbox" checked={showAsteroids} onChange={(e) => setShowAsteroids(e.target.checked)} />
                Belt
              </label>
              <div className="flex items-center gap-2 text-sm bg-slate-800/60 rounded-xl px-2 py-1">
                <span>Tilt</span>
                <input type="range" min={0} max={360} step={1} value={tiltDeg} onChange={(e) => setTiltDeg(parseInt(e.target.value))} />
                <span className="tabular-nums w-10 text-right">{tiltDeg}°</span>
              </div>
              <div className="text-sm px-2 py-1 rounded-xl bg-slate-800/60">{formatDateUTC(simTime)}</div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden ring-1 ring-slate-800 shadow-xl">
            <div className="relative h-[720px] bg-slate-950">
              <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
              <div className="absolute bottom-3 left-3 text-xs text-slate-400">Drag to pan • Scroll to zoom</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="bg-slate-900/70 ring-1 ring-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="text-sm font-semibold">Add custom asteroid</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <label className="flex items-center gap-2"><span className="w-16">Name</span><input className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
                <label className="flex items-center gap-2"><span className="w-16">a (AU)</span><input type="number" step="0.001" className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.a} onChange={e=>setForm({...form,a:parseFloat(e.target.value)})} /></label>
                <label className="flex items-center gap-2"><span className="w-16">e</span><input type="number" step="0.001" min="0" max="0.95" className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.e} onChange={e=>setForm({...form,e:parseFloat(e.target.value)})} /></label>
                <label className="flex items-center gap-2"><span className="w-16">Period (d)</span><input type="number" step="1" className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.period} onChange={e=>setForm({...form,period:parseFloat(e.target.value)})} /></label>
                <label className="flex items-center gap-2"><span className="w-16">ω (°)</span><input type="number" step="1" className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.omega} onChange={e=>setForm({...form,omega:parseFloat(e.target.value)})} /></label>
                <label className="flex items-center gap-2"><span className="w-16">Ω (°)</span><input type="number" step="1" className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.Omega} onChange={e=>setForm({...form,Omega:parseFloat(e.target.value)})} /></label>
                <label className="flex items-center gap-2"><span className="w-16">i (°)</span><input type="number" step="0.1" className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.i} onChange={e=>setForm({...form,i:parseFloat(e.target.value)})} /></label>
                <label className="flex items-center gap-2"><span className="w-16">Mass (kg)</span><input type="number" step="1" className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.mass} onChange={e=>setForm({...form,mass:parseFloat(e.target.value)})} /></label>
                <label className="flex items-center gap-2"><span className="w-16">Density</span><input type="number" step="1" className="flex-1 bg-slate-800 rounded px-2 py-1" value={form.density} onChange={e=>setForm({...form,density:parseFloat(e.target.value)})} /></label>
                <div className="col-span-2 flex gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500" onClick={addCustomAsteroid}>Add</button>
                </div>
              </div>
              <div className="text-xs text-slate-400">Orbits are shown only if highlighted.</div>
            </div>

            <div className="xl:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[...presetAsteroids, ...customAsteroids].map((a) => (
                <div key={a.name} className="flex items-center gap-2 bg-slate-900/60 ring-1 ring-slate-800 rounded-2xl px-3 py-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: a.color }} />
                  <span className="truncate max-w-[10rem]" title={a.name}>{a.name}</span>
                  <button className={`ml-auto px-2 py-1 rounded-lg border ${highlights.has(a.name) ? 'bg-slate-200 text-slate-900' : 'bg-slate-800 border-slate-600'}`} onClick={() => setHighlights((prev) => { const p = new Set(prev); p.has(a.name) ? p.delete(a.name) : p.add(a.name); return p; })}>{highlights.has(a.name) ? 'Highlighted' : 'Highlight'}</button>
                  {customAsteroids.find(x => x.name === a.name) && (
                    <button className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500" onClick={() => removeCustom(a.name)}>Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {bodies.map((b) => (
              <div key={b.name} className="flex items-center gap-2 bg-slate-900/60 ring-1 ring-slate-800 rounded-2xl px-3 py-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: b.color }} />
                <span className="font-medium">{b.name}</span>
                <span className="text-slate-400 ml-auto">a={b.a} AU</span>
                <button className={`ml-2 px-2 py-1 rounded-lg text-xs border ${highlights.has(b.name) ? 'bg-slate-200 text-slate-900' : 'bg-slate-800 border-slate-600'}`} onClick={() => setHighlights((prev) => { const p = new Set(prev); p.has(b.name) ? p.delete(b.name) : p.add(b.name); return p; })}>{highlights.has(b.name) ? 'Highlighted' : 'Highlight'}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
