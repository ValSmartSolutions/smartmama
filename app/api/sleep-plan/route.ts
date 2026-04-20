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
      .from("usage")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!usage) {
      const { data: newUsage, error: insertError } = await supabase
        .from("usage")
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

    // 👉 различен лимит ако искаш (пример: 1 free)
    if (!isPremium && usage.count >= 1) {
      return NextResponse.json({
        paywall: true,
        message: "Използва безплатната консултация за сън. Отключи Premium за неограничен достъп.",
      });
    }

    const body = await req.json();

    const {
      childAge,
      sleepProblem,
      bedtime,
      wakeTime,
      notes,
    } = body;

    const prompt = `
Ти си експерт по детски сън.

Дай практични съвети за подобряване на съня при дете със следния профил:

Възраст: ${childAge || "не е посочена"}
Проблем: ${sleepProblem || "няма описан проблем"}
Час за лягане: ${bedtime || "не е посочен"}
Час за събуждане: ${wakeTime || "не е посочен"}
Бележки: ${notes || "няма"}

Изисквания:
- Отговор на български
- Ясен и практичен
- До 5 конкретни съвета
- Без медицински диагнози
- Подходящ за родители
`;

    try {
      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 400,
      });

      const text = response.output_text || "Няма генериран отговор.";

      if (!isPremium) {
        await supabase
          .from("usage")
          .update({ count: usage.count + 1 })
          .eq("user_id", user.id);
      }

      return NextResponse.json({ text });
    } catch (openaiError: any) {
      console.error("OpenAI error:", openaiError?.message || openaiError);

      return NextResponse.json(
        {
          error: "Временно не можем да генерираме съвети за сън. Опитай отново след малко.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("sleep-plan route error:", error);

    return NextResponse.json(
      { error: error?.message || "Грешка при генериране на съвети." },
      { status: 500 }
    );
  }
}