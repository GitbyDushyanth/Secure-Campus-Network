import { Device, VLAN, DHCPPool, DHCPLease, PortSecurityState, SSHConfig, EventLog } from '../types/network.js';

export const SEEDED_VLANS: VLAN[] = [
  {
    id: 10,
    name: 'ADMIN',
    subnet: '192.168.10.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.10.1',
    deviceName: 'ADMIN-PC',
    switchPort: 'Fa0/1',
    routerSubinterface: 'G0/0.10',
    purpose: 'Campus Network Management & Administrative Operations',
    color: '#06B6D4' // Cyan
  },
  {
    id: 20,
    name: 'FACULTY',
    subnet: '192.168.20.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.20.1',
    deviceName: 'FACULTY-PC',
    switchPort: 'Fa0/2',
    routerSubinterface: 'G0/0.20',
    purpose: 'Faculty Offices, Staff Workstations & Academic Portals',
    color: '#3B82F6' // Blue
  },
  {
    id: 30,
    name: 'STUDENTS',
    subnet: '192.168.30.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.30.1',
    deviceName: 'STUDENT-PC',
    switchPort: 'Fa0/3',
    routerSubinterface: 'G0/0.30',
    purpose: 'Student Classrooms, Library Terminals & BYOD Access',
    color: '#10B981' // Emerald
  },
  {
    id: 40,
    name: 'LAB',
    subnet: '192.168.40.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.40.1',
    deviceName: 'LAB-PC',
    switchPort: 'Fa0/4',
    routerSubinterface: 'G0/0.40',
    purpose: 'Computer Engineering & Networking Research Laboratories',
    color: '#F59E0B' // Amber
  },
  {
    id: 50,
    name: 'GUEST',
    subnet: '192.168.50.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.50.1',
    deviceName: 'GUEST-PC',
    switchPort: 'Fa0/5',
    routerSubinterface: 'G0/0.50',
    purpose: 'Visitor Internet Access with Strict Internal Network Isolation',
    color: '#F43F5E' // Rose
  }
];

export const SEEDED_DEVICES: Device[] = [
  {
    id: 'dev-admin',
    name: 'ADMIN-PC',
    type: 'PC',
    ip: '192.168.10.10',
    mac: '00:0A:F7:10:0A:01',
    vlanId: 10,
    vlanName: 'ADMIN',
    switchPort: 'Fa0/1',
    gateway: '192.168.10.1',
    status: 'ONLINE',
    role: 'Administrative Terminal',
    description: 'Secured administrative PC with management access to all campus segments and R1/S1.'
  },
  {
    id: 'dev-faculty',
    name: 'FACULTY-PC',
    type: 'PC',
    ip: '192.168.20.10',
    mac: '00:0A:F7:20:0B:02',
    vlanId: 20,
    vlanName: 'FACULTY',
    switchPort: 'Fa0/2',
    gateway: '192.168.20.1',
    status: 'ONLINE',
    role: 'Faculty Workstation',
    description: 'Faculty device used for curriculum management, grading, and campus network services.'
  },
  {
    id: 'dev-student',
    name: 'STUDENT-PC',
    type: 'PC',
    ip: '192.168.30.10',
    mac: '00:0A:F7:30:0C:03',
    vlanId: 30,
    vlanName: 'STUDENTS',
    switchPort: 'Fa0/3',
    gateway: '192.168.30.1',
    status: 'ONLINE',
    role: 'Student Workstation',
    description: 'Student lab terminal subject to extended ACL 101 blocking access to the ADMIN subnet.'
  },
  {
    id: 'dev-lab',
    name: 'LAB-PC',
    type: 'PC',
    ip: '192.168.40.10',
    mac: '00:0A:F7:40:0D:04',
    vlanId: 40,
    vlanName: 'LAB',
    switchPort: 'Fa0/4',
    gateway: '192.168.40.1',
    status: 'ONLINE',
    role: 'Laboratory Research PC',
    description: 'Specialized workstation configured for hands-on student projects and network simulations.'
  },
  {
    id: 'dev-guest',
    name: 'GUEST-PC',
    type: 'PC',
    ip: '192.168.50.10',
    mac: '00:0A:F7:50:0E:05',
    vlanId: 50,
    vlanName: 'GUEST',
    switchPort: 'Fa0/5',
    gateway: '192.168.50.1',
    status: 'ONLINE',
    role: 'Visitor Laptop',
    description: 'Guest workstation restricted by ACL 102 from communicating with any internal campus subnets.'
  },
  // Infrastructure nodes
  {
    id: 'dev-router-r1',
    name: 'R1',
    type: 'ROUTER',
    ip: '192.168.10.1', // Primary gateway reference
    mac: 'CC:01:A2:88:00:00',
    vlanId: 0,
    vlanName: 'ROUTER-TRUNK',
    switchPort: 'G0/0',
    gateway: '0.0.0.0',
    status: 'ONLINE',
    role: 'Core Inter-VLAN Gateway (Cisco 2911)',
    description: 'Cisco 2911 Integrated Services Router running Router-on-a-Stick for VLANs 10, 20, 30, 40, 50, hosting DHCP pools and enforcing Extended ACLs 101 & 102.'
  },
  {
    id: 'dev-switch-s1',
    name: 'S1',
    type: 'SWITCH',
    ip: '192.168.10.2',
    mac: '00:50:79:66:68:00',
    vlanId: 1,
    vlanName: 'MGMT-VLAN1',
    switchPort: 'G0/1',
    gateway: '192.168.10.1',
    status: 'ONLINE',
    role: 'Access & Distribution Switch (Cisco 2960)',
    description: 'Cisco Catalyst 2960-24TT Switch providing 802.1Q dot1q trunking on G0/1 and Port Security in restrict mode on Fa0/1 - Fa0/5.'
  }
];

export const SEEDED_DHCP_POOLS: DHCPPool[] = [
  {
    vlanId: 10,
    vlanName: 'POOL-ADMIN',
    networkAddress: '192.168.10.0',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.10.1',
    dnsServer: '8.8.8.8',
    excludedRange: '192.168.10.1 - 192.168.10.9',
    exampleLease: '192.168.10.10'
  },
  {
    vlanId: 20,
    vlanName: 'POOL-FACULTY',
    networkAddress: '192.168.20.0',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.20.1',
    dnsServer: '8.8.8.8',
    excludedRange: '192.168.20.1 - 192.168.20.9',
    exampleLease: '192.168.20.10'
  },
  {
    vlanId: 30,
    vlanName: 'POOL-STUDENTS',
    networkAddress: '192.168.30.0',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.30.1',
    dnsServer: '8.8.8.8',
    excludedRange: '192.168.30.1 - 192.168.30.9',
    exampleLease: '192.168.30.10'
  },
  {
    vlanId: 40,
    vlanName: 'POOL-LAB',
    networkAddress: '192.168.40.0',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.40.1',
    dnsServer: '8.8.8.8',
    excludedRange: '192.168.40.1 - 192.168.40.9',
    exampleLease: '192.168.40.10'
  },
  {
    vlanId: 50,
    vlanName: 'POOL-GUEST',
    networkAddress: '192.168.50.0',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.50.1',
    dnsServer: '8.8.8.8',
    excludedRange: '192.168.50.1 - 192.168.50.9',
    exampleLease: '192.168.50.10'
  }
];

export const SEEDED_DHCP_LEASES: DHCPLease[] = [
  {
    id: 'lease-10',
    ip: '192.168.10.10',
    mac: '00:0A:F7:10:0A:01',
    vlanId: 10,
    vlanName: 'ADMIN',
    deviceName: 'ADMIN-PC',
    port: 'Fa0/1',
    leaseTime: '24 Hours (Static Reservation/Demo)',
    status: 'ACTIVE',
    expiresIn: '23h 48m',
    isDemoData: true
  },
  {
    id: 'lease-20',
    ip: '192.168.20.10',
    mac: '00:0A:F7:20:0B:02',
    vlanId: 20,
    vlanName: 'FACULTY',
    deviceName: 'FACULTY-PC',
    port: 'Fa0/2',
    leaseTime: '24 Hours (Static Reservation/Demo)',
    status: 'ACTIVE',
    expiresIn: '22h 15m',
    isDemoData: true
  },
  {
    id: 'lease-30',
    ip: '192.168.30.10',
    mac: '00:0A:F7:30:0C:03',
    vlanId: 30,
    vlanName: 'STUDENTS',
    deviceName: 'STUDENT-PC',
    port: 'Fa0/3',
    leaseTime: '24 Hours (Static Reservation/Demo)',
    status: 'ACTIVE',
    expiresIn: '21h 05m',
    isDemoData: true
  },
  {
    id: 'lease-40',
    ip: '192.168.40.10',
    mac: '00:0A:F7:40:0D:04',
    vlanId: 40,
    vlanName: 'LAB',
    deviceName: 'LAB-PC',
    port: 'Fa0/4',
    leaseTime: '24 Hours (Static Reservation/Demo)',
    status: 'ACTIVE',
    expiresIn: '23h 30m',
    isDemoData: true
  },
  {
    id: 'lease-50',
    ip: '192.168.50.10',
    mac: '00:0A:F7:50:0E:05',
    vlanId: 50,
    vlanName: 'GUEST',
    deviceName: 'GUEST-PC',
    port: 'Fa0/5',
    leaseTime: '8 Hours (Visitor Policy)',
    status: 'ACTIVE',
    expiresIn: '7h 12m',
    isDemoData: true
  }
];

export const SEEDED_PORT_SECURITY: PortSecurityState[] = [
  {
    port: 'Fa0/1',
    connectedDevice: 'ADMIN-PC',
    vlanId: 10,
    status: 'SECURE-UP',
    maxMacAllowed: 1,
    configuredMac: '000a.f710.0a01',
    stickyMac: '000a.f710.0a01',
    currentDetectedMac: '000a.f710.0a01',
    violationMode: 'restrict',
    violationCount: 0,
    isTrunk: false,
    notes: 'Configured with switchport port-security mac-address sticky; restrict mode drops rogue frames and increments SNMP/syslog trap counter without shutting down the link.'
  },
  {
    port: 'Fa0/2',
    connectedDevice: 'FACULTY-PC',
    vlanId: 20,
    status: 'SECURE-UP',
    maxMacAllowed: 1,
    configuredMac: '000a.f720.0b02',
    stickyMac: '000a.f720.0b02',
    currentDetectedMac: '000a.f720.0b02',
    violationMode: 'restrict',
    violationCount: 0,
    isTrunk: false,
    notes: 'Access port bound to Faculty VLAN 20. Strict MAC restriction in effect.'
  },
  {
    port: 'Fa0/3',
    connectedDevice: 'STUDENT-PC',
    vlanId: 30,
    status: 'SECURE-UP',
    maxMacAllowed: 1,
    configuredMac: '000a.f730.0c03',
    stickyMac: '000a.f730.0c03',
    currentDetectedMac: '000a.f730.0c03',
    violationMode: 'restrict',
    violationCount: 0,
    isTrunk: false,
    notes: 'High security risk port. Restrict mode ensures unauthorized student devices/switches cannot hijack the socket.'
  },
  {
    port: 'Fa0/4',
    connectedDevice: 'LAB-PC',
    vlanId: 40,
    status: 'SECURE-UP',
    maxMacAllowed: 1,
    configuredMac: '000a.f740.0d04',
    stickyMac: '000a.f740.0d04',
    currentDetectedMac: '000a.f740.0d04',
    violationMode: 'restrict',
    violationCount: 0,
    isTrunk: false,
    notes: 'Laboratory workstation port. Restrict mode active.'
  },
  {
    port: 'Fa0/5',
    connectedDevice: 'GUEST-PC',
    vlanId: 50,
    status: 'SECURE-UP',
    maxMacAllowed: 1,
    configuredMac: '000a.f750.0e05',
    stickyMac: '000a.f750.0e05',
    currentDetectedMac: '000a.f750.0e05',
    violationMode: 'restrict',
    violationCount: 0,
    isTrunk: false,
    notes: 'Public guest access port. Restricts foreign laptops from spoofing multiple MACs.'
  },
  {
    port: 'G0/1',
    connectedDevice: 'R1 (Router Trunk)',
    vlanId: 1,
    status: 'SECURE-UP',
    maxMacAllowed: 0,
    configuredMac: 'N/A (802.1Q Trunk)',
    stickyMac: 'N/A',
    currentDetectedMac: 'Multiple (802.1Q tagged frames)',
    violationMode: 'restrict',
    violationCount: 0,
    isTrunk: true,
    notes: 'IEEE 802.1Q trunk port connecting S1 to R1 G0/0. Port security is intentionally NOT enabled on trunk links per Cisco design best practices.'
  }
];

export const SEEDED_SSH_CONFIG: SSHConfig = {
  routerHostname: 'R1',
  domainName: 'campus.local',
  sshVersion: 'SSH-2.0 (Cisco-1.25)',
  rsaKeySize: 2048,
  status: 'ACTIVE & SECURED',
  motd: '*********************************************************************\n* UNAUTHORIZED ACCESS TO THIS CAMPUS NETWORK DEVICE IS PROHIBITED!   *\n* All sessions are monitored, logged, and audited under campus IT    *\n* policy. Disconnect immediately if you are not an authorized admin. *\n*********************************************************************',
  localAuthUsers: [
    {
      username: 'netadmin',
      privilege: 15,
      secretConfigured: true
    },
    {
      username: 'secops',
      privilege: 15,
      secretConfigured: true
    }
  ],
  vtyConfig: {
    lines: 'line vty 0 4',
    transportInput: 'transport input ssh',
    loginMode: 'login local',
    execTimeout: 'exec-timeout 5 0'
  },
  sampleCiscoCommands: [
    'R1(config)# hostname R1',
    'R1(config)# ip domain-name campus.local',
    'R1(config)# crypto key generate rsa general-keys modulus 2048',
    'R1(config)# ip ssh version 2',
    'R1(config)# ip ssh time-out 60',
    'R1(config)# ip ssh authentication-retries 3',
    'R1(config)# username netadmin privilege 15 secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0',
    'R1(config)# line vty 0 4',
    'R1(config-line)# transport input ssh',
    'R1(config-line)# login local',
    'R1(config-line)# exec-timeout 5 0',
    'R1(config)# banner motd ^C\n*** RESTRICTED CAMPUS NETWORK - AUTHORIZED ACCESS ONLY ***\n^C'
  ]
};

export const SEEDED_INITIAL_LOGS: EventLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'SYSTEM_EVENT',
    outcome: 'INFO',
    description: 'Campus Network Simulation initialized. R1 (2911) and S1 (2960) link G0/0 - G0/1 operational.',
    severity: 'low'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    type: 'DHCP_LEASE',
    vlanId: 10,
    vlanName: 'ADMIN',
    source: '192.168.10.1',
    destination: 'ADMIN-PC',
    outcome: 'INFO',
    description: 'DHCP Offer & Ack: IP 192.168.10.10 leased to ADMIN-PC (00:0A:F7:10:0A:01).',
    severity: 'low'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    type: 'CONNECTIVITY_TEST',
    vlanId: 10,
    vlanName: 'ADMIN',
    source: 'ADMIN-PC',
    destination: '192.168.10.1',
    outcome: 'ALLOWED',
    description: 'Intra-VLAN Gateway Ping: ADMIN-PC -> 192.168.10.1 (G0/0.10) verified successful (1ms).',
    severity: 'low'
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 3600000 * 1.1).toISOString(),
    type: 'ACL_DENIED',
    vlanId: 30,
    vlanName: 'STUDENTS',
    source: 'STUDENT-PC (192.168.30.10)',
    destination: 'ADMIN-PC (192.168.10.10)',
    outcome: 'BLOCKED',
    description: 'ACL 101 Rule 2 Match: Denied IP packet from student subnet 192.168.30.0/24 to admin subnet 192.168.10.0/24.',
    severity: 'medium'
  },
  {
    id: 'log-105',
    timestamp: new Date(Date.now() - 3600000 * 0.7).toISOString(),
    type: 'ACL_DENIED',
    vlanId: 50,
    vlanName: 'GUEST',
    source: 'GUEST-PC (192.168.50.10)',
    destination: 'FACULTY-PC (192.168.20.10)',
    outcome: 'BLOCKED',
    description: 'ACL 102 Rule 1 Match: Denied IP packet from guest subnet 192.168.50.0/24 to faculty subnet 192.168.20.0/24.',
    severity: 'medium'
  },
  {
    id: 'log-106',
    timestamp: new Date(Date.now() - 3600000 * 0.3).toISOString(),
    type: 'CONNECTIVITY_TEST',
    vlanId: 10,
    vlanName: 'ADMIN',
    source: 'ADMIN-PC (192.168.10.10)',
    destination: 'STUDENT-PC (192.168.30.10)',
    outcome: 'ALLOWED',
    description: 'Inter-VLAN Route: ADMIN-PC -> STUDENT-PC permitted by default inter-VLAN forwarding policy.',
    severity: 'low'
  }
];
