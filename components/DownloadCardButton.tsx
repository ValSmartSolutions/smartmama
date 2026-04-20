"use client";

import { toPng } from "html-to-image";

export default function DownloadCardButton() {
  async function handleDownload() {
    try {
      const element = document.getElementById("development-card-export");

      if (!element) {
        alert("Картата не е намерена");
        return;
      }

      await new Promise((res) => setTimeout(res, 300));

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
        backgroundColor: "#fffaf7",
        canvasWidth: 1240,
        canvasHeight: 1754,
      });

      const link = document.createElement("a");
      link.download = "smartmama-karta.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Грешка при генериране на картата");
    }
  }

  return (
    <button onClick={handleDownload} className="primary-btn w-full">
      Изтегли дигиталната карта
    </button>
  );
}