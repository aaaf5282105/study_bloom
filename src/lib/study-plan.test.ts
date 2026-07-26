import { describe, expect, it } from "vitest";
import { buildCoachResponse, buildFallbackPlan } from "./study-plan";

describe("StudyBloom planning logic", () => {
  it("creates a balanced weekly plan with realistic hours", () => {
    const plan = buildFallbackPlan({
      courses: ["Math", "Physics"],
      deadlines: ["final exam"],
      weeklyHours: 14,
      focusArea: "exam prep",
      energy: "steady",
      lifestyle: "working part-time",
      preferredDays: ["Mon", "Wed", "Fri"],
    });

    expect(plan.weeklyPlan.length).toBe(7);
    expect(plan.weeklyPlan.filter((day) => day.hours >= 2).length).toBeGreaterThan(0);
    expect(plan.coachingNotes.length).toBeGreaterThan(0);
    expect(plan.habitTips.length).toBeGreaterThan(0);
  });

  it("produces a helpful coach message using the student context", () => {
    const reply = buildCoachResponse(
      {
        courses: ["Math", "Physics"],
        deadlines: ["final exam"],
        weeklyHours: 14,
        focusArea: "exam prep",
        energy: "high",
        lifestyle: "working part-time",
        preferredDays: ["Mon", "Wed", "Fri"],
      },
      "Help me stay consistent this week"
    );

    expect(reply).toContain("exam prep");
    expect(reply).toContain("final exam");
    expect(reply).toContain("working part-time");
  });
});
