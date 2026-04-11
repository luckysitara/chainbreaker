# 🦞 Chainbreaker — Personal AI Assistant & Web3 Security Researcher

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/luckysitara/chainbreaker/main/docs/assets/chainbreaker-logo-text-dark.svg">
        <img src="https://raw.githubusercontent.com/luckysitara/chainbreaker/main/docs/assets/chainbreaker-logo-text.svg" alt="Chainbreaker" width="500">
    </picture>
</p>

**Chainbreaker** is a high-performance, self-hosted AI assistant designed for developers and security researchers. It acts as a universal AI gateway that connects the world's most powerful LLMs to your personal messaging channels and a specialized, root-enabled security sandbox.

Beyond standard assistant tasks, Chainbreaker is equipped with a **full-stack Web3 Whitehat Auditing suite**, capable of autonomously analyzing and auditing smart contracts on both **EVM** and **SVM** (Solana) chains.

---

## 🚀 Key Features

### 1. Universal AI Gateway
Chainbreaker lives where you are. It monitors your messages and responds using the AI models you choose.
*   **Supported Channels:** WhatsApp, Telegram, and a built-in WebChat interface.
*   **Isolated Sessions:** Per-user and per-group conversation tracking with context pruning.
*   **Real-time Interaction:** Supports typing indicators, voice-to-text, and high-quality text-to-speech.

### 2. Web3 Security Researcher (Whitehat Skill)
Transform your AI into an autonomous security auditor. The `web3-whitehat` skill provides:
*   **Multi-Chain Auditing:** Full support for **Solidity (EVM)** and **Rust/Anchor (SVM/Solana)**.
*   **GitHub Integration:** Clone any repository directly into the sandbox for local building and analysis.
*   **Dynamic Tooling:** The agent has **root access** in a Docker sandbox. It can dynamically install decompilers, static analyzers, or any CLI tool (`apt`, `npm`, `pip`, `cargo`) needed for the task.
*   **Mainnet Forking:** Ability to spawn local forks (`anvil` for EVM, `solana-test-validator` for SVM) to simulate exploits against live contract states without spending gas.
*   **Verified PoCs:** The agent doesn't just guess; it writes Foundry/Anchor tests to empirically prove vulnerabilities and shows you the execution traces.

### 3. Advanced AI Model Support
Chainbreaker is unopinionated. Use your preferred provider:
*   **Cloud:** OpenAI (GPT-4o), Claude (3.5 Sonnet/Opus), Google (Gemini 1.5 Pro/Flash), Grok (xAI), DeepSeek.
*   **Aggregators:** OpenRouter, Vercel AI Gateway.
*   **Developer-First:** Full **GitHub Copilot** integration.
*   **Local-First:** Natively supports **Ollama** and **vLLM** for running models on your own hardware.

---

## 🛠 Installation & Setup

### 1. Prerequisites
*   **Node.js:** v22.14.0 or higher.
*   **pnpm:** v10.x (Recommended for workspace management).
*   **Docker:** Required for secure code execution and sandboxing.

### 2. Clone the Repository
```bash
git clone https://github.com/luckysitara/chainbreaker.git
cd chainbreaker
```

### 3. Install Dependencies & Build
```bash
# Install workspace dependencies
pnpm install

# Build the Web Control UI
pnpm ui:build

# Build the core project
pnpm build
```

### 4. Interactive Onboarding
Run the setup wizard to connect your AI models and messaging accounts:
```bash
pnpm chainbreaker onboard
```
*Follow the prompts to enter your API keys and link your WhatsApp or Telegram bot.*

---

## 🏃 Running Chainbreaker

### Start the Gateway
The Gateway is the central control plane. Start it in the background (as a service) or in the foreground:
```bash
# Run in foreground (best for logs)
pnpm chainbreaker gateway run

# Or start as a background service (Linux systemd)
pnpm chainbreaker gateway start
```

### Access the Interfaces
*   **Terminal UI (TUI):** Chat with your agent directly in your terminal.
    ```bash
    pnpm chainbreaker tui
    ```
*   **Web Dashboard:** Access the graphical control panel.
    ```bash
    pnpm chainbreaker dashboard
    ```

---

## 🛡 Using the Web3 Whitehat Skill

To use the security auditing features, ensure the `web3-whitehat` skill is active. You can then issue commands like these via WhatsApp, Telegram, or the TUI:

**Example 1: Auditing a GitHub Repo**
> "Audit this repo: https://github.com/example/defi-protocol. Find any reentrancy bugs and write a Foundry PoC to prove them."

**Example 2: Mainnet Forking (Solana)**
> "Use Helius RPC to fork Solana mainnet. Can you simulate a swap on Raydium that causes an arbitrage profit? Show me the Rust exploit code."

**Example 3: Dynamic Tooling**
> "I need to analyze this bytecode. Install the `heimdall-rs` decompiler in the sandbox and tell me what the `0x1234` function does."

---

## 🔒 Security & Privacy
*   **Local-First:** Your configuration, credentials, and conversation history stay on your machine.
*   **Sandboxed Execution:** All code execution (compiling Solidity, running exploits) happens inside a restricted Docker container.
*   **DM Policy:** By default, Chainbreaker uses a "Pairing" policy. Unknown senders must be approved via `chainbreaker pairing approve` before the AI will respond to them.

---

## 📄 License
Chainbreaker is released under the MIT License.

---
*Built for the next generation of autonomous security researchers.* 🦞
