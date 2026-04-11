package ai.chainbreaker.app.node

import ai.chainbreaker.app.protocol.ChainbreakerCalendarCommand
import ai.chainbreaker.app.protocol.ChainbreakerCameraCommand
import ai.chainbreaker.app.protocol.ChainbreakerCallLogCommand
import ai.chainbreaker.app.protocol.ChainbreakerCapability
import ai.chainbreaker.app.protocol.ChainbreakerContactsCommand
import ai.chainbreaker.app.protocol.ChainbreakerDeviceCommand
import ai.chainbreaker.app.protocol.ChainbreakerLocationCommand
import ai.chainbreaker.app.protocol.ChainbreakerMotionCommand
import ai.chainbreaker.app.protocol.ChainbreakerNotificationsCommand
import ai.chainbreaker.app.protocol.ChainbreakerPhotosCommand
import ai.chainbreaker.app.protocol.ChainbreakerSmsCommand
import ai.chainbreaker.app.protocol.ChainbreakerSystemCommand
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      ChainbreakerCapability.Canvas.rawValue,
      ChainbreakerCapability.Device.rawValue,
      ChainbreakerCapability.Notifications.rawValue,
      ChainbreakerCapability.System.rawValue,
      ChainbreakerCapability.Photos.rawValue,
      ChainbreakerCapability.Contacts.rawValue,
      ChainbreakerCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      ChainbreakerCapability.Camera.rawValue,
      ChainbreakerCapability.Location.rawValue,
      ChainbreakerCapability.Sms.rawValue,
      ChainbreakerCapability.CallLog.rawValue,
      ChainbreakerCapability.VoiceWake.rawValue,
      ChainbreakerCapability.Motion.rawValue,
    )

  private val coreCommands =
    setOf(
      ChainbreakerDeviceCommand.Status.rawValue,
      ChainbreakerDeviceCommand.Info.rawValue,
      ChainbreakerDeviceCommand.Permissions.rawValue,
      ChainbreakerDeviceCommand.Health.rawValue,
      ChainbreakerNotificationsCommand.List.rawValue,
      ChainbreakerNotificationsCommand.Actions.rawValue,
      ChainbreakerSystemCommand.Notify.rawValue,
      ChainbreakerPhotosCommand.Latest.rawValue,
      ChainbreakerContactsCommand.Search.rawValue,
      ChainbreakerContactsCommand.Add.rawValue,
      ChainbreakerCalendarCommand.Events.rawValue,
      ChainbreakerCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      ChainbreakerCameraCommand.Snap.rawValue,
      ChainbreakerCameraCommand.Clip.rawValue,
      ChainbreakerCameraCommand.List.rawValue,
      ChainbreakerLocationCommand.Get.rawValue,
      ChainbreakerMotionCommand.Activity.rawValue,
      ChainbreakerMotionCommand.Pedometer.rawValue,
      ChainbreakerSmsCommand.Send.rawValue,
      ChainbreakerSmsCommand.Search.rawValue,
      ChainbreakerCallLogCommand.Search.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(ChainbreakerMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(ChainbreakerMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(ChainbreakerSmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(ChainbreakerSmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(ChainbreakerSmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(ChainbreakerSmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(ChainbreakerSmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(ChainbreakerCapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(ChainbreakerCapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(ChainbreakerCapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(ChainbreakerCallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(ChainbreakerCapability.CallLog.rawValue))
  }

  @Test
  fun advertisedCapabilities_includesVoiceWakeWithoutAdvertisingCommands() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(voiceWakeEnabled = true))
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(voiceWakeEnabled = true))

    assertTrue(capabilities.contains(ChainbreakerCapability.VoiceWake.rawValue))
    assertFalse(commands.any { it.contains("voice", ignoreCase = true) })
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(ChainbreakerCameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(ChainbreakerLocationCommand.Get.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(actual: List<String>, expected: Set<String>) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(actual: List<String>, forbidden: Set<String>) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
