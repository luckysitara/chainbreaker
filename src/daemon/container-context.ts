export function resolveDaemonContainerContext(
  env: Record<string, string | undefined> = process.env,
): string | null {
  return env.CHAINBREAKER_CONTAINER_HINT?.trim() || env.CHAINBREAKER_CONTAINER?.trim() || null;
}
