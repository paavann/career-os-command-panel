import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

function download(data: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = data;
  link.click();
}

export async function downloadElementImage(element: HTMLElement, name: string) {
  const data = await toPng(element, { pixelRatio: 2, cacheBust: true, backgroundColor: "#0B1C2D" });
  download(data, `${name}.png`);
}

export async function downloadElementPdf(element: HTMLElement, name: string) {
  const data = await toPng(element, { pixelRatio: 2, cacheBust: true, backgroundColor: "#0B1C2D" });
  const image = new Image();
  image.src = data;
  await new Promise<void>((resolve) => { image.onload = () => resolve(); });
  const pdf = new jsPDF({ orientation: image.width > image.height ? "landscape" : "portrait", unit: "px", format: [image.width, image.height] });
  pdf.addImage(data, "PNG", 0, 0, image.width, image.height);
  pdf.save(`${name}.pdf`);
}