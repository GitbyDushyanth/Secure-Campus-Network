import React from 'react';
import {
  LayoutDashboard,
  Network,
  Layers,
  ShieldCheck,
  Server,
  Lock,
  Terminal,
  FileText,
  Radio,
  Cpu
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'topology'
  | 'vlans'
  | 'security'
  | 'dhcp'
  | 'port-security'
  | 'ssh'
  | 'logs';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  routerStatus?: string;
  switchStatus?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  routerStatus = 'ONLINE',
  switchStatus = 'ONLINE'
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'topology' as ActiveTab, label: 'Network Topology', icon: Network, badge: 'Interactive' },
    { id: 'vlans' as ActiveTab, label: 'VLAN Management', icon: Layers, badge: '5 Segments' },
    { id: 'security' as ActiveTab, label: 'Security Lab & ACL', icon: ShieldCheck, badge: 'Testing' },
    { id: 'dhcp' as ActiveTab, label: 'DHCP Monitor', icon: Server, badge: 'Pools & Leases' },
    { id: 'port-security' as ActiveTab, label: 'Port Security', icon: Lock, badge: 'Restrict Mode' },
    { id: 'ssh' as ActiveTab, label: 'SSH & Device Config', icon: Terminal, badge: 'Cisco 2911' },
    { id: 'logs' as ActiveTab, label: 'Event Logs & Report', icon: FileText, badge: 'Audit/CSV' },
  ];

  return (
    <aside className="w-64 bg-[#0A0F1D] border-r border-[#1E2E4A] flex flex-col h-screen shrink-0 no-print select-none">
      {/* Brand & Project Info */}
      <div className="p-5 border-b border-[#1E2E4A]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Campus NOC</h1>
            <p className="text-xs text-cyan-400 font-mono">Campus Network Sec</p>
          </div>
        </div>
        <div className="mt-3 py-1.5 px-2.5 rounded bg-[#111C35] border border-[#1E2E4A] flex items-center justify-between text-xs">
          <span className="text-slate-400">Simulation:</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE (Local)
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Management & Analysis
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C35]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-[#162036] text-slate-400'
                }`}
              >
                {item.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Hardware Status Widget */}
      <div className="p-4 border-t border-[#1E2E4A] bg-[#080D1A]/60">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Packet Tracer Topology</span>
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded bg-[#0F172A] border border-[#1E2E4A]">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 font-semibold">R1 (2911)</span>
            </div>
            <span className="text-emerald-400 text-[11px] font-bold">G0/0 UP</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-[#0F172A] border border-[#1E2E4A]">
            <div className="flex items-center space-x-2">
              <Network className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300 font-semibold">S1 (2960)</span>
            </div>
            <span className="text-emerald-400 text-[11px] font-bold">G0/1 TRUNK</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-slate-500 text-center">
          Educational simulation • RFC 1918
        </p>
      </div>
    </aside>
  );
};
