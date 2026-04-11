import Testing
@testable import Chainbreaker

@Suite(.serialized)
@MainActor
struct OnboardingCoverageTests {
    @Test func `exercise onboarding pages`() {
        OnboardingView.exerciseForTesting()
    }
}
