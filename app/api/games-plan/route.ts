import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const isPremium =
      !!subscription && ["active", "trialing"].includes(subscription.status || "");

    let { data: usage } = await supabase
      .from("games_usage")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!usage) {
      const { data: newUsage, error: insertError } = await supabase
        .from("games_usage")
        .insert({
          user_id: user.id,
          count: 0,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      usage = newUsage;
    }

    if (!isPremium && usage.count >= 1) {
      return NextResponse.json({
        paywall: true,
        message: "Използва безплатната идея за игра. Отключи SmartMama Premium за неограничен достъп.",
      });
    }

    const body = await req.json();

    const {
      childName,
      ageText,
      interest,
      materials,
      goal,
      notes,
    } = body;

    const prompt = `
Ти си полезен асистент за родители и детско развитие.

Предложи 3 подходящи игри за дете със следния профил:

Име: ${childName || "не е посочено"}
Възраст: ${ageText || "не е посочена"}
Интерес: ${interest || "не е посочен"}
Налични материали: ${materials || "не са посочени"}
Цел: ${goal || "не е посочена"}
Бележки: ${notes || "няма"}

Изисквания:
- Отговорът да е на български
- Да е практичен и кратък
- Да предложиш 3 отделни игри
- За всяка игра дай:
  1. Име
  2. Как се играе
  3. Какво развива
- Да е подходящо за родители и за игра у дома
- Без медицински твърдения
`;

    try {
      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 500,
      });

      const text = response.output_text || "Няма генериран отговор.";

      if (!isPremium) {
        await supabase
          .from("games_usage")
          .update({ count: usage.count + 1 })
          .eq("user_id", user.id);
      }

      return NextResponse.json({ text });
    } catch (openaiError: any) {
      console.error("OpenAI error:", openaiError?.message || openaiError);

      return NextResponse.json(
        {
          error: "Временно не можем да генерираме идеи за игри. Моля опитай отново след малко.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("games-plan route error:", error);

    return NextResponse.json(
      { error: error?.message || "Грешка при генериране на игри." },
      { status: 500 }
    );
  }
}