import { Router, Request, Response } from 'express';
import { dataStore } from '../services/store.js';

export const apiRouter = Router();

// Dashboard Stats
apiRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = dataStore.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Devices
apiRouter.get('/devices', (req: Request, res: Response) => {
  try {
    const devices = dataStore.getDevices();
    res.json({ success: true, data: devices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// VLANs
apiRouter.get('/vlans', (req: Request, res: Response) => {
  try {
    const vlans = dataStore.getVLANs();
    res.json({ success: true, data: vlans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/vlans/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid VLAN ID' });
    }
    const updated = dataStore.updateVLAN(id, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Network Security Connectivity Testing
apiRouter.post('/security/test', (req: Request, res: Response) => {
  try {
    const { sourceDeviceId, destDeviceId, protocol, packetType } = req.body;
    if (!sourceDeviceId || !destDeviceId) {
      return res.status(400).json({
        success: false,
        error: 'sourceDeviceId and destDeviceId are required parameters.'
      });
    }

    const result = dataStore.runConnectivityTest({
      sourceDeviceId,
      destDeviceId,
      protocol: protocol || 'ICMP',
      packetType: packetType || 'echo-request'
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.get('/security/history', (req: Request, res: Response) => {
  try {
    const history = dataStore.getTestHistory();
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/security/history', (req: Request, res: Response) => {
  try {
    dataStore.clearTestHistory();
    res.json({ success: true, message: 'Test history cleared.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DHCP
apiRouter.get('/dhcp/pools', (req: Request, res: Response) => {
  try {
    const pools = dataStore.getDHCPPools();
    res.json({ success: true, data: pools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/dhcp/leases', (req: Request, res: Response) => {
  try {
    const leases = dataStore.getDHCPLeases();
    res.json({ success: true, data: leases });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Port Security
apiRouter.get('/port-security', (req: Request, res: Response) => {
  try {
    const portSecurity = dataStore.getPortSecurityStates();
    res.json({ success: true, data: portSecurity });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/port-security/simulate-violation', (req: Request, res: Response) => {
  try {
    const { port } = req.body;
    if (!port) {
      return res.status(400).json({ success: false, error: 'Port name (e.g. Fa0/1) is required.' });
    }
    const updatedPort = dataStore.simulatePortSecurityViolation(port);
    res.json({
      success: true,
      message: `Violation simulated on port ${port}. Offending frames dropped, violation counter incremented. Port remains UP (restrict mode).`,
      data: updatedPort
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/port-security/reset', (req: Request, res: Response) => {
  try {
    const { port } = req.body;
    const states = dataStore.resetPortSecurity(port);
    res.json({
      success: true,
      message: port ? `Port security counters reset for ${port}` : 'All port security counters reset.',
      data: states
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SSH Configuration & Commands
apiRouter.get('/ssh/config', (req: Request, res: Response) => {
  try {
    const ssh = dataStore.getSSHConfig();
    res.json({ success: true, data: ssh });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Event Logs
apiRouter.get('/logs', (req: Request, res: Response) => {
  try {
    const { type, vlan, outcome } = req.query;
    const filterVlan = vlan ? parseInt(vlan as string, 10) : undefined;
    const logs = dataStore.getEventLogs(type as string, filterVlan, outcome as string);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CSV Exports
apiRouter.get('/export/tests.csv', (req: Request, res: Response) => {
  try {
    const csv = dataStore.exportTestHistoryCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campus_network_tests.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).send(`Error exporting CSV: ${error.message}`);
  }
});

apiRouter.get('/export/logs.csv', (req: Request, res: Response) => {
  try {
    const csv = dataStore.exportEventLogsCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campus_network_event_logs.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).send(`Error exporting CSV: ${error.message}`);
  }
});
