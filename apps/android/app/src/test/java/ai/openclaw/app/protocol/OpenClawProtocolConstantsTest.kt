package ai.chainbreaker.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class ChainbreakerProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", ChainbreakerCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", ChainbreakerCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", ChainbreakerCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", ChainbreakerCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", ChainbreakerCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", ChainbreakerCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", ChainbreakerCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", ChainbreakerCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", ChainbreakerCapability.Canvas.rawValue)
    assertEquals("camera", ChainbreakerCapability.Camera.rawValue)
    assertEquals("voiceWake", ChainbreakerCapability.VoiceWake.rawValue)
    assertEquals("location", ChainbreakerCapability.Location.rawValue)
    assertEquals("sms", ChainbreakerCapability.Sms.rawValue)
    assertEquals("device", ChainbreakerCapability.Device.rawValue)
    assertEquals("notifications", ChainbreakerCapability.Notifications.rawValue)
    assertEquals("system", ChainbreakerCapability.System.rawValue)
    assertEquals("photos", ChainbreakerCapability.Photos.rawValue)
    assertEquals("contacts", ChainbreakerCapability.Contacts.rawValue)
    assertEquals("calendar", ChainbreakerCapability.Calendar.rawValue)
    assertEquals("motion", ChainbreakerCapability.Motion.rawValue)
    assertEquals("callLog", ChainbreakerCapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", ChainbreakerCameraCommand.List.rawValue)
    assertEquals("camera.snap", ChainbreakerCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", ChainbreakerCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", ChainbreakerNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", ChainbreakerNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", ChainbreakerDeviceCommand.Status.rawValue)
    assertEquals("device.info", ChainbreakerDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", ChainbreakerDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", ChainbreakerDeviceCommand.Health.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", ChainbreakerSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", ChainbreakerPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", ChainbreakerContactsCommand.Search.rawValue)
    assertEquals("contacts.add", ChainbreakerContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", ChainbreakerCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", ChainbreakerCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", ChainbreakerMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", ChainbreakerMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun smsCommandsUseStableStrings() {
    assertEquals("sms.send", ChainbreakerSmsCommand.Send.rawValue)
    assertEquals("sms.search", ChainbreakerSmsCommand.Search.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", ChainbreakerCallLogCommand.Search.rawValue)
  }

}
