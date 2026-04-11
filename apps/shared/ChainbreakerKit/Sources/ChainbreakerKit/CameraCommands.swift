import Foundation

public enum ChainbreakerCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum ChainbreakerCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum ChainbreakerCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum ChainbreakerCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct ChainbreakerCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: ChainbreakerCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: ChainbreakerCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: ChainbreakerCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: ChainbreakerCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct ChainbreakerCameraClipParams: Codable, Sendable, Equatable {
    public var facing: ChainbreakerCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: ChainbreakerCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: ChainbreakerCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: ChainbreakerCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
