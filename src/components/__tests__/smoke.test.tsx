import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { MomentumRing } from "../Transformation/MomentumRing";
import { RewardCard } from "../Coach/RewardCard";
import { renderWithProviders } from "../../test/utils";

describe("component smoke tests", () => {
  it("renders transformation momentum without crashing", () => {
    renderWithProviders(<MomentumRing snapshot={{ momentum: 82, xpPercentage: 40, level: 3, streak: 5, missionPercentage: 75 }} />);
    expect(screen.getByText(/Momentum/i)).toBeInTheDocument();
  });

  it("renders coach reward cards without crashing", () => {
    renderWithProviders(<RewardCard reward={{ title: "Consistency", description: "Keep showing up", score: 75, unlocked: true }} />);
    expect(screen.getByText(/Consistency/i)).toBeInTheDocument();
  });
});
