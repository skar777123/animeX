import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Monitor, Shield, Server, HardDrive, Network, Copy, PlaySquare, CheckCircle, Menu, X, ChevronRight } from 'lucide-react';

// --- REUSABLE SOLUTION DATA ---
// Extracted from Sanskar_Virt (1).pdf
const SOLUTIONS = {
  installHypervisor: `**Step 1: Download & Install VirtualBox**
1. Visit https://www.virtualbox.org -> Click 'Downloads'.
2. Select 'Windows Hosts' and download the installer. Also, download the matching 'VirtualBox Extension Pack'.
3. Run the VirtualBox installer. Click 'Next', keep default settings, proceed through the network warning, and click 'Install'.
4. Once installed, double-click the 'Extension Pack' file, click 'Install', accept the license agreement, and click OK.

**Step 2: Enable Virtualization in BIOS (If not already enabled)**
1. Open Windows Settings -> System -> Recovery.
2. Click 'Restart Now' under Advanced Startup.
3. Select Troubleshoot -> Advanced Options -> UEFI Firmware Settings -> Restart.
4. In BIOS, navigate to Config/Security and set 'Intel/AMD Virtualization Technology' to **Enabled**. Save and Exit.`,

  createLinuxVM: `**Step 1: Create Virtual Machine**
1. Open VirtualBox and click 'New'.
2. Enter Name: 'ubuntu', Type: 'Linux', Version: 'Ubuntu (64-bit)'.
3. Set RAM to at least 2048 MB and CPU to 1 core. Click Next.
4. Select 'Create a virtual hard disk now' -> VDI (VirtualBox Disk Image) -> Dynamically Allocated -> Set disk size to 20 GB. Click Create.

**Step 2: Attach Ubuntu ISO & Install**
1. Select the VM and click 'Settings' -> 'Storage'.
2. Click 'Empty' under Controller: IDE. Click the disk icon on the right side and choose 'Choose a disk file'. Select your Ubuntu ISO.
3. Click OK, then click 'Start' to boot the VM.
4. Choose 'Install Ubuntu', select 'Normal Installation', and 'Erase disk and install Ubuntu'. Follow the wizard to create a user and restart.`,

  createWinVM: `**Step 1: Create Virtual Machine**
1. Open VirtualBox and click 'New'.
2. Enter Name (e.g., Windows 10), Type (Microsoft Windows), and corresponding Version.
3. Set RAM to at least 4096 MB (recommended for Windows) and CPU to 2 cores.
4. Create a virtual hard disk -> VDI -> Dynamically Allocated -> Set size to 40+ GB.

**Step 2: Attach ISO & Install**
1. Select VM -> Settings -> Storage. Click 'Empty' under Controller IDE.
2. Click the disk icon and select the Windows ISO file.
3. Click 'Start' and follow the standard Windows installation process.`,

  configNAT: `**Configure NAT Networking:**
1. Select the VM and click 'Settings'.
2. Go to the 'Network' tab.
3. Ensure 'Enable Network Adapter' is checked for Adapter 1.
4. Under 'Attached to', select **NAT**.
5. Click OK and Start the VM. 
*Note: NAT allows the VM to access the internet using the host's IP address while remaining hidden from the external network.*`,

  configBridged: `**Configure Bridged Networking:**
1. Select the VM and click 'Settings'.
2. Go to the 'Network' tab.
3. Ensure 'Enable Network Adapter' is checked for Adapter 1.
4. Under 'Attached to', select **Bridged Adapter**.
5. In the 'Name' dropdown, select your host machine's active network connection (e.g., your Wi-Fi or Ethernet adapter).
6. Click OK and Start the VM. Run \`ip a\` in Linux or \`ipconfig\` in Windows to verify it received an IP from your physical router.`,

  configHostOnly: `**Configure Host-Only Networking:**
1. Select the VM and click 'Settings'.
2. Go to the 'Network' tab.
3. Ensure 'Enable Network Adapter' is checked for Adapter 1.
4. Under 'Attached to', select **Host-only Adapter**.
5. Select the VirtualBox Host-Only Ethernet Adapter from the Name dropdown.
6. Click OK and Start the VM. 
*Note: This strictly isolates the VM from the internet but allows direct communication with the Host machine.*`,

  snapshotClone: `**Create and Restore Snapshot:**
1. Select the VM and click on the 'Snapshots' tab (list icon on the top right).
2. Click the 'Take Snapshot' button, give it a name (e.g., 'Clean State'), and click OK.
3. To restore: Right-click the snapshot name and click 'Restore Snapshot'.

**Perform VM Cloning:**
1. Right-click the powered-off VM in the main VirtualBox manager and select 'Clone'.
2. Enter a new name for the cloned VM.
3. Select 'Full Clone' (creates an exact, independent copy) and click Finish.`,

  virtualDisk: `**Create and Attach Virtual Disk:**
1. Ensure the VM is powered off. Select the VM and click 'Settings'.
2. Go to 'Storage'. Select 'Controller: SATA' and click the 'Add Hard Disk' icon (+).
3. Click 'Create' -> Choose VDI (VirtualBox Disk Image) -> Dynamically Allocated -> Set Size (e.g., 20 GB) -> Click Finish.
4. Select the newly created disk from the 'Not Attached' list and click 'Choose'. Click OK.
5. Boot the VM. In Linux, use \`lsblk\` to verify the disk, \`sudo fdisk /dev/sdb\` to partition, and \`sudo mkfs -t ext4 /dev/sdb1\` to format before mounting it.`,

  headlessMode: `**Server Virtualization / Headless Mode:**
1. Open Windows Command Prompt (\`cmd\`).
2. Navigate to the VirtualBox directory or use the global command if mapped. List VMs: \`VBoxManage list vms\`
3. Start the VM without a GUI: \`VBoxManage startvm "Your_VM_Name" --type headless\`
4. Verify it is running: \`VBoxManage list runningvms\`
5. Power off: \`VBoxManage controlvm "Your_VM_Name" poweroff\`
*Note: This is useful for server virtualization where VMs are accessed via SSH or RDP, saving host GUI resources.*`
};

// --- CASE STUDIES DATA ---
// Extracted from Case study.pdf
const CASE_STUDIES = [
  {
    title: "Case Study 1: College Computer Lab Virtualization",
    scenario: "A college wants to replace physical systems with virtual machines to reduce cost and maintenance.",
    tasks: `**1. Suggest a suitable Type-2 hypervisor:** Oracle VirtualBox or VMware Workstation Player. They are cost-effective, support varied guest OSs, and are intuitive for academic environments.
**2. Design VM setup for 30 students:** Install the hypervisor on the host machines. Create a 'Master VM' with all necessary lab software. Clone this Master VM across the 30 physical hosts to guarantee a uniform environment.
**3. Explain how snapshots can help:** A 'Clean State' snapshot can be created before any lab session. If a student misconfigures the OS, the instructor can instantly revert to this snapshot, restoring the VM to its pristine condition.
**4. Recommend network mode:** NAT (Network Address Translation). It gives VMs internet access while hiding them from the college's main external network, preventing unauthorized access and IP conflicts.`
  },
  {
    title: "Case Study 2: Software Testing Environment",
    scenario: "A software company needs multiple OS environments (Windows, Linux) for testing applications.",
    tasks: `**1. Create plan for multiple VM setup:** Host machine with sufficient RAM (e.g., 16GB+). Deploy one Windows VM and one Linux VM. Ensure Virtual Machine Additions are installed for smooth integration.
**2. Explain cloning vs fresh installation:** Cloning duplicates an existing, fully-configured VM, taking minutes. Fresh installation requires installing the OS from an ISO, configuring settings, and updating, taking hours. Cloning is vastly more efficient for testing.
**3. Allocate CPU/RAM efficiently:** Use dynamic memory allocation. Allocate 4GB RAM to Windows and 2GB to Linux, leaving at least 4-8GB for the Host OS.
**4. Suggest best storage configuration:** Dynamically allocated virtual hard disks. This ensures VMs only consume physical host storage as they actually use it.`
  },
  {
    title: "Case Study 3: Cybersecurity Lab Setup",
    scenario: "A cybersecurity lab requires isolated environments to test malware safely.",
    tasks: `**1. Recommend safest network mode:** Host-only or Internal Network. This completely isolates the VM from the internet and the host's physical network.
**2. Explain why isolation is important:** Malware like ransomware or worms actively scan networks to spread. Isolation ensures the malicious code remains contained within the VM environment and cannot infect the host.
**3. Demonstrate snapshot usage:** Take a snapshot named 'Pre-Execution'. Execute the malware and analyze it. Once done, power off and immediately revert to 'Pre-Execution'.
**4. Suggest rollback mechanism:** Snapshot restoration is the primary mechanism. Alternatively, configuring the VM disk to be 'Immutable' forces it to discard all changes upon reboot.`
  },
  {
    title: "Case Study 4: Small Business Server Virtualization",
    scenario: "A small company wants to virtualize its server to reduce hardware dependency.",
    tasks: `**1. Explain server virtualization using Hyper-V or headless:** Running the hypervisor directly on hardware (Type-1) or running VMs without a GUI (headless) saves resources. Hyper-V allows enterprise-level VM management.
**2. Suggest VM configuration:** Allocate static RAM, multiple vCPUs, and Fixed-Size virtual disks for maximum performance. Assign a static IP using Bridged networking.
**3. Discuss benefits over physical server:** Reduced hardware costs, lower energy bills, easier backups (via exports), faster disaster recovery, and hardware independence.
**4. Explain backup strategy:** Take weekly snapshots before applying system updates. Export the VM to an external NAS periodically for disaster recovery.`
  },
  {
    title: "Case Study 5: Data Storage Expansion Problem",
    scenario: "A company needs to increase storage without buying new physical systems.",
    tasks: `**1. Explain virtual disk creation and attachment:** Create a new Virtual Hard Disk (VDI) in the hypervisor storage settings and attach it to the VM's virtual SATA controller.
**2. Suggest dynamic vs fixed disk:** For standard file storage, use Dynamic. For high-I/O applications like databases, use Fixed-size disks to avoid expansion overhead.
**3. Demonstrate adding storage:** Power off VM -> Go to Storage settings -> Click 'Add Hard Disk' -> Create new. Boot VM, open Disk Management or \`fdisk\`, initialize, and format the new drive.
**4. Discuss performance considerations:** Place virtual disks on physical SSDs or NVMe drives. Use Fixed-size disks for faster read/write speeds.`
  },
  {
    title: "Case Study 6: Network Configuration for Training Lab",
    scenario: "A training institute wants: Internet access for students, Internal communication between VMs, Isolation from host system.",
    tasks: `**1. Compare NAT, Bridged, and Host-only:** NAT provides internet but isolates inbound traffic. Bridged connects directly to physical network. Host-only isolates to host with no internet.
**2. Recommend suitable combination:** Use dual adapters per VM: Adapter 1 set to NAT (for internet), and Adapter 2 set to Internal Network (for isolated VM-to-VM communication).
**3. Justify choice with diagram:** [Internet] <--> (NAT Adapter) <--> [VM 1] <--> (Internal Network Adapter) <--> [VM 2]. This ensures internet access without exposing internal lab traffic.
**4. Test connectivity:** Ping external sites (e.g., 8.8.8.8) to test NAT. Ping the internal IP of another VM to test the Internal Network adapter.`
  },
  {
    title: "Case Study 7: Disaster Recovery Scenario",
    scenario: "A company lost its system due to failure and wants faster recovery in future.",
    tasks: `**1. Explain role of snapshots and cloning:** Snapshots capture VM state for quick rollbacks. Clones are complete, independent copies used to restore a totally failed system.
**2. Design recovery workflow:** Detect failure -> Retrieve latest VM backup/clone from external storage -> Import to new hypervisor -> Boot VM and redirect network traffic.
**3. Compare backup vs snapshot:** Snapshots depend on the base disk; if base disk corrupts, snapshots are useless. Backups/Clones are independent files that can be moved.
**4. Suggest best practices:** Follow the 3-2-1 backup rule. Store complete VM exports off-site or in the cloud. Do not keep snapshots for long periods.`
  },
  {
    title: "Case Study 8: Multi-OS Development Environment",
    scenario: "A developer needs Windows, Linux, and testing environments on a single machine.",
    tasks: `**1. Plan VM setup:** Host: 16GB RAM, 8 Cores. VM1 (Windows): 4GB RAM, 2 Cores. VM2 (Linux): 2GB RAM, 2 Cores. Only run needed VMs simultaneously.
**2. Explain performance optimization:** Install Guest Additions for graphics acceleration and shared folders. Keep virtual disks on an SSD. Use dynamic allocation.
**3. Use cloning to save time:** Create a 'Base' Linux VM. Create 'Linked Clones' for testing environments, which takes seconds and uses minimal disk space.
**4. Configure networking:** Use Host-only adapter so the host browser can access local web servers running on VMs, while a NAT adapter provides internet.`
  },
  {
    title: "Case Study 9: University Exam Lab Reset System",
    scenario: "During practical exams, systems often get misconfigured by students.",
    tasks: `**1. Propose VM-based solution:** Set up a Master VM with all exam software. Take a baseline snapshot called 'Ready for Exam' before the exam begins.
**2. Explain instant restore:** After a student finishes, the invigilator selects the VM, clicks 'Revert to Current Snapshot', undoing all student changes instantly.
**3. Suggest frequency:** Create baseline snapshot once per semester or when syllabus changes. Restore it after every individual student's session.
**4. Compare cloning vs snapshot:** Cloning creates a full copy (takes minutes/space). Snapshots track delta changes and restore in seconds, making them far superior for rapid resets.`
  },
  {
    title: "Case Study 10: Freelancer with Low-End Laptop",
    scenario: "A freelancer needs to run multiple OS but has limited RAM and CPU.",
    tasks: `**1. Suggest lightweight VM configuration:** Allocate 1GB RAM and 1 CPU core per VM. Disable 3D acceleration. Run only one VM at a time.
**2. Recommend OS choices:** Avoid Windows 11. Use lightweight Linux distros (Lubuntu, Xubuntu, Alpine) or older optimized versions of Windows.
**3. Explain resource optimization:** Use 'Headless Start' if GUI isn't needed. Pause or 'Save State' instead of running VMs in the background. Close heavy host apps.
**4. Suggest storage type:** Dynamic disk is mandatory here to preserve the host's limited physical storage space.`
  },
  {
    title: "Case Study 11: IT Training Center Setup",
    scenario: "An institute wants to teach Windows and Linux simultaneously.",
    tasks: `**1. Design VM lab setup:** Install a base Host OS. Create two VMs per workstation: one Windows and one Linux. Provide instructions to switch between them.
**2. Suggest number of VMs per system:** Two primary VMs. Depending on RAM, they can run simultaneously (8GB+ host) or one at a time (4GB host).
**3. Recommend network configuration:** Bridged Networking if students need to access centralized institute servers directly via IP. Otherwise, NAT for safe internet.
**4. Explain benefits over dual boot:** Allows simultaneous use without rebooting, copy-pasting between host and guest, safe snapshots if OS breaks, and hardware independence.`
  },
  {
    title: "Case Study 12: Web Developer Testing Environment",
    scenario: "A developer needs to test websites on different OS and browsers.",
    tasks: `**1. Plan VM-based testing setup:** Set up base VMs for Windows, Linux, and macOS. Install necessary browsers (Chrome, Firefox, Safari, Edge) on each.
**2. Use cloning:** Create a base Windows VM. Use 'Linked Clones' to create different environments (e.g., testing IE11 vs latest Edge) without wasting disk space.
**3. Configure network:** Use a 'Host-only' or 'Bridged' adapter so the VMs can resolve and connect to the local development server hosted on the physical developer machine.`
  },
  {
    title: "Case Study 13: Secure Banking Application Testing",
    scenario: "A bank wants to test applications in a secure, isolated environment.",
    tasks: `**1. Recommend safest network mode:** Host-Only Networking or Internal Network without routing. No NAT or Bridged modes should be enabled.
**2. Justify use of Host-only:** It allows the VM to communicate ONLY with the host machine (for extracting logs) but physically blocks all outbound internet traffic.
**3. Explain isolation importance:** Banking apps contain sensitive PII and keys. Isolation prevents external hacking attempts, malware interference, and data leaks.
**4. Suggest backup mechanism:** Export VMs as encrypted OVAs/OVFs to a secure offline server. Avoid relying solely on hypervisor snapshots for long-term secure backups.`
  },
  {
    title: "Case Study 14: Cloud Migration Preparation",
    scenario: "A company plans to move from physical systems to cloud.",
    tasks: `**1. Explain role of virtualization:** Virtualization is the foundation of cloud computing. It abstracts physical hardware into virtual resources, allowing scalable, portable VMs.
**2. Design VM architecture:** Audit physical servers. Create matching VMs on-premise. Perform a Physical-to-Virtual (P2V) conversion to test workloads before uploading to cloud.
**3. Compare physical vs virtual:** Physical systems are rigid and scale poorly. Virtual systems are hardware-agnostic, easily cloned, highly scalable, and capable of live migration.
**4. Suggest advantages:** Cost optimization via server consolidation, agility in provisioning, high availability, easier backups, and a seamless stepping stone to cloud infrastructure.`
  },
  {
    title: "Case Study 15: Startup Cost Optimization",
    scenario: "A startup wants to reduce hardware investment.",
    tasks: `**1. Suggest virtualization strategy:** Implement Server Consolidation. Instead of buying separate physical servers for Web, Database, and Mail, run all three as isolated VMs on one host.
**2. Explain cost benefits:** Drastically reduces capital expenditure on hardware. Lowers operational costs including electricity, cooling, and data center rack space.
**3. Design VM usage plan:** Host: Proxmox/Hyper-V. VM1: Web Server (Linux, 2GB RAM). VM2: Database Server (Linux, 4GB RAM). VM3: Internal Tools (2GB RAM).
**4. Recommend storage/network:** Use dynamic virtual disks to maximize storage efficiency. Use Bridged networking so each VM gets its own dedicated IP address.`
  },
  {
    title: "Case Study 16: Gaming Testing Lab",
    scenario: "A gaming company needs multiple OS for compatibility testing.",
    tasks: `**1. Design VM setup:** High-performance Host machine. Multiple VMs mapped to different OS versions (Windows 10, Windows 11, Linux with Proton).
**2. Allocate CPU/GPU resources:** Enable PCIe Passthrough (IOMMU/VT-d) to give the VM direct access to the physical GPU. Allocate max logical CPU cores and 8-16GB RAM.
**3. Explain limitations:** Standard VMs emulate graphics, resulting in severe lag, low FPS, and lack of DirectX support. Anti-cheat software often blocks games in VMs.
**4. Suggest optimization:** Use GPU Passthrough, allocate fixed-size storage on NVMe SSDs, lock CPU cores to the VM (CPU pinning), and ensure VT-x/AMD-V is enabled.`
  },
  {
    title: "Case Study 17: Remote Learning Environment",
    scenario: "Students need access to lab software from home.",
    tasks: `**1. Suggest VM-based solution:** Host Virtual Desktop Infrastructure (VDI) or standardized VMs on the college's central servers. Students connect remotely.
**2. Explain headless mode:** Run VMs without a graphical interface on the host server (headless). This saves significant host resources, allowing more student VMs to run concurrently.
**3. Design access mechanism:** Students use a VPN to connect to the college network, then use RDP or SSH to log into their assigned VM.
**4. Discuss benefits:** 24/7 access from anywhere, no wear and tear on physical lab machines, centrally managed security, and students don't need powerful laptops.`
  },
  {
    title: "Case Study 18: Backup and Recovery Planning",
    scenario: "A company wants regular backups without downtime.",
    tasks: `**1. Compare snapshots vs full backups:** Snapshots capture delta changes instantly but rely on the base disk. Full backups export the entire VM independently but take more time/storage.
**2. Design backup schedule:** Take snapshots daily for quick rollback of minor errors. Run full VM backups (exports) weekly during off-hours to an external NAS or cloud storage.
**3. Explain recovery steps:** Minor corruption: Revert to yesterday's snapshot. Major hardware failure: Import the weekly full backup to a new host.
**4. Suggest best practices:** Delete old snapshots regularly to prevent virtual disk fragmentation. Follow the 3-2-1 rule. Automate backups using hypervisor APIs.`
  },
  {
    title: "Case Study 19: Multi-User Server Environment",
    scenario: "A company wants multiple users to access different systems on one machine.",
    tasks: `**1. Design VM allocation strategy:** Deploy a robust Type-1 or Type-2 hypervisor. Create separate VMs dedicated to specific departments (e.g., HR VM, Dev VM, Sales VM).
**2. Explain server virtualization:** Partitioning a single physical server into multiple isolated virtual servers. Each runs its own OS and operates completely independently.
**3. Recommend Hyper-V:** Hyper-V integrates natively with Windows Server, offers excellent resource management, and runs highly efficiently.
**4. Discuss scalability:** Virtualization allows instant scalability. Admin can simply adjust a slider to allocate more virtual RAM or CPUs without touching physical hardware.`
  },
  {
    title: "Case Study 20: Research Lab Isolation Requirement",
    scenario: "Researchers need isolated environments for experiments.",
    tasks: `**1. Suggest network configuration:** Host-Only or Internal Network. This ensures experiments cannot inadvertently access the internet or the university's production network.
**2. Explain Host-only vs NAT:** NAT translates the VM IP for internet access. Host-only strictly restricts communication to just the VM and the Host, physically blocking internet routing.
**3. Use snapshots for rollback:** Take a baseline snapshot before running volatile code. Revert to the snapshot immediately after gathering results to reset the environment.
**4. Discuss security benefits:** Total containment. If a researcher accidentally creates a network loop or deploys a virus, it is trapped inside the virtual environment.`
  },
  {
    title: "Case Study 21: Hospital Management System Testing",
    scenario: "A hospital wants to test its software on different OS without affecting live systems.",
    tasks: `**1. Design testing environment:** Create a 'Staging' environment on an isolated host. Clone the production Database and Application servers into VMs to simulate the real environment.
**2. Recommend OS combinations:** Windows 10/11 VMs for client endpoints (reception/doctors). Windows Server or Linux VMs for backend database and application hosting.
**3. Use snapshots for safe testing:** Before applying a major HMS software update, take a snapshot. If it fails or causes data loss, restore the snapshot instantly.
**4. Suggest network configuration:** Internal Network. This ensures the test VMs cannot accidentally sync with or corrupt the live production hospital database.`
  },
  {
    title: "Case Study 22: Digital Forensics Lab",
    scenario: "A forensic team needs to analyze suspect systems without modifying original data.",
    tasks: `**1. Explain use of VM cloning:** Forensic analysts convert the suspect's physical hard drive to a virtual disk image. They then clone this image into a VM to conduct analysis safely.
**2. Justify read-only disk usage:** Connecting the virtual disk as 'Read-Only' or 'Immutable' ensures no tools or accidental actions can modify the evidence, preserving the chain of custody.
**3. Recommend isolated network setup:** Host-Only. Prevents malware on the suspect's system from spreading or 'phoning home' via the internet.
**4. Explain importance of snapshots:** Snapshots capture the state before running invasive analysis tools, allowing analysts to reset and try different forensic approaches.`
  },
  {
    title: "Case Study 23: E-Learning Platform Development",
    scenario: "A team is building LMS and needs different environments for development and testing.",
    tasks: `**1. Design VM workflow:** Developers build the LMS on an 'LMS-Dev' VM. Once complete, it is pushed to an identical 'LMS-Test' VM for QA engineers to evaluate.
**2. Explain cloning for quick setup:** Instead of manually configuring Apache/PHP/MySQL on every machine, configure it once on a Base VM and clone it for all developers and testers.
**3. Suggest network configuration:** NAT Network. Allows VMs to download packages from the internet while enabling them to communicate with each other on the same subnet.
**4. Optimize resource allocation:** Use dynamic RAM and dynamic disks. Limit dev VMs to minimal specs so multiple environments can run concurrently on a single workstation.`
  },
  {
    title: "Case Study 24: IT Support Troubleshooting Lab",
    scenario: "An IT team needs to replicate customer issues on different OS.",
    tasks: `**1. Create VM setup for multiple OS:** Maintain a repository of base VMs covering all supported OS versions (Windows 10, Windows 11, macOS, Ubuntu). Launch the specific VM matching the customer's OS.
**2. Use snapshots before fixes:** Once the issue is replicated, take a snapshot. The technician can test a fix (e.g., registry edit). If it fails, restore snapshot and try another fix.
**3. Restore system after testing:** After successfully resolving the ticket, restore the base snapshot to clean out all replicated issues, leaving VM ready for the next ticket.
**4. Explain benefits over physical:** Eliminates the need for a physical lab full of laptops. Instant switching between environments. Eliminates hours of OS reformatting.`
  }
];

// --- GENERATE ALL 24 SLIPS ---
const SLIPS = [
  { q1: { title: "Install VirtualBox or VMware Player.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create VM and manage resources.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Configure NAT networking.", sol: SOLUTIONS.configNAT }, q4: CASE_STUDIES[0] },
  { q1: { title: "Install hypervisor.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Linux VM.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Configure Host-only networking.", sol: SOLUTIONS.configHostOnly }, q4: CASE_STUDIES[1] },
  { q1: { title: "Install VirtualBox.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create VM and install OS.", sol: SOLUTIONS.createWinVM }, q3: { title: "Create and restore snapshot.", sol: SOLUTIONS.snapshotClone }, q4: CASE_STUDIES[2] },
  { q1: { title: "Install VMware Player.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Windows VM.", sol: SOLUTIONS.createWinVM }, q3: { title: "Configure Bridged networking.", sol: SOLUTIONS.configBridged }, q4: CASE_STUDIES[3] },
  { q1: { title: "Install VirtualBox.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Linux VM and configure storage.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Attach and manage virtual disk.", sol: SOLUTIONS.virtualDisk }, q4: CASE_STUDIES[4] },
  { q1: { title: "Install hypervisor.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create VM and install OS.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Perform cloning of VM.", sol: SOLUTIONS.snapshotClone }, q4: CASE_STUDIES[5] },
  { q1: { title: "Install VirtualBox.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create and manage multiple VMs.", sol: SOLUTIONS.createWinVM }, q3: { title: "Configure NAT networking.", sol: SOLUTIONS.configNAT }, q4: CASE_STUDIES[6] },
  { q1: { title: "Install VMware Player.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Linux VM.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Configure Host-only network.", sol: SOLUTIONS.configHostOnly }, q4: CASE_STUDIES[7] },
  { q1: { title: "Install VirtualBox.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Windows VM and configure RAM/CPU.", sol: SOLUTIONS.createWinVM }, q3: { title: "Attach virtual disk.", sol: SOLUTIONS.virtualDisk }, q4: CASE_STUDIES[8] },
  { q1: { title: "Install hypervisor.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create VM and install Linux OS.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Perform snapshot and cloning.", sol: SOLUTIONS.snapshotClone }, q4: CASE_STUDIES[9] },
  { q1: { title: "Install VirtualBox and enable virtualization.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create dual VMs.", sol: SOLUTIONS.createLinuxVM + "\n\n" + SOLUTIONS.createWinVM }, q3: { title: "Configure Bridged networking.", sol: SOLUTIONS.configBridged }, q4: CASE_STUDIES[10] },
  { q1: { title: "Install VMware Player and configure settings.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Windows VM with ISO.", sol: SOLUTIONS.createWinVM }, q3: { title: "Configure NAT and test internet.", sol: SOLUTIONS.configNAT }, q4: CASE_STUDIES[11] },
  { q1: { title: "Install VirtualBox.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Linux VM and configure disk.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Attach additional virtual disk.", sol: SOLUTIONS.virtualDisk }, q4: CASE_STUDIES[12] },
  { q1: { title: "Install hypervisor and compare features.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create VM and install OS.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Clone VM and verify functionality.", sol: SOLUTIONS.snapshotClone }, q4: CASE_STUDIES[13] },
  { q1: { title: "Install VirtualBox and configure network settings.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Windows VM.", sol: SOLUTIONS.createWinVM }, q3: { title: "Configure Host-only networking.", sol: SOLUTIONS.configHostOnly }, q4: CASE_STUDIES[14] },
  { q1: { title: "Install VMware Player.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Linux VM and configure storage.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Create and restore snapshot.", sol: SOLUTIONS.snapshotClone }, q4: CASE_STUDIES[15] },
  { q1: { title: "Install and configure a Type-2 Hypervisor using VirtualBox.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create a Linux virtual machine and install OS.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Demonstrate snapshot creation and restoration.", sol: SOLUTIONS.snapshotClone }, q4: CASE_STUDIES[16] },
  { q1: { title: "Install VMware Workstation Player and configure settings.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create a Windows VM and install OS.", sol: SOLUTIONS.createWinVM }, q3: { title: "Configure NAT networking for the VM.", sol: SOLUTIONS.configNAT }, q4: CASE_STUDIES[17] },
  { q1: { title: "Compare VirtualBox and VMware installation steps.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create and manage two VMs (Windows + Linux).", sol: SOLUTIONS.createLinuxVM + "\n\n" + SOLUTIONS.createWinVM }, q3: { title: "Configure Bridged networking.", sol: SOLUTIONS.configBridged }, q4: CASE_STUDIES[18] },
  { q1: { title: "Install VirtualBox and create initial configuration.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Clone an existing virtual machine.", sol: SOLUTIONS.snapshotClone }, q3: { title: "Configure Host-only network.", sol: SOLUTIONS.configHostOnly }, q4: CASE_STUDIES[19] },
  { q1: { title: "Install and configure VMware Player.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create VM and attach ISO image.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Perform snapshot and rollback.", sol: SOLUTIONS.snapshotClone }, q4: CASE_STUDIES[20] },
  { q1: { title: "Install VirtualBox and configure system settings.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Linux VM with custom RAM/CPU allocation.", sol: SOLUTIONS.createLinuxVM }, q3: { title: "Demonstrate VM cloning.", sol: SOLUTIONS.snapshotClone }, q4: CASE_STUDIES[21] },
  { q1: { title: "Install hypervisor and configure environment.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create Windows VM and manage resources.", sol: SOLUTIONS.createWinVM }, q3: { title: "Configure NAT and test connectivity.", sol: SOLUTIONS.configNAT }, q4: CASE_STUDIES[22] },
  { q1: { title: "Install VirtualBox with extension pack.", sol: SOLUTIONS.installHypervisor }, q2: { title: "Create and configure two VMs.", sol: SOLUTIONS.createLinuxVM + "\n\n" + SOLUTIONS.createWinVM }, q3: { title: "Configure Bridged networking and test IP.", sol: SOLUTIONS.configBridged }, q4: CASE_STUDIES[23] }
];

const PracticalsDashboard = () => {
  const [activeSlipId, setActiveSlipId] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSlip = SLIPS[activeSlipId];

  // Helper to format text with pseudo-markdown bold parsing
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      // Very basic parser for **bold**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={index} className="mb-2 text-slate-700 leading-relaxed">
          {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-slate-900 font-semibold">{part}</strong> : part))}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">

      {/* Mobile Header & Menu Toggle */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" /> Virtualization Practicals
        </h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:sticky top-0 left-0 z-40 w-72 h-screen transition-transform 
        bg-slate-900 text-slate-300 shadow-xl overflow-y-auto flex-shrink-0
      `}>
        <div className="p-6 hidden md:block border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-400" />
            <span className="leading-tight">Virtualization<br />Practicals Guide</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2">M.Sc. IT (Cloud Computing) Sem II</p>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {SLIPS.map((slip, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveSlipId(idx); setSidebarOpen(false); }}
              className={`
                flex items-center justify-between text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium
                ${activeSlipId === idx
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3">
                <BookOpen className={`w-4 h-4 ${activeSlipId === idx ? 'text-blue-200' : 'text-slate-500'}`} />
                Slip Number {idx + 1}
              </div>
              {activeSlipId === idx && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto p-4 md:p-8 w-full">

        {/* Exam Header
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-1">
            B. K. Birla College of Arts, Science and Commerce (Autonomous), Kalyan
          </h2>
          <h3 className="text-md text-slate-600 font-medium mb-4">
            M.Sc. Information Technology (Cloud Computing) (Semester II) Practical Examination
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm font-semibold text-slate-500 border-t border-slate-100 pt-4 mt-2 gap-2">
            <div className="bg-slate-100 px-4 py-2 rounded-md">SUBJECT: Virtualization</div>
            <div className="bg-slate-100 px-4 py-2 rounded-md">Practical Slip No: {activeSlipId + 1}</div>
            <div className="bg-slate-100 px-4 py-2 rounded-md">Max Marks: 100</div>
          </div>
        </div> */}

        {/* Questions and Solutions */}
        <div className="space-y-6">

          {/* Question 1 */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-5 flex justify-between items-start md:items-center gap-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                {activeSlip.q1.title}
              </h3>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">25 Marks</span>
            </div>
            <div className="p-5 md:p-6 bg-white">
              <div className="prose prose-slate max-w-none text-sm md:text-base">
                {formatText(activeSlip.q1.sol)}
              </div>
            </div>
          </section>

          {/* Question 2 */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-5 flex justify-between items-start md:items-center gap-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                {activeSlip.q2.title}
              </h3>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">25 Marks</span>
            </div>
            <div className="p-5 md:p-6 bg-white">
              <div className="prose prose-slate max-w-none text-sm md:text-base">
                {formatText(activeSlip.q2.sol)}
              </div>
            </div>
          </section>

          {/* Question 3 */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-5 flex justify-between items-start md:items-center gap-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                {activeSlip.q3.title}
              </h3>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">20 Marks</span>
            </div>
            <div className="p-5 md:p-6 bg-white">
              <div className="prose prose-slate max-w-none text-sm md:text-base">
                {formatText(activeSlip.q3.sol)}
              </div>
            </div>
          </section>

          {/* Question 4 - Case Study */}
          <section className="bg-white rounded-xl shadow-sm border border-indigo-200 overflow-hidden border-t-4 border-t-indigo-500">
            <div className="bg-indigo-50/50 border-b border-indigo-100 p-4 md:p-5 flex justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-1">
                  <span className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
                  {activeSlip.q4.title}
                </h3>
              </div>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">20 Marks</span>
            </div>

            <div className="p-5 md:p-6 bg-white">
              <div className="mb-6 p-4 bg-slate-50 border-l-4 border-slate-400 rounded-r-lg text-slate-700 text-sm md:text-base italic">
                <strong>Scenario: </strong>{activeSlip.q4.scenario}
              </div>

              <h4 className="font-bold text-slate-800 mb-3 text-md uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Tasks & Solutions
              </h4>

              <div className="prose prose-indigo max-w-none text-sm md:text-base">
                {formatText(activeSlip.q4.tasks)}
              </div>
            </div>
          </section>

          {/* Question 5 */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 md:p-5 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm">5</span>
                Viva and Journal
              </h3>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">10 Marks</span>
            </div>
          </section>

        </div>

        <footer className="mt-12 text-center text-slate-400 text-sm pb-8">
          Generated based on Virtualization Practicals course material & case studies.
        </footer>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const RouterHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('authorized') === 'true';
  });

  useEffect(() => {
    if (location.pathname === '/0909') {
      sessionStorage.setItem('authorized', 'true');
      setIsAuthorized(true);
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/" element={isAuthorized ? children : null} />
      <Route path="*" element={null} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <RouterHandler>
        <PracticalsDashboard />
      </RouterHandler>
    </BrowserRouter>
  );
}
