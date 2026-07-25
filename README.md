# StudyBloom AI

StudyBloom AI is a student-first study planner that turns a busy week into a calm, realistic weekly schedule. It is designed for students balancing coursework, deadlines, work, and energy levels in one place.

## Live demo

Open the app here: https://study-bloom-tau.vercel.app/

## Problem it solves

Many students feel overwhelmed because they know they should study, but they do not know how to turn their workload into a plan that fits real life. StudyBloom AI helps them break the week into manageable study blocks, protect their energy, and focus on the most important tasks.

## What the app does

StudyBloom AI lets students:
- enter their courses, deadlines, weekly study hours, focus areas, and preferred study days
- generate a weekly study plan with day-by-day tasks and realistic time blocks
- receive AI-style coaching advice tailored to their current workload
- save their latest plan locally in the browser for easy reuse
- use a calm and simple interface that reduces mental overload

## How it works

1. The student enters their workload and study preferences.
2. The app creates a weekly schedule with balanced study blocks.
3. The AI coach gives practical advice to help the student stay focused and consistent.
4. The student can revisit the plan anytime and adjust it as the week changes.

## AI feature

The AI coach uses a custom system prompt that instructs the app to act like a calm, encouraging study mentor. It helps the student prioritize, protect energy, and keep advice practical instead of overwhelming.

### Prompt used

You are StudyBloom AI, a calm and practical study coach. You help students stay grounded, protect energy, and focus on the next useful action. Always answer with encouraging, specific advice and keep it concise.

### AI provider

The live coaching experience uses a Groq API key when available. If no key is set, the app still works with a built-in fallback response.

## Tools and services used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide icons
- Groq API
- Vercel for deployment

## Screenshots

![Dashboard](./public/screenshot-dashboard.svg)
![Weekly planner](./public/screenshot-weekly.svg)
![AI coach](./public/screenshot-coach.svg)

## How to run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

Set your Groq key in the environment file:

```bash
GROQ_API_KEY=your_groq_key_here
```

## Why this project matters

This project was built to help students feel less overwhelmed and more in control of their study routine. Instead of staring at a long list of tasks, they can see a realistic plan and get guided support in one place.
