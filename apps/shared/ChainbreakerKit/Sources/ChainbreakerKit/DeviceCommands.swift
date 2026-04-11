import Foundation

public enum ChainbreakerDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum ChainbreakerBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum ChainbreakerThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum ChainbreakerNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum ChainbreakerNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct ChainbreakerBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: ChainbreakerBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: ChainbreakerBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct ChainbreakerThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: ChainbreakerThermalState

    public init(state: ChainbreakerThermalState) {
        self.state = state
    }
}

public struct ChainbreakerStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct ChainbreakerNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: ChainbreakerNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [ChainbreakerNetworkInterfaceType]

    public init(
        status: ChainbreakerNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [ChainbreakerNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct ChainbreakerDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: ChainbreakerBatteryStatusPayload
    public var thermal: ChainbreakerThermalStatusPayload
    public var storage: ChainbreakerStorageStatusPayload
    public var network: ChainbreakerNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: ChainbreakerBatteryStatusPayload,
        thermal: ChainbreakerThermalStatusPayload,
        storage: ChainbreakerStorageStatusPayload,
        network: ChainbreakerNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct ChainbreakerDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
