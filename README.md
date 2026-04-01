# Chainbreaker: Agentic AI Toolchain for Solana & Ethereum Auditing

**Chainbreaker** is an autonomous agentic security toolchain designed for deep auditing and exploitation of Solana and Ethereum smart contracts. Inspired by the modular architecture of Openclaw, it integrates a multi-agent "Metasploit-like" flow with direct access to local security tools, browsers, and cross-chain execution, all orchestrated by its internal AI agent framework.

## 🚀 Features

- **Modular Agent Framework**: An internal framework manages a Commander Agent that coordinates specialized workers for Solana, Ethereum, and Network scanning.
- **Autonomous Audit Flow**: Agents automatically build, analyze (static/dynamic), and fuzz contracts.
- **Full PC Access**: Agents can execute shell commands, install required tools, and manage local files within a sandboxed environment.
- **Smart Contract Specialists**:
  - **Solana**: Leverages `anchor`, `soteria`, `trident`, `solana-program-test`.
  - **Ethereum**: Leverages `foundry`, `slither`, `echidna`, `halmos`.
- **RAG-Enhanced Reasoning**: Uses a vector database of vulnerability patterns and recent exploit reports for enhanced analysis.

## 📁 Directory Structure

- `src/`: Core Chainbreaker agent framework and internal logic.
- `agents/`: Definitions and implementations of specialized agents (Commander, Solana, Ethereum).
- `tools/`: Implementations of tools agents can use (e.g., shell executor, file manager).
- `modules/`: Metasploit-like auditing and exploitation modules.
- `skills/`: Specialized prompt templates for auditing tasks.
- `docker/`: Container configurations for the toolchain environment.
- `output/`: Audit reports, logs, and findings.
- `docs/`: Technical guides and system architecture.

## 🛠 Setup

Detailed setup instructions will be provided as the project evolves.

1.  **Environment**: Run `docker-compose up` in the `docker/` directory to spin up the toolchain.
2.  **API Keys**: Configure your LLM (Claude/GPT) and Search (Tavily/Brave) keys within the Chainbreaker configuration.

## ⚖ License

MIT
The Chainbreaker project is now fully set up and functional, with a verified core agent
  framework, including Docker integration, core components, and local execution. My next focus
  is on agent communication and orchestration, followed by specialized tool development,
  subagent spawning, LLM integration, and Metasploit-like modules.
