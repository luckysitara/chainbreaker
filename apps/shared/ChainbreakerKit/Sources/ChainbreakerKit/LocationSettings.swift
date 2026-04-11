import Foundation

public enum ChainbreakerLocationMode: String, Codable, Sendable, CaseIterable {
    case off
    case whileUsing
    case always
}
