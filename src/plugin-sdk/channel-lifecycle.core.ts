import type { ChannelAccountSnapshot } from "../channels/plugins/types.core.js";

type CloseAwareServer = {
  once: (event: "close", listener: () => void) => unknown;
};

type PassiveAccountLifecycleParams<Handle> = {
  abortSignal?: AbortSignal;
  start: () => Promise<Handle>;
  stop?: (handle: Handle) => void | Promise<void>;
  onStop?: () => void | Promise<void>;
};

/** Bind a fixed account id into a status writer so lifecycle code can emit partial snapshots. */
export function createAccountStatusSink(params: {
  accountId: string;
  setStatus: (next: ChannelAccountSnapshot) => void;
}): (patch: Omit<ChannelAccountSnapshot, "accountId">) => void {
  return (patch) => {
    params.setStatus({ accountId: params.accountId, ...patch });
  };
}

/**
 *
 * `onAbort` runs once before the promise resolves.
 */
export function waitUntilAbort(
  onAbort?: () => void | Promise<void>,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const complete = () => {
      Promise.resolve(onAbort?.()).then(() => resolve(), reject);
    };
      return;
    }
      complete();
      return;
    }
  });
}

/**
 * Keep a passive account task alive until abort, then run optional cleanup.
 */
export async function runPassiveAccountLifecycle<Handle>(
  params: PassiveAccountLifecycleParams<Handle>,
): Promise<void> {
  const handle = await params.start();

  try {
    await waitUntilAbort(params.abortSignal);
  } finally {
    await params.stop?.(handle);
    await params.onStop?.();
  }
}

/**
 * Keep a channel/provider task pending until the HTTP server closes.
 *
 * trigger server shutdown. The returned promise resolves only after `close`.
 */
export async function keepHttpServerTaskAlive(params: {
  server: CloseAwareServer;
  abortSignal?: AbortSignal;
  onAbort?: () => void | Promise<void>;
}): Promise<void> {
  const { server, abortSignal, onAbort } = params;
  let abortTask: Promise<void> = Promise.resolve();
  let abortTriggered = false;

  const triggerAbort = () => {
    if (abortTriggered) {
      return;
    }
    abortTriggered = true;
    abortTask = Promise.resolve(onAbort?.()).then(() => undefined);
  };

  const onAbortSignal = () => {
    triggerAbort();
  };

  if (abortSignal) {
    if (abortSignal.aborted) {
      triggerAbort();
    } else {
      abortSignal.addEventListener("abort", onAbortSignal, { once: true });
    }
  }

  await new Promise<void>((resolve) => {
    server.once("close", () => resolve());
  });

  if (abortSignal) {
    abortSignal.removeEventListener("abort", onAbortSignal);
  }
  await abortTask;
}
