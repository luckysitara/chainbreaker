# n8n Implementation Guide for Chainbreaker

Chainbreaker leverages n8n's **AI Agent** nodes and **Workflow as a Tool** capabilities to create a decentralized, autonomous auditing system.

## 1. The Manager Agent (Main Workflow)
The Manager Agent is an AI Agent node configured with:
- **Model**: Claude 3.5 Sonnet (preferred for complex Rust/Solidity logic).
- **Memory**: Window Buffer Memory to keep track of the audit state.
- **Tools**: Every worker workflow (SolanaAuditor, EthereumAuditor, etc.) is connected as a "Workflow Tool".

## 2. Implementing "ExecuteShell" as a Tool
To give the agent "Full PC Access," create a sub-workflow named `ExecuteShell`:
1.  **Trigger**: "Execute Workflow" (receives `command` from the agent).
2.  **Logic**: An **Execute Command** node that runs the command in the `security-tools` container.
3.  **Safety**: (Optional) Add a "Wait for Approval" node to manually review destructive commands before execution.

## 3. Multi-Agent Flow (Concurrent Execution)
n8n allows the Manager Agent to call multiple tools. If you want **simultaneous** sub-agents:
1.  The Manager Agent sends multiple requests to the "Execute Workflow" node.
2.  Each worker workflow runs in parallel.
3.  The results are gathered and synthesized by the Manager Agent.

## 4. RAG for Auditing
To reduce hallucinations and provide "Deep Knowledge":
1.  Connect a **Vector Store** (e.g., Pinecone or Qdrant) to the AI Agent node.
2.  Upload vulnerability patterns (SWC Registry, DeFiHackLabs) into the Vector Store.
3.  The agent will automatically query the store for relevant patterns before performing an audit.

## 5. Implementation Steps
1.  Import the workflow JSONs from the `workflows/` directory into your n8n instance.
2.  Configure your API Credentials (LLM, Vector DB).
3.  Update the tool descriptions in the Manager Agent node so it understands when to call each worker.
