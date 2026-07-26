"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { adaptPlanToPriority, buildFallbackPlan, type StudyInput, type StudyPlan } from "@/lib/study-plan";

const initialInput: StudyInput = {
  courses: ["Mathematics", "Writing"],
  deadlines: ["midterm paper"],
  weeklyHours: 12,
  focusArea: "exam prep",
  energy: "steady",
  lifestyle: "working part-time",
  preferredDays: ["Mon", "Wed", "Fri"],
};

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadSavedPlan(): StudyPlan | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem("study-bloom-plan");
    if (!saved) {
      return null;
    }

    return JSON.parse(saved) as StudyPlan;
  } catch {
    return null;
  }
}

export default function Home() {
  const [input, setInput] = useState<StudyInput>(initialInput);
  const [plan, setPlan] = useState<StudyPlan | null>(() => loadSavedPlan());
  const [coachPrompt, setCoachPrompt] = useState("Help me stay focused this week.");
  const [coachReply, setCoachReply] = useState<string | null>(null);
  const [priorityChoice, setPriorityChoice] = useState("exam prep");
  const [status, setStatus] = useState(() => {
    if (typeof window === "undefined") {
      return "Ready to build your plan.";
    }

    return loadSavedPlan() ? "Loaded your last saved plan." : "Ready to build your plan.";
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const summary = useMemo(() => {
    if (!plan) return null;
    return {
      totalHours: plan.weeklyPlan.reduce((sum, day) => sum + day.hours, 0),
      focusDays: plan.weeklyPlan.filter((day) => day.hours >= 2).length,
      recoveryDays: plan.weeklyPlan.filter((day) => day.hours <= 1).length,
    };
  }, [plan]);

  async function generatePlan() {
    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setStatus("Generating a personalized schedule...");

      const generated = buildFallbackPlan(input);
      setPlan(generated);
      window.localStorage.setItem("study-bloom-plan", JSON.stringify(generated));

      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, prompt: coachPrompt || "Help me stay focused this week." }),
      });

      if (!response.ok) {
        throw new Error("Coach service unavailable");
      }

      const data = await response.json();
      setCoachReply(data.reply || "I’m ready to help you build momentum.");
      setStatus(`Plan ready for ${input.courses[0] ?? "your goals"}.`);
    } catch {
      setErrorMessage("The coach is unavailable right now, but your plan was still created.");
      setCoachReply("Your coach is ready. Add a Groq key to unlock richer replies.");
      setStatus("Plan created successfully.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function askCoach() {
    if (!plan) {
      setStatus("Generate a plan first so your coach has context.");
      return;
    }

    try {
      setIsCoaching(true);
      setErrorMessage(null);
      setStatus("Your coach is crafting a personalized response...");

      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, prompt: coachPrompt || "Help me stay focused this week." }),
      });

      if (!response.ok) {
        throw new Error("Coach service unavailable");
      }

      const data = await response.json();
      setCoachReply(data.reply || "You're building a strong rhythm.");
      setStatus("Coach guidance updated.");
    } catch {
      setErrorMessage("Your coach could not respond just now, but your plan remains available.");
      setCoachReply("Your coach is ready. Add a Groq key to unlock richer replies.");
      setStatus("Coach guidance updated.");
    } finally {
      setIsCoaching(false);
    }
  }

  function applyPriority() {
    if (!plan) {
      return;
    }

    const adapted = adaptPlanToPriority(plan, priorityChoice);
    setPlan(adapted);
    window.localStorage.setItem("study-bloom-plan", JSON.stringify(adapted));
    setStatus(`Updated your plan around ${priorityChoice}.`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf2f8,_#f8fafc_45%,_#eef2ff_100%)] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_25px_80px_-20px_rgba(15,23,42,0.25)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                <Brain className="h-4 w-4" />
                StudyBloom AI
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Turn overloaded weeks into calm, realistic study plans.
                </h1>
                <p className="mt-2 max-w-2xl text-lg text-slate-600">
                  Built for students balancing coursework, deadlines, and energy in one place with a coach that feels clear, calm, and practical.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" />
                Designed for focus, balance, and steady momentum.
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { icon: Target, title: "Personalized", text: "Your plan adapts to your courses, hours, and energy level." },
              { icon: Clock3, title: "Balanced pacing", text: "Work gets spread across stronger and lighter days." },
              { icon: ShieldCheck, title: "Stress-aware", text: "Recovery time is built into the schedule so you stay consistent." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Icon className="h-4 w-4 text-indigo-600" />
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Target className="h-5 w-5 text-indigo-600" />
              Plan details
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Courses
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none ring-0 transition focus:border-indigo-400"
                  value={input.courses.join(", ")}
                  onChange={(event) => setInput({ ...input, courses: parseList(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Deadlines
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-indigo-400"
                  value={input.deadlines.join(", ")}
                  onChange={(event) => setInput({ ...input, deadlines: parseList(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Weekly study hours
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-indigo-400"
                  value={input.weeklyHours}
                  onChange={(event) => setInput({ ...input, weeklyHours: Number(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Focus area
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-indigo-400"
                  value={input.focusArea}
                  onChange={(event) => setInput({ ...input, focusArea: event.target.value })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Energy level
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-indigo-400"
                  value={input.energy}
                  onChange={(event) => setInput({ ...input, energy: event.target.value as StudyInput["energy"] })}
                >
                  <option value="low">Low</option>
                  <option value="steady">Steady</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Lifestyle
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-indigo-400"
                  value={input.lifestyle}
                  onChange={(event) => setInput({ ...input, lifestyle: event.target.value })}
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Preferred study days
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-indigo-400"
                value={input.preferredDays.join(", ")}
                onChange={(event) => setInput({ ...input, preferredDays: parseList(event.target.value) })}
              />
            </label>

            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <label className="text-sm font-medium text-slate-700">
                Choose your top study priority
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-indigo-400"
                  value={priorityChoice}
                  onChange={(event) => setPriorityChoice(event.target.value)}
                />
              </label>
              <button
                onClick={applyPriority}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                <Target className="h-4 w-4" />
                Apply priority shift
              </button>
            </div>

            <button
              onClick={generatePlan}
              disabled={isGenerating}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Zap className="h-4 w-4" />
              {isGenerating ? "Generating plan..." : "Generate weekly plan"}
            </button>
            <p className="mt-3 text-sm text-slate-500">{status}</p>
            {errorMessage && <p className="mt-2 text-sm font-medium text-amber-700">{errorMessage}</p>}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-lg shadow-slate-200">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-5 w-5 text-cyan-300" />
              Weekly snapshot
            </div>
            {plan ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{plan.headline}</h2>
                  <p className="mt-2 text-sm text-slate-300">{plan.summary}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-3 py-1 text-sm font-medium text-cyan-200">
                    <Target className="h-4 w-4" />
                    Priority focus: {plan.priorityFocus}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-sm text-slate-400">Total hours</p>
                    <p className="text-2xl font-semibold">{summary?.totalHours ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-sm text-slate-400">Focus days</p>
                    <p className="text-2xl font-semibold">{summary?.focusDays ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-sm text-slate-400">Recovery days</p>
                    <p className="text-2xl font-semibold">{summary?.recoveryDays ?? 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/20 p-4 text-sm text-slate-400">
                Your plan preview will appear here after you generate it.
              </div>
            )}
          </div>
        </section>

        {plan && (
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-slate-900">Weekly schedule</h3>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  <TrendingUp className="h-4 w-4" />
                  Balanced rhythm
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {plan.weeklyPlan.map((day) => (
                  <div key={day.day} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{day.day}</p>
                        <p className="text-sm text-slate-600">{day.focus}</p>
                      </div>
                      <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                        {day.hours}h
                      </div>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {day.tasks.map((task) => (
                        <li key={task} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-slate-900">AI coach</h3>
                </div>
                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Ask your coach
                  <textarea
                    className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-indigo-400"
                    value={coachPrompt}
                    onChange={(event) => setCoachPrompt(event.target.value)}
                  />
                </label>
                <button
                  onClick={askCoach}
                  disabled={isCoaching}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Brain className="h-4 w-4" />
                  {isCoaching ? "Thinking..." : "Ask StudyBloom"}
                </button>
                {coachReply && (
                  <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-700">
                    {coachReply}
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-slate-900">AI coaching notes</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {plan.coachingNotes.map((note) => (
                    <li key={note} className="rounded-2xl bg-slate-50 p-3">{note}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
                <h3 className="text-xl font-semibold text-slate-900">Habit tips</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {plan.habitTips.map((tip) => (
                    <li key={tip} className="rounded-2xl bg-slate-50 p-3">{tip}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
                <h3 className="text-xl font-semibold text-slate-900">Risk notes</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {plan.riskNotes.map((note) => (
                    <li key={note} className="rounded-2xl bg-slate-50 p-3">{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
