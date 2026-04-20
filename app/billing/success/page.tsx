import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border p-8 text-center">
        <h1 className="text-3xl font-semibold mb-3">Плащането е успешно</h1>
        <p className="text-gray-600 mb-6">
          Благодарим ти. След малко ще активираме SmartMama Premium.
        </p>

        <Link
          href="/meal-plan"
          className="inline-block rounded-xl border px-4 py-3"
        >
          Обратно към менюто
        </Link>
      </div>
    </main>
  );
}