// chainbreaker/src/agents/AutonomousCommanderAgent.ts
import { BaseAgent } from "./baseAgent.js";
const CODE_BLOCK_DELIMITER = "```"; // Define a constant for code block delimiters
// This agent will represent the LLM's thought process and decisions.
// The LLM will dictate which tools to use and which specialists to engage.
export class AutonomousCommanderAgent extends BaseAgent {
    constructor(toolManager, communicationManager, llmManager, llmProviderName = "gemini") {
        super("AutonomousCommanderAgent", toolManager, communicationManager);
        this.activeAgents = new Map();
        this.conversationHistory = [];
        this.currentGoal = "";
        this.llmManager = llmManager;
        const provider = this.llmManager.getProvider(llmProviderName);
        if (!provider) {
            throw new Error(`LLM Provider "${llmProviderName}" not found.`);
        }
        this.llmProvider = provider;
    }
    async init() {
        console.log(`${this.name} initializing discovery...`);
        await this.communicationManager.subscribeToDiscovery((announcement) => {
            console.log(`${this.name} discovered agent: ${announcement.name} (${announcement.agentId}) with capabilities: ${announcement.capabilities.join(", ")}`);
            this.activeAgents.set(announcement.agentId, announcement);
        });
        // Subscribe to all results for ongoing planning
        // Using the more flexible subscribeToResults method now
        await this.communicationManager.subscribeToResults("*", (result) => {
            this.handleAgentResult(result).catch(console.error);
        });
    }
    async handleAgentResult(result) {
        console.log(`${this.name} received async result for task ${result.taskId}:`, result);
        // Add result to conversation history for LLM to consider in next planning step
        this.conversationHistory.push({
            role: "tool",
            content: JSON.stringify({ type: "task_result", result }),
        });
        // Potentially trigger a new planning cycle if the current one is paused
        // For simplicity, this will be handled in the main run loop for now.
    }
    // This method encapsulates the LLM's thought process (ReAct/CoT style)
    async decideNextAction() {
        const availableTools = this.toolManager
            .listTools()
            .map((tool) => ({ name: tool.name, description: tool.description }));
        const availableAgents = Array.from(this.activeAgents.values()).map((agent) => ({
            name: agent.name,
            agentId: agent.agentId,
            capabilities: agent.capabilities,
        }));
        const systemPrompt = `You are an Autonomous Commander Agent. Your goal is to break down complex security auditing tasks, delegate them to specialist agents, execute tools, and synthesize results to achieve the user's objective.

You have access to the following specialist agents:
${JSON.stringify(availableAgents, null, 2)}

You have access to the following tools:
${JSON.stringify(availableTools, null, 2)}

Your current goal is: "${this.currentGoal}"

Conversation history (your previous thoughts and agent/tool outputs):
${JSON.stringify(this.conversationHistory, null, 2)}

Based on the goal, available agents, tools, and conversation history, decide your next action.
You must respond with a JSON object that strictly adheres to one of the following formats:

1.  **To delegate a task to a specialist agent:**
    ${CODE_BLOCK_DELIMITER}json
    {
      "thought": "<your_reasoning_for_this_delegation>",
      "action": "delegate_task",
      "agentId": "<id_of_specialist_agent>",
      "taskType": "<type_of_task_for_specialist>",
      "payload": { "<task_specific_parameters>" }
    }
    ${CODE_BLOCK_DELIMITER}
2.  **To execute a tool directly:**
    ${CODE_BLOCK_DELIMITER}json
    {
      "thought": "<your_reasoning_for_this_tool_execution>",
      "action": "execute_tool",
      "toolName": "<name_of_tool>",
      "params": { "<tool_specific_parameters>" }
    }
    ${CODE_BLOCK_DELIMITER}
3.  **To indicate you have completed the goal:**
    ${CODE_BLOCK_DELIMITER}json
    {
      "thought": "<your_final_assessment_of_completion>",
      "action": "finish",
      "summary": "<summary_of_findings_and_completion_status>"
    }
    ${CODE_BLOCK_DELIMITER}
4.  **To ask the user for clarification or more information:**
    ${CODE_BLOCK_DELIMITER}json
    {
      "thought": "<your_reasoning_for_needing_user_input>",
      "action": "ask_user",
      "question": "<your_question_to_the_user>"
    }
    ${CODE_BLOCK_DELIMITER}
5.  **To think about the next step without taking an action:**
    ${CODE_BLOCK_DELIMITER}json
    {
      "action": "think",
      "thought": "<your_thought_process_here>"
    }
    ${CODE_BLOCK_DELIMITER}

Ensure your JSON is valid and only includes one of the specified actions. The 'thought' field is mandatory for 'delegate_task', 'execute_tool', 'finish', and 'ask_user' actions. Do not include any other text outside the JSON.
`;
        this.conversationHistory.push({
            role: "system",
            content: systemPrompt,
        });
        const llmResponse = await this.llmProvider.generateChatCompletion(this.conversationHistory);
        this.conversationHistory.push({ role: "assistant", content: llmResponse });
        return llmResponse;
    }
    async run(goal) {
        console.log(`${this.name} received goal: "${goal}"`);
        this.currentGoal = goal;
        this.conversationHistory = [
            { role: "user", content: `Initial Goal: ${goal}` },
        ];
        let completed = false;
        while (!completed) {
            try {
                const actionJsonString = await this.decideNextAction();
                const action = JSON.parse(actionJsonString);
                // Add the LLM's thought to the conversation history if present
                if (action.thought) {
                    this.conversationHistory.push({
                        role: "assistant_thought",
                        content: action.thought,
                    });
                }
                if (action.action === "delegate_task") {
                    console.log(`${this.name} delegating task ${action.taskType} to ${action.agentId}`);
                    // Now simply publish the task; results will be handled by handleAgentResult asynchronously.
                    await this.communicationManager.publishTask({
                        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Generate unique ID
                        type: action.taskType,
                        payload: action.payload,
                        assignedTo: action.agentId,
                    });
                }
                else if (action.action === "execute_tool") {
                    console.log(`${this.name} executing tool ${action.toolName} with params:`, action.params);
                    const toolResult = await this.toolManager.executeTool(action.toolName, action.params);
                    this.conversationHistory.push({
                        role: "tool",
                        content: JSON.stringify({
                            type: "tool_output",
                            toolName: action.toolName,
                            result: toolResult,
                        }),
                    });
                }
                else if (action.action === "finish") {
                    console.log(`${this.name} finished goal: ${action.summary}`);
                    this.conversationHistory.push({
                        role: "system",
                        content: `Goal completed: ${action.summary}`,
                    });
                    completed = true;
                }
                else if (action.action === "ask_user") {
                    console.log(`${this.name} needs user input: ${action.question}`);
                    this.conversationHistory.push({
                        role: "system",
                        content: `User asked: ${action.question}. Please provide an answer to proceed.`,
                    });
                    // For a real CLI, this would interactively prompt the user.
                    // For this simulation, we'll mark as completed and the user can re-run with new info.
                    completed = true;
                }
                else if (action.action === "think") {
                    console.log(`${this.name} thinking: ${action.thought}`);
                    // No action taken, LLM will think again in the next loop iteration
                }
                else {
                    console.error(`${this.name} received unknown action:`, action);
                    this.conversationHistory.push({
                        role: "system",
                        content: `Error: Unknown action received from LLM: ${JSON.stringify(action)}. Please provide a valid action.`,
                    });
                }
            }
            catch (error) {
                console.error(`${this.name} error during planning/execution:`, error);
                this.conversationHistory.push({
                    role: "system",
                    content: `Error during execution: ${error.message}. Please adjust your plan.`,
                });
                // Avoid infinite loops on persistent errors
                if (this.conversationHistory.length > 20) {
                    console.error(`${this.name} too many errors, breaking autonomous loop.`);
                    completed = true;
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay to prevent busy-looping
        }
        // After the loop, generate a final summary report from all results.
        const reportContent = this.generateSummaryReport();
        await this.toolManager.executeTool("write_file", {
            path: `./output/autonomous_audit_report_${Date.now()}.md`,
            content: reportContent,
        });
        console.log(`${this.name} Autonomous audit report generated in output/`);
        console.log(`${this.name} finished goal.`);
    }
    // Re-use the summary report generation logic
    generateSummaryReport() {
        let report = `# Chainbreaker Autonomous Audit Summary Report

`;
        report += `**Report Generated:** ${new Date().toISOString()}

`;
        report += `---

`;
        report += `## Discovered Agents
`;
        if (this.activeAgents.size > 0) {
            this.activeAgents.forEach((agent) => {
                report += `- **${agent.name}** (ID: ${agent.agentId})
`;
                report += `  - Capabilities: ${agent.capabilities.join(", ")}
`;
            });
        }
        else {
            report += `No agents discovered.
`;
        }
        report += `---

`;
        report += `## Task Execution Summary (from conversation history)
`;
        if (this.conversationHistory.length > 0) {
            this.conversationHistory.forEach((entry, index) => {
                if (entry.role === "tool") {
                    const content = JSON.parse(entry.content);
                    report += `### Action ${index + 1}: ${content.type}
`;
                    if (content.type === "task_result") {
                        report += `- Task Type: ${content.result.taskType}
`;
                        report += `- Status: ${content.result.status}
`;
                        if (content.result.error) {
                            report += `  - Error: ${content.result.error}
`;
                        }
                        report += `  - Data: ${CODE_BLOCK_DELIMITER}json
${JSON.stringify(content.result.data, null, 2)}
${CODE_BLOCK_DELIMITER}

`;
                    }
                    else if (content.type === "tool_output") {
                        report += `- Tool Name: ${content.toolName}
`;
                        report += `- Result: ${CODE_BLOCK_DELIMITER}json
${JSON.stringify(content.result, null, 2)}
${CODE_BLOCK_DELIMITER}

`;
                    }
                }
                else if (entry.role === "assistant") {
                    // This should ideally be the JSON response from the LLM
                    report += `### LLM Response (JSON):
${CODE_BLOCK_DELIMITER}json
${entry.content}
${CODE_BLOCK_DELIMITER}

`;
                }
                else if (entry.role === "assistant_thought") {
                    report += `### LLM Thought:
${CODE_BLOCK_DELIMITER}
${entry.content}
${CODE_BLOCK_DELIMITER}

`;
                }
                else {
                    report += `### ${entry.role} input:
${CODE_BLOCK_DELIMITER}
${entry.content}
${CODE_BLOCK_DELIMITER}

`;
                }
            });
        }
        else {
            report += `No conversation history to report.
`;
        }
        report += `---

`;
        return report;
    }
}
