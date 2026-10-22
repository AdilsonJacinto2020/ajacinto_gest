import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY_INFO } from "../constants/catalog";

export interface InvoicePrintData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientNif?: string;
  clientPhone?: string;
  paymentMethod: string;
  operatorName: string;
  pointName: string;
  items: Array<{
    operator: string;
    productName: string;
    recipient: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

// Carrega imagem e converte para base64 para uso fiável no jsPDF
function loadImageBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function buildInvoiceDoc(data: InvoicePrintData): Promise<jsPDF> {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  // Tenta carregar o logotipo oficial
  const logoBase64 = await loadImageBase64("/logo.png");


  // Bloco 1: Logotipo da Empresa e Dados da Empresa no Topo
  let currentY = 12;

  if (logoBase64) {
    try {
      // largura 56mm, altura 15mm mantendo proporções do logo retangular
      doc.addImage(logoBase64, "PNG", 14, currentY, 56, 15);
      currentY += 18;
    } catch (e) {
      console.warn("Erro ao desenhar imagem no PDF:", e);
    }
  }

  // Bloco dos Dados da Empresa (ocupa a largura inteira abaixo do logo, nunca bate com nada)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(COMPANY_INFO.shortName, 14, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate 600

  currentY += 4.2;

  doc.text(`NIF: ${COMPANY_INFO.nif}`, 14, currentY);
  currentY += 4.2;

  doc.text(`Sede: ${COMPANY_INFO.address}`, 14, currentY);
  currentY += 4.2;

  doc.text(`Tel: ${COMPANY_INFO.phone}`, 14, currentY);
  currentY += 4.2;

  currentY += 7;

  // Bloco 2: Barra / Faixa de Linha Inteira (Display Block) para o Número da Fatura e Metadados
  // Largura total da folha útil: 14mm a 196mm (182mm)
  const barY = currentY;
  const barHeight = 12;
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(14, barY, 182, barHeight, 1.5, 1.5, "FD");

  // Faixa esquerda da barra: FATURA - RECIBO N.º
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`FATURA - RECIBO:  ${data.invoiceNumber}`, 18, barY + 7.5);

  // Faixa direita da barra: Data / Ponto / Operador
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105); // Slate 600
  const metaText = `Data: ${data.date}   |   Ponto: ${data.pointName}   |   Op: ${data.operatorName}`;
  doc.text(metaText, 192, barY + 7.5, { align: "right" });

  currentY = barY + barHeight + 5;

  // Bloco 3: Dados do Cliente
  const clientBoxY = currentY;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, clientBoxY, 182, 16, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("DESTINATÁRIO / CLIENTE", 18, clientBoxY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Nome: ${data.clientName || "Consumidor Final"}`, 18, clientBoxY + 11);
  doc.text(`NIF: ${data.clientNif || "Consumidor Final"}`, 105, clientBoxY + 11);
  if (data.clientPhone) {
    doc.text(`Tel: ${data.clientPhone}`, 155, clientBoxY + 11);
  }

  // Bloco 5: Tabela de Itens / Recargas / Pacotes
  const tableRows = data.items.map((it, idx) => [
    idx + 1,
    it.operator,
    it.productName,
    it.recipient,
    it.quantity,
    `${it.unitPrice.toLocaleString("pt-AO")} Kz`,
    `${it.totalPrice.toLocaleString("pt-AO")} Kz`,
  ]);

  autoTable(doc, {
    startY: clientBoxY + 20,
    head: [["#", "Operadora", "Produto / Serviço", "Nº Destinatário / Cartão", "Qtd", "Preço Unit.", "Total"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 24 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { cellWidth: 10, halign: "center" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 26, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // Bloco 6: Totais e Pagamento
  // @ts-expect-error jspdf-autotable extends jsPDF
  const finalY = (doc.lastAutoTable?.finalY || 130) + 8;

  // Caixa de Totais à Direita
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(120, finalY, 76, 26, 1.5, 1.5, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", 125, finalY + 6);
  doc.text(`${data.subtotal.toLocaleString("pt-AO")} Kz`, 190, finalY + 6, { align: "right" });

  doc.text("IVA (0% Isento):", 125, finalY + 12);
  doc.text("0,00 Kz", 190, finalY + 12, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL PAGO:", 125, finalY + 20);
  doc.text(`${data.total.toLocaleString("pt-AO")} Kz`, 190, finalY + 20, { align: "right" });

  // Método de pagamento à Esquerda
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("FORMA DE PAGAMENTO:", 14, finalY + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(data.paymentMethod, 14, finalY + 12);

  // Bloco 7: Rodapé Fiscal / Informativo
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 276, 196, 276);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(COMPANY_INFO.footerNotice, 105, 281, { align: "center" });
  doc.text(
    `${COMPANY_INFO.shortName} • Contactos: ${COMPANY_INFO.phone}`,
    105,
    286,
    { align: "center" }
  );

  return doc;
}

export async function generateInvoicePDF(data: InvoicePrintData) {
  const doc = await buildInvoiceDoc(data);
  doc.save(`${data.invoiceNumber.replace(/[\/\s]/g, "_")}.pdf`);
}

export async function openInvoicePDFPreview(data: InvoicePrintData) {
  const doc = await buildInvoiceDoc(data);
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl, "_blank");
}
