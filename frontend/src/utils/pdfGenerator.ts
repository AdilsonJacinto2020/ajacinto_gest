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

export async function generateInvoicePDF(data: InvoicePrintData) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  // Tenta carregar o logotipo oficial
  const logoBase64 = await loadImageBase64("/logo.png");

  // Barra de destaque superior decorativa
  doc.setFillColor(22, 163, 74); // Verde Marca
  doc.rect(0, 0, 210, 4, "F");

  // Bloco 1: Logotipo da Empresa
  if (logoBase64) {
    try {
      // largura 56mm, altura 15mm mantendo proporções do logo retangular
      doc.addImage(logoBase64, "PNG", 14, 10, 56, 15);
    } catch (e) {
      console.warn("Erro ao desenhar imagem no PDF:", e);
    }
  }

  // Bloco 2: Caixa do Número do Documento (Canto Superior Direito)
  // Posicionada na extrema direita (X: 132 a 196) com fundo suave
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(132, 10, 64, 30, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text("FATURA - RECIBO", 136, 17);

  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74); // Verde Marca
  doc.text(data.invoiceNumber, 136, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Data / Hora: ${data.date}`, 136, 29);
  doc.text(`Ponto: ${data.pointName}`, 136, 34);
  doc.text(`Operador: ${data.operatorName}`, 136, 38);

  // Bloco 3: Dados Institucionais da Empresa (à esquerda, abaixo do logotipo, com largura máxima de 114mm para NUNCA bater na caixa da fatura)
  const companyStartY = logoBase64 ? 28 : 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // Slate 900
  const splitName = doc.splitTextToSize(COMPANY_INFO.name, 114);
  doc.text(splitName, 14, companyStartY);

  const addressStartY = companyStartY + splitName.length * 4.2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`NIF: ${COMPANY_INFO.nif}`, 14, addressStartY);

  const splitAddress = doc.splitTextToSize(`Sede: ${COMPANY_INFO.address}`, 114);
  doc.text(splitAddress, 14, addressStartY + 4);

  const phoneStartY = addressStartY + 4 + splitAddress.length * 3.5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Tel: ${COMPANY_INFO.phone}`, 14, phoneStartY);

  // Linha divisória suave
  const clientBoxY = Math.max(phoneStartY + 5, 46);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, clientBoxY - 2, 196, clientBoxY - 2);

  // Bloco 4: Dados do Cliente
  doc.setFillColor(248, 250, 252);
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
    `${COMPANY_INFO.name} • Contactos: ${COMPANY_INFO.phone}`,
    105,
    286,
    { align: "center" }
  );

  // Salvar PDF
  doc.save(`${data.invoiceNumber.replace(/[\/\s]/g, "_")}.pdf`);
}
