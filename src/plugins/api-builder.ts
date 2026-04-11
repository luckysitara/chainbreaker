import type { ChainbreakerConfig } from "../config/config.js";
import type { PluginRuntime } from "./runtime/types.js";
import type { ChainbreakerPluginApi, PluginLogger } from "./types.js";

export type BuildPluginApiParams = {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  rootDir?: string;
  registrationMode: ChainbreakerPluginApi["registrationMode"];
  config: ChainbreakerConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: PluginRuntime;
  logger: PluginLogger;
  resolvePath: (input: string) => string;
  handlers?: Partial<
    Pick<
      ChainbreakerPluginApi,
      | "registerTool"
      | "registerHook"
      | "registerHttpRoute"
      | "registerChannel"
      | "registerGatewayMethod"
      | "registerCli"
      | "registerService"
      | "registerCliBackend"
      | "registerProvider"
      | "registerSpeechProvider"
      | "registerMediaUnderstandingProvider"
      | "registerImageGenerationProvider"
      | "registerWebSearchProvider"
      | "registerInteractiveHandler"
      | "onConversationBindingResolved"
      | "registerCommand"
      | "registerContextEngine"
      | "registerMemoryPromptSection"
      | "registerMemoryFlushPlan"
      | "registerMemoryRuntime"
      | "registerMemoryEmbeddingProvider"
      | "on"
    >
  >;
};

const noopRegisterTool: ChainbreakerPluginApi["registerTool"] = () => {};
const noopRegisterHook: ChainbreakerPluginApi["registerHook"] = () => {};
const noopRegisterHttpRoute: ChainbreakerPluginApi["registerHttpRoute"] = () => {};
const noopRegisterChannel: ChainbreakerPluginApi["registerChannel"] = () => {};
const noopRegisterGatewayMethod: ChainbreakerPluginApi["registerGatewayMethod"] = () => {};
const noopRegisterCli: ChainbreakerPluginApi["registerCli"] = () => {};
const noopRegisterService: ChainbreakerPluginApi["registerService"] = () => {};
const noopRegisterCliBackend: ChainbreakerPluginApi["registerCliBackend"] = () => {};
const noopRegisterProvider: ChainbreakerPluginApi["registerProvider"] = () => {};
const noopRegisterSpeechProvider: ChainbreakerPluginApi["registerSpeechProvider"] = () => {};
const noopRegisterMediaUnderstandingProvider: ChainbreakerPluginApi["registerMediaUnderstandingProvider"] =
  () => {};
const noopRegisterImageGenerationProvider: ChainbreakerPluginApi["registerImageGenerationProvider"] =
  () => {};
const noopRegisterWebSearchProvider: ChainbreakerPluginApi["registerWebSearchProvider"] = () => {};
const noopRegisterInteractiveHandler: ChainbreakerPluginApi["registerInteractiveHandler"] = () => {};
const noopOnConversationBindingResolved: ChainbreakerPluginApi["onConversationBindingResolved"] =
  () => {};
const noopRegisterCommand: ChainbreakerPluginApi["registerCommand"] = () => {};
const noopRegisterContextEngine: ChainbreakerPluginApi["registerContextEngine"] = () => {};
const noopRegisterMemoryPromptSection: ChainbreakerPluginApi["registerMemoryPromptSection"] = () => {};
const noopRegisterMemoryFlushPlan: ChainbreakerPluginApi["registerMemoryFlushPlan"] = () => {};
const noopRegisterMemoryRuntime: ChainbreakerPluginApi["registerMemoryRuntime"] = () => {};
const noopRegisterMemoryEmbeddingProvider: ChainbreakerPluginApi["registerMemoryEmbeddingProvider"] =
  () => {};
const noopOn: ChainbreakerPluginApi["on"] = () => {};

export function buildPluginApi(params: BuildPluginApiParams): ChainbreakerPluginApi {
  const handlers = params.handlers ?? {};
  return {
    id: params.id,
    name: params.name,
    version: params.version,
    description: params.description,
    source: params.source,
    rootDir: params.rootDir,
    registrationMode: params.registrationMode,
    config: params.config,
    pluginConfig: params.pluginConfig,
    runtime: params.runtime,
    logger: params.logger,
    registerTool: handlers.registerTool ?? noopRegisterTool,
    registerHook: handlers.registerHook ?? noopRegisterHook,
    registerHttpRoute: handlers.registerHttpRoute ?? noopRegisterHttpRoute,
    registerChannel: handlers.registerChannel ?? noopRegisterChannel,
    registerGatewayMethod: handlers.registerGatewayMethod ?? noopRegisterGatewayMethod,
    registerCli: handlers.registerCli ?? noopRegisterCli,
    registerService: handlers.registerService ?? noopRegisterService,
    registerCliBackend: handlers.registerCliBackend ?? noopRegisterCliBackend,
    registerProvider: handlers.registerProvider ?? noopRegisterProvider,
    registerSpeechProvider: handlers.registerSpeechProvider ?? noopRegisterSpeechProvider,
    registerMediaUnderstandingProvider:
      handlers.registerMediaUnderstandingProvider ?? noopRegisterMediaUnderstandingProvider,
    registerImageGenerationProvider:
      handlers.registerImageGenerationProvider ?? noopRegisterImageGenerationProvider,
    registerWebSearchProvider: handlers.registerWebSearchProvider ?? noopRegisterWebSearchProvider,
    registerInteractiveHandler:
      handlers.registerInteractiveHandler ?? noopRegisterInteractiveHandler,
    onConversationBindingResolved:
      handlers.onConversationBindingResolved ?? noopOnConversationBindingResolved,
    registerCommand: handlers.registerCommand ?? noopRegisterCommand,
    registerContextEngine: handlers.registerContextEngine ?? noopRegisterContextEngine,
    registerMemoryPromptSection:
      handlers.registerMemoryPromptSection ?? noopRegisterMemoryPromptSection,
    registerMemoryFlushPlan: handlers.registerMemoryFlushPlan ?? noopRegisterMemoryFlushPlan,
    registerMemoryRuntime: handlers.registerMemoryRuntime ?? noopRegisterMemoryRuntime,
    registerMemoryEmbeddingProvider:
      handlers.registerMemoryEmbeddingProvider ?? noopRegisterMemoryEmbeddingProvider,
    resolvePath: params.resolvePath,
    on: handlers.on ?? noopOn,
  };
}
