import React, { useState } from "react";
import { COMPANY_INFO } from "../constants/catalog";
import {
  InvoicePrintData,
  generateInvoicePDF,
  openInvoicePDFPreview,
} from "../utils/pdfGenerator";
import { Printer, FileText, Download, X, Calendar, Check } from "lucide-react";

interface ThermalReceiptProps {
  data: InvoicePrintData;
  onClose: () => void;
  onUpdateDate?: (newDate: string) => void;
  onShowToast?: (title: string, desc?: string, type?: "success" | "info" | "error") => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  data,
  onClose,
  onUpdateDate,
  onShowToast,
}) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateInput, setDateInput] = useState(data.date);

  const handlePrint = () => {
    const el = document.getElementById("thermal-receipt-area");
    if (!el) {
      window.print();
      return;
    }

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      window.print();
      return;
    }

    const contentHtml = el.innerHTML;
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${data.invoiceNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 80mm;
              font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
              font-size: 11px;
              color: #000;
              background: #fff;
            }
            .ticket-wrap {
              width: 72mm;
              margin: 0 auto;
              padding: 4mm 2mm;
              box-sizing: border-box;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .border-t { border-top: 1px dashed #444; }
            .border-b { border-bottom: 1px dashed #444; }
            .my-2 { margin-top: 6px; margin-bottom: 6px; }
            .py-1 { padding-top: 3px; padding-bottom: 3px; }
            .pt-1 { padding-top: 3px; }
            .space-between { display: flex; justify-content: space-between; }
            .item-row { margin-bottom: 4px; padding-bottom: 3px; border-bottom: 1px dotted #ccc; }
          </style>
        </head>
        <body>
          <div class="ticket-wrap">
            <div class="text-center font-bold" style="font-size: 13px;">${COMPANY_INFO.shortName}</div>
            <div class="text-center">NIF: ${COMPANY_INFO.nif}</div>
            <div class="text-center" style="font-size: 9px; color: #555;">${COMPANY_INFO.address}</div>
            
            <div class="border-t border-b font-bold text-center my-2 py-1">
              FATURA - RECIBO: ${data.invoiceNumber}
            </div>

            <div style="font-size: 10px; margin-bottom: 6px;">
              <div>Data: <strong>${data.date}</strong></div>
              <div>Ponto: <strong>${data.pointName}</strong></div>
              <div>Operador: <strong>${data.operatorName}</strong></div>
              <div>Cliente: <strong>${data.clientName || "Consumidor Final"}</strong></div>
              ${data.clientNif ? `<div>NIF: ${data.clientNif}</div>` : ""}
              ${data.clientPhone ? `<div>Tel: ${data.clientPhone}</div>` : ""}
            </div>

            <div class="border-t font-bold space-between py-1" style="font-size: 10px;">
              <span>ITEM / DEST</span>
              <span>TOTAL</span>
            </div>

            ${data.items
              .map(
                (item) => `
              <div class="item-row" style="font-size: 10px;">
                <div class="font-bold">[${item.operator}] ${item.productName}</div>
                <div style="color: #444;">Dest: ${item.recipient}</div>
                <div class="space-between">
                  <span>${item.quantity} x ${item.unitPrice.toLocaleString("pt-AO")} Kz</span>
                  <span class="font-bold">${item.totalPrice.toLocaleString("pt-AO")} Kz</span>
                </div>
              </div>`
              )
              .join("")}

            <div class="border-t pt-1" style="font-size: 10px;">
              <div class="space-between">
                <span>Subtotal:</span>
                <span>${data.subtotal.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div class="space-between" style="color: #666;">
                <span>IVA (0% Isento):</span>
                <span>0,00 Kz</span>
              </div>
              <div class="space-between font-bold border-t pt-1" style="font-size: 12px; margin-top: 4px;">
                <span>TOTAL A PAGAR:</span>
                <span>${data.total.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div style="margin-top: 4px; font-size: 9px; color: #444;">
                Forma de Pagamento: <strong>${data.paymentMethod}</strong>
              </div>
            </div>

            <div class="border-t text-center" style="margin-top: 8px; padding-top: 6px; font-size: 8.5px; color: #555;">
              Obrigado pela preferência!<br />
              ${COMPANY_INFO.footerNotice}
            </div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveDate = () => {
    if (!dateInput.trim()) return;
    if (onUpdateDate) {
      onUpdateDate(dateInput.trim());
    }
    data.date = dateInput.trim();
    setIsEditingDate(false);
    if (onShowToast) {
      onShowToast("Data da Fatura Atualizada", `Nova data: ${dateInput}`, "success");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await generateInvoicePDF(data);
      if (onShowToast) {
        onShowToast("Download Iniciado", `Fatura ${data.invoiceNumber} descarregada em PDF.`, "success");
      }
    } catch (e) {
      if (onShowToast) {
        onShowToast("Erro ao Gerar PDF", "Não foi possível descarregar o PDF.", "error");
      }
    }
  };

  const handlePreviewPDF = async () => {
    try {
      await openInvoicePDFPreview(data);
      if (onShowToast) {
        onShowToast("Fatura Aberta", "Documento aberto em nova aba para visualização/impressão A4.", "info");
      }
    } catch (e) {
      if (onShowToast) {
        onShowToast("Erro ao Abrir PDF", "Não foi possível abrir a pré-visualização.", "error");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Cabeçalho do Modal */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-brand-400" />
            <span className="font-bold text-sm">Opções de Emissão de Fatura</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Edição da Data da Fatura */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span className="font-medium">Data:</span>
          </div>

          {!isEditingDate ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {data.date}
              </span>
              <button
                type="button"
                onClick={() => {
                  setDateInput(data.date);
                  setIsEditingDate(true);
                }}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Editar data
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 max-w-[240px]">
              <input
                type="text"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="Ex: 22/10/2026 17:30"
                className="w-full text-xs font-semibold px-2 py-1 bg-white border border-brand-400 rounded-lg outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleSaveDate}
                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                title="Salvar nova data"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingDate(false)}
                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg"
                title="Cancelar"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Visualização do Talão */}
        <div className="overflow-y-auto p-4 flex-1 bg-slate-100/50">
          <div
            id="thermal-receipt-area"
            className="font-mono text-xs text-slate-800 bg-white p-3 border border-dashed border-slate-300 rounded-xl shadow-xs mx-auto max-w-[320px]"
          >
            <div className="text-center font-bold text-sm mb-0.5">{COMPANY_INFO.shortName}</div>
            <div className="text-center text-[10.5px] text-slate-600 mb-0.5">NIF: {COMPANY_INFO.nif}</div>
            <div className="text-center text-[9.5px] text-slate-500 mb-2 leading-tight">
              {COMPANY_INFO.address}
            </div>

            <div className="border-t border-b border-dashed border-slate-400 py-1.5 my-2 text-center font-bold text-slate-900">
              FATURA - RECIBO: {data.invoiceNumber}
            </div>

            <div className="text-[10px] space-y-0.5 mb-2 text-slate-700">
              <div>Data / Hora: <strong>{data.date}</strong></div>
              <div>Ponto de Venda: <strong>{data.pointName}</strong></div>
              <div>Operador de Caixa: <strong>{data.operatorName}</strong></div>
              <div>Cliente: <strong>{data.clientName || "Consumidor Final"}</strong></div>
              {data.clientNif && <div>NIF: {data.clientNif}</div>}
              {data.clientPhone && <div>Tel: {data.clientPhone}</div>}
            </div>

            <div className="border-t border-dashed border-slate-400 py-1 font-bold flex justify-between text-[10.5px] text-slate-900">
              <span>ITEM / DESTINATÁRIO</span>
              <span>TOTAL</span>
            </div>

            <div className="divide-y divide-dashed divide-slate-200 mb-2">
              {data.items.map((item, idx) => (
                <div key={idx} className="py-1 text-[10px]">
                  <div className="font-semibold text-slate-900">
                    [{item.operator}] {item.productName}
                  </div>
                  <div className="text-slate-500">Destinatário: {item.recipient}</div>
                  <div className="flex justify-between text-slate-700">
                    <span>
                      {item.quantity} x {item.unitPrice.toLocaleString("pt-AO")} Kz
                    </span>
                    <span className="font-bold">
                      {item.totalPrice.toLocaleString("pt-AO")} Kz
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-400 pt-1.5 space-y-1 text-right text-[10.5px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{data.subtotal.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>IVA (0% Isento):</span>
                <span>0,00 Kz</span>
              </div>
              <div className="flex justify-between text-xs font-black border-t border-slate-800 pt-1 text-slate-900">
                <span>TOTAL A PAGAR:</span>
                <span>{data.total.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div className="text-left text-[9.5px] text-slate-600 mt-1">
                Forma de Pagamento: <strong>{data.paymentMethod}</strong>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 mt-2.5 pt-2 text-center text-[9px] text-slate-500 leading-tight">
              Obrigado pela preferência!
              <br />
              {COMPANY_INFO.footerNotice}
            </div>
          </div>
        </div>

        {/* Ações de Impressão e Recibo Fatura */}
        <div className="p-3.5 bg-white border-t border-slate-200 space-y-2">
          {/* Botão Principal 1: Talão Térmico */}
          <button
            onClick={handlePrint}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
          >
            <Printer size={16} />
            Imprimir Talão Térmico (80mm)
          </button>

          {/* Botão Secundário 2: Imprimir / Visualizar Recibo Fatura A4 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePreviewPDF}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <FileText size={15} />
              Imprimir Recibo Fatura
            </button>

            <button
              onClick={handleDownloadPDF}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Download size={15} />
              Baixar PDF
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Concluir / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
