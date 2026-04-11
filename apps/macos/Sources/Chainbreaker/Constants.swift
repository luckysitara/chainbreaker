import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-chainbreaker writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.chainbreaker.mac"
let gatewayLaunchdLabel = "ai.chainbreaker.gateway"
let onboardingVersionKey = "chainbreaker.onboardingVersion"
let onboardingSeenKey = "chainbreaker.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "chainbreaker.pauseEnabled"
let iconAnimationsEnabledKey = "chainbreaker.iconAnimationsEnabled"
let swabbleEnabledKey = "chainbreaker.swabbleEnabled"
let swabbleTriggersKey = "chainbreaker.swabbleTriggers"
let voiceWakeTriggerChimeKey = "chainbreaker.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "chainbreaker.voiceWakeSendChime"
let showDockIconKey = "chainbreaker.showDockIcon"
let defaultVoiceWakeTriggers = ["chainbreaker"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "chainbreaker.voiceWakeMicID"
let voiceWakeMicNameKey = "chainbreaker.voiceWakeMicName"
let voiceWakeLocaleKey = "chainbreaker.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "chainbreaker.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "chainbreaker.voicePushToTalkEnabled"
let voiceWakeTriggersTalkModeKey = "chainbreaker.voiceWakeTriggersTalkMode"
let talkEnabledKey = "chainbreaker.talkEnabled"
let iconOverrideKey = "chainbreaker.iconOverride"
let connectionModeKey = "chainbreaker.connectionMode"
let remoteTargetKey = "chainbreaker.remoteTarget"
let remoteIdentityKey = "chainbreaker.remoteIdentity"
let remoteProjectRootKey = "chainbreaker.remoteProjectRoot"
let remoteCliPathKey = "chainbreaker.remoteCliPath"
let canvasEnabledKey = "chainbreaker.canvasEnabled"
let cameraEnabledKey = "chainbreaker.cameraEnabled"
let systemRunPolicyKey = "chainbreaker.systemRunPolicy"
let systemRunAllowlistKey = "chainbreaker.systemRunAllowlist"
let systemRunEnabledKey = "chainbreaker.systemRunEnabled"
let locationModeKey = "chainbreaker.locationMode"
let locationPreciseKey = "chainbreaker.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "chainbreaker.peekabooBridgeEnabled"
let deepLinkKeyKey = "chainbreaker.deepLinkKey"
let modelCatalogPathKey = "chainbreaker.modelCatalogPath"
let modelCatalogReloadKey = "chainbreaker.modelCatalogReload"
let cliInstallPromptedVersionKey = "chainbreaker.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "chainbreaker.heartbeatsEnabled"
let debugPaneEnabledKey = "chainbreaker.debugPaneEnabled"
let debugFileLogEnabledKey = "chainbreaker.debug.fileLogEnabled"
let appLogLevelKey = "chainbreaker.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
