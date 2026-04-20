import Link from "next/link";
import Navbar from "../../../components/Navbar";

export default function DevelopmentCardDownloadPage() {
  return (
    <>
      <Navbar isPremium />

      <main className="page-wrap pb-32">
        <div className="shell">
          <div className="card p-6 md:p-8 max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold text-pink-500 mb-2">🖼️ Дигитална карта</p>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
              Download ще добавим в следващата стъпка
            </h1>
            <p className="hero-text mb-6">
              Страницата е готова. Следва да направим истинско генериране и теглене на картата.
            </p>

            <Link href="/development-card" className="primary-btn">
              Обратно към картата
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}