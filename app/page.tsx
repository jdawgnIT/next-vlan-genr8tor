"use client";
import React, { useState } from 'react';
import { 
  GlobalSettings, 
  VlanProfile, 
  generateCiscoSwitch, 
  generateCiscoAP, 
  generatePfSense, 
  generateMarkdownExplanation, 
  generateMermaid // <-- Dynamic Import Bound
} from './utils/generators';
import { GlobalConfigForm } from './components/GlobalConfigForm';
import { VlanMatrix } from './components/VlanMatrix';
import { ConfigReviewTabs } from './components/ConfigReviewTabs';

export default function NetworkGenerator() {
  const [activeTab, setActiveTab] = useState('vlans');
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    nativeVlan: '1',
    managementVlan: '10',
    managementSwitchPort: 'Gi0/24',
    pfsensePorts: 'Gi0/1',
    accessPointPorts: 'Gi0/2',
    interSwitchPorts: 'Gi0/22, Gi0/23',
    pfsenseParentInterface: 'igb1'
  });

  const [vlans, setVlans] = useState<VlanProfile[]>([
    { id: '10', name: 'MGMT', purpose: 'Device Management', subnet: '10.10.10.0/24', routerIp: '10.10.10.1', switchIp: '10.10.10.2', apIp: '10.10.10.3', isWireless: false, isHostile: false, ssid: '' },
    { id: '20', name: 'GUEST_WIFI', purpose: 'Hostile Wireless Untrusted', subnet: '10.10.20.0/24', routerIp: '10.10.20.1', switchIp: 'DHCP', apIp: 'NONE', isWireless: true, isHostile: true, ssid: 'Hostile_Guest' }
  ]);

  // --- 💾 JSON WORKSPACE ACTIONS ---
  const exportAppStateToJson = () => {
    const backupPayload = { globalSettings, vlans };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `network_generator_workspace.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.globalSettings && parsed.vlans) {
            setGlobalSettings(parsed.globalSettings);
            setVlans(parsed.vlans);
            alert("✅ Configuration State Loaded Successfully!");
          } else {
            alert("❌ Invalid JSON File Structure.");
          }
        } catch (error) {
          alert("❌ Failed to parse JSON configuration file.");
        }
      };
    }
  };

  // --- FILE EXPORT CONTROLLER ---
  const triggerFileDownloads = () => {
    const filesToDownload = [
      { name: 'cisco_switch_config.cfg', content: generateCiscoSwitch(vlans, globalSettings) },
      { name: 'cisco_ap_config.cfg', content: generateCiscoAP(vlans, globalSettings) },
      { name: 'pfsense_vlan_import.xml', content: generatePfSense(vlans, globalSettings) },
      { name: 'DEPLOYMENT_DOCUMENTATION.md', content: generateMarkdownExplanation(vlans, globalSettings) },
      { name: 'TOPOLOGY_DIAGRAM.mermaid', content: generateMermaid(vlans, globalSettings) },
      { name: 'generator_workspace_state.json', content: JSON.stringify({ globalSettings, vlans }, null, 2) }
    ];

    filesToDownload.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = url;
      element.download = file.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* BRANDING TOOLBAR HEADER */}
        <header className="border-b border-slate-700 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">Isolated Network Script Bootstrap Engine</h1>
            <p className="text-sm text-slate-400 mt-1">Decoupled UI Suite targeting Cisco Multilayer Switches &amp; pfSense Nodes Context</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-lg border border-slate-700 text-xs">
            <button onClick={exportAppStateToJson} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition font-medium border border-slate-600">
              💾 Save Workspace
            </button>
            <label className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition font-medium border border-slate-600 cursor-pointer">
              📂 Load Workspace
              <input type="file" accept=".json" onChange={handleJsonImport} className="hidden" />
            </label>
          </div>
        </header>

        {/* MOUNT GLOBAL CONTROL FORM */}
        <GlobalConfigForm globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} />

        {/* WORKSPACE SELECTION CONTROL */}
        <div className="flex justify-between items-center border-b border-slate-700">
          <div className="flex space-x-2">
            <button onClick={() => setActiveTab('vlans')} className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'vlans' ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              VLAN Matrix
            </button>
            <button onClick={() => setActiveTab('scripts')} className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'scripts' ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              Generated Configurations Review
            </button>
          </div>
          
          <button onClick={triggerFileDownloads} className="mb-1 px-4 py-1.5 text-xs font-bold bg-emerald-500 text-slate-900 rounded-lg hover:bg-emerald-400 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/10">
            <span>🚀</span> Generate &amp; Download Config Bundle
          </button>
        </div>

        {/* DYNAMIC SCREEN ROUTER PANEL */}
        {activeTab === 'vlans' ? (
          <VlanMatrix vlans={vlans} setVlans={setVlans} />
        ) : (
          <div className="space-y-6">
            {/* Core Config File Tabs Sub-Component View */}
            <ConfigReviewTabs 
              ciscoSwitch={generateCiscoSwitch(vlans, globalSettings)} 
              ciscoAp={generateCiscoAP(vlans, globalSettings)} 
              pfsense={generatePfSense(vlans, globalSettings)} 
              markdown={generateMarkdownExplanation(vlans, globalSettings)} 
            />
            
            {/* Live Topology String Viewer Element Panel Block */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">Generated Mermaid Topology Blueprint Data</h3>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400 overflow-x-auto whitespace-pre-wrap max-h-96 select-all">
                {generateMermaid(vlans, globalSettings)}
              </pre>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
