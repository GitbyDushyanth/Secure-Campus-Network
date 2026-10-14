import { ConnectivityTestRequest, ConnectivityTestResult, PacketHop, Device, ProtocolType, PacketType } from '../types/network.js';
import { SEEDED_DEVICES, SEEDED_VLANS } from '../data/seededData.js';

export function evaluateNetworkPolicy(
  req: ConnectivityTestRequest,
  devices: Device[] = SEEDED_DEVICES
): ConnectivityTestResult {
  const sourceDevice = devices.find(d => d.id === req.sourceDeviceId || d.name === req.sourceDeviceId);
  const destDevice = devices.find(d => d.id === req.destDeviceId || d.name === req.destDeviceId);

  if (!sourceDevice || !destDevice) {
    throw new Error(`Device not found: source=${req.sourceDeviceId}, dest=${req.destDeviceId}`);
  }

  const protocol: ProtocolType = req.protocol || 'ICMP';
  const packetType: PacketType = req.packetType || 'echo-request';
  const isInterVlan = sourceDevice.vlanId !== destDevice.vlanId;
  const isGatewayTest = destDevice.type === 'ROUTER' || destDevice.ip === sourceDevice.gateway;

  const testId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  let outcome: 'ALLOWED' | 'BLOCKED' = 'ALLOWED';
  let ruleId = 'PERMIT-DEFAULT';
  let matchedRule = 'permit ip any any (Default Inter-VLAN Forwarding)';
  let explanation = '';
  let aclType = 'Extended IP Access List (Educational Simulation)';
  const packetJourney: PacketHop[] = [];

  // Step 1: Origin at Source PC
  packetJourney.push({
    step: 1,
    nodeName: sourceDevice.name,
    nodeType: 'PC',
    interface: 'NIC',
    action: 'TRANSMIT',
    status: 'SUCCESS',
    detail: `Originating ${protocol} (${packetType}) frame from ${sourceDevice.ip} towards destination ${destDevice.ip}.`
  });

  // Step 2: Ingress at Switch S1 access port
  packetJourney.push({
    step: 2,
    nodeName: 'S1',
    nodeType: 'SWITCH',
    interface: sourceDevice.switchPort,
    action: 'SWITCH',
    status: 'SUCCESS',
    detail: `Frame entered switch access port ${sourceDevice.switchPort}. Port security verified (MAC: ${sourceDevice.mac}). Tagged with 802.1Q VID ${sourceDevice.vlanId}.`
  });

  // Check Rule 1: Same VLAN / Intra-VLAN or Gateway Test
  if (!isInterVlan && isGatewayTest) {
    // Communicating with own gateway
    outcome = 'ALLOWED';
    ruleId = 'INTRA-VLAN-GW';
    matchedRule = `Direct Gateway Arp & Forwarding (VLAN ${sourceDevice.vlanId})`;
    explanation = `${sourceDevice.name} successfully reached its default gateway (${sourceDevice.gateway}) on router subinterface G0/0.${sourceDevice.vlanId}. Local subnet traffic is switched directly without cross-VLAN ACL filtration.`;

    packetJourney.push({
      step: 3,
      nodeName: 'S1',
      nodeType: 'SWITCH',
      interface: 'G0/1',
      action: 'SWITCH',
      status: 'SUCCESS',
      detail: `Forwarding 802.1Q tagged frame (VID ${sourceDevice.vlanId}) via trunk port G0/1 to Router R1.`
    });

    packetJourney.push({
      step: 4,
      nodeName: 'R1',
      nodeType: 'ROUTER',
      interface: `G0/0.${sourceDevice.vlanId}`,
      action: 'DELIVER',
      status: 'SUCCESS',
      detail: `Router R1 received packet on subinterface G0/0.${sourceDevice.vlanId}. Processed ICMP gateway echo request and prepared reply.`
    });

    return {
      id: testId,
      timestamp,
      sourceDevice: sourceDevice.name,
      destDevice: destDevice.name,
      sourceIp: sourceDevice.ip,
      destIp: destDevice.ip,
      sourceVlan: sourceDevice.vlanId,
      destVlan: destDevice.vlanId,
      protocol,
      packetType,
      outcome,
      ruleId,
      matchedRule,
      explanation,
      packetJourney,
      latencyMs: 1,
      aclType
    };
  }

  // Inter-VLAN Routing through R1: Step 3: Trunk to R1
  packetJourney.push({
    step: 3,
    nodeName: 'S1',
    nodeType: 'SWITCH',
    interface: 'G0/1',
    action: 'SWITCH',
    status: 'SUCCESS',
    detail: `Switch forwarding frame over 802.1Q trunk link G0/1 -> R1 G0/0 carrying VLAN ${sourceDevice.vlanId}.`
  });

  // Step 4: Router R1 Ingress
  packetJourney.push({
    step: 4,
    nodeName: 'R1',
    nodeType: 'ROUTER',
    interface: `G0/0.${sourceDevice.vlanId}`,
    action: 'ROUTER_EVALUATE',
    status: 'SUCCESS',
    detail: `Router-on-a-stick subinterface G0/0.${sourceDevice.vlanId} de-encapsulates 802.1Q tag ${sourceDevice.vlanId}. Evaluates routing table and access lists.`
  });

  // Security Evaluation Logic based on educational rules
  const srcVlan = sourceDevice.vlanId;
  const dstVlan = destDevice.vlanId;

  // RULE 3 & 4: STUDENTS (VLAN 30) -> ADMIN (VLAN 10)
  if (srcVlan === 30 && dstVlan === 10) {
    if (protocol === 'ICMP' && packetType === 'echo-reply') {
      // Echo reply exception rule
      outcome = 'ALLOWED';
      ruleId = 'ACL-101-PERMIT-REPLY';
      matchedRule = 'permit icmp 192.168.30.0 0.0.0.255 192.168.10.0 0.0.0.255 echo-reply';
      explanation = `Packet permitted under the configured ICMP echo-reply exception rule on ACL 101. Student PC is replying to an echo request previously initiated by an Admin device.`;
    } else {
      // Ingress echo request or standard IP traffic: DENIED
      outcome = 'BLOCKED';
      ruleId = 'ACL-101-DENY-STUDENT-ADMIN';
      matchedRule = 'deny ip 192.168.30.0 0.0.0.255 192.168.10.0 0.0.0.255';
      explanation = `Traffic BLOCKED by Extended Access-List 101 on subinterface G0/0.30. Student network (192.168.30.0/24) is forbidden from initiating traffic to the administrative subnet (192.168.10.0/24) to protect sensitive management infrastructure.`;
      aclType = 'Cisco Extended ACL 101 (Inbound on G0/0.30)';
    }
  }
  // RULE 5: GUEST (VLAN 50) -> Any Internal Subnet (VLAN 10, 20, 30, 40)
  else if (srcVlan === 50 && (dstVlan === 10 || dstVlan === 20 || dstVlan === 30 || dstVlan === 40)) {
    outcome = 'BLOCKED';
    ruleId = 'ACL-102-DENY-GUEST-INTERNAL';
    const targetSubnet = SEEDED_VLANS.find(v => v.id === dstVlan)?.subnet || 'Internal Subnet';
    matchedRule = `deny ip 192.168.50.0 0.0.0.255 192.168.0.0 0.0.255.255 (Subnet: ${targetSubnet})`;
    explanation = `Traffic BLOCKED by Extended Access-List 102 on subinterface G0/0.50. Guest network (192.168.50.0/24) is strictly isolated from internal campus subnets (Admin, Faculty, Students, Lab). Guests may only communicate with their gateway (192.168.50.1) and outbound Internet.`;
    aclType = 'Cisco Extended ACL 102 (Inbound on G0/0.50)';
  }
  // RULE 6: All other inter-VLAN traffic (ADMIN -> any, FACULTY -> LAB, etc.)
  else {
    outcome = 'ALLOWED';
    ruleId = 'ACL-PERMIT-ANY';
    matchedRule = 'permit ip any any (Implicit/Explicit inter-VLAN forwarding)';
    explanation = `Traffic PERMITTED by Router R1. Source ${sourceDevice.name} (VLAN ${sourceDevice.vlanId}) has legitimate inter-VLAN routing privileges to communicate with ${destDevice.name} (VLAN ${destDevice.vlanId}).`;
  }

  // Final Journey Steps based on Outcome
  if (outcome === 'BLOCKED') {
    packetJourney.push({
      step: 5,
      nodeName: 'R1',
      nodeType: 'ROUTER',
      interface: `G0/0.${sourceDevice.vlanId}`,
      action: 'ACL_CHECK',
      status: 'DROPPED',
      detail: `ACL Filtering match: [${matchedRule}]. Packet rejected and dropped at router boundary. No forwarding occurred.`
    });
  } else {
    packetJourney.push({
      step: 5,
      nodeName: 'R1',
      nodeType: 'ROUTER',
      interface: `G0/0.${destDevice.vlanId}`,
      action: 'FORWARD',
      status: 'SUCCESS',
      detail: `Packet passed ACL checks. Routed from G0/0.${sourceDevice.vlanId} to G0/0.${destDevice.vlanId}. Tagged with 802.1Q VID ${destDevice.vlanId}.`
    });

    packetJourney.push({
      step: 6,
      nodeName: 'S1',
      nodeType: 'SWITCH',
      interface: destDevice.switchPort,
      action: 'SWITCH',
      status: 'SUCCESS',
      detail: `Switch S1 receives frame from trunk G0/1, strips 802.1Q header for VLAN ${destDevice.vlanId}, forwards untagged out access port ${destDevice.switchPort}.`
    });

    packetJourney.push({
      step: 7,
      nodeName: destDevice.name,
      nodeType: 'PC',
      interface: 'NIC',
      action: 'DELIVER',
      status: 'SUCCESS',
      detail: `Destination host ${destDevice.name} (${destDevice.ip}) successfully received the packet.`
    });
  }

  return {
    id: testId,
    timestamp,
    sourceDevice: sourceDevice.name,
    destDevice: destDevice.name,
    sourceIp: sourceDevice.ip,
    destIp: destDevice.ip,
    sourceVlan: sourceDevice.vlanId,
    destVlan: destDevice.vlanId,
    protocol,
    packetType,
    outcome,
    ruleId,
    matchedRule,
    explanation,
    packetJourney,
    latencyMs: outcome === 'ALLOWED' ? Math.floor(Math.random() * 3) + 2 : 0,
    aclType
  };
}
