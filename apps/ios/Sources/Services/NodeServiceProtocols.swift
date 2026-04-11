import CoreLocation
import Foundation
import ChainbreakerKit
import UIKit

typealias ChainbreakerCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias ChainbreakerCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: ChainbreakerCameraSnapParams) async throws -> ChainbreakerCameraSnapResult
    func clip(params: ChainbreakerCameraClipParams) async throws -> ChainbreakerCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: ChainbreakerLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: ChainbreakerLocationGetParams,
        desiredAccuracy: ChainbreakerLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: ChainbreakerLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> ChainbreakerDeviceStatusPayload
    func info() -> ChainbreakerDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: ChainbreakerPhotosLatestParams) async throws -> ChainbreakerPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: ChainbreakerContactsSearchParams) async throws -> ChainbreakerContactsSearchPayload
    func add(params: ChainbreakerContactsAddParams) async throws -> ChainbreakerContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: ChainbreakerCalendarEventsParams) async throws -> ChainbreakerCalendarEventsPayload
    func add(params: ChainbreakerCalendarAddParams) async throws -> ChainbreakerCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: ChainbreakerRemindersListParams) async throws -> ChainbreakerRemindersListPayload
    func add(params: ChainbreakerRemindersAddParams) async throws -> ChainbreakerRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: ChainbreakerMotionActivityParams) async throws -> ChainbreakerMotionActivityPayload
    func pedometer(params: ChainbreakerPedometerParams) async throws -> ChainbreakerPedometerPayload
}

struct WatchMessagingStatus: Sendable, Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Sendable, Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Sendable, Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: ChainbreakerWatchNotifyParams) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
