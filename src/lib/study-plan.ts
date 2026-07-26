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

function getPreferredDays(input: StudyInput) {
  return input.preferredDays.length ? input.preferredDays : ["Mon", "Wed", "Fri"];
}

export function buildFallbackPlan(input: StudyInput): StudyPlan {
  const courseList = input.courses.length ? input.courses : ["Core coursework"];
  const deadlineList = input.deadlines.length ? input.deadlines : ["your next milestone"];
  const totalHours = Math.max(1, input.weeklyHours);
  const preferredDays = getPreferredDays(input);
  const focusLabel = input.focusArea || "consistency";
  const energyLabel = input.energy === "high" ? "high-energy" : input.energy === "low" ? "gentle" : "steady";
  const lifestyleLabel = input.lifestyle || "a busy student life";
  const preferredCount = Math.max(1, preferredDays.length);
  const dailyTarget = Math.max(1, Math.round(totalHours / preferredCount));

  const weeklyPlan: StudyDayPlan[] = [0, 1, 2, 3, 4, 5, 6].map((index) => {
    const day = createDayLabel(index);
    const isPreferred = preferredDays.includes(day);
    const hours = isPreferred
      ? Math.max(1, dailyTarget + (input.energy === "high" ? 1 : 0))
      : Math.max(1, Math.round(dailyTarget / 2));

    const tasks = isPreferred
      ? [
          `${courseList[0]} review`,
          `${courseList[1] ?? courseList[0]} practice`,
          `Deep prep for ${deadlineList[0]}`,
        ]
      : [
          `Light recap for ${deadlineList[0]}`,
          `Reset your notes and priorities`,
          `Short recovery session for ${focusLabel}`,
        ];

    return {
      day,
      focus: isPreferred ? `Deep work for ${focusLabel}` : `Recovery + review`,
      hours,
      tasks,
    };
  });

  return {
    headline: `${courseList.join(", ")} gets a calmer rhythm`,
    summary: `You have ${input.weeklyHours} study hours this week. The plan protects your energy with ${energyLabel} sessions, fits ${lifestyleLabel}, and keeps ${deadlineList[0]} in view.`,
    weeklyPlan,
    coachingNotes: [
      `Start with 20 minutes of ${focusLabel} work before opening your notes.`,
      `Use the first 10 minutes to capture one clear outcome for the session.`,
      `Keep the hardest task at the start of your strongest study block.`,
    ],
    habitTips: [
      "Keep a 3-item priority list for each study block.",
      "End every session with one sentence about what is next.",
      "Use a short break after every focused sprint to protect concentration.",
    ],
    riskNotes: [
      "If your schedule slips, protect the most important deadline first.",
      "A short catch-up session is better than skipping the whole week.",
      "Treat recovery time as part of the plan, not wasted time.",
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
  const lifestyle = input.lifestyle || "a busy schedule";

  return `${systemPrompt}\n\nUser request: ${userPrompt}\n\nAdvice: Because you are balancing ${input.courses.join(", ")} and ${deadline} while managing ${lifestyle}, I recommend a ${energyDescriptor} study rhythm. Protect ${input.weeklyHours} hours by splitting work into short blocks, keep ${focus} as the priority, and reserve lighter days for recovery so your momentum stays strong.`;
}
