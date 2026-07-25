export type EnergyLevel = "low" | "steady" | "high";

export interface StudyInput {
  courses: string[];
  deadlines: string[];
  weeklyHours: number;
  focusArea: string;
  energy: EnergyLevel;
  lifestyle: string;
  preferredDays: string[];
}

export interface StudyDayPlan {
  day: string;
  focus: string;
  hours: number;
  tasks: string[];
}

export interface StudyPlan {
  headline: string;
  summary: string;
  weeklyPlan: StudyDayPlan[];
  coachingNotes: string[];
  habitTips: string[];
  riskNotes: string[];
}

function createDayLabel(index: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days[index] ?? `Day ${index + 1}`;
}

export function buildFallbackPlan(input: StudyInput): StudyPlan {
  const courseList = input.courses.length ? input.courses : ["Core coursework"];
  const deadlineList = input.deadlines.length ? input.deadlines : ["your next milestone"];
  const totalHours = Math.max(1, input.weeklyHours);
  const dailyTarget = Math.max(1, Math.round(totalHours / 5));
  const focusLabel = input.focusArea || "consistency";
  const energyLabel = input.energy === "high" ? "high-energy" : input.energy === "low" ? "gentle" : "steady";

  const weeklyPlan: StudyDayPlan[] = [0, 1, 2, 3, 4, 5, 6].map((index) => {
    const day = createDayLabel(index);
    const isPreferred = input.preferredDays.includes(day);
    const tasks = [
      `${courseList[0]} review`,
      `${courseList[1] ?? courseList[0]} practice`,
      `Light recap for ${deadlineList[0]}`,
    ];

    return {
      day,
      focus: isPreferred ? `Deep work for ${focusLabel}` : `Recovery + review`,
      hours: isPreferred ? Math.max(1, dailyTarget) : Math.max(1, Math.round(dailyTarget / 2)),
      tasks,
    };
  });

  return {
    headline: `${courseList.join(", ")} gets a calmer rhythm`,
    summary: `You have ${input.weeklyHours} study hours this week. The plan protects your energy with ${energyLabel} sessions and keeps ${deadlineList[0]} in view.`,
    weeklyPlan,
    coachingNotes: [
      `Start with 20 minutes of ${focusLabel} work before opening your notes.`,
      `Use the first 10 minutes to capture one clear outcome for the session.`,
    ],
    habitTips: [
      "Keep a 3-item priority list for each study block.",
      "End every session with one sentence about what is next.",
    ],
    riskNotes: [
      "If your schedule slips, protect the most important deadline first.",
      "A short catch-up session is better than skipping the whole week.",
    ],
  };
}

export function buildCoachResponse(input: StudyInput, userPrompt: string) {
  const systemPrompt = [
    "You are StudyBloom AI, a calm and practical study coach.",
    "You help students stay grounded, protect energy, and focus on the next useful action.",
    "Always answer with encouraging, specific advice and keep it concise.",
  ].join(" ");

  const focus = input.focusArea || "your priorities";
  const energyDescriptor = input.energy === "high" ? "high-energy" : input.energy === "low" ? "gentle" : "steady";
  const deadline = input.deadlines[0] || "your next milestone";

  return `${systemPrompt}\n\nUser request: ${userPrompt}\n\nAdvice: Because you are balancing ${input.courses.join(", ")} and ${deadline}, I recommend a ${energyDescriptor} study rhythm. Protect ${input.weeklyHours} hours by splitting work into short blocks, keep ${focus} as the priority, and save one lighter day for recovery so your momentum stays strong.`;
}
