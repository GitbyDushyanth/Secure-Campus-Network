import React, { useState } from 'react';
import { Device, VLAN, ConnectivityTestResult, ProtocolType, PacketType } from '../types/network';
import {
  ShieldCheck,
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Layers,
  Cpu,
  Network,
  Laptop,
  Activity,
  Trash2,
  Info,
  Clock,
  HelpCircle,
  Check
} from 'lucide-react';

interface SecurityLabViewProps {
  devices: Device[];
  vlans: VLAN[];
  testHistory: ConnectivityTestResult[];
  onRunTest: (params: {
    sourceDeviceId: string;
    destDeviceId: string;
    protocol?: ProtocolType;
    packetType?: PacketType;
  }) => Promise<ConnectivityTestResult | null>;
  onClearHistory: () => Promise<void>;
  isTesting?: boolean;
}

export const SecurityLabView: React.FC<SecurityLabViewProps> = ({
  devices,
  vlans,
  testHistory,
  onRunTest,
  onClearHistory,
  isTesting
}) => {
  const pcDevices = devices.filter(d => d.type === 'PC');
  const router = devices.find(d => d.type === 'ROUTER') || devices[5];

  const [sourceId, setSourceId] = useState(pcDevices[2]?.name || 'STUDENT-PC'); // Default to Student
  const [destId, setDestId] = useState(pcDevices[0]?.name || 'ADMIN-PC'); // Default to Admin
  const [protocol, setProtocol] = useState<ProtocolType>('ICMP');
  const [packetType, setPacketType] = useState<PacketType>('echo-request');
  const [activeResult, setActiveResult] = useState<ConnectivityTestResult | null>(
    testHistory[0] || null
  );

  // 7 Predefined security test scenarios
  const predefinedScenarios = [
    {
      source: 'ADMIN-PC',
      dest: 'R1',
      protocol: 'ICMP' as ProtocolType,
      packetType: 'echo-request' as PacketType,
      label: 'ADMIN-PC → ADMIN gateway',
      expected: 'ALLOWED',
      desc: 'Local gateway echo test on G0/0.10'
    },
    {
      source: 'ADMIN-PC',
      dest: 'STUDENT-PC',
      protocol: 'ICMP' as ProtocolType,
      packetType: 'echo-request' as PacketType,
      label: 'ADMIN-PC → STUDENT-PC',
      expected: 'ALLOWED',
      desc: 'Admin management traffic permitted inter-VLAN'
    },
    {
      source: 'STUDENT-PC',
      dest: 'ADMIN-PC',
      protocol: 'ICMP' as ProtocolType,
      packetType: 'echo-request' as PacketType,
      label: 'STUDENT-PC → ADMIN-PC',
      expected: 'BLOCKED',
      desc: 'ACL 101: Deny student IP access to admin subnet'
    },
    {
      source: 'GUEST-PC',
      dest: 'ADMIN-PC',
      protocol: 'ICMP' as ProtocolType,
      packetType: 'echo-request' as PacketType,
      label: 'GUEST-PC → ADMIN-PC',
      expected: 'BLOCKED',
      desc: 'ACL 102: Deny guest access to admin subnet'
    },
    {
      source: 'GUEST-PC',
      dest: 'FACULTY-PC',
      protocol: 'ICMP' as ProtocolType,
      packetType: 'echo-request' as PacketType,
      label: 'GUEST-PC → FACULTY-PC',
      expected: 'BLOCKED',
      desc: 'ACL 102: Deny guest access to faculty subnet'
    },
    {
      source: 'GUEST-PC',
      dest: 'LAB-PC',
      protocol: 'ICMP' as ProtocolType,
      packetType: 'echo-request' as PacketType,
      label: 'GUEST-PC → LAB-PC',
      expected: 'BLOCKED',
      desc: 'ACL 102: Deny guest access to engineering lab'
    },
    {
      source: 'GUEST-PC',
      dest: 'R1',
      protocol: 'ICMP' as ProtocolType,
      packetType: 'echo-request' as PacketType,
      label: 'GUEST-PC → GUEST gateway',
      expected: 'ALLOWED',
      desc: 'Guest access to local gateway G0/0.50'
    }
  ];

  const handleExecute = async () => {
    const res = await onRunTest({
      sourceDeviceId: sourceId,
      destDeviceId: destId,
      protocol,
      packetType
    });
    if (res) setActiveResult(res);
  };

  const handleRunPredefined = async (sc: typeof predefinedScenarios[0]) => {
    setSourceId(sc.source);
    setDestId(sc.dest);
    setProtocol(sc.protocol);
    setPacketType(sc.packetType);

    const res = await onRunTest({
      sourceDeviceId: sc.source,
      destDeviceId: sc.dest,
      protocol: sc.protocol,
      packetType: sc.packetType
    });
    if (res) setActiveResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner explaining Stateless ACL & Echo-Reply Exception */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] flex items-start space-x-3 shadow-sm">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">
            Educational ACL Model • Stateless ACL vs Stateful Inspection Notice
          </div>
          <p className="text-slate-400 leading-relaxed">
            In Cisco IOS, Access Control Lists are stateless filters.
            To allow administrative hosts to ping student machines and receive replies without allowing students to initiate unsolicited connections, an explicit <span className="text-cyan-300 font-mono">permit icmp any any echo-reply</span> rule is applied on subinterface G0/0.30.
            This dashboard distinguishes ICMP echo requests from echo replies to accurately simulate Packet Tracer ACL filtering.
          </p>
        </div>
      </div>

      {/* Row 1: Interactive Test Generator & Predefined Quick Scenario Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Custom Test Form (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#1E2E4A]">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Custom Packet Generator</h3>
                <p className="text-xs text-slate-400">Select source, destination, and protocol</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Source Device */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source Device</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-[#111C35] text-slate-200 p-2.5 rounded-lg border border-[#1E2E4A] font-mono focus:outline-none focus:border-cyan-500"
                >
                  {pcDevices.map(pc => (
                    <option key={pc.id} value={pc.name}>
                      {pc.name} ({pc.ip} • VLAN {pc.vlanId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Device */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination Device / Gateway</label>
                <select
                  value={destId}
                  onChange={(e) => setDestId(e.target.value)}
                  className="w-full bg-[#111C35] text-slate-200 p-2.5 rounded-lg border border-[#1E2E4A] font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="R1">R1 Gateway Router (Subinterfaces G0/0.x)</option>
                  {pcDevices.map(pc => (
                    <option key={pc.id} value={pc.name}>
                      {pc.name} ({pc.ip} • VLAN {pc.vlanId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Protocol and Packet Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Protocol</label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value as ProtocolType)}
                    className="w-full bg-[#111C35] text-slate-200 p-2.5 rounded-lg border border-[#1E2E4A] font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ICMP">ICMP (Ping)</option>
                    <option value="HTTP">HTTP (TCP 80)</option>
                    <option value="HTTPS">HTTPS (TCP 443)</option>
                    <option value="SSH">SSH (TCP 22)</option>
                    <option value="DNS">DNS (UDP 53)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ICMP Message Type</label>
                  <select
                    value={packetType}
                    disabled={protocol !== 'ICMP'}
                    onChange={(e) => setPacketType(e.target.value as PacketType)}
                    className="w-full bg-[#111C35] text-slate-200 p-2.5 rounded-lg border border-[#1E2E4A] font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                  >
                    <option value="echo-request">Echo Request (ping)</option>
                    <option value="echo-reply">Echo Reply (pong)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#1E2E4A]">
            <button
              onClick={handleExecute}
              disabled={isTesting}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-current ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Evaluating ACLs & Forwarding...' : 'Run Connectivity Test'}</span>
            </button>
          </div>
        </div>

        {/* 7 Predefined Test Scenarios (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2E4A]">
            <div>
              <h3 className="text-sm font-bold text-white">7 Predefined Security Test Cases</h3>
              <p className="text-xs text-slate-400">Packet Tracer test suite with expected ACL outcomes</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-[#111C35] px-2 py-0.5 rounded border border-[#1E2E4A]">
              Cisco Extended ACL 101 & 102
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {predefinedScenarios.map((sc, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#111C35] border border-[#1E2E4A] flex items-center justify-between hover:border-slate-600 transition-all text-xs"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white font-mono">{sc.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        sc.expected === 'ALLOWED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sc.expected}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{sc.desc}</p>
                </div>

                <button
                  onClick={() => handleRunPredefined(sc)}
                  disabled={isTesting}
                  className="px-3 py-1.5 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white font-medium text-xs flex items-center space-x-1 shrink-0 transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test</span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1E2E4A] text-[11px] text-slate-500 flex justify-between">
            <span>All test executions are saved to event logs and telemetry</span>
            <span>Zero hardware dependency</span>
          </div>
        </div>
      </div>

      {/* Row 2: Detailed Outcome & Step-by-Step Simulated Packet Journey */}
      {activeResult && (
        <div className="p-6 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-md space-y-5">
          {/* Header of Result */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#1E2E4A] gap-3">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeResult.outcome === 'ALLOWED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {activeResult.outcome === 'ALLOWED' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">
                    {activeResult.sourceDevice} → {activeResult.destDevice}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                      activeResult.outcome === 'ALLOWED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {activeResult.outcome}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {activeResult.sourceIp} (VLAN {activeResult.sourceVlan}) ── {activeResult.protocol} ({activeResult.packetType}) ──▶ {activeResult.destIp} (VLAN {activeResult.destVlan})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="bg-[#111C35] px-3 py-1.5 rounded-lg border border-[#1E2E4A]">
                <span className="text-slate-400">Latency: </span>
                <span className="text-white font-bold">{activeResult.latencyMs} ms</span>
              </div>
              <div className="bg-[#111C35] px-3 py-1.5 rounded-lg border border-[#1E2E4A]">
                <span className="text-slate-400">Time: </span>
                <span className="text-slate-300">{new Date(activeResult.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Rule Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-4 rounded-lg bg-[#111C35] border border-[#1E2E4A] space-y-2">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Matching Cisco Policy & Explanation
              </div>
              <div className="p-2.5 rounded bg-[#0B1120] border border-[#1E2E4A] font-mono text-xs text-white">
                {activeResult.matchedRule}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeResult.explanation}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#111C35] border border-[#1E2E4A] space-y-2 text-xs font-mono">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                Filter Specifications
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E2E4A]">
                <span className="text-slate-400">ACL Type:</span>
                <span className="text-cyan-300 text-right">{activeResult.aclType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E2E4A]">
                <span className="text-slate-400">Rule Tag:</span>
                <span className="text-white">{activeResult.ruleId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1E2E4A]">
                <span className="text-slate-400">Source VID:</span>
                <span className="text-emerald-400">VLAN {activeResult.sourceVlan}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Dest VID:</span>
                <span className="text-amber-400">VLAN {activeResult.destVlan}</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Simulated Packet Journey */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Simulated Packet Journey Through Campus Topology</span>
            </h4>

            <div className="space-y-2.5">
              {activeResult.packetJourney.map((hop) => (
                <div
                  key={hop.step}
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-3 transition-all ${
                    hop.status === 'DROPPED'
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                      : 'bg-[#111C35] border-[#1E2E4A] text-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5 ${
                      hop.status === 'DROPPED'
                        ? 'bg-rose-500 text-white'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    }`}
                  >
                    {hop.step}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">{hop.nodeName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0B1120] text-slate-400 font-mono border border-[#1E2E4A]">
                        {hop.nodeType} ({hop.interface})
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          hop.action === 'DROP'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {hop.action}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-normal">{hop.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Recent Test Run History */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2E4A]">
          <div>
            <h3 className="text-sm font-bold text-white">Execution History</h3>
            <p className="text-xs text-slate-400">Cumulative simulated tests in current session</p>
          </div>
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#111C35] border border-[#1E2E4A] transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1E2E4A] text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Matched Cisco Rule</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]">
              {testHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No tests executed yet. Use the test generator above.
                  </td>
                </tr>
              ) : (
                testHistory.map((test) => (
                  <tr key={test.id} className="hover:bg-[#111C35]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {test.sourceDevice} <span className="text-slate-500 font-mono">({test.sourceIp})</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {test.destDevice} <span className="text-slate-500 font-mono">({test.destIp})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{test.protocol}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          test.outcome === 'ALLOWED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {test.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 max-w-xs truncate">
                      {test.matchedRule}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setActiveResult(test)}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
