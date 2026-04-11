// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "ChainbreakerKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "ChainbreakerProtocol", targets: ["ChainbreakerProtocol"]),
        .library(name: "ChainbreakerKit", targets: ["ChainbreakerKit"]),
        .library(name: "ChainbreakerChatUI", targets: ["ChainbreakerChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "ChainbreakerProtocol",
            path: "Sources/ChainbreakerProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "ChainbreakerKit",
            dependencies: [
                "ChainbreakerProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/ChainbreakerKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "ChainbreakerChatUI",
            dependencies: [
                "ChainbreakerKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/ChainbreakerChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "ChainbreakerKitTests",
            dependencies: ["ChainbreakerKit", "ChainbreakerChatUI"],
            path: "Tests/ChainbreakerKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
