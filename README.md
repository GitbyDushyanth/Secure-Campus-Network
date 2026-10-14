# Design and Implementation of a Secure Campus Network
### Interactive Network Simulation, Security Monitoring & Telemetry Dashboard (College PBL)

---

## 📌 Project Overview
This project is an educational, interactive campus network monitoring and simulation dashboard developed for the college Project-Based Learning (PBL) curriculum titled **“Design and Implementation of a Secure Campus Network”**.

The application models a multi-segment campus network architecture matching a **Cisco Packet Tracer** topology featuring:
- **Router:** Cisco 2911 (`R1`), running **Router-on-a-Stick** with IEEE 802.1Q subinterfaces `G0/0.10` through `G0/0.50`
- **Switch:** Cisco Catalyst 2960 (`S1`), providing 802.1Q trunking on `G0/1` and access ports `Fa0/1` through `Fa0/5`
- **5 End Devices:** Workstations in dedicated VLAN segments (`ADMIN-PC`, `FACULTY-PC`, `STUDENT-PC`, `LAB-PC`, `GUEST-PC`)
- **Centralized Security Enforcement:** Cisco Extended Access Control Lists (ACLs 101 & 102), switchport port security in **restrict** mode, and secure administrative SSH v2 access.

> ⚠️ **Educational Simulation Notice:**  
> This dashboard simulates network behavior locally. It does not connect to or configure physical Cisco hardware. Cisco Packet Tracer serves as the authoritative source for packet-level lab demonstrations.

---

## 🛠️ Technology Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend:** Node.js, Express, TypeScript (`tsx`), CORS
- **Data Architecture:** Zero-dependency in-memory persistent store with full PostgreSQL / Prisma ORM ready schema
- **Export Formats:** Dynamic CSV export for test runs and security audit logs, plus a browser print-optimized demonstration report.

---

## 🗺️ Campus Network Topology & VLAN Segmentation

| VLAN | Name | Subnet | Gateway | Switch Port | Device Name | IP Address | Purpose |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **10** | **ADMIN** | `192.168.10.0/24` | `192.168.10.1` | `Fa0/1` | `ADMIN-PC` | `192.168.10.10` | Administrative Operations & Core Management |
| **20** | **FACULTY** | `192.168.20.0/24` | `192.168.20.1` | `Fa0/2` | `FACULTY-PC` | `192.168.20.10` | Faculty Workstations & Grading Portals |
| **30** | **STUDENTS** | `192.168.30.0/24` | `192.168.30.1` | `Fa0/3` | `STUDENT-PC` | `192.168.30.10` | Classrooms, Library Terminals & BYOD |
| **40** | **LAB** | `192.168.40.0/24` | `192.168.40.1` | `Fa0/4` | `LAB-PC` | `192.168.40.10` | Computer Engineering & Networking Lab |
| **50** | **GUEST** | `192.168.50.0/24` | `192.168.50.1` | `Fa0/5` | `GUEST-PC` | `192.168.50.10` | Isolated Public / Visitor Access |
| **Trunk** | **802.1Q** | Multiple | N/A | `G0/1` ↔ `R1 G0/0` | `R1` / `S1` | N/A | Multiplexes tagged traffic for all 5 VLANs |

---

## 🛡️ Centralized Network Security & ACL Rules

The backend security engine enforces educational Cisco IOS Extended ACL logic:

### 1. Student Network Restrictions (Extended ACL 101 on Subinterface `G0/0.30`)
- **Unsolicited Initiation to Admin:** Denied  
  `deny ip 192.168.30.0 0.0.0.255 192.168.10.0 0.0.0.255`
- **ICMP Echo-Reply Exception:** Permitted  
  `permit icmp 192.168.30.0 0.0.0.255 192.168.10.0 0.0.0.255 echo-reply`  
  *(Allows ADMIN hosts to ping student hosts without allowing student hosts to initiate connections to ADMIN)*

### 2. Guest Network Restrictions (Extended ACL 102 on Subinterface `G0/0.50`)
- **All Internal Subnets:** Denied  
  `deny ip 192.168.50.0 0.0.0.255 192.168.0.0 0.0.255.255`
- **Guest Gateway:** Permitted  
  `permit icmp 192.168.50.0 0.0.0.255 host 192.168.50.1`

### 3. Switch Port Security (Access Ports `Fa0/1` – `Fa0/5`)
- **Sticky MAC Learning:** Enabled (`switchport port-security mac-address sticky`)
- **Maximum MACs Allowed:** 1 per access port
- **Violation Mode:** `restrict`  
  *Offending frames from unknown source MACs are dropped and the violation counter increments without disabling the port (`err-disable`), ensuring high service availability.*
- **Trunk Link Policy:** Port security is **NOT** enabled on `G0/1` per Cisco best practices.

### 4. SSH v2 Management Hardening
- **Protocol:** SSH version 2 (`ip ssh version 2`, RSA 2048-bit modulus)
- **Authentication:** Local database (`username netadmin privilege 15 secret ...`)
- **VTY Lines:** `transport input ssh`, unencrypted Telnet disabled
- **MOTD Banner:** Legal deterrent banner warning against unauthorized tampering

---

## 🧪 Predefined PBL Test Cases & Expected Outcomes

| # | Test Scenario | Expected Outcome | Responsible Cisco IOS Policy Rule |
|:---:|:---|:---:|:---|
| **1** | `ADMIN-PC` → `ADMIN gateway (192.168.10.1)` | **ALLOWED** | Local intra-VLAN gateway ARP & ICMP echo |
| **2** | `ADMIN-PC` → `STUDENT-PC` | **ALLOWED** | Inter-VLAN routing default permit policy |
| **3** | `STUDENT-PC` → `ADMIN-PC` | **BLOCKED** | Extended ACL 101: `deny ip 192.168.30.0 ... 192.168.10.0` |
| **4** | `GUEST-PC` → `ADMIN-PC` | **BLOCKED** | Extended ACL 102: `deny ip 192.168.50.0 ... 192.168.0.0` |
| **5** | `GUEST-PC` → `FACULTY-PC` | **BLOCKED** | Extended ACL 102: Guest sandbox containment |
| **6** | `GUEST-PC` → `LAB-PC` | **BLOCKED** | Extended ACL 102: Guest sandbox containment |
| **7** | `GUEST-PC` → `GUEST gateway (192.168.50.1)` | **ALLOWED** | Subinterface `G0/0.50` default router reachability |

---

## 🚀 Quickstart & Running Instructions

### Prerequisites
- Node.js (v18 or higher; tested on v24.19)
- npm

### Step 1: Clone or Open Project
```powershell
cd d:\CN
```

### Step 2: Install Dependencies
Both client and server have dependencies configured:
```powershell
# From the root directory:
npm.cmd --prefix server install
npm.cmd --prefix client install
```

### Step 3: Run the Application
Open two terminal windows or run using standard npm scripts:

**Terminal 1 (Backend API Server):**
```powershell
npm.cmd --prefix server run dev
# Starts Express REST API at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```powershell
npm.cmd --prefix client run dev
# Starts Vite React dev server at http://localhost:5173
```

### Step 4: Open in Web Browser
Navigate to:
```
http://localhost:5173
```
The Vite dev server automatically proxies all `/api/*` calls directly to the Express server on port 5000.

---

## 🖥️ Dashboard Page Highlights

1. **Dashboard Overview:** Displays key metrics (5 VLANs, 5 Devices, 8 Security Policies, Port Violations), interactive Recharts traffic breakdown, and recent event feeds.
2. **Interactive Network Topology:** Visual diagram of Cisco 2911 (R1), Cisco 2960 (S1), trunk link, and 5 access PCs with link statuses and clickable device inspection drawers.
3. **VLAN Management:** Detailed breakdown of all 5 VLAN segments with Cisco IOS CLI syntax cards and metadata editing.
4. **Network Security Lab:** Interactive test suite with protocol selectors (ICMP, HTTP, HTTPS, SSH, DNS), echo-request vs. echo-reply distinction, and simulated hop-by-hop packet journey tracing.
5. **DHCP Monitor:** Scope pool tables (excluded range `.1`–`.9`, gateway, DNS) and simulated active leases table.
6. **Port Security:** Restrict mode demonstration with an interactive **"Simulate Violation"** button that injects rogue MAC addresses and tracks dropped frames.
7. **SSH & Device Configuration:** Read-only inspection of Cisco IOS hardening commands, RSA-2048 parameters, and MOTD warning banner.
8. **Event Logs & Reports:** Searchable/filterable telemetry log, single-click CSV exports, and a print-ready summary view for academic evaluation.

---

## 🗄️ Optional PostgreSQL & Prisma Setup

The application runs in **local demo mode** with zero configuration required. If you wish to connect a persistent PostgreSQL instance:

1. Install Prisma in `server/`:
   ```powershell
   cd server
   npm.cmd install @prisma/client
   npm.cmd install -D prisma
   ```
2. Initialize Prisma schema:
   ```powershell
   npx.cmd prisma init
   ```
3. Set your `DATABASE_URL` in `server/.env` and run migrations:
   ```powershell
   npx.cmd prisma migrate dev --name init
   ```
4. Update `server/src/services/store.ts` to query `prisma.testHistory.create()` and `prisma.eventLog.create()`.

---

## 🎓 PBL Academic Demonstration Tips
- **Demonstrate Port Security:** Go to the **Port Security** tab, click **Simulate Violation** on `Fa0/3 (STUDENT-PC)`. Show the evaluators that the violation counter increments, but the port remains operational (Restrict mode).
- **Demonstrate ACL Enforcement:** Go to **Security Lab & ACL**, click `STUDENT-PC → ADMIN-PC` (shows packet dropped at Router R1 G0/0.30), then run `ADMIN-PC → STUDENT-PC` (shows packet successfully forwarded).
- **Print Final Report:** Go to **Event Logs & Report** and click **Print PBL Report** to open a clean, formatted evaluation printout.
