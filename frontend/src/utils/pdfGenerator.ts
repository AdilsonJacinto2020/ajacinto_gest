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

export function generateInvoicePDF(data: InvoicePrintData) {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  // Cabeçalho da Empresa Oficial
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(COMPANY_INFO.name, 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`NIF: ${COMPANY_INFO.nif}`, 14, 26);
  doc.text(`Sede: ${COMPANY_INFO.address}`, 14, 31, { maxWidth: 120 });
  doc.text(`Contacto: ${COMPANY_INFO.phone}`, 14, 40);

  // Bloco Documento / Fatura-Recibo
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(140, 15, 56, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("FATURA - RECIBO", 144, 22);
  doc.setFontSize(10);
  doc.setTextColor(22, 163, 74);
  doc.text(data.invoiceNumber, 144, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(`Data: ${data.date}`, 144, 34);
  doc.text(`Ponto: ${data.pointName}`, 144, 39);
  doc.text(`Operador: ${data.operatorName}`, 144, 44);

  // Bloco Cliente
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, 48, 182, 18, 1, 1, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text("DADOS DO CLIENTE:", 18, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Nome: ${data.clientName || "Consumidor Final"}`, 18, 61);
  if (data.clientNif) doc.text(`NIF: ${data.clientNif}`, 95, 61);
  if (data.clientPhone) doc.text(`Tel: ${data.clientPhone}`, 145, 61);

  // Tabela de Produtos / Itens
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
    startY: 72,
    head: [["#", "Operadora", "Produto / Serviço", "Nº Destinatário", "Qtd", "Preço Unit.", "Total"]],
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
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { cellWidth: 50 },
      3: { cellWidth: 35 },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 30, halign: "right" },
    },
  });

  // Totais
  // @ts-expect-error jspdf-autotable extends jsPDF
  const finalY = (doc.lastAutoTable?.finalY || 150) + 8;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(120, finalY, 76, 26, 1, 1, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Subtotal:", 125, finalY + 6);
  doc.text(`${data.subtotal.toLocaleString("pt-AO")} Kz`, 190, finalY + 6, { align: "right" });

  doc.text("IVA (0% Isento):", 125, finalY + 12);
  doc.text("0,00 Kz", 190, finalY + 12, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL PAGO:", 125, finalY + 20);
  doc.text(`${data.total.toLocaleString("pt-AO")} Kz`, 190, finalY + 20, { align: "right" });

  // Método de pagamento
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`Forma de Pagamento: ${data.paymentMethod}`, 14, finalY + 6);

  // Rodapé
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(COMPANY_INFO.footerNotice, 105, 282, { align: "center" });
  doc.text("Desenvolvido para ADIJACINTO – Sistema de Gestão e Vendas", 105, 287, { align: "center" });

  // Salvar PDF
  doc.save(`${data.invoiceNumber.replace(/[\/\s]/g, "_")}.pdf`);
}
