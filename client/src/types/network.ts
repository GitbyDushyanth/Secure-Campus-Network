export type DeviceType = 'ROUTER' | 'SWITCH' | 'PC';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  mac: string;
  vlanId: number;
  vlanName: string;
  switchPort: string;
  routerSubinterface?: string;
  gateway: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  role: string;
  description: string;
}

export interface VLAN {
  id: number;
  name: string;
  subnet: string;
  mask: string;
  gateway: string;
  deviceName: string;
  switchPort: string;
  routerSubinterface: string;
  purpose: string;
  color: string;
}

export type ProtocolType = 'ICMP' | 'HTTP' | 'HTTPS' | 'SSH' | 'DNS';
export type PacketType = 'echo-request' | 'echo-reply' | 'standard';

export interface PacketHop {
  step: number;
  nodeName: string;
  nodeType: 'PC' | 'SWITCH' | 'ROUTER';
  interface: string;
  action: 'TRANSMIT' | 'SWITCH' | 'ROUTER_EVALUATE' | 'ACL_CHECK' | 'FORWARD' | 'DROP' | 'DELIVER';
  status: 'SUCCESS' | 'DROPPED';
  detail: string;
}

export interface ConnectivityTestResult {
  id: string;
  timestamp: string;
  sourceDevice: string;
  destDevice: string;
  sourceIp: string;
  destIp: string;
  sourceVlan: number;
  destVlan: number;
  protocol: ProtocolType;
  packetType: PacketType;
  outcome: 'ALLOWED' | 'BLOCKED';
  ruleId: string;
  matchedRule: string;
  explanation: string;
  packetJourney: PacketHop[];
  latencyMs: number;
  aclType: string;
}

export interface DHCPPool {
  vlanId: number;
  vlanName: string;
  networkAddress: string;
  subnetMask: string;
  defaultGateway: string;
  dnsServer: string;
  excludedRange: string;
  exampleLease: string;
}

export interface DHCPLease {
  id: string;
  ip: string;
  mac: string;
  vlanId: number;
  vlanName: string;
  deviceName: string;
  port: string;
  leaseTime: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RESERVED';
  expiresIn: string;
  isDemoData: boolean;
}

export interface PortSecurityState {
  port: string;
  connectedDevice: string;
  vlanId: number;
  status: 'SECURE-UP' | 'RESTRICTING' | 'DISABLED';
  maxMacAllowed: number;
  configuredMac: string;
  stickyMac: string;
  currentDetectedMac: string;
  violationMode: 'restrict' | 'protect' | 'shutdown';
  violationCount: number;
  lastViolationTime?: string;
  lastOffendingMac?: string;
  isTrunk: boolean;
  notes: string;
}

export interface EventLog {
  id: string;
  timestamp: string;
  type: 'CONNECTIVITY_TEST' | 'ACL_DENIED' | 'DHCP_LEASE' | 'PORT_SECURITY_VIOLATION' | 'CONFIG_VIEW' | 'SYSTEM_EVENT';
  vlanId?: number;
  vlanName?: string;
  source?: string;
  destination?: string;
  outcome: 'ALLOWED' | 'BLOCKED' | 'INFO' | 'WARNING' | 'ALERT';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SSHConfig {
  routerHostname: string;
  domainName: string;
  sshVersion: string;
  rsaKeySize: number;
  status: string;
  motd: string;
  localAuthUsers: Array<{
    username: string;
    privilege: number;
    secretConfigured: boolean;
  }>;
  vtyConfig: {
    lines: string;
    transportInput: string;
    loginMode: string;
    execTimeout: string;
  };
  sampleCiscoCommands: string[];
}

export interface DashboardStats {
  totalVlans: number;
  totalDevices: number;
  routerStatus: string;
  switchStatus: string;
  securityPoliciesCount: number;
  totalTestsRun: number;
  allowedCount: number;
  blockedCount: number;
  totalViolations: number;
  trafficDistribution: Array<{ name: string; value: number; color: string }>;
  vlanTrafficStats: Array<{
    vlanId: number;
    name: string;
    color: string;
    allowed: number;
    blocked: number;
  }>;
  recentEvents: EventLog[];
}
