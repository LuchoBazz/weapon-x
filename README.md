# WEAPON-X
```text
 __        _______    _    ____   ___  _   _        __  __
 \ \      / / ____|  / \  |  _ \ / _ \| \ | |       \ \/ /
  \ \ /\ / /|  _|   / _ \ | |_) | | | |  \| |  _____\  / 
   \ V  V / | |___ / ___ \|  __/| |_| | |\  | |_____/  \ 
    \_/\_/  |_____/_/   \_\_|    \___/|_| \_|      /_/\_\ 
                                                         
========== [ CLASSIFIED: TOP SECRET ] ==========
```

> **WARNING:** UNAUTHORIZED ACCESS TO THIS REPOSITORY IS STRICTLY PROHIBITED.
> **SUBJECT:** ADVANCED FEATURE FLAG & CONFIGURATION MANAGEMENT SYSTEM.
> **STATUS:** RETRO-ENGINEERED / ACTIVE

---

## 🧬 MISSION ABSTRACT

**PROJECT DESIGNATION:** WEAPON-X  
**OBJECTIVE:** ZERO-LATENCY FEATURE EVALUATION

Weapon-X is a high-performance, centralized control system designed to manage application configurations and feature toggles across distributed environments. Unlike standard systems that suffer from network latency, Weapon-X utilizes a dual-mode evaluation strategy:

1.  **Remote Command:** Server-side evaluation for secure, audit-logged decisions.
2.  **Autonomous Protocol:** Client-side, zero-latency evaluation using cryptographic sync, ensuring features deploy instantly without network round-trips.

This system provides a unified interface for defining Projects, Environments, and conditional Rules, allowing operators to surgically target specific user segments (Test Subjects) based on custom attributes.

---

## ⚔️ THE ARSENAL

Weapon-X is built upon a hardened stack of advanced technologies, optimized for speed and reliability.

### **Command Center (Frontend)**
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/Shadcn%2FUI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### **Mainframe (Backend)**
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

### **Tactical Gear (SDK)**
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Crypto-JS](https://img.shields.io/badge/CryptoJS-000000?style=for-the-badge&logo=javascript&logoColor=white)

---

## 💉 INJECTION PROTOCOL

**PREREQUISITES:**
*   Node.js v20+ (Runtime Environment)
*   Bun v1.0+ (Package Manager / Runtime)
*   Docker & Docker Compose (Containerization)

**INITIALIZATION:**
Clone the classified repository to your local machine.

```bash
git clone https://github.com/LuchoBazz/weapon-x.git
cd weapon-x
```

**DEPENDENCY INJECTION:**
Install all required node modules across the monorepo using Bun.

```bash
# Execute global dependency installation
bun install
```

---

## 🎖️ FIELD OPERATIONS

### **1. Ignite the Mainframe (Backend & DB)**

Navigate to the server sector and initiate the Docker containers. This will spin up the PostgreSQL database and the API service.

```bash
cd server
cp .env.example .env     # Configure your environment variables
docker-compose up -d     # Deploy containers in background mode
bun run prisma:migrate   # Apply database schema transformations
```

### **2. Launch the Command Center (Frontend)**

Return to the root directory and initiate the development interface.

```bash
cd ..
bun dev
```

> **Target Acquired:** The Command Center is now accessible at `http://localhost:5173`.

### **3. Deploy the SDK (Integration)**

To utilize the Weapon-X capabilities in other applications, build the SDK package.

```bash
cd packages/sdk
bun run build
```

---

## 📁 CLASSIFIED ARCHITECTURE

The Weapon-X facility is organized into distinct sectors:

*   **`/server`**: The brain of the operation. REST API handling authentication, rule management, and flag evaluation.
*   **`/src` (Root)**: The frontend dashboard. A visual interface for operators to manipulate system configurations.
*   **`/packages/sdk`**: The portable tactical unit. Allows external applications to interface with Weapon-X.
    *   `AdminClient`: For management operations.
    *   `EvaluationClient`: For remote server-side evaluation.
    *   `SyncEvaluationClient`: For instant, local evaluation.

---

## 🔐 CLEARANCE LEVEL

**CONTRIBUTION PROTOCOL:**
Operatives wished to contribute to the Weapon-X program must follow strict protocol:

1.  **Fork** the repository to your secure channel.
2.  Create a **Feature Branch** (`git checkout -b feature/augmentation-name`).
3.  **Commit** your changes (`git commit -m 'feat: deployed new augmentation'`).
4.  **Push** to the branch (`git push origin feature/augmentation-name`).
5.  Open a **Pull Request** for code review and security clearance.

**REPORTING SYSTEM REJECTIONS:**
If you encounter a system anomaly (bug) or have a request for a new genetic augmentation (feature), please file a report in the [Issues Channel](https://github.com/LuchoBazz/weapon-x/issues).

---
> *“We made them into weapons... and now we must control the trigger.”*
