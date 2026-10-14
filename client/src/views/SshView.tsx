import React, { useState } from 'react';
import { SSHConfig } from '../types/network';
import {
  Terminal,
  Lock,
  ShieldCheck,
  Key,
  Info,
  Copy,
  Check,
  Server,
  AlertTriangle,
  Cpu
} from 'lucide-react';

interface SshViewProps {
  sshConfig: SSHConfig;
}

export const SshView: React.FC<SshViewProps> = ({ sshConfig }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Educational Notice Banner */}
      <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] flex items-start space-x-3 shadow-sm">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-slate-200">
            Educational Device Hardening Reference • SSH v2 Configuration
          </div>
          <p className="text-slate-400 leading-relaxed">
            This module illustrates administrative device management security on Router R1.
            Unencrypted Telnet is completely disabled on VTY lines 0 4 (<span className="text-cyan-300 font-mono">transport input ssh</span>).
            Passwords are hashed using Cisco Secret Type 5/7 algorithms.
            This is an educational reference view and does not establish a live SSH socket from the browser.
          </p>
        </div>
      </div>

      {/* Row 1: SSH Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Hostname</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{sshConfig.routerHostname}</div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">Domain: {sshConfig.domainName}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protocol Version</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{sshConfig.sshVersion}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Telnet (Port 23) Blocked</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Cryptographic Key</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">RSA {sshConfig.rsaKeySize} bits</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">FIPS-Compliant Modulus</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Authentication Mode</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">Local AAA / Database</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Privilege Level 15</div>
        </div>
      </div>

      {/* Row 2: MOTD Banner & Configured Local Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banner MOTD */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#1E2E4A]">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Configured Legal Warning Banner (MOTD)</h4>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#080D1A] border border-[#1E2E4A] font-mono text-[11px] text-amber-300/90 whitespace-pre-wrap leading-relaxed">
              {sshConfig.motd}
            </pre>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">
            Legal advisory displayed to any client attempting an interactive session prior to authentication.
          </p>
        </div>

        {/* Local Auth Users */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#1E2E4A]">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Local User Database (Privileged)</h4>
            </div>

            <div className="space-y-3">
              {sshConfig.localAuthUsers.map((user, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#111C35] border border-[#1E2E4A] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white font-mono text-xs">{user.username}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        Privilege {user.privilege} (Enable)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Password Secret: <span className="font-mono text-emerald-400">MD5/SHA-256 (Protected)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HASHED
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 text-[11px] font-mono text-slate-400 bg-[#111C35] p-2.5 rounded border border-[#1E2E4A] space-y-1">
            <div className="flex justify-between">
              <span>Lines:</span>
              <span className="text-white font-bold">{sshConfig.vtyConfig.lines}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport:</span>
              <span className="text-cyan-400 font-bold">{sshConfig.vtyConfig.transportInput}</span>
            </div>
            <div className="flex justify-between">
              <span>Login Mode:</span>
              <span className="text-emerald-400">{sshConfig.vtyConfig.loginMode}</span>
            </div>
            <div className="flex justify-between">
              <span>Exec Timeout:</span>
              <span className="text-slate-300">{sshConfig.vtyConfig.execTimeout} (5 min idle)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Cisco IOS Command Sequence Reference */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-[#1E2E4A] shadow-sm">
        <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#1E2E4A]">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Complete Cisco IOS Hardening Configuration Commands</h4>
        </div>

        <div className="space-y-1.5 font-mono text-xs bg-[#080D1A] p-4 rounded-lg border border-[#1E2E4A] overflow-x-auto">
          {sshConfig.sampleCiscoCommands.map((cmd, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between group hover:bg-[#111C35] px-2 py-1 rounded transition-colors"
            >
              <span className="text-cyan-300 whitespace-pre">{cmd}</span>
              <button
                onClick={() => handleCopy(cmd, idx)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity ml-4"
                title="Copy command"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
