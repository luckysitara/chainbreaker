/**
 * Utility for checking AbortSignal state and throwing a standard AbortError.
 */

/**
 * Use at async checkpoints to support cancellation.
 */
export function throwIfAborted(abortSignal?: AbortSignal): void {
  if (abortSignal?.aborted) {
    const err = new Error("Operation aborted");
    err.name = "AbortError";
    throw err;
  }
}
