export const CHAINBREAKER_CLI_ENV_VAR = "CHAINBREAKER_CLI";
export const CHAINBREAKER_CLI_ENV_VALUE = "1";

export function markChainbreakerExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [CHAINBREAKER_CLI_ENV_VAR]: CHAINBREAKER_CLI_ENV_VALUE,
  };
}

export function ensureChainbreakerExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[CHAINBREAKER_CLI_ENV_VAR] = CHAINBREAKER_CLI_ENV_VALUE;
  return env;
}
