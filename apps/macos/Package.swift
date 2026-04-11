// swift-tools-version: 6.2
// Package manifest for the Chainbreaker macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Chainbreaker",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "ChainbreakerIPC", targets: ["ChainbreakerIPC"]),
        .library(name: "ChainbreakerDiscovery", targets: ["ChainbreakerDiscovery"]),
        .executable(name: "Chainbreaker", targets: ["Chainbreaker"]),
        .executable(name: "chainbreaker-mac", targets: ["ChainbreakerMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.4.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.10.1"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.9.0"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/ChainbreakerKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "ChainbreakerIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "ChainbreakerDiscovery",
            dependencies: [
                .product(name: "ChainbreakerKit", package: "ChainbreakerKit"),
            ],
            path: "Sources/ChainbreakerDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Chainbreaker",
            dependencies: [
                "ChainbreakerIPC",
                "ChainbreakerDiscovery",
                .product(name: "ChainbreakerKit", package: "ChainbreakerKit"),
                .product(name: "ChainbreakerChatUI", package: "ChainbreakerKit"),
                .product(name: "ChainbreakerProtocol", package: "ChainbreakerKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Chainbreaker.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "ChainbreakerMacCLI",
            dependencies: [
                "ChainbreakerDiscovery",
                .product(name: "ChainbreakerKit", package: "ChainbreakerKit"),
                .product(name: "ChainbreakerProtocol", package: "ChainbreakerKit"),
            ],
            path: "Sources/ChainbreakerMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "ChainbreakerIPCTests",
            dependencies: [
                "ChainbreakerIPC",
                "Chainbreaker",
                "ChainbreakerDiscovery",
                .product(name: "ChainbreakerProtocol", package: "ChainbreakerKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
