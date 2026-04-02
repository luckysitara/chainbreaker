// chainbreaker/src/modules/NoOpModule.ts
import { IModule } from "./IModule.js";

export class NoOpModule implements IModule {
  public readonly name = "noop_module";
  public readonly description = "A no-operation module for testing purposes.";

  async execute(params: unknown): Promise<any> {
    console.log(`NoOpModule executed with params:`, params);
    return { status: "noop_executed", params };
  }
}
