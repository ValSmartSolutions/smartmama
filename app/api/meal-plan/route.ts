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

    if (!isPremium && usage.count >= 3) {
      return NextResponse.json({
        paywall: true,
        message: "Използва безплатните менюта. Отключи SmartMama Premium, за да продължиш.",
      });
    }

    const body = await req.json();

    const {
      childName,
      ageText,
      allergies,
      goals,
      notes,
      timeAvailable,
      budgetLevel,
    } = body;

    const prompt = `
Ти си полезен асистент за родители и детско хранене.

Направи 1-дневно меню за дете със следния профил:

Име: ${childName || "не е посочено"}
Възраст: ${ageText || "не е посочена"}
Алергии: ${allergies || "няма посочени"}
Цели: ${goals || "няма посочени"}
Бележки: ${notes || "няма"}

Допълнителни условия:
- Налични минути за готвене: ${timeAvailable || "30"}
- Бюджет: ${budgetLevel || "среден"}

Изисквания:
- Отговорът да е на български
- Да е практичен и кратък
- Да съдържа:
  1. Закуска
  2. Междинна закуска
  3. Обяд
  4. Следобедна закуска
  5. Вечеря
- За всяко хранене дай кратко описание
- Накрая дай кратък списък за пазаруване
- Ако има алергии, не включвай рискови храни
- Не давай медицински твърдения
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
          .from("usage")
          .update({ count: usage.count + 1 })
          .eq("user_id", user.id);
      }

      return NextResponse.json({ text });
    } catch (openaiError: any) {
      console.error("OpenAI error:", openaiError?.message || openaiError);

      return NextResponse.json(
        {
          error: "Временно не можем да генерираме меню. Моля опитай отново след малко.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("meal-plan route error:", error);

    return NextResponse.json(
      { error: error?.message || "Грешка при генериране на меню." },
      { status: 500 }
    );
  }
}