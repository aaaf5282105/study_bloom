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

export type WorkloadFit = "light" | "balanced" | "heavy";

export interface StudyPlan {
  headline: string;
  summary: string;
  weeklyPlan: StudyDayPlan[];
  coachingNotes: string[];
  habitTips: string[];
  riskNotes: string[];
  priorityFocus: string;
  nextBestAction: string;
  workloadFit: WorkloadFit;
  insights: string[];
}

function createDayLabel(index: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days[index] ?? `Day ${index + 1}`;
}

function getPreferredDays(input: StudyInput) {
  return input.preferredDays.length ? input.preferredDays : ["Mon", "Wed", "Fri"];
}

function determineWorkloadFit(input: StudyInput): WorkloadFit {
  const normalizedInput = normalizeInput(input);
  const hours = normalizedInput.weeklyHours;
  const courseCount = normalizedInput.courses.length;

  if (hours >= 22 || courseCount >= 3) {
    return "heavy";
  }

  if (hours >= 12 || courseCount >= 2) {
    return "balanced";
  }

  return "light";
}

function buildNextBestAction(input: StudyInput, workloadFit: WorkloadFit) {
  const normalizedInput = normalizeInput(input);
  const focus = normalizedInput.focusArea || "consistency";
  const deadline = normalizedInput.deadlines[0] || "your next milestone";
  const energyStyle = normalizedInput.energy === "high" ? "Start with a 35-minute sprint" : normalizedInput.energy === "low" ? "Start with a 20-minute reset" : "Start with a 25-minute sprint";

  if (workloadFit === "heavy") {
    return `${energyStyle} on ${focus}, then spend 10 minutes mapping the next step for ${deadline}. Protect one recovery block before your next deep session.`;
  }

  if (workloadFit === "light") {
    return `${energyStyle} on ${focus}, then use the rest of the block to review ${deadline} and build momentum without overloading yourself.`;
  }

  return `${energyStyle} on ${focus}, then keep the rest of the day lighter while you make steady progress on ${deadline}.`;
}

function buildInsights(input: StudyInput, workloadFit: WorkloadFit, preferredDays: string[]) {
  const normalizedInput = normalizeInput(input);
  const deadline = normalizedInput.deadlines[0] || "your next milestone";
  const targetHours = normalizedInput.weeklyHours;
  const focusDays = preferredDays.length;
  const recoveryDays = Math.max(1, 7 - focusDays);

  return [
    `Your strongest study windows appear to be ${preferredDays.slice(0, 3).join(", ")}.`,
    workloadFit === "heavy"
      ? `This is a demanding week, so keep ${recoveryDays} lighter days and protect the most important work for ${deadline}.`
      : `This week is manageable, so use ${focusDays} focused days and leave room for recovery before ${deadline}.`,
    `A practical target is ${Math.max(1, Math.round(targetHours / Math.max(1, focusDays)))} hours on your main study days.`,
  ];
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
  const workloadFit = determineWorkloadFit(normalizedInput);
  const nextBestAction = buildNextBestAction(normalizedInput, workloadFit);
  const insights = buildInsights(normalizedInput, workloadFit, preferredDays);

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
    priorityFocus: focusLabel,
    nextBestAction,
    workloadFit,
    insights,
  };
}

export function adaptPlanToPriority(plan: StudyPlan, priority: string): StudyPlan {
  const updatedPlan: StudyPlan = {
    ...plan,
    priorityFocus: priority,
    nextBestAction: `Start with ${priority} as your first move, then protect one lighter block so the week still feels sustainable.`,
    insights: [
      `The plan is now centered on ${priority}.`,
      "Keep your first deep-work block protected and keep the rest of the day lighter.",
      "Treat the next review block as a recovery checkpoint, not another heavy task.",
    ],
    workloadFit: plan.workloadFit === "light" ? "balanced" : plan.workloadFit,
    weeklyPlan: plan.weeklyPlan.map((day, index) => {
      const adjustedHours = day.hours + (index % 2 === 0 ? 0 : 1);
      const updatedTasks = day.tasks.map((task, taskIndex) => {
        if (taskIndex === 0) {
          return `${priority} first: ${task}`;
        }
        return task;
      });

      return {
        ...day,
        focus: index < 3 ? `Priority shift: ${priority}` : day.focus,
        hours: Math.max(1, adjustedHours),
        tasks: updatedTasks,
      };
    }),
    coachingNotes: [
      `Your plan now centers around ${priority}.`,
      `Protect your first deep-work block for the most important task.`,
      `Keep a smaller review block later to stay realistic.`,
    ],
  };

  return updatedPlan;
}

export function adaptPlanToDeadline(plan: StudyPlan, deadline: string): StudyPlan {
  const updatedPlan: StudyPlan = {
    ...plan,
    workloadFit: "heavy",
    nextBestAction: `Start with the most urgent piece of ${deadline} first, then reduce optional review work so the next few days stay realistic.`,
    insights: [
      `The schedule is leaning into ${deadline} for the next few days.`,
      "Keep the hardest work early, then drop the optional extras if energy gets tight.",
      "Protect one short recovery block so this push does not drain your focus.",
    ],
    weeklyPlan: plan.weeklyPlan.map((day, index) => {
      const isUrgentWindow = index < 3;
      const adjustedHours = isUrgentWindow ? day.hours + 1 : Math.max(1, day.hours - 1);
      const updatedTasks = day.tasks.map((task, taskIndex) => {
        if (taskIndex === 2 && isUrgentWindow) {
          return `Deadline prep: ${deadline}`;
        }
        return task;
      });

      return {
        ...day,
        focus: isUrgentWindow ? `Deadline pressure: ${deadline}` : day.focus,
        hours: adjustedHours,
        tasks: updatedTasks,
      };
    }),
    coachingNotes: [
      `Your schedule now emphasizes ${deadline}.`,
      `Use the next few days to reduce task load and protect focus.`,
      `Keep one lighter block so recovery still happens.`,
    ],
    riskNotes: [
      `If ${deadline} gets closer, reduce nonessential tasks first.`,
      "Protect sleep and recovery so the final push does not break your rhythm.",
    ],
  };

  return updatedPlan;
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

  const workloadFit = determineWorkloadFit(normalizedInput);
  const nextBestAction = buildNextBestAction(normalizedInput, workloadFit);

  return `${systemPrompt}\n\nUser request: ${userPrompt}\n\nAdvice: Because you are balancing ${normalizedInput.courses.join(", ")} and ${deadline} while managing ${lifestyle}, I recommend a ${energyDescriptor} study rhythm. Protect ${normalizedInput.weeklyHours} hours by splitting work into short blocks, keep ${focus} as the priority, and reserve lighter days for recovery so your momentum stays strong. Your first move should be: ${nextBestAction}`;
}
