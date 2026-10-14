import React, { useState } from 'react';
import { VLAN } from '../types/network';
import {
  Layers,
  Edit2,
  Check,
  X,
  Info,
  Shield,
  Server,
  Network,
  Cpu,
  Code
} from 'lucide-react';

interface VlanViewProps {
  vlans: VLAN[];
  onUpdateVlan?: (id: number, data: Partial<VLAN>) => Promise<void>;
}

export const VlanView: React.FC<VlanViewProps> = ({ vlans, onUpdateVlan }) => {
  const [editingVlan, setEditingVlan] = useState<VLAN | null>(null);
  const [purposeInput, setPurposeInput] = useState('');
  const [selectedVlan, setSelectedVlan] = useState<VLAN | null>(vlans[0] || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const startEdit = (vlan: VLAN) => {
    setEditingVlan(vlan);
    setPurposeInput(vlan.purpose);
  };

  const handleSave = async () => {
    if (!editingVlan || !onUpdateVlan) return;
    setIsSaving(true);
    try {
      await onUpdateVlan(editingVlan.id, { purpose: purposeInput });
      setEditingVlan(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Notice Alert */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] flex items-start space-x-3 shadow-sm">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">
            Educational Scope Notice • VLAN Segmentation Model
          </div>
          <p className="text-slate-400 leading-relaxed">
            This module displays IEEE 802.1Q VLAN segmentation across the campus access layer.
            Any metadata edits are strictly confined to the simulated application database and do not reconfigure real Cisco hardware.
            Physical Packet Tracer configs use standard Cisco IOS encapsulation syntax shown in the reference card.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Simulated VLAN metadata successfully updated in data store!</span>
        </div>
      )}

      {/* Main VLAN Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vlans.map((vlan) => {
          const isSelected = selectedVlan?.id === vlan.id;
          return (
            <div
              key={vlan.id}
              onClick={() => setSelectedVlan(vlan)}
              className={`p-5 rounded-xl bg-[#0F172A] border-2 transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                isSelected
                  ? 'border-cyan-400 bg-[#141E34] ring-1 ring-cyan-500/30'
                  : 'border-[#1E2E4A] hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                      style={{ backgroundColor: `${vlan.color}25`, color: vlan.color }}
                    >
                      {vlan.id}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">{vlan.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">VLAN {vlan.id}</span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                    style={{ backgroundColor: `${vlan.color}20`, color: vlan.color, border: `1px solid ${vlan.color}40` }}
                  >
                    802.1Q Active
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono bg-[#111C35] p-3 rounded-lg border border-[#1E2E4A]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Subnet:</span>
                    <span className="text-white font-bold">{vlan.subnet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Gateway:</span>
                    <span className="text-cyan-400">{vlan.gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Switch Access Port:</span>
                    <span className="text-amber-400 font-bold">{vlan.switchPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Router Subif:</span>
                    <span className="text-blue-400">{vlan.routerSubinterface}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Host Device:</span>
                    <span className="text-slate-200">{vlan.deviceName}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Purpose & Role:</span>
                  <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-2">{vlan.purpose}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E2E4A] flex items-center justify-between text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(vlan);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Purpose</span>
                </button>
                <span className="text-[11px] text-slate-500 font-mono">Netmask /24</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail & Cisco Configuration Reference for Selected VLAN */}
      {selectedVlan && (
        <div className="p-6 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1E2E4A]">
            <div className="flex items-center space-x-3">
              <Code className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Cisco Packet Tracer IOS Commands: VLAN {selectedVlan.id} ({selectedVlan.name})
                </h3>
                <p className="text-xs text-slate-400">
                  Switch VLAN database and Router-on-a-stick subinterface configuration
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
              Gateway: {selectedVlan.gateway}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Switch 2960 config */}
            <div>
              <span className="text-xs font-bold text-blue-400 font-mono block mb-1.5 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                S1 (Cisco 2960 Switch) Configuration
              </span>
              <pre className="p-3 rounded-lg bg-[#080D1A] border border-[#1E2E4A] text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`S1(config)# vlan ${selectedVlan.id}
S1(config-vlan)# name ${selectedVlan.name}
S1(config-vlan)# exit
!
S1(config)# interface ${selectedVlan.switchPort}
S1(config-if)# description Connected to ${selectedVlan.deviceName}
S1(config-if)# switchport mode access
S1(config-if)# switchport access vlan ${selectedVlan.id}
S1(config-if)# switchport port-security
S1(config-if)# switchport port-security maximum 1
S1(config-if)# switchport port-security violation restrict
S1(config-if)# switchport port-security mac-address sticky`}
              </pre>
            </div>

            {/* Router 2911 config */}
            <div>
              <span className="text-xs font-bold text-cyan-400 font-mono block mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                R1 (Cisco 2911 Router) Subinterface
              </span>
              <pre className="p-3 rounded-lg bg-[#080D1A] border border-[#1E2E4A] text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`R1(config)# interface ${selectedVlan.routerSubinterface}
R1(config-subif)# description Default Gateway for ${selectedVlan.name}
R1(config-subif)# encapsulation dot1Q ${selectedVlan.id}
R1(config-subif)# ip address ${selectedVlan.gateway} ${selectedVlan.mask}
${selectedVlan.id === 30 ? 'R1(config-subif)# ip access-group 101 in' : ''}${selectedVlan.id === 50 ? 'R1(config-subif)# ip access-group 102 in' : ''}
!
R1(config)# ip dhcp pool POOL-${selectedVlan.name}
R1(dhcp-config)# network ${selectedVlan.subnet.replace('/24', '')} ${selectedVlan.mask}
R1(dhcp-config)# default-router ${selectedVlan.gateway}
R1(dhcp-config)# dns-server 8.8.8.8`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Simulated data model) */}
      {editingVlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E2E4A] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2E4A]">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  Edit VLAN {editingVlan.id} ({editingVlan.name}) Purpose
                </h4>
              </div>
              <button onClick={() => setEditingVlan(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Note: This edit updates the educational simulation metadata store.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">VLAN Purpose / Role Description</label>
              <textarea
                value={purposeInput}
                onChange={(e) => setPurposeInput(e.target.value)}
                rows={3}
                className="w-full bg-[#111C35] text-slate-200 text-xs p-3 rounded-lg border border-[#1E2E4A] focus:outline-none focus:border-cyan-500 font-sans"
                placeholder="Enter description of VLAN role..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingVlan(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-[#1E2E4A]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 rounded text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 flex items-center space-x-1"
              >
                {isSaving ? <span>Saving...</span> : <span>Save Simulation</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
