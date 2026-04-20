"use client";

import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function DownloadCardPdfButton() {
  async function handleDownloadPdf() {
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

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setFillColor(255, 250, 247);
      pdf.rect(0, 0, 210, 297, "F");

      pdf.addImage(dataUrl, "PNG", 10, 10, 190, 268);
      pdf.save("smartmama-karta-a4.pdf");
    } catch (err) {
      console.error(err);
      alert("Грешка при генериране на PDF");
    }
  }

  return (
    <button onClick={handleDownloadPdf} className="secondary-btn w-full">
      Изтегли PDF за печат
    </button>
  );
}