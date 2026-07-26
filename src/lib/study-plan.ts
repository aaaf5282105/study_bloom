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

function sanitizeList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function normalizeInput(input: StudyInput): StudyInput {
  const courses = sanitizeList(input.courses);
  const deadlines = sanitizeList(input.deadlines);
  const preferredDays = sanitizeList(input.preferredDays);

  return {
    ...input,
    courses: courses.length ? courses : ["Core coursework"],
    deadlines: deadlines.length ? deadlines : ["your next milestone"],
    focusArea: input.focusArea.trim() || "consistency",
    lifestyle: input.lifestyle.trim() || "a busy student life",
    preferredDays: preferredDays.length ? preferredDays : ["Mon", "Wed", "Fri"],
    weeklyHours: Math.max(1, Number(input.weeklyHours) || 1),
  };
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
  const normalizedInput = normalizeInput(input);
  const courseList = normalizedInput.courses;
  const deadlineList = normalizedInput.deadlines;
  const totalHours = normalizedInput.weeklyHours;
  const preferredDays = getPreferredDays(normalizedInput);
  const focusLabel = normalizedInput.focusArea;
  const energyLabel = normalizedInput.energy === "high" ? "high-energy" : normalizedInput.energy === "low" ? "gentle" : "steady";
  const lifestyleLabel = normalizedInput.lifestyle;
  const preferredCount = Math.max(1, preferredDays.length);
  const dailyTarget = Math.max(1, Math.round(totalHours / preferredCount));

  const weeklyPlan: StudyDayPlan[] = [0, 1, 2, 3, 4, 5, 6].map((index) => {
    const day = createDayLabel(index);
    const isPreferred = preferredDays.includes(day);
    const hours = isPreferred
      ? Math.max(1, dailyTarget + (normalizedInput.energy === "high" ? 1 : 0))
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
    summary: `You have ${normalizedInput.weeklyHours} study hours this week. The plan protects your energy with ${energyLabel} sessions, fits ${lifestyleLabel}, and keeps ${deadlineList[0]} in view.`,
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
  const normalizedInput = normalizeInput(input);
  const systemPrompt = [
    "You are StudyBloom AI, a calm and practical study coach.",
    "You help students stay grounded, protect energy, and focus on the next useful action.",
    "Always answer with encouraging, specific advice and keep it concise.",
  ].join(" ");

  const focus = normalizedInput.focusArea;
  const energyDescriptor = normalizedInput.energy === "high" ? "high-energy" : normalizedInput.energy === "low" ? "gentle" : "steady";
  const deadline = normalizedInput.deadlines[0];
  const lifestyle = normalizedInput.lifestyle;

  return `${systemPrompt}\n\nUser request: ${userPrompt}\n\nAdvice: Because you are balancing ${normalizedInput.courses.join(", ")} and ${deadline} while managing ${lifestyle}, I recommend a ${energyDescriptor} study rhythm. Protect ${normalizedInput.weeklyHours} hours by splitting work into short blocks, keep ${focus} as the priority, and reserve lighter days for recovery so your momentum stays strong.`;
}
