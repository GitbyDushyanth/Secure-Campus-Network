import React, { useState } from 'react';
import { Device, VLAN, ConnectivityTestResult } from '../types/network';
import {
  Cpu,
  Network,
  Laptop,
  CheckCircle2,
  XCircle,
  Shield,
  Activity,
  Layers,
  Info,
  Play,
  RotateCcw,
  Zap,
  Terminal,
  Server,
  Lock
} from 'lucide-react';

interface TopologyViewProps {
  devices: Device[];
  vlans: VLAN[];
  activeTestResult?: ConnectivityTestResult | null;
  onRunTest?: (source: string, dest: string) => void;
  isTesting?: boolean;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  devices,
  vlans,
  activeTestResult,
  onRunTest,
  isTesting
}) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [animatingPath, setAnimatingPath] = useState<string[]>([]);
  const [quickSrc, setQuickSrc] = useState('ADMIN-PC');
  const [quickDst, setQuickDst] = useState('STUDENT-PC');

  // Router and Switch references
  const router = devices.find(d => d.type === 'ROUTER') || devices[5];
  const switchDevice = devices.find(d => d.type === 'SWITCH') || devices[6];
  const pcDevices = devices.filter(d => d.type === 'PC');

  // Highlight connections if a test is running or just finished
  const isTrunkActive = activeTestResult && (
    activeTestResult.sourceDevice.includes('PC') || activeTestResult.destDevice.includes('PC')
  );

  const handleQuickRun = () => {
    if (onRunTest) {
      onRunTest(quickSrc, quickDst);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Packet Tracer Exact Topology</h3>
            <p className="text-xs text-slate-400">
              Cisco 2911 (R1) • Cisco 2960 (S1) Trunk Link • 5 VLAN Access Ports (Fa0/1 - Fa0/5)
            </p>
          </div>
        </div>

        {/* Quick Test Bar directly on Topology page */}
        <div className="flex items-center space-x-2 bg-[#111C35] p-1.5 rounded-lg border border-[#1E2E4A]">
          <span className="text-xs text-slate-400 pl-2">Quick Test:</span>
          <select
            value={quickSrc}
            onChange={(e) => setQuickSrc(e.target.value)}
            className="bg-[#0B1120] text-slate-200 text-xs px-2.5 py-1 rounded border border-[#1E2E4A] focus:outline-none focus:border-cyan-500 font-mono"
          >
            {pcDevices.map(pc => (
              <option key={pc.id} value={pc.name}>{pc.name} (VLAN {pc.vlanId})</option>
            ))}
          </select>
          <span className="text-slate-500 text-xs">→</span>
          <select
            value={quickDst}
            onChange={(e) => setQuickDst(e.target.value)}
            className="bg-[#0B1120] text-slate-200 text-xs px-2.5 py-1 rounded border border-[#1E2E4A] focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="R1">R1 (Gateway)</option>
            {pcDevices.map(pc => (
              <option key={pc.id} value={pc.name}>{pc.name} (VLAN {pc.vlanId})</option>
            ))}
          </select>
          <button
            onClick={handleQuickRun}
            disabled={isTesting}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all disabled:opacity-50 shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isTesting ? 'animate-spin' : ''}`} />
            <span>Transmit</span>
          </button>
        </div>
      </div>

      {/* Main Diagram Area with side drawer when device selected */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive SVG / Visual Diagram (Cols 3) */}
        <div className={`p-6 rounded-xl bg-[#0F172A] border border-[#1E2E4A] relative overflow-hidden flex flex-col justify-between min-h-[580px] shadow-sm ${selectedDevice ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#06B6D4 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Topology Header Info Overlay */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs text-slate-300 font-mono font-medium">Link Status: All Dot1Q Interfaces UP</span>
            </div>
            <div className="text-xs text-slate-400">
              Click any device node to inspect Cisco IOS interfaces & configs
            </div>
          </div>

          {/* Diagram Structure */}
          <div className="relative z-10 my-auto py-8">
            {/* LEVEL 1: ROUTER R1 */}
            <div className="flex justify-center mb-6">
              <div
                onClick={() => setSelectedDevice(router)}
                className={`relative group cursor-pointer p-4 rounded-xl bg-[#111C35] border-2 transition-all duration-200 flex flex-col items-center w-64 shadow-lg ${
                  selectedDevice?.id === router?.id
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-cyan-500/20'
                    : 'border-cyan-500/40 hover:border-cyan-400'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-105 transition-transform">
                  <Cpu className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-white tracking-wide">R1 (Cisco 2911)</div>
                <div className="text-[11px] font-mono text-cyan-400">Router-on-a-Stick Gateway</div>
                <div className="mt-2 text-[10px] bg-[#0B1120] px-2 py-0.5 rounded text-slate-300 font-mono border border-[#1E2E4A]">
                  G0/0 [Subifs .10, .20, .30, .40, .50]
                </div>
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                  ONLINE
                </span>
              </div>
            </div>

            {/* TRUNK LINK (R1 G0/0 <-> S1 G0/1) */}
            <div className="flex flex-col items-center my-1 relative">
              <div className="h-12 w-0.5 bg-gradient-to-b from-cyan-500 to-blue-500 relative">
                {isTesting && (
                  <div className="absolute inset-0 w-1 bg-cyan-300 animate-pulse -left-[1px]"></div>
                )}
              </div>
              <div className="bg-[#0B1120] border border-[#1E2E4A] px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-300 flex items-center space-x-1.5 shadow-sm">
                <span className="text-cyan-400 font-bold">R1 G0/0</span>
                <span className="text-slate-500">── 802.1Q TRUNK ──</span>
                <span className="text-blue-400 font-bold">S1 G0/1</span>
              </div>
              <div className="h-12 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500"></div>
            </div>

            {/* LEVEL 2: SWITCH S1 */}
            <div className="flex justify-center mb-8">
              <div
                onClick={() => setSelectedDevice(switchDevice)}
                className={`relative group cursor-pointer p-4 rounded-xl bg-[#111C35] border-2 transition-all duration-200 flex flex-col items-center w-72 shadow-lg ${
                  selectedDevice?.id === switchDevice?.id
                    ? 'border-blue-400 bg-blue-950/40 shadow-blue-500/20'
                    : 'border-blue-500/40 hover:border-blue-400'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                  <Network className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-white tracking-wide">S1 (Cisco 2960-24TT)</div>
                <div className="text-[11px] font-mono text-blue-400">Campus Distribution Switch</div>
                <div className="mt-2 flex items-center space-x-1 text-[10px] font-mono">
                  <span className="bg-[#0B1120] px-1.5 py-0.5 rounded text-amber-300 border border-[#1E2E4A]">
                    Port Sec: Restrict
                  </span>
                  <span className="bg-[#0B1120] px-1.5 py-0.5 rounded text-emerald-300 border border-[#1E2E4A]">
                    5 Access Ports
                  </span>
                </div>
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                  ONLINE
                </span>
              </div>
            </div>

            {/* LEVEL 3: 5 HOST PCS CONNECTED TO S1 ACCESS PORTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              {pcDevices.map((pc) => {
                const isSelected = selectedDevice?.id === pc.id;
                const isSource = activeTestResult?.sourceDevice === pc.name;
                const isDest = activeTestResult?.destDevice === pc.name;

                // Color accent based on VLAN
                const vlanColors: Record<number, { border: string; bg: string; text: string; badge: string }> = {
                  10: { border: 'border-cyan-500/40', bg: 'hover:border-cyan-400', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
                  20: { border: 'border-blue-500/40', bg: 'hover:border-blue-400', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
                  30: { border: 'border-emerald-500/40', bg: 'hover:border-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
                  40: { border: 'border-amber-500/40', bg: 'hover:border-amber-400', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
                  50: { border: 'border-rose-500/40', bg: 'hover:border-rose-400', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
                };

                const colors = vlanColors[pc.vlanId] || vlanColors[10];

                return (
                  <div
                    key={pc.id}
                    onClick={() => setSelectedDevice(pc)}
                    className={`relative cursor-pointer p-3 rounded-xl bg-[#111C35] border-2 transition-all duration-200 flex flex-col items-center shadow-md ${
                      isSelected
                        ? 'border-white bg-[#1A2644] ring-2 ring-cyan-500/50'
                        : isSource
                        ? 'border-emerald-400 bg-emerald-950/30'
                        : isDest
                        ? 'border-amber-400 bg-amber-950/30'
                        : `${colors.border} ${colors.bg}`
                    }`}
                  >
                    {/* Switch Port Link Indicator */}
                    <div className="text-[10px] font-mono text-slate-400 bg-[#0B1120] px-2 py-0.5 rounded border border-[#1E2E4A] mb-2">
                      Port: <span className="text-white font-bold">{pc.switchPort}</span>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-[#0F172A] border border-[#1E2E4A] flex items-center justify-center text-slate-300 mb-1.5">
                      <Laptop className="w-5 h-5" />
                    </div>

                    <div className="text-xs font-bold text-white tracking-wide text-center">{pc.name}</div>
                    <span className={`mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${colors.badge}`}>
                      VLAN {pc.vlanId} ({pc.vlanName})
                    </span>

                    <div className="mt-2 text-[10px] font-mono text-slate-300 text-center space-y-0.5">
                      <div>IP: {pc.ip}</div>
                      <div className="text-slate-400 text-[9px]">GW: {pc.gateway}</div>
                    </div>

                    {isSource && (
                      <span className="absolute -top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-black rounded font-mono">
                        SRC
                      </span>
                    )}
                    {isDest && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-black rounded font-mono">
                        DST
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Simulation Result Banner on Topology */}
          {activeTestResult && (
            <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs z-10 ${
              activeTestResult.outcome === 'ALLOWED'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center space-x-2.5">
                {activeTestResult.outcome === 'ALLOWED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold">
                    {activeTestResult.sourceDevice} → {activeTestResult.destDevice}: {activeTestResult.outcome}
                  </span>
                  <span className="mx-2 text-slate-500">|</span>
                  <span className="font-mono">{activeTestResult.matchedRule}</span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Latency: {activeTestResult.latencyMs}ms
              </span>
            </div>
          )}
        </div>

        {/* Device Inspection Drawer (Col 4 when active) */}
        {selectedDevice && (
          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Device Telemetry</h4>
                </div>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#111C35]"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Device Name & Role</span>
                  <span className="text-white font-bold text-sm">{selectedDevice.name}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedDevice.role}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111C35] border border-[#1E2E4A] space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-cyan-400 font-bold">{selectedDevice.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IP Address:</span>
                    <span className="text-white">{selectedDevice.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MAC Address:</span>
                    <span className="text-slate-300">{selectedDevice.mac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Switch Port:</span>
                    <span className="text-amber-400 font-bold">{selectedDevice.switchPort}</span>
                  </div>
                  {selectedDevice.vlanId > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">VLAN Tag:</span>
                      <span className="text-emerald-400 font-bold">VLAN {selectedDevice.vlanId} ({selectedDevice.vlanName})</span>
                    </div>
                  )}
                  {selectedDevice.gateway !== '0.0.0.0' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gateway:</span>
                      <span className="text-slate-300">{selectedDevice.gateway}</span>
                    </div>
                  )}
                </div>

                {/* Simulated Cisco IOS Running Config Snippet */}
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Cisco IOS Configuration Extract:</span>
                  <pre className="p-2.5 rounded bg-[#080D1A] border border-[#1E2E4A] text-[10px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                    {selectedDevice.type === 'ROUTER' && (
`interface GigabitEthernet0/0
 no ip address
 no shutdown
!
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
!
interface GigabitEthernet0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
 ip access-group 101 in
!
interface GigabitEthernet0/0.50
 encapsulation dot1Q 50
 ip address 192.168.50.1 255.255.255.0
 ip access-group 102 in`
                    )}
                    {selectedDevice.type === 'SWITCH' && (
`interface GigabitEthernet0/1
 switchport mode trunk
!
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 10
 switchport port-security
 switchport port-security maximum 1
 switchport port-security violation restrict
 switchport port-security mac-address sticky`
                    )}
                    {selectedDevice.type === 'PC' && (
`[DHCP Client Configuration]
Interface: FastEthernet0
IP Address: ${selectedDevice.ip}
Subnet Mask: 255.255.255.0
Default Gateway: ${selectedDevice.gateway}
DNS Server: 8.8.8.8
MAC Address: ${selectedDevice.mac}
Connected Port: Switch S1 ${selectedDevice.switchPort}`
                    )}
                  </pre>
                </div>

                <p className="text-[10px] text-slate-500 leading-normal">
                  {selectedDevice.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2E4A] flex space-x-2">
              {selectedDevice.type === 'PC' && (
                <button
                  onClick={() => {
                    setQuickSrc(selectedDevice.name);
                    setSelectedDevice(null);
                  }}
                  className="w-full py-1.5 text-xs font-medium rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
                >
                  Set as Test Source
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
