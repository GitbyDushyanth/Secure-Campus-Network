import React, { useState } from 'react';
import { EventLog, ConnectivityTestResult, VLAN, DashboardStats } from '../types/network';
import {
  FileText,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Activity,
  Layers,
  Search,
  Check
} from 'lucide-react';

interface LogsViewProps {
  logs: EventLog[];
  testHistory: ConnectivityTestResult[];
  vlans: VLAN[];
  stats: DashboardStats | null;
}

export const LogsView: React.FC<LogsViewProps> = ({
  logs,
  testHistory,
  vlans,
  stats
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [vlanFilter, setVlanFilter] = useState<string>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrintingReport, setIsPrintingReport] = useState(false);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (typeFilter !== 'ALL' && log.type !== typeFilter) return false;
    if (vlanFilter !== 'ALL' && log.vlanId !== parseInt(vlanFilter, 10)) return false;
    if (outcomeFilter !== 'ALL' && log.outcome !== outcomeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        log.description.toLowerCase().includes(q) ||
        (log.source && log.source.toLowerCase().includes(q)) ||
        (log.destination && log.destination.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar: Export CSVs and Print Report */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] flex flex-wrap items-center justify-between gap-4 shadow-sm no-print">
        <div>
          <h3 className="text-sm font-bold text-white">Security Event Telemetry & Audit Logs</h3>
          <p className="text-xs text-slate-400">
            Export test summaries, compliance logs, or generate printable demonstration report
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <a
            href="/api/export/tests.csv"
            download="campus_network_tests.csv"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111C35] hover:bg-[#1E2E4A] text-slate-200 text-xs font-medium border border-[#1E2E4A] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Tests (CSV)</span>
          </a>

          <a
            href="/api/export/logs.csv"
            download="campus_network_event_logs.csv"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111C35] hover:bg-[#1E2E4A] text-slate-200 text-xs font-medium border border-[#1E2E4A] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Logs (CSV)</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Network Report</span>
          </button>
        </div>
      </div>

      {/* PRINT-FRIENDLY DEMONSTRATION SECTION */}
      {/* Visible only on print or expandable */}
      <div className="hidden print:block p-8 bg-white text-black space-y-6">
        <div className="border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            Design and Implementation of a Secure Campus Network
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Network Architecture & Security Evaluation Report • Topology: Cisco 2911 Router + Cisco 2960 Switch + 5 VLANs
          </p>
          <div className="mt-2 text-xs text-gray-600">
            Generated on: {new Date().toLocaleString()} • Evaluation Host: Local Simulator
          </div>
        </div>

        {/* Print Summary Table */}
        <div>
          <h2 className="text-base font-bold mb-2 uppercase">1. VLAN Segmentation Architecture</h2>
          <table className="w-full text-xs border border-gray-400 text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="p-2 border-r border-gray-400">VID</th>
                <th className="p-2 border-r border-gray-400">VLAN Name</th>
                <th className="p-2 border-r border-gray-400">Subnet Mask</th>
                <th className="p-2 border-r border-gray-400">Default Gateway</th>
                <th className="p-2 border-r border-gray-400">Access Port</th>
                <th className="p-2 border-r border-gray-400">Host Device</th>
                <th className="p-2">Role & Purpose</th>
              </tr>
            </thead>
            <tbody>
              {vlans.map((v) => (
                <tr key={v.id} className="border-b border-gray-300">
                  <td className="p-2 border-r border-gray-400 font-bold">{v.id}</td>
                  <td className="p-2 border-r border-gray-400">{v.name}</td>
                  <td className="p-2 border-r border-gray-400">{v.subnet}</td>
                  <td className="p-2 border-r border-gray-400">{v.gateway}</td>
                  <td className="p-2 border-r border-gray-400">{v.switchPort}</td>
                  <td className="p-2 border-r border-gray-400">{v.deviceName}</td>
                  <td className="p-2">{v.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Print Security Lab Summary */}
        <div>
          <h2 className="text-base font-bold mb-2 uppercase">2. Access Control List (ACL) Test Verification</h2>
          <table className="w-full text-xs border border-gray-400 text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="p-2 border-r border-gray-400">Source Host</th>
                <th className="p-2 border-r border-gray-400">Destination</th>
                <th className="p-2 border-r border-gray-400">Proto</th>
                <th className="p-2 border-r border-gray-400">Outcome</th>
                <th className="p-2">Matching Cisco IOS Policy Rule</th>
              </tr>
            </thead>
            <tbody>
              {testHistory.map((t) => (
                <tr key={t.id} className="border-b border-gray-300">
                  <td className="p-2 border-r border-gray-400 font-bold">{t.sourceDevice} ({t.sourceIp})</td>
                  <td className="p-2 border-r border-gray-400">{t.destDevice} ({t.destIp})</td>
                  <td className="p-2 border-r border-gray-400">{t.protocol}</td>
                  <td className="p-2 border-r border-gray-400 font-bold">
                    {t.outcome}
                  </td>
                  <td className="p-2 text-xs">{t.matchedRule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Print Port Security Summary */}
        <div>
          <h2 className="text-base font-bold mb-2 uppercase">3. Switch Port Security Verification</h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            All access ports (Fa0/1 - Fa0/5) configured with sticky MAC learning and restrict mode.
            Rogue frames with unauthorized source MACs are actively dropped while the port remains in UP state.
            Trunk port G0/1 maintains 802.1Q dot1q encapsulation to Router R1 without port-security restrictions.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS (Screen view) */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] space-y-3 no-print">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filter Telemetry Logs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div>
            <label className="block text-slate-400 mb-1">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search IPs, ports, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111C35] text-slate-200 px-3 py-2 pl-8 rounded-lg border border-[#1E2E4A] focus:outline-none focus:border-cyan-500 font-sans"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Event Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#111C35] text-slate-200 p-2 rounded-lg border border-[#1E2E4A] font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Event Types</option>
              <option value="CONNECTIVITY_TEST">Connectivity Tests</option>
              <option value="ACL_DENIED">ACL Denials</option>
              <option value="PORT_SECURITY_VIOLATION">Port Security Violations</option>
              <option value="DHCP_LEASE">DHCP Leases</option>
              <option value="CONFIG_VIEW">Config Views</option>
              <option value="SYSTEM_EVENT">System Events</option>
            </select>
          </div>

          {/* VLAN Filter */}
          <div>
            <label className="block text-slate-400 mb-1">VLAN Scope</label>
            <select
              value={vlanFilter}
              onChange={(e) => setVlanFilter(e.target.value)}
              className="w-full bg-[#111C35] text-slate-200 p-2 rounded-lg border border-[#1E2E4A] font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All VLANs</option>
              <option value="10">VLAN 10 (ADMIN)</option>
              <option value="20">VLAN 20 (FACULTY)</option>
              <option value="30">VLAN 30 (STUDENTS)</option>
              <option value="40">VLAN 40 (LAB)</option>
              <option value="50">VLAN 50 (GUEST)</option>
            </select>
          </div>

          {/* Outcome Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Outcome / Severity</label>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="w-full bg-[#111C35] text-slate-200 p-2 rounded-lg border border-[#1E2E4A] font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="ALLOWED">Allowed</option>
              <option value="BLOCKED">Blocked</option>
              <option value="ALERT">Alert / Violation</option>
              <option value="INFO">Informational</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Logs Table (Screen View) */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm no-print">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2E4A]">
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredLogs.length} matching events
          </span>
          <span className="text-xs font-mono text-cyan-400">Real-time In-memory Store</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1E2E4A] text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">VLAN</th>
                <th className="py-2.5 px-3">Source → Destination</th>
                <th className="py-2.5 px-3">Outcome</th>
                <th className="py-2.5 px-3">Description & Rule Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#111C35]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[11px] text-slate-200 font-semibold">
                        {log.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {log.vlanId ? (
                        <span className="text-cyan-400 font-bold">VLAN {log.vlanId}</span>
                      ) : (
                        <span className="text-slate-500">Global</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {log.source || 'N/A'} {log.destination ? `→ ${log.destination}` : ''}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          log.outcome === 'ALLOWED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.outcome === 'BLOCKED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : log.outcome === 'ALERT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {log.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-xs leading-normal">
                      {log.description}
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
