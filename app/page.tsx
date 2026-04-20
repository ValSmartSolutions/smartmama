import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <div className="shell flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img
			  src="/logo.png"
			  alt="SmartMama"
			  className="w-12 h-12 rounded-2xl shadow-md"
			/>
            <div>
              <p className="font-extrabold text-lg leading-none">SmartMama</p>
              <p className="text-xs text-gray-500">AI помощник за родители</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="secondary-btn text-sm px-4 py-2">
              Вход
            </Link>
            <Link href="/login" className="primary-btn text-sm px-4 py-2">
              Опитай
            </Link>
          </div>
        </div>
      </header>

      <section className="shell page-wrap">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold text-pink-500 mb-3">
              По-малко стрес. Повече спокойствие.
            </p>

            <h1 className="hero-title font-extrabold mb-4">
              AI помощник за родители
              <br />
              в ежедневните грижи за детето
            </h1>

            <p className="hero-text mb-6">
              SmartMama помага с идеи за хранене, сън и режим, игри и развитие —
              бързо, ясно и удобно от телефон или компютър.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="primary-btn">
                Започни сега
              </Link>
              <a href="#features" className="secondary-btn">
                Виж функциите
              </a>
            </div>
			<p className="text-xs text-gray-500 mt-2">
  🎁 Създай първата си карта безплатно
</p>
          </div>

          <div className="card p-5 md:p-7">
            <div className="grid gap-3">
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4">
                <p className="font-semibold mb-1">🍽️ Меню за деня</p>
                <p className="text-sm text-gray-600">
                  Закуска, обяд, вечеря и списък за пазаруване според възраст и нужди.
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="font-semibold mb-1">😴 Сън и режим</p>
                <p className="text-sm text-gray-600">
                  Бързи практични насоки за трудно заспиване и нощни събуждания.
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                <p className="font-semibold mb-1">🧩 Игри и развитие</p>
                <p className="text-sm text-gray-600">
                  Лесни идеи за игри у дома според интересите на детето.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="shell pb-12 md:pb-16">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-pink-500 mb-2">Функции</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Всичко важно на едно място
          </h2>
          <p className="hero-text max-w-2xl mx-auto">
            Създадено за родители, които искат бърза и практична помощ всеки ден.
          </p>
        </div>

        <div className="grid-cards three">
          <div className="feature-card">
            <div className="feature-icon">🍽️</div>
            <h3 className="text-xl font-bold mb-2">Хранене</h3>
            <p className="text-sm text-gray-600 leading-6">
              Генерирай идеи за меню и списък за пазаруване според профила на детето.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">😴</div>
            <h3 className="text-xl font-bold mb-2">Сън</h3>
            <p className="text-sm text-gray-600 leading-6">
              Получи ясен съвет какво да направиш още тази вечер и кратък план.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🧩</div>
            <h3 className="text-xl font-bold mb-2">Развитие</h3>
            <p className="text-sm text-gray-600 leading-6">
              Подбери игри и занимания за концентрация, логика, движение и реч.
            </p>
          </div>
		  <div className="feature-card bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100">
  <div className="feature-icon">🖼️</div>

  <h3 className="font-bold text-lg mb-1">
    Карта на развитието
  </h3>

  <p className="text-sm text-gray-600">
    Превърни важните моменти от живота на детето в красива A4 карта – дигитално или в рамка.
  </p>
</div>
        </div>
      </section>
    </main>
  );
}