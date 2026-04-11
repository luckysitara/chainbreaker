import Foundation
import Testing
@testable import Chainbreaker

@Suite(.serialized) struct NodeServiceManagerTests {
    @Test func `builds node service commands with current CLI shape`() async throws {
        try await TestIsolation.withUserDefaultsValues(["chainbreaker.gatewayProjectRootPath": nil]) {
            let tmp = try makeTempDirForTests()
            CommandResolver.setProjectRoot(tmp.path)

            let chainbreakerPath = tmp.appendingPathComponent("node_modules/.bin/chainbreaker")
            try makeExecutableForTests(at: chainbreakerPath)

            let start = NodeServiceManager._testServiceCommand(["start"])
            #expect(start == [chainbreakerPath.path, "node", "start", "--json"])

            let stop = NodeServiceManager._testServiceCommand(["stop"])
            #expect(stop == [chainbreakerPath.path, "node", "stop", "--json"])
        }
    }
}
