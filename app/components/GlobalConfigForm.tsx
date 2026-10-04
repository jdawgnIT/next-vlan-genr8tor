// app/components/GlobalConfigForm.tsx
import React from "react";
import { GlobalSettings } from "../utils/generators";

interface GlobalConfigFormProps {
  globalSettings: GlobalSettings;
  setGlobalSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
}

export const GlobalConfigForm: React.FC<GlobalConfigFormProps> = ({
  globalSettings,
  setGlobalSettings
}) => {
  const handleChange = (field: keyof GlobalSettings, value: string) => {
    setGlobalSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="bg-slate-800 p-4 md:p-5 rounded-xl border border-slate-700/80 shadow-xl space-y-4">
      <div className="border-b border-slate-700/60 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 font-mono">
          Global Hardware Plane Parameters
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] items-start md:items-center gap-1 md:gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-tight">
            Global Native VLAN ID
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            value={globalSettings.nativeVlan}
            onChange={(e) => handleChange("nativeVlan", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] items-start md:items-center gap-1 md:gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-tight">
            Management VLAN ID
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            value={globalSettings.managementVlan}
            onChange={(e) => handleChange("managementVlan", e.target.value)}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] items-start md:items-center gap-1 md:gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-tight">
            Wired Admin Access Port
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            value={globalSettings.managementSwitchPort}
            onChange={(e) => handleChange("managementSwitchPort", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] items-start md:items-center gap-1 md:gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-tight">
            pfSense Parent Interface
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            value={globalSettings.pfsenseParentInterface}
            onChange={(e) => handleChange("pfsenseParentInterface", e.target.value)}
          />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] items-start md:items-center gap-1 md:gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-tight">
            Switch Trunks to Router
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            value={globalSettings.pfsensePorts}
            onChange={(e) => handleChange("pfsensePorts", e.target.value)}
            placeholder="e.g. Gi0/1"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] items-start md:items-center gap-1 md:gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-tight">
            Switch Trunks to AP Array
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            value={globalSettings.accessPointPorts}
            onChange={(e) => handleChange("accessPointPorts", e.target.value)}
            placeholder="e.g. Gi0/2, Gi0/3"
          />
        </div>

        {/* Full Width Row */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[16rem_1fr] items-start md:items-center gap-1 md:gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-tight">
            Inter-Switch Link Trunks
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            value={globalSettings.interSwitchPorts}
            onChange={(e) => handleChange("interSwitchPorts", e.target.value)}
            placeholder="e.g. Gi0/22, Gi0/23"
          />
        </div>
      </div>
    </section>
  );
};
