import React, { useState } from 'react';
import { PortSecurityState } from '../types/network';
import {
  Lock,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  Code,
  Network
} from 'lucide-react';

interface PortSecurityViewProps {
  portStates: PortSecurityState[];
  onSimulateViolation: (port: string) => Promise<void>;
  onResetPortSecurity: (port?: string) => Promise<void>;
  isProcessing?: boolean;
}

export const PortSecurityView: React.FC<PortSecurityViewProps> = ({
  portStates,
  onSimulateViolation,
  onResetPortSecurity,
  isProcessing
}) => {
  const [selectedPort, setSelectedPort] = useState<string>('Fa0/3'); // Student port default
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  const handleSimulate = async (port: string) => {
    try {
      await onSimulateViolation(port);
      setLastActionResult(`Simulated rogue MAC intrusion on port ${port}. Restrict mode active: Dropped unauthorized frames, incremented violation counter, link remained UP.`);
      setTimeout(() => setLastActionResult(null), 6000);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleReset = async (port?: string) => {
    try {
      await onResetPortSecurity(port);
      setLastActionResult(port ? `Reset violation counters for port ${port}.` : 'Reset violation counters for all access ports.');
      setTimeout(() => setLastActionResult(null), 4000);
    } catch (e: any) {
      console.error(e);
    }
  };

  const accessPorts = portStates.filter(p => !p.isTrunk);
  const trunkPort = portStates.find(p => p.isTrunk);

  return (
    <div className="space-y-6">
      {/* Educational Explainer Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] flex items-start space-x-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">
            Educational Port Security Reference • Restrict Mode vs Shutdown Mode
          </div>
          <p className="text-slate-400 leading-relaxed">
            On Cisco Catalyst switches, <span className="text-amber-300 font-mono">violation restrict</span> mode drops packets from unauthorized MAC addresses, increments the security violation counter, and generates a syslog/SNMP trap — <strong className="text-slate-200">without disabling the port</strong>.
            This prevents denial-of-service on legitimate users while blocking MAC spoofing.
            Trunk port <span className="text-cyan-300 font-mono">G0/1</span> does not run port security because it multiplexes frames for multiple VLANs and devices.
          </p>
        </div>
      </div>

      {lastActionResult && (
        <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{lastActionResult}</span>
        </div>
      )}

      {/* Row 1: Access Ports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {accessPorts.map((p) => {
          const hasViolations = p.violationCount > 0;
          return (
            <div
              key={p.port}
              className={`p-4 rounded-xl bg-[#0F172A] border-2 shadow-sm flex flex-col justify-between transition-all ${
                hasViolations
                  ? 'border-amber-500/70 bg-[#161D2E]'
                  : 'border-[#1E2E4A] hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <Lock className={`w-4 h-4 ${hasViolations ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="font-bold text-white text-sm font-mono">{p.port}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      hasViolations
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-semibold mb-2">
                  {p.connectedDevice} <span className="text-slate-400 font-mono font-normal">(VLAN {p.vlanId})</span>
                </div>

                <div className="space-y-1.5 text-[10px] font-mono bg-[#111C35] p-2.5 rounded-lg border border-[#1E2E4A]">
                  <div>
                    <span className="text-slate-500 font-sans block">Sticky Learned MAC:</span>
                    <span className="text-emerald-400 font-bold">{p.stickyMac}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans block">Detected On Wire:</span>
                    <span className={p.currentDetectedMac !== p.stickyMac ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {p.currentDetectedMac}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#1E2E4A]">
                    <span className="text-slate-400 font-sans">Max MAC:</span>
                    <span className="text-white font-bold">{p.maxMacAllowed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Violation Mode:</span>
                    <span className="text-amber-400 uppercase font-bold">{p.violationMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Violations Dropped:</span>
                    <span className={`font-bold ${hasViolations ? 'text-rose-400 text-xs' : 'text-slate-400'}`}>
                      {p.violationCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E2E4A] space-y-2">
                <button
                  onClick={() => handleSimulate(p.port)}
                  disabled={isProcessing}
                  className="w-full py-1.5 rounded bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                  title="Simulate unauthorized second MAC address on this access port"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Simulate Violation</span>
                </button>
                {hasViolations && (
                  <button
                    onClick={() => handleReset(p.port)}
                    disabled={isProcessing}
                    className="w-full py-1 rounded bg-[#111C35] hover:bg-[#1E2E4A] text-slate-300 text-[11px] font-mono flex items-center justify-center space-x-1 border border-[#1E2E4A]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Counter</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Trunk Port Exclusion Card & Global Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trunkPort && (
          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E2E4A]">
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white font-mono">Trunk Port {trunkPort.port} (S1 ↔ R1 G0/0)</h4>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  802.1Q TRUNK
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Port security is <strong className="text-white">NOT applied to trunk port G0/1</strong>.
                Per Cisco enterprise design standards, trunk links transport frames bearing multiple 802.1Q VLAN tags and thousands of dynamic source MAC addresses from across the campus.
                Enabling port security on a core trunk would cause severe network-wide outages.
              </p>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-400 bg-[#111C35] p-2 rounded border border-[#1E2E4A]">
              Interface: GigabitEthernet0/1 • switchport mode trunk • Dot1Q encapsulation active
            </div>
          </div>
        )}

        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Switch Security Controls</h4>
            <p className="text-xs text-slate-400 mb-4">
              Reset violation counters across all access ports or restore clean MAC learning state.
            </p>
          </div>

          <button
            onClick={() => handleReset()}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-lg bg-[#111C35] hover:bg-[#1E2E4A] text-slate-200 text-xs font-medium border border-[#1E2E4A] flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Clear All Port Security Counters</span>
          </button>
        </div>
      </div>

      {/* Row 3: Cisco IOS Port Security Configuration Snippet */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
        <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#1E2E4A]">
          <Code className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Cisco Catalyst 2960 Port Security Syntax</h4>
        </div>
        <pre className="p-3 rounded-lg bg-[#080D1A] border border-[#1E2E4A] text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
{`S1(config)# interface range FastEthernet 0/1 - 5
S1(config-if-range)# switchport mode access
S1(config-if-range)# switchport port-security
S1(config-if-range)# switchport port-security maximum 1
S1(config-if-range)# switchport port-security violation restrict
S1(config-if-range)# switchport port-security mac-address sticky
!
! Verification command:
S1# show port-security interface FastEthernet 0/1
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Restrict
Aging Time                 : 0 mins
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0050.56a1.2345:10
Security Violation Count   : 1`}
        </pre>
      </div>
    </div>
  );
};
