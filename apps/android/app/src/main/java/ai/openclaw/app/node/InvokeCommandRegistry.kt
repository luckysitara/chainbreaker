package ai.chainbreaker.app.node

import ai.chainbreaker.app.protocol.ChainbreakerCalendarCommand
import ai.chainbreaker.app.protocol.ChainbreakerCanvasA2UICommand
import ai.chainbreaker.app.protocol.ChainbreakerCanvasCommand
import ai.chainbreaker.app.protocol.ChainbreakerCameraCommand
import ai.chainbreaker.app.protocol.ChainbreakerCapability
import ai.chainbreaker.app.protocol.ChainbreakerCallLogCommand
import ai.chainbreaker.app.protocol.ChainbreakerContactsCommand
import ai.chainbreaker.app.protocol.ChainbreakerDeviceCommand
import ai.chainbreaker.app.protocol.ChainbreakerLocationCommand
import ai.chainbreaker.app.protocol.ChainbreakerMotionCommand
import ai.chainbreaker.app.protocol.ChainbreakerNotificationsCommand
import ai.chainbreaker.app.protocol.ChainbreakerPhotosCommand
import ai.chainbreaker.app.protocol.ChainbreakerSmsCommand
import ai.chainbreaker.app.protocol.ChainbreakerSystemCommand

data class NodeRuntimeFlags(
  val cameraEnabled: Boolean,
  val locationEnabled: Boolean,
  val sendSmsAvailable: Boolean,
  val readSmsAvailable: Boolean,
  val smsSearchPossible: Boolean,
  val callLogAvailable: Boolean,
  val voiceWakeEnabled: Boolean,
  val motionActivityAvailable: Boolean,
  val motionPedometerAvailable: Boolean,
  val debugBuild: Boolean,
)

enum class InvokeCommandAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SendSmsAvailable,
  ReadSmsAvailable,
  RequestableSmsSearchAvailable,
  CallLogAvailable,
  MotionActivityAvailable,
  MotionPedometerAvailable,
  DebugBuild,
}

enum class NodeCapabilityAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  CallLogAvailable,
  VoiceWakeEnabled,
  MotionAvailable,
}

data class NodeCapabilitySpec(
  val name: String,
  val availability: NodeCapabilityAvailability = NodeCapabilityAvailability.Always,
)

data class InvokeCommandSpec(
  val name: String,
  val requiresForeground: Boolean = false,
  val availability: InvokeCommandAvailability = InvokeCommandAvailability.Always,
)

object InvokeCommandRegistry {
  val capabilityManifest: List<NodeCapabilitySpec> =
    listOf(
      NodeCapabilitySpec(name = ChainbreakerCapability.Canvas.rawValue),
      NodeCapabilitySpec(name = ChainbreakerCapability.Device.rawValue),
      NodeCapabilitySpec(name = ChainbreakerCapability.Notifications.rawValue),
      NodeCapabilitySpec(name = ChainbreakerCapability.System.rawValue),
      NodeCapabilitySpec(
        name = ChainbreakerCapability.Camera.rawValue,
        availability = NodeCapabilityAvailability.CameraEnabled,
      ),
      NodeCapabilitySpec(
        name = ChainbreakerCapability.Sms.rawValue,
        availability = NodeCapabilityAvailability.SmsAvailable,
      ),
      NodeCapabilitySpec(
        name = ChainbreakerCapability.VoiceWake.rawValue,
        availability = NodeCapabilityAvailability.VoiceWakeEnabled,
      ),
      NodeCapabilitySpec(
        name = ChainbreakerCapability.Location.rawValue,
        availability = NodeCapabilityAvailability.LocationEnabled,
      ),
      NodeCapabilitySpec(name = ChainbreakerCapability.Photos.rawValue),
      NodeCapabilitySpec(name = ChainbreakerCapability.Contacts.rawValue),
      NodeCapabilitySpec(name = ChainbreakerCapability.Calendar.rawValue),
      NodeCapabilitySpec(
        name = ChainbreakerCapability.Motion.rawValue,
        availability = NodeCapabilityAvailability.MotionAvailable,
      ),
      NodeCapabilitySpec(
        name = ChainbreakerCapability.CallLog.rawValue,
        availability = NodeCapabilityAvailability.CallLogAvailable,
      ),
    )

  val all: List<InvokeCommandSpec> =
    listOf(
      InvokeCommandSpec(
        name = ChainbreakerCanvasCommand.Present.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCanvasCommand.Hide.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCanvasCommand.Navigate.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCanvasCommand.Eval.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCanvasCommand.Snapshot.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCanvasA2UICommand.Push.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCanvasA2UICommand.PushJSONL.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCanvasA2UICommand.Reset.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ChainbreakerSystemCommand.Notify.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCameraCommand.List.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCameraCommand.Snap.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCameraCommand.Clip.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = ChainbreakerLocationCommand.Get.rawValue,
        availability = InvokeCommandAvailability.LocationEnabled,
      ),
      InvokeCommandSpec(
        name = ChainbreakerDeviceCommand.Status.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerDeviceCommand.Info.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerDeviceCommand.Permissions.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerDeviceCommand.Health.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerNotificationsCommand.List.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerNotificationsCommand.Actions.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerPhotosCommand.Latest.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerContactsCommand.Search.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerContactsCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCalendarCommand.Events.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCalendarCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = ChainbreakerMotionCommand.Activity.rawValue,
        availability = InvokeCommandAvailability.MotionActivityAvailable,
      ),
      InvokeCommandSpec(
        name = ChainbreakerMotionCommand.Pedometer.rawValue,
        availability = InvokeCommandAvailability.MotionPedometerAvailable,
      ),
      InvokeCommandSpec(
        name = ChainbreakerSmsCommand.Send.rawValue,
        availability = InvokeCommandAvailability.SendSmsAvailable,
      ),
      InvokeCommandSpec(
        name = ChainbreakerSmsCommand.Search.rawValue,
        availability = InvokeCommandAvailability.RequestableSmsSearchAvailable,
      ),
      InvokeCommandSpec(
        name = ChainbreakerCallLogCommand.Search.rawValue,
        availability = InvokeCommandAvailability.CallLogAvailable,
      ),
      InvokeCommandSpec(
        name = "debug.logs",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
      InvokeCommandSpec(
        name = "debug.ed25519",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
    )

  private val byNameInternal: Map<String, InvokeCommandSpec> = all.associateBy { it.name }

  fun find(command: String): InvokeCommandSpec? = byNameInternal[command]

  fun advertisedCapabilities(flags: NodeRuntimeFlags): List<String> {
    return capabilityManifest
      .filter { spec ->
        when (spec.availability) {
          NodeCapabilityAvailability.Always -> true
          NodeCapabilityAvailability.CameraEnabled -> flags.cameraEnabled
          NodeCapabilityAvailability.LocationEnabled -> flags.locationEnabled
          NodeCapabilityAvailability.SmsAvailable -> flags.sendSmsAvailable || flags.readSmsAvailable
          NodeCapabilityAvailability.CallLogAvailable -> flags.callLogAvailable
          NodeCapabilityAvailability.VoiceWakeEnabled -> flags.voiceWakeEnabled
          NodeCapabilityAvailability.MotionAvailable -> flags.motionActivityAvailable || flags.motionPedometerAvailable
        }
      }
      .map { it.name }
  }

  fun advertisedCommands(flags: NodeRuntimeFlags): List<String> {
    return all
      .filter { spec ->
        when (spec.availability) {
          InvokeCommandAvailability.Always -> true
          InvokeCommandAvailability.CameraEnabled -> flags.cameraEnabled
          InvokeCommandAvailability.LocationEnabled -> flags.locationEnabled
          InvokeCommandAvailability.SendSmsAvailable -> flags.sendSmsAvailable
          InvokeCommandAvailability.ReadSmsAvailable -> flags.readSmsAvailable
          InvokeCommandAvailability.RequestableSmsSearchAvailable -> flags.smsSearchPossible
          InvokeCommandAvailability.CallLogAvailable -> flags.callLogAvailable
          InvokeCommandAvailability.MotionActivityAvailable -> flags.motionActivityAvailable
          InvokeCommandAvailability.MotionPedometerAvailable -> flags.motionPedometerAvailable
          InvokeCommandAvailability.DebugBuild -> flags.debugBuild
        }
      }
      .map { it.name }
  }
}
