import React from 'react';
import {
  DashboardStats,
  VLAN,
  Device,
  ConnectivityTestResult
} from '../types/network';
import {
  Layers,
  Laptop,
  Cpu,
  Network,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Activity,
  Play,
  Lock,
  Clock,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  vlans: VLAN[];
  devices: Device[];
  onNavigate: (tab: any) => void;
  onRunPredefinedTest: (source: string, dest: string, label: string) => void;
  isRunningTest?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  vlans,
  devices,
  onNavigate,
  onRunPredefinedTest,
  isRunningTest
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-3">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400 font-mono">Loading campus network telemetry...</p>
        </div>
      </div>
    );
  }

  // Predefined quick test scenarios
  const quickScenarios = [
    { source: 'ADMIN-PC', dest: 'R1', label: 'Admin → Gateway', expected: 'ALLOWED', desc: 'Intra-VLAN local gateway communication' },
    { source: 'ADMIN-PC', dest: 'STUDENT-PC', label: 'Admin → Student', expected: 'ALLOWED', desc: 'Inter-VLAN management access permit' },
    { source: 'STUDENT-PC', dest: 'ADMIN-PC', label: 'Student → Admin', expected: 'BLOCKED', desc: 'Extended ACL 101 restriction' },
    { source: 'GUEST-PC', dest: 'ADMIN-PC', label: 'Guest → Admin', expected: 'BLOCKED', desc: 'Extended ACL 102 guest isolation' },
  ];

  const pieColors = ['#10B981', '#F43F5E', '#F59E0B'];

  return (
    <div className="space-y-6">
      {/* Educational Notice Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] flex items-start space-x-3 shadow-md">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">
            Educational Simulation Notice & Project Scope
          </div>
          <p className="text-slate-400 leading-relaxed">
            This dashboard simulates network behavior locally based on the campus Cisco Packet Tracer topology.
            It models router-on-a-stick subinterfaces on <span className="text-cyan-300 font-mono">Cisco 2911 (R1)</span>, 802.1Q dot1q trunking on <span className="text-blue-300 font-mono">Cisco 2960 (S1)</span>, sticky MAC port security, and Cisco Extended ACL policies.
            Live Cisco hardware connection is not implied; Packet Tracer remains the reference simulator.
          </p>
        </div>
      </div>

      {/* Top Metric Cards: 4 Key Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total VLANs */}
        <div
          onClick={() => onNavigate('vlans')}
          className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total VLANs</span>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-mono">{stats.totalVlans}</span>
            <span className="text-xs text-emerald-400 font-medium">10, 20, 30, 40, 50</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Segmented subnets</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">View →</span>
          </p>
        </div>

        {/* Metric 2: Total End Devices */}
        <div
          onClick={() => onNavigate('topology')}
          className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">End Devices</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-mono">{stats.totalDevices}</span>
            <span className="text-xs text-blue-400 font-medium">All Online via DHCP</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fa0/1 to Fa0/5 Access Ports</span>
            <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">Topology →</span>
          </p>
        </div>

        {/* Metric 3: Security Policies */}
        <div
          onClick={() => onNavigate('security')}
          className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Security Policies</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-mono">{stats.securityPoliciesCount}</span>
            <span className="text-xs text-emerald-400 font-medium">ACLs, PortSec, SSH</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Enforced on R1 / S1</span>
            <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">Test ACLs →</span>
          </p>
        </div>

        {/* Metric 4: Port Violations */}
        <div
          onClick={() => onNavigate('port-security')}
          className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] hover:border-amber-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Port Violations</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-mono">{stats.totalViolations}</span>
            <span className={`text-xs font-medium ${stats.totalViolations > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {stats.totalViolations > 0 ? 'Restrict Drops Active' : '0 Dropped Frames'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Sticky MAC Restrict Mode</span>
            <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">Ports →</span>
          </p>
        </div>
      </div>

      {/* Second Row: Charts & Security Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Allowed vs Blocked Traffic Distribution */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Simulated Traffic Outcomes</h3>
              <p className="text-xs text-slate-400">Inter-VLAN ACL filtration ratio</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              {stats.totalTestsRun} Tests Run
            </span>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.trafficDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.trafficDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E2E4A', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-[#1E2E4A] text-xs">
            <div className="p-2 rounded bg-[#111C35] flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Allowed:
              </span>
              <span className="font-mono text-white font-bold">{stats.allowedCount}</span>
            </div>
            <div className="p-2 rounded bg-[#111C35] flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Blocked:
              </span>
              <span className="font-mono text-white font-bold">{stats.blockedCount}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: VLAN Traffic Analysis */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Traffic by VLAN Segment</h3>
              <p className="text-xs text-slate-400">Activity & filtration per subnet</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">VLAN 10-50</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.vlanTrafficStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E2E4A', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={25}
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
                <Bar dataKey="allowed" name="Allowed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" name="Blocked" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto pt-3 border-t border-[#1E2E4A] text-[11px] text-slate-400 flex justify-between">
            <span>Student & Guest subnets show highest denial rates</span>
            <button
              onClick={() => onNavigate('vlans')}
              className="text-cyan-400 hover:underline"
            >
              VLAN Details →
            </button>
          </div>
        </div>

        {/* Security Status Summary Card */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Security Posture Summary</h3>
              <p className="text-xs text-slate-400">Cisco Packet Tracer verified status</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium">
              HARDENED
            </span>
          </div>

          <div className="space-y-2.5 my-auto text-xs">
            {/* Policy item 1 */}
            <div className="p-2.5 rounded-lg bg-[#111C35] border border-[#1E2E4A] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-slate-200 font-semibold">ACL 101: Student Subnet Isolation</div>
                  <div className="text-[11px] text-slate-400">Blocks Student → Admin (Permits echo-reply)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>

            {/* Policy item 2 */}
            <div className="p-2.5 rounded-lg bg-[#111C35] border border-[#1E2E4A] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-slate-200 font-semibold">ACL 102: Guest Subnet Sandbox</div>
                  <div className="text-[11px] text-slate-400">Blocks Guest → 192.168.0.0/16 internal</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>

            {/* Policy item 3 */}
            <div className="p-2.5 rounded-lg bg-[#111C35] border border-[#1E2E4A] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-slate-200 font-semibold">Switchport Port Security</div>
                  <div className="text-[11px] text-slate-400">Sticky MAC, Max 1, Violation: Restrict</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                RESTRICT
              </span>
            </div>

            {/* Policy item 4 */}
            <div className="p-2.5 rounded-lg bg-[#111C35] border border-[#1E2E4A] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-slate-200 font-semibold">SSH v2 & Local Authentication</div>
                  <div className="text-[11px] text-slate-400">RSA-2048, Telnet Disabled on VTY 0 4</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                ENCRYPTED
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#1E2E4A] flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">Router: R1 (Cisco 2911)</span>
            <span className="text-slate-400 font-mono">Switch: S1 (Cisco 2960)</span>
          </div>
        </div>
      </div>

      {/* Third Row: Predefined Quick Connectivity Tests & Recent Events Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predefined Quick Tests */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Quick Educational Scenarios</h3>
              <p className="text-xs text-slate-400">Execute key network security demonstration test cases</p>
            </div>
            <button
              onClick={() => onNavigate('security')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>Full Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {quickScenarios.map((sc, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-[#111C35] border border-[#1E2E4A] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white font-mono">{sc.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
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
                  onClick={() => onRunPredefinedTest(sc.source, sc.dest, sc.label)}
                  disabled={isRunningTest}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-sm transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events Feed */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Recent Simulated Events</h3>
              <p className="text-xs text-slate-400">Live stream of ACL drops, pings & port events</p>
            </div>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-72 flex-1 pr-1">
            {stats.recentEvents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No recent events recorded.</p>
            ) : (
              stats.recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg bg-[#111C35] border border-[#1E2E4A] flex items-start space-x-3 text-xs"
                >
                  <div className="mt-0.5 shrink-0">
                    {evt.outcome === 'ALLOWED' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {evt.outcome === 'BLOCKED' && <XCircle className="w-4 h-4 text-rose-400" />}
                    {evt.outcome === 'ALERT' && <ShieldAlert className="w-4 h-4 text-amber-400" />}
                    {evt.outcome === 'INFO' && <Activity className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 truncate">{evt.type.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{evt.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
