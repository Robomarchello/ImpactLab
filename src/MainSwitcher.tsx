
import React, { useState } from "react";
import AppA from "./projectA/AppA";
import AppB from "./projectB"; // re-export original App from projectB

export default function MainSwitcher(){
  const [active, setActive] = useState<'A'|'B'>('A');
  return (
    <div className="w-full h-full">
      <div className="p-3 flex gap-2 bg-slate-900 border-b border-slate-800">
        <button onClick={()=>setActive('A')} className={`px-3 py-1.5 rounded ${active==='A'?'bg-emerald-600':'bg-slate-700'}`}>Project A — Solar System</button>
        <button onClick={()=>setActive('B')} className={`px-3 py-1.5 rounded ${active==='B'?'bg-emerald-600':'bg-slate-700'}`}>Project B — Impact Simulator</button>
      </div>
      <div className="h-[calc(100vh-56px)] overflow-auto">
        {active==='A' ? <AppA/> : <AppB/>}
      </div>
    </div>
  );
}
