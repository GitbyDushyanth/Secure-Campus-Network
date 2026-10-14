import {
  Device,
  VLAN,
  DHCPPool,
  DHCPLease,
  PortSecurityState,
  SSHConfig,
  EventLog,
  ConnectivityTestResult,
  ConnectivityTestRequest
} from '../types/network.js';
import {
  SEEDED_DEVICES,
  SEEDED_VLANS,
  SEEDED_DHCP_POOLS,
  SEEDED_DHCP_LEASES,
  SEEDED_PORT_SECURITY,
  SEEDED_SSH_CONFIG,
  SEEDED_INITIAL_LOGS
} from '../data/seededData.js';
import { evaluateNetworkPolicy } from './networkPolicy.js';

class NetworkDataStore {
  private devices: Device[] = [...SEEDED_DEVICES];
  private vlans: VLAN[] = [...SEEDED_VLANS];
  private dhcpPools: DHCPPool[] = [...SEEDED_DHCP_POOLS];
  private dhcpLeases: DHCPLease[] = [...SEEDED_DHCP_LEASES];
  private portSecurity: PortSecurityState[] = [...SEEDED_PORT_SECURITY];
  private sshConfig: SSHConfig = { ...SEEDED_SSH_CONFIG };
  private testHistory: ConnectivityTestResult[] = [];
  private eventLogs: EventLog[] = [...SEEDED_INITIAL_LOGS];

  constructor() {
    // Seed some initial predefined test runs so the dashboard has rich initial analytics
    this.seedInitialTests();
  }

  private seedInitialTests() {
    const initialTests: ConnectivityTestRequest[] = [
      { sourceDeviceId: 'ADMIN-PC', destDeviceId: 'R1' },
      { sourceDeviceId: 'ADMIN-PC', destDeviceId: 'STUDENT-PC' },
      { sourceDeviceId: 'STUDENT-PC', destDeviceId: 'ADMIN-PC' },
      { sourceDeviceId: 'GUEST-PC', destDeviceId: 'ADMIN-PC' },
      { sourceDeviceId: 'GUEST-PC', destDeviceId: 'FACULTY-PC' },
      { sourceDeviceId: 'GUEST-PC', destDeviceId: 'LAB-PC' },
      { sourceDeviceId: 'GUEST-PC', destDeviceId: 'R1' }
    ];

    for (const testReq of initialTests) {
      try {
        const result = evaluateNetworkPolicy(testReq, this.devices);
        this.testHistory.push(result);
      } catch (e) {
        // ignore init errors
      }
    }
  }

  // --- Topology / Devices / VLANs ---
  getDevices(): Device[] {
    return this.devices;
  }

  getDeviceById(id: string): Device | undefined {
    return this.devices.find(d => d.id === id || d.name === id);
  }

  getVLANs(): VLAN[] {
    return this.vlans;
  }

  getVlanById(id: number): VLAN | undefined {
    return this.vlans.find(v => v.id === id);
  }

  updateVLAN(id: number, updates: Partial<VLAN>): VLAN {
    const index = this.vlans.findIndex(v => v.id === id);
    if (index === -1) throw new Error(`VLAN ${id} not found`);
    this.vlans[index] = { ...this.vlans[index], ...updates };

    this.addEventLog({
      type: 'CONFIG_VIEW',
      vlanId: id,
      vlanName: this.vlans[index].name,
      outcome: 'INFO',
      description: `Simulated VLAN ${id} (${this.vlans[index].name}) metadata updated. Note: Confined to simulation model.`,
      severity: 'low'
    });

    return this.vlans[index];
  }

  // --- Network Security Lab Testing ---
  runConnectivityTest(req: ConnectivityTestRequest): ConnectivityTestResult {
    const result = evaluateNetworkPolicy(req, this.devices);
    this.testHistory.unshift(result);

    // Add corresponding event log
    this.addEventLog({
      type: result.outcome === 'ALLOWED' ? 'CONNECTIVITY_TEST' : 'ACL_DENIED',
      vlanId: result.sourceVlan,
      source: `${result.sourceDevice} (${result.sourceIp})`,
      destination: `${result.destDevice} (${result.destIp})`,
      outcome: result.outcome,
      description: `${result.protocol} packet from ${result.sourceDevice} to ${result.destDevice} ${result.outcome}. Rule: [${result.matchedRule}].`,
      severity: result.outcome === 'ALLOWED' ? 'low' : 'medium'
    });

    return result;
  }

  getTestHistory(): ConnectivityTestResult[] {
    return this.testHistory;
  }

  clearTestHistory(): void {
    this.testHistory = [];
  }

  // --- DHCP Monitor ---
  getDHCPPools(): DHCPPool[] {
    return this.dhcpPools;
  }

  getDHCPLeases(): DHCPLease[] {
    return this.dhcpLeases;
  }

  // --- Port Security ---
  getPortSecurityStates(): PortSecurityState[] {
    return this.portSecurity;
  }

  simulatePortSecurityViolation(portName: string): PortSecurityState {
    const portState = this.portSecurity.find(p => p.port.toLowerCase() === portName.toLowerCase());
    if (!portState) {
      throw new Error(`Port ${portName} not found`);
    }

    if (portState.isTrunk) {
      throw new Error(`Port Security violation simulation cannot be run on trunk port ${portName}`);
    }

    // Generate a simulated rogue MAC address
    const randomHex = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
    const rogueMac = `0050.56${randomHex.substring(0, 2)}.${randomHex}`;
    
    // In restrict mode: Port status stays UP, packets dropped, violation count increments, syslog/trap sent
    portState.violationCount += 1;
    portState.lastViolationTime = new Date().toISOString();
    portState.lastOffendingMac = rogueMac;
    portState.currentDetectedMac = rogueMac;
    portState.status = 'RESTRICTING';

    this.addEventLog({
      type: 'PORT_SECURITY_VIOLATION',
      vlanId: portState.vlanId,
      source: `Port ${portState.port}`,
      destination: `Switch S1`,
      outcome: 'ALERT',
      description: `PORT SECURITY VIOLATION on ${portState.port} (VLAN ${portState.vlanId}): Unauthorized MAC ${rogueMac} detected! Restrict mode: Offending frames DROPPED, violation count incremented to ${portState.violationCount}. Port remains UP.`,
      severity: 'critical'
    });

    return portState;
  }

  resetPortSecurity(portName?: string): PortSecurityState[] {
    if (portName) {
      const port = this.portSecurity.find(p => p.port.toLowerCase() === portName.toLowerCase());
      if (port && !port.isTrunk) {
        port.violationCount = 0;
        port.status = 'SECURE-UP';
        port.currentDetectedMac = port.configuredMac;
        port.lastOffendingMac = undefined;
        port.lastViolationTime = undefined;
      }
    } else {
      for (const p of this.portSecurity) {
        if (!p.isTrunk) {
          p.violationCount = 0;
          p.status = 'SECURE-UP';
          p.currentDetectedMac = p.configuredMac;
          p.lastOffendingMac = undefined;
          p.lastViolationTime = undefined;
        }
      }
    }

    this.addEventLog({
      type: 'SYSTEM_EVENT',
      outcome: 'INFO',
      description: `Port security violation counters reset ${portName ? `for port ${portName}` : 'for all access ports'}.`,
      severity: 'low'
    });

    return this.portSecurity;
  }

  // --- SSH Config ---
  getSSHConfig(): SSHConfig {
    return this.sshConfig;
  }

  // --- Event Logs ---
  getEventLogs(filterType?: string, filterVlan?: number, filterOutcome?: string): EventLog[] {
    return this.eventLogs.filter(log => {
      if (filterType && log.type !== filterType) return false;
      if (filterVlan !== undefined && log.vlanId !== filterVlan) return false;
      if (filterOutcome && log.outcome !== filterOutcome) return false;
      return true;
    });
  }

  addEventLog(logInput: Omit<EventLog, 'id' | 'timestamp'>): EventLog {
    const newLog: EventLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...logInput
    };
    this.eventLogs.unshift(newLog);
    // Keep max 200 logs
    if (this.eventLogs.length > 200) {
      this.eventLogs = this.eventLogs.slice(0, 200);
    }
    return newLog;
  }

  // --- Dashboard Statistics ---
  getDashboardStats() {
    const totalVlans = this.vlans.length;
    const totalDevices = this.devices.filter(d => d.type === 'PC').length;
    const securityPoliciesCount = 8; // ACL 101, ACL 102, Port Security, SSH v2, DHCP snooping/pools, VLAN isolation, etc.
    const routerStatus = 'ONLINE (Cisco 2911)';
    const switchStatus = 'ONLINE (Cisco 2960)';
    
    const allowedTests = this.testHistory.filter(t => t.outcome === 'ALLOWED').length;
    const blockedTests = this.testHistory.filter(t => t.outcome === 'BLOCKED').length;
    const totalViolations = this.portSecurity.reduce((acc, p) => acc + p.violationCount, 0);

    const trafficDistribution = [
      { name: 'Allowed Inter-VLAN', value: allowedTests || 4, color: '#10B981' },
      { name: 'ACL Denied', value: blockedTests || 3, color: '#F43F5E' },
      { name: 'Port Violations', value: totalViolations, color: '#F59E0B' }
    ];

    const vlanTrafficStats = this.vlans.map(v => {
      const vlanTests = this.testHistory.filter(t => t.sourceVlan === v.id || t.destVlan === v.id);
      return {
        vlanId: v.id,
        name: v.name,
        color: v.color,
        allowed: vlanTests.filter(t => t.outcome === 'ALLOWED').length,
        blocked: vlanTests.filter(t => t.outcome === 'BLOCKED').length
      };
    });

    return {
      totalVlans,
      totalDevices,
      routerStatus,
      switchStatus,
      securityPoliciesCount,
      totalTestsRun: this.testHistory.length,
      allowedCount: allowedTests,
      blockedCount: blockedTests,
      totalViolations,
      trafficDistribution,
      vlanTrafficStats,
      recentEvents: this.eventLogs.slice(0, 6)
    };
  }

  // --- CSV Export Utility ---
  exportTestHistoryCSV(): string {
    const headers = ['ID', 'Timestamp', 'Source Device', 'Source IP', 'Source VLAN', 'Destination Device', 'Destination IP', 'Dest VLAN', 'Protocol', 'Outcome', 'Matched Rule', 'Latency (ms)'];
    const rows = this.testHistory.map(t => [
      t.id,
      t.timestamp,
      t.sourceDevice,
      t.sourceIp,
      t.sourceVlan,
      t.destDevice,
      t.destIp,
      t.destVlan,
      t.protocol,
      t.outcome,
      `"${t.matchedRule.replace(/"/g, '""')}"`,
      t.latencyMs
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  exportEventLogsCSV(): string {
    const headers = ['ID', 'Timestamp', 'Type', 'VLAN', 'Source', 'Destination', 'Outcome', 'Severity', 'Description'];
    const rows = this.eventLogs.map(l => [
      l.id,
      l.timestamp,
      l.type,
      l.vlanId || 'N/A',
      l.source || 'N/A',
      l.destination || 'N/A',
      l.outcome,
      l.severity,
      `"${l.description.replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const dataStore = new NetworkDataStore();
