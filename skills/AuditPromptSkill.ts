// chainbreaker/skills/AuditPromptSkill.ts
import { ISkill } from "./ISkill.js";

export class AuditPromptSkill implements ISkill {
  public readonly name = "audit_prompt_skill";
  public readonly description = "Generates a specialized prompt for smart contract auditing based on provided context.";

  async apply(context: { code: string; vulnerabilityType?: string }): Promise<string> {
    const { code, vulnerabilityType } = context;

    let prompt = `Analyze the following smart contract code for security vulnerabilities:

```
${code}
```

`;

    if (vulnerabilityType) {
      prompt += `Pay special attention to potential ${vulnerabilityType} issues.`;
    } else {
      prompt += `Identify any common smart contract vulnerabilities, including reentrancy, access control issues, integer overflows/underflows, and front-running risks.`;
    }

    prompt += "

Please provide a detailed report of findings, severity, and recommended remediations.";

    return prompt;
  }
}
