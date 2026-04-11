import { createConfigIO } from "../config/config.js";

  if (value === "random" || value === "default" || value === "off") {
    return value;
  }
  return undefined;
}

  env: NodeJS.ProcessEnv = process.env,
  try {
    const parsed = createConfigIO({ env }).loadConfig() as {
    };
  } catch {
    return undefined;
  }
}
