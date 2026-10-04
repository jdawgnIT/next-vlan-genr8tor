// app/components/ConfigReviewTabs.tsx
import React from 'react';

interface ConfigReviewTabsProps {
  ciscoSwitch: string;
  ciscoAp: string;
  pfsense: string;
  markdown: string;
}

export const ConfigReviewTabs: React.FC<ConfigReviewTabsProps> = ({ ciscoSwitch, ciscoAp, pfsense, markdown }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cisco 3850 Catalyst Switch Config</h3>
        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-96 select-all">{ciscoSwitch}</pre>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cisco 3502 Autonomous AP Config</h3>
        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-96 select-all">{ciscoAp}</pre>
      </div>
      <div className="md:col-span-2 space-y-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">pfSense /conf/config.xml Node Elements</h3>
        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-amber-400 overflow-x-auto whitespace-pre-wrap max-h-96 select-all">{pfsense}</pre>
      </div>
      <div className="md:col-span-2 space-y-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Generated Deployment Documentation Summary (Markdown File Output)</h3>
        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-96 select-all">{markdown}</pre>
      </div>
    </div>
  );
};
