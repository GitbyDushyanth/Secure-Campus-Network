import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { TopologyView } from './views/TopologyView';
import { VlanView } from './views/VlanView';
import { SecurityLabView } from './views/SecurityLabView';
import { DhcpView } from './views/DhcpView';
import { PortSecurityView } from './views/PortSecurityView';
import { SshView } from './views/SshView';
import { LogsView } from './views/LogsView';
import { api } from './services/api';
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
} from './types/network';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vlans, setVlans] = useState<VLAN[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [testHistory, setTestHistory] = useState<ConnectivityTestResult[]>([]);
  const [dhcpPools, setDhcpPools] = useState<DHCPPool[]>([]);
  const [dhcpLeases, setDhcpLeases] = useState<DHCPLease[]>([]);
  const [portSecurity, setPortSecurity] = useState<PortSecurityState[]>([]);
  const [sshConfig, setSshConfig] = useState<SSHConfig | null>(null);
  const [logs, setLogs] = useState<EventLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isProcessingPort, setIsProcessingPort] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeTestResult, setActiveTestResult] = useState<ConnectivityTestResult | null>(null);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const loadData = async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [
        statsData,
        vlansData,
        devicesData,
        historyData,
        poolsData,
        leasesData,
        portsData,
        sshData,
        logsData
      ] = await Promise.all([
        api.getStats(),
        api.getVlans(),
        api.getDevices(),
        api.getTestHistory(),
        api.getDhcpPools(),
        api.getDhcpLeases(),
        api.getPortSecurity(),
        api.getSshConfig(),
        api.getLogs()
      ]);

      setStats(statsData);
      setVlans(vlansData);
      setDevices(devicesData);
      setTestHistory(historyData);
      setDhcpPools(poolsData);
      setDhcpLeases(leasesData);
      setPortSecurity(portsData);
      setSshConfig(sshData);
      setLogs(logsData);
    } catch (err: any) {
      console.error('Failed to load telemetry:', err);
      addToast('error', 'API Communication Notice', 'Unable to reach backend API. Using cached local simulation.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Connectivity Test Runner
  const handleRunTest = async (params: {
    sourceDeviceId: string;
    destDeviceId: string;
    protocol?: ProtocolType;
    packetType?: PacketType;
  }): Promise<ConnectivityTestResult | null> => {
    setIsTesting(true);
    try {
      const result = await api.runTest(params);
      setActiveTestResult(result);
      
      // Refresh test history and stats
      const [updatedHistory, updatedStats, updatedLogs] = await Promise.all([
        api.getTestHistory(),
        api.getStats(),
        api.getLogs()
      ]);
      setTestHistory(updatedHistory);
      setStats(updatedStats);
      setLogs(updatedLogs);

      if (result.outcome === 'ALLOWED') {
        addToast(
          'success',
          `Traffic Allowed (${result.protocol})`,
          `${result.sourceDevice} reached ${result.destDevice} [Rule: ${result.matchedRule}]`
        );
      } else {
        addToast(
          'warning',
          `Traffic Denied by ACL (${result.protocol})`,
          `${result.sourceDevice} to ${result.destDevice} blocked [Rule: ${result.matchedRule}]`
        );
      }

      return result;
    } catch (err: any) {
      addToast('error', 'Test Failed', err.message || 'Execution error');
      return null;
    } finally {
      setIsTesting(false);
    }
  };

  // Predefined Quick Test Runner from Dashboard or Topology
  const handleRunPredefined = async (source: string, dest: string, label: string) => {
    await handleRunTest({ sourceDeviceId: source, destDeviceId: dest, protocol: 'ICMP', packetType: 'echo-request' });
  };

  // Clear Test History
  const handleClearHistory = async () => {
    try {
      await api.clearTestHistory();
      setTestHistory([]);
      const updatedStats = await api.getStats();
      setStats(updatedStats);
      addToast('info', 'History Reset', 'Simulated test history cleared.');
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  // Port Security Violation Simulation
  const handleSimulateViolation = async (port: string) => {
    setIsProcessingPort(true);
    try {
      await api.simulateViolation(port);
      const [updatedPorts, updatedStats, updatedLogs] = await Promise.all([
        api.getPortSecurity(),
        api.getStats(),
        api.getLogs()
      ]);
      setPortSecurity(updatedPorts);
      setStats(updatedStats);
      setLogs(updatedLogs);

      addToast(
        'error',
        `Port Security Violation on ${port}!`,
        'Unauthorized MAC detected. Restrict mode: frames dropped, violation counter incremented. Port remains UP.'
      );
    } catch (err: any) {
      addToast('error', 'Simulation Failed', err.message);
    } finally {
      setIsProcessingPort(false);
    }
  };

  // Reset Port Security
  const handleResetPortSecurity = async (port?: string) => {
    setIsProcessingPort(true);
    try {
      const updatedPorts = await api.resetPortSecurity(port);
      setPortSecurity(updatedPorts);
      const [updatedStats, updatedLogs] = await Promise.all([
        api.getStats(),
        api.getLogs()
      ]);
      setStats(updatedStats);
      setLogs(updatedLogs);

      addToast('success', 'Port Security Reset', port ? `Counter cleared for ${port}.` : 'All port counters reset to 0.');
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setIsProcessingPort(false);
    }
  };

  // Update VLAN metadata
  const handleUpdateVlan = async (id: number, data: Partial<VLAN>) => {
    try {
      const updated = await api.updateVlan(id, data);
      setVlans((prev) => prev.map((v) => (v.id === id ? updated : v)));
      const updatedLogs = await api.getLogs();
      setLogs(updatedLogs);
      addToast('success', 'VLAN Updated', `VLAN ${id} metadata updated in simulation store.`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  return (
    <div className="flex h-screen bg-[#080D1A] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        routerStatus={stats?.routerStatus}
        switchStatus={stats?.switchStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onRefresh={() => loadData()}
          isRefreshing={isRefreshing}
        />

        {/* View Port Router */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                <p className="text-sm font-mono text-cyan-400">Initializing Campus Network Simulation Environment...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  vlans={vlans}
                  devices={devices}
                  onNavigate={setActiveTab}
                  onRunPredefinedTest={handleRunPredefined}
                  isRunningTest={isTesting}
                />
              )}

              {activeTab === 'topology' && (
                <TopologyView
                  devices={devices}
                  vlans={vlans}
                  activeTestResult={activeTestResult}
                  onRunTest={(src, dst) => handleRunPredefined(src, dst, `${src} → ${dst}`)}
                  isTesting={isTesting}
                />
              )}

              {activeTab === 'vlans' && (
                <VlanView
                  vlans={vlans}
                  onUpdateVlan={handleUpdateVlan}
                />
              )}

              {activeTab === 'security' && (
                <SecurityLabView
                  devices={devices}
                  vlans={vlans}
                  testHistory={testHistory}
                  onRunTest={handleRunTest}
                  onClearHistory={handleClearHistory}
                  isTesting={isTesting}
                />
              )}

              {activeTab === 'dhcp' && (
                <DhcpView
                  pools={dhcpPools}
                  leases={dhcpLeases}
                />
              )}

              {activeTab === 'port-security' && (
                <PortSecurityView
                  portStates={portSecurity}
                  onSimulateViolation={handleSimulateViolation}
                  onResetPortSecurity={handleResetPortSecurity}
                  isProcessing={isProcessingPort}
                />
              )}

              {activeTab === 'ssh' && sshConfig && (
                <SshView sshConfig={sshConfig} />
              )}

              {activeTab === 'logs' && (
                <LogsView
                  logs={logs}
                  testHistory={testHistory}
                  vlans={vlans}
                  stats={stats}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm pointer-events-none no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl border shadow-xl pointer-events-auto flex items-start space-x-3 text-xs transition-all animate-slideUp ${
              toast.type === 'success'
                ? 'bg-[#0B1A1B] border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-[#1F1116] border-rose-500/40 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-[#1C170E] border-amber-500/40 text-amber-200'
                : 'bg-[#0F172A] border-cyan-500/40 text-cyan-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white mb-0.5">{toast.title}</div>
              <p className="text-[11px] leading-relaxed opacity-90">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;
