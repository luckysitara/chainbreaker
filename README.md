# Chainbreaker: Agentic AI Toolchain for Solana & Ethereum Auditing

**Chainbreaker** is an autonomous agentic security toolchain designed for deep auditing and exploitation of Solana and Ethereum smart contracts. Orchestrated by **n8n**, it integrates a multi-agent "Metasploit-like" flow with direct access to local security tools, browsers, and cross-chain execution.

## 🚀 Features

- **Multi-Agent Orchestration**: A Manager Agent coordinates specialized workers for Solana, Ethereum, and Network scanning.
- **Autonomous Audit Flow**: Automatically builds, analyzes (static/dynamic), and fuzzes contracts.
- **Full PC Access**: Executes shell commands, installs required tools, and manages local files via n8n.
- **Smart Contract Specialists**:
  - **Solana**: `anchor`, `soteria`, `trident`, `solana-program-test`.
  - **Ethereum**: `foundry`, `slither`, `echidna`, `halmos`.
- **RAG-Enhanced Reasoning**: Uses a vector database of vulnerability patterns and recent exploit reports.
- **Full n8n Integration**: Workflows are modular, versioned, and easily extensible.

## 📁 Directory Structure

- `workflows/`: JSON exports of n8n workflows (the agent "brains").
- `scripts/`: Custom exploit/audit scripts used by agents.
- `docs/`: Technical guides and system architecture.
- `skills/`: Specialized prompt templates for auditing tasks.
- `docker/`: Container configurations for the toolchain environment.
- `output/`: Audit reports, logs, and findings.

## 🛠 Setup

Detailed setup instructions will be provided as the project evolves.

1.  **Self-Hosted n8n**: Ensure you have a self-hosted instance of n8n.
2.  **Environment**: Run `docker-compose up` in the `docker/` directory to spin up the toolchain.
3.  **API Keys**: Configure your LLM (Claude/GPT) and Search (Tavily/Brave) keys.

## ⚖ License

MIT
