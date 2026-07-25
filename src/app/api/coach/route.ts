import { NextRequest, NextResponse } from "next/server";
import { buildCoachResponse, type StudyInput } from "@/lib/study-plan";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = body.input as StudyInput;
  const prompt = body.prompt as string;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ reply: buildCoachResponse(input, prompt) });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are StudyBloom AI, a calm and practical study coach. Keep advice concise, encouraging, and specific.",
        },
        {
          role: "user",
          content: `Help this student with their study week. Courses: ${input.courses.join(", ")}. Deadlines: ${input.deadlines.join(", ")}. Weekly hours: ${input.weeklyHours}. Focus area: ${input.focusArea}. Energy: ${input.energy}. Lifestyle: ${input.lifestyle}. Request: ${prompt}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content ?? buildCoachResponse(input, prompt);

  return NextResponse.json({ reply });
}
