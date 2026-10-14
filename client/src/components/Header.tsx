import React from 'react';
import { Shield, Radio, Terminal, AlertCircle, RefreshCw } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Campus NOC Operations & Security Center',
    subtitle: 'Real-time telemetry, VLAN segmentation status, and inter-VLAN ACL enforcement'
  },
  topology: {
    title: 'Interactive Campus Network Topology',
    subtitle: 'Physical & logical diagram for Cisco 2911 (R1), Cisco 2960 (S1), and 5 Access VLAN PCs'
  },
  vlans: {
    title: 'VLAN Segmentation & Subnet Directory',
    subtitle: 'IEEE 802.1Q subinterface mapping, network masks, and subnet boundaries'
  },
  security: {
    title: 'Network Security Testing Lab & ACL Engine',
    subtitle: 'Simulate packet journeys, evaluate Cisco Extended ACL 101/102 rules, and trace forwarding'
  },
  dhcp: {
    title: 'DHCP Scope & Lease Monitor',
    subtitle: 'Router R1 DHCP pool allocations, DNS assignments, and simulated host leases'
  },
  'port-security': {
    title: 'Switch Port Security & MAC Learning',
    subtitle: 'Catalyst 2960 sticky MAC enforcement, restrict violation mode, and intruder simulation'
  },
  ssh: {
    title: 'SSH Management & Cisco IOS Configuration',
    subtitle: 'Secure administrative access (v2), RSA-2048 encryption, local auth, and MOTD banner'
  },
  logs: {
    title: 'Security Audit Logs & PBL Demonstration Report',
    subtitle: 'Chronological test results, ACL violation events, CSV export, and print summary'
  }
};

export const Header: React.FC<HeaderProps> = ({ activeTab, onRefresh, isRefreshing }) => {
  const current = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <header className="bg-[#0A0F1D] border-b border-[#1E2E4A] px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print select-none">
      <div>
        <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono mb-1">
          <Shield className="w-3.5 h-3.5" />
          <span>COLLEGE PBL: SECURE CAMPUS NETWORK</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">CISCO 2911 ROUTER-ON-A-STICK</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">{current.title}</h2>
        <p className="text-xs text-slate-400">{current.subtitle}</p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Educational Simulation Notice Tag */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111C35] border border-cyan-500/20 text-xs">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Packet Tracer Topology:</span>
          <span className="text-cyan-300 font-mono font-medium">1 Router • 1 Switch • 5 Hosts</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#162036] hover:bg-[#1E2E4A] text-slate-200 text-xs font-medium border border-[#1E2E4A] transition-all disabled:opacity-50"
            title="Refresh network telemetry from simulation store"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};
