import {
  DashboardStats,
  VLAN,
  Device,
  ConnectivityTestResult,
  DHCPPool,
  DHCPLease,
  PortSecurityState,
  SSHConfig,
  EventLog,
  ProtocolType,
  PacketType
} from '../types/network';

const API_BASE = '/api';

export const api = {
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch stats');
    return json.data;
  },

  async getVlans(): Promise<VLAN[]> {
    const res = await fetch(`${API_BASE}/vlans`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch VLANs');
    return json.data;
  },

  async updateVlan(id: number, data: Partial<VLAN>): Promise<VLAN> {
    const res = await fetch(`${API_BASE}/vlans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update VLAN');
    return json.data;
  },

  async getDevices(): Promise<Device[]> {
    const res = await fetch(`${API_BASE}/devices`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch devices');
    return json.data;
  },

  async runTest(params: {
    sourceDeviceId: string;
    destDeviceId: string;
    protocol?: ProtocolType;
    packetType?: PacketType;
  }): Promise<ConnectivityTestResult> {
    const res = await fetch(`${API_BASE}/security/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Connectivity test failed');
    return json.data;
  },

  async getTestHistory(): Promise<ConnectivityTestResult[]> {
    const res = await fetch(`${API_BASE}/security/history`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch test history');
    return json.data;
  },

  async clearTestHistory(): Promise<void> {
    const res = await fetch(`${API_BASE}/security/history`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to clear test history');
  },

  async getDhcpPools(): Promise<DHCPPool[]> {
    const res = await fetch(`${API_BASE}/dhcp/pools`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch DHCP pools');
    return json.data;
  },

  async getDhcpLeases(): Promise<DHCPLease[]> {
    const res = await fetch(`${API_BASE}/dhcp/leases`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch DHCP leases');
    return json.data;
  },

  async getPortSecurity(): Promise<PortSecurityState[]> {
    const res = await fetch(`${API_BASE}/port-security`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch port security');
    return json.data;
  },

  async simulateViolation(port: string): Promise<PortSecurityState> {
    const res = await fetch(`${API_BASE}/port-security/simulate-violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to simulate violation');
    return json.data;
  },

  async resetPortSecurity(port?: string): Promise<PortSecurityState[]> {
    const res = await fetch(`${API_BASE}/port-security/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to reset port security');
    return json.data;
  },

  async getSshConfig(): Promise<SSHConfig> {
    const res = await fetch(`${API_BASE}/ssh/config`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch SSH config');
    return json.data;
  },

  async getLogs(filters?: { type?: string; vlan?: number; outcome?: string }): Promise<EventLog[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.vlan) params.append('vlan', filters.vlan.toString());
    if (filters?.outcome) params.append('outcome', filters.outcome);

    const res = await fetch(`${API_BASE}/logs?${params.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch logs');
    return json.data;
  }
};
