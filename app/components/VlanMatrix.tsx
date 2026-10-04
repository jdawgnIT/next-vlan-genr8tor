// app/components/VlanMatrix.tsx
import React from 'react';
import { VlanProfile } from '../utils/generators';

interface VlanMatrixProps {
  vlans: VlanProfile[];
  setVlans: React.Dispatch<React.SetStateAction<VlanProfile[]>>;
}

export const VlanMatrix: React.FC<VlanMatrixProps> = ({ vlans, setVlans }) => {
  const addVlan = () => {
    const newId = String(Math.max(...vlans.map(v => parseInt(v.id || '0'))) + 10);
    setVlans([...vlans, {
      id: newId,
      name: `VLAN_${newId}`,
      purpose: 'Internet Only Wireless',
      subnet: `10.10.${newId}.0/24`,
      routerIp: `10.10.${newId}.1`,
      switchIp: 'NONE',
      apIp: 'NONE',
      isWireless: true,
      isHostile: true,
      ssid: `Secure_Wifi_${newId}`
    }]);
  };

  const updateVlan = (id: string, field: keyof VlanProfile, value: any) => {
    setVlans(vlans.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVlan = (id: string) => {
    setVlans(vlans.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-200">Active Subnet Configuration Profiles Matrix</h2>
        <button onClick={addVlan} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded text-white font-medium transition">
          ➕ Add New Subnet Segment
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {vlans.map(v => (
          <div key={v.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm bg-slate-700 px-2 py-1 rounded text-emerald-400 font-bold">VLAN {v.id}</span>
                <h3 className="font-bold text-lg text-slate-200">{v.name}</h3>
              </div>
              <button onClick={() => removeVlan(v.id)} className="text-xs text-rose-400 hover:text-rose-300 font-medium">
                Remove Profile
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium">Profile Descriptive Name</label>
                <input type="text" className="mt-1 w-full bg-slate-700 border border-slate-600 rounded p-1.5 text-white" value={v.name} onChange={e => updateVlan(v.id, 'name', e.target.value)} />
              </div>
              <div>
                <label className="block text-slate-400 font-medium">Subnet Space Allocation</label>
                <input type="text" className="mt-1 w-full bg-slate-700 border border-slate-600 rounded p-1.5 text-white font-mono" value={v.subnet} onChange={e => updateVlan(v.id, 'subnet', e.target.value)} />
              </div>
              <div>
                <label className="block text-slate-400 font-medium">pfSense Router Core Gateway IP</label>
                <input type="text" className="mt-1 w-full bg-slate-700 border border-slate-600 rounded p-1.5 text-white font-mono" value={v.routerIp} onChange={e => updateVlan(v.id, 'routerIp', e.target.value)} />
              </div>
              <div>
                <label className="block text-slate-400 font-medium">Switch SVI / Target Mapping Address</label>
                <input type="text" className="mt-1 w-full bg-slate-700 border border-slate-600 rounded p-1.5 text-white font-mono" value={v.switchIp} onChange={e => updateVlan(v.id, 'switchIp', e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={v.isWireless} onChange={e => updateVlan(v.id, 'isWireless', e.target.checked)} className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-0" />
                <span>Activate Wireless SSID Broadcasting Node</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={v.isHostile} onChange={e => updateVlan(v.id, 'isHostile', e.target.checked)} className="rounded bg-slate-700 border-slate-600 text-rose-500 focus:ring-0" />
                <span className="text-rose-300 font-medium">Classify as Hostile / Fully Isolated Network Segment</span>
              </label>
              
              {v.isWireless && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-400 whitespace-nowrap font-medium">SSID Name:</span>
                  <input type="text" className="max-w-xs bg-slate-700 border border-slate-600 rounded p-1 text-white font-mono" value={v.ssid} onChange={e => updateVlan(v.id, 'ssid', e.target.value)} placeholder="SSID Broadcast Tag" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
