import React from 'react';
import { DHCPPool, DHCPLease } from '../types/network';
import {
  Server,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  Laptop,
  Code,
  ShieldCheck
} from 'lucide-react';

interface DhcpViewProps {
  pools: DHCPPool[];
  leases: DHCPLease[];
}

export const DhcpView: React.FC<DhcpViewProps> = ({ pools, leases }) => {
  return (
    <div className="space-y-6">
      {/* Educational Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] flex items-start space-x-3 shadow-sm">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">
            Educational DHCP Scope Model • Cisco IOS Emulation Notice
          </div>
          <p className="text-slate-400 leading-relaxed">
            All 5 VLAN subnets are serviced by the Cisco 2911 router acting as a centralized DHCP server.
            Addresses <span className="text-cyan-300 font-mono">.1 through .9</span> are strictly excluded for network infrastructure (default gateways, switch management SVIs, and future static assets).
            Host leases below represent simulated educational assignments conforming to Packet Tracer topologies.
          </p>
        </div>
      </div>

      {/* Row 1: 5 DHCP Pools Cards */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Server className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Router R1 DHCP Scope Pools (5 VLANs)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {pools.map((pool) => (
            <div
              key={pool.vlanId}
              className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-white">{pool.vlanName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    VID {pool.vlanId}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-[#111C35] p-2.5 rounded-lg border border-[#1E2E4A]">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Network:</span>
                    <span className="text-white font-bold">{pool.networkAddress}/24</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Default Router:</span>
                    <span className="text-cyan-400">{pool.defaultGateway}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">DNS Server:</span>
                    <span>{pool.dnsServer}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Excluded Range:</span>
                    <span className="text-amber-400 text-[10px]">{pool.excludedRange}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1E2E4A] text-[10px] text-slate-400 flex justify-between">
                <span>Demo Lease:</span>
                <span className="font-mono text-emerald-400 font-bold">{pool.exampleLease}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Active Simulated Leases Table */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2E4A]">
          <div>
            <h3 className="text-sm font-bold text-white">Simulated Active DHCP Leases</h3>
            <p className="text-xs text-slate-400">Host IP assignments matching Packet Tracer demonstration</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-[#111C35] border border-[#1E2E4A] font-mono text-cyan-300">
            5/5 Leases Bound
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1E2E4A] text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-2.5 px-3">Device Name</th>
                <th className="py-2.5 px-3">Assigned IP</th>
                <th className="py-2.5 px-3">MAC Address</th>
                <th className="py-2.5 px-3">VLAN Segment</th>
                <th className="py-2.5 px-3">Switch Port</th>
                <th className="py-2.5 px-3">Lease Status</th>
                <th className="py-2.5 px-3">TTL Remaining</th>
                <th className="py-2.5 px-3 text-right">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]">
              {leases.map((lease) => (
                <tr key={lease.id} className="hover:bg-[#111C35]/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center space-x-2">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    <span>{lease.deviceName}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{lease.ip}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{lease.mac}</td>
                  <td className="py-3 px-3 font-mono">
                    <span className="bg-[#111C35] px-2 py-0.5 rounded border border-[#1E2E4A] text-slate-200">
                      VLAN {lease.vlanId} ({lease.vlanName})
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-400 font-bold">{lease.port}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center w-fit space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{lease.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{lease.expiresIn}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111C35] text-slate-400 border border-[#1E2E4A]">
                      Demo Seeded
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Cisco IOS DHCP Configuration Commands Snippet */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
        <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#1E2E4A]">
          <Code className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Cisco IOS DHCP Pool Implementation Template</h4>
        </div>
        <pre className="p-3 rounded-lg bg-[#080D1A] border border-[#1E2E4A] text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
{`! Exclude default gateway and management reserved IP addresses
R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.9
R1(config)# ip dhcp excluded-address 192.168.20.1 192.168.20.9
R1(config)# ip dhcp excluded-address 192.168.30.1 192.168.30.9
R1(config)# ip dhcp excluded-address 192.168.40.1 192.168.40.9
R1(config)# ip dhcp excluded-address 192.168.50.1 192.168.50.9
!
! Example Pool for Students VLAN
R1(config)# ip dhcp pool POOL-STUDENTS
R1(dhcp-config)# network 192.168.30.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.30.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# lease 1 0 0`}
        </pre>
      </div>
    </div>
  );
};
