import {
  applyAgentDefaultModelPrimary,
  withAgentModelAliases,
  type ChainbreakerConfig,
} from "chainbreaker/plugin-sdk/provider-onboard";

export const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.5";

const OPENCODE_GO_ALIAS_DEFAULTS: Record<string, string> = {
  "opencode-go/kimi-k2.5": "Kimi",
  "opencode-go/glm-5": "GLM",
};

export function applyOpencodeGoProviderConfig(cfg: ChainbreakerConfig): ChainbreakerConfig {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models: withAgentModelAliases(
          cfg.agents?.defaults?.models,
          Object.entries(OPENCODE_GO_ALIAS_DEFAULTS).map(([modelRef, alias]) => ({
            modelRef,
            alias,
          })),
        ),
      },
    },
  };
}

export function applyOpencodeGoConfig(cfg: ChainbreakerConfig): ChainbreakerConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeGoProviderConfig(cfg),
    OPENCODE_GO_DEFAULT_MODEL_REF,
  );
}
