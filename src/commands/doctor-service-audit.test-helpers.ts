export const testServiceAuditCodes = {
  gatewayEntrypointMismatch: "gateway-entrypoint-mismatch",
  gatewayTokenMismatch: "gateway-token-mismatch",
} as const;

export function readEmbeddedGatewayTokenForTest(
  command: {
    environment?: Record<string, string>;
  } | null,
) {
  return command?.environmentValueSources?.CHAINBREAKER_GATEWAY_TOKEN === "file"
    ? undefined
    : command?.environment?.CHAINBREAKER_GATEWAY_TOKEN?.trim() || undefined;
}
