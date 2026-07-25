"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, CalendarDays, MessageSquareText, Sparkles, Target, Zap } from "lucide-react";
import { buildFallbackPlan, type StudyInput, type StudyPlan } from "@/lib/study-plan";

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

export default function Home() {
  const [input, setInput] = useState<StudyInput>(initialInput);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [coachPrompt, setCoachPrompt] = useState("Help me stay focused this week.");
  const [coachReply, setCoachReply] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to build your plan.");

  useEffect(() => {
    const saved = window.localStorage.getItem("study-bloom-plan");
    if (saved) {
      const parsed = JSON.parse(saved) as StudyPlan;
      setPlan(parsed);
      setStatus("Loaded your last saved plan.");
    }
  }, []);

  const summary = useMemo(() => {
    if (!plan) return null;
    return {
      totalHours: plan.weeklyPlan.reduce((sum, day) => sum + day.hours, 0),
      focusDays: plan.weeklyPlan.filter((day) => day.hours >= 2).length,
    };
  }, [plan]);

  async function generatePlan() {
    setStatus("Generating a personalized schedule...");
    const generated = buildFallbackPlan(input);
    setPlan(generated);
    window.localStorage.setItem("study-bloom-plan", JSON.stringify(generated));

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, prompt: coachPrompt || "Help me stay focused this week." }),
      });
      const data = await response.json();
      setCoachReply(data.reply || "I’m ready to help you build momentum.");
    } catch {
      setCoachReply("Your coach is ready. Add an OpenAI key to unlock richer replies.");
    }

    setStatus("Plan created successfully.");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf2f8,_#f8fafc_45%,_#eef2ff_100%)] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
                  This app helps students balance deadlines, coursework, and energy levels with a coach that feels practical, not robotic.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" />
                Built for students juggling classes, work, and life.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Target className="h-5 w-5 text-indigo-600" />
              Plan details
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Courses
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                  value={input.courses.join(", ")}
                  onChange={(event) => setInput({ ...input, courses: parseList(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Deadlines
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                  value={input.deadlines.join(", ")}
                  onChange={(event) => setInput({ ...input, deadlines: parseList(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Weekly study hours
                <input
                  type="number"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                  value={input.weeklyHours}
                  onChange={(event) => setInput({ ...input, weeklyHours: Number(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Focus area
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                  value={input.focusArea}
                  onChange={(event) => setInput({ ...input, focusArea: event.target.value })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Energy level
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
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
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                  value={input.lifestyle}
                  onChange={(event) => setInput({ ...input, lifestyle: event.target.value })}
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Preferred study days
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                value={input.preferredDays.join(", ")}
                onChange={(event) => setInput({ ...input, preferredDays: parseList(event.target.value) })}
              />
            </label>
            <button
              onClick={generatePlan}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
            >
              <Zap className="h-4 w-4" />
              Generate weekly plan
            </button>
            <p className="mt-3 text-sm text-slate-500">{status}</p>
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
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-sm text-slate-400">Total planned hours</p>
                    <p className="text-2xl font-semibold">{summary?.totalHours ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-sm text-slate-400">High-focus days</p>
                    <p className="text-2xl font-semibold">{summary?.focusDays ?? 0}</p>
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
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
              <h3 className="text-xl font-semibold text-slate-900">Weekly schedule</h3>
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
                    className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                    value={coachPrompt}
                    onChange={(event) => setCoachPrompt(event.target.value)}
                  />
                </label>
                <button
                  onClick={generatePlan}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  <Brain className="h-4 w-4" />
                  Ask StudyBloom
                </button>
                {coachReply && (
                  <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-700">
                    {coachReply}
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
                <h3 className="text-xl font-semibold text-slate-900">AI coaching notes</h3>
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
