import React from "react";
import { ShiftCloseReport } from "../types";
import { COMPANY_INFO } from "../constants/catalog";
import { CheckCircle2, AlertTriangle, Printer, X } from "lucide-react";

interface ShiftReportModalProps {
  report: ShiftCloseReport;
  onClose: () => void;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({ report, onClose }) => {
  const isPerfect = report.difference === 0;
  const isOver = report.difference > 0;
  const isShort = report.difference < 0;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Fecho de Turno - ${report.pointName}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            html, body {
              margin: 0; padding: 0; width: 80mm;
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px; color: #000; background: #fff;
            }
            .ticket-wrap { width: 72mm; margin: 0 auto; padding: 4mm 2mm; box-sizing: border-box; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border-t { border-top: 1px dashed #444; }
            .border-b { border-bottom: 1px dashed #444; }
            .my-2 { margin: 6px 0; }
            .py-1 { padding: 3px 0; }
            .space-between { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="ticket-wrap">
            <div class="text-center font-bold" style="font-size: 13px;">${COMPANY_INFO.shortName}</div>
            <div class="text-center">FECHO E APURAMENTO DE CAIXA</div>
            <div class="border-t border-b text-center font-bold my-2 py-1">${report.pointName}</div>
            
            <div style="font-size: 10px; margin-bottom: 6px;">
              <div>Operador: <strong>${report.operatorName}</strong></div>
              <div>Data Fecho: <strong>${report.closedAt}</strong></div>
            </div>

            <div class="border-t py-1" style="font-size: 10.5px;">
              <div class="space-between"><span>(+) Fundo Inicial:</span><span>${report.openingCash.toLocaleString("pt-AO")} Kz</span></div>
              <div class="space-between"><span>(+) Vendas Dinheiro:</span><span>${report.totalSalesCash.toLocaleString("pt-AO")} Kz</span></div>
              <div class="space-between"><span>(-) Despesas Caixa:</span><span>${report.totalExpenses.toLocaleString("pt-AO")} Kz</span></div>
              <div class="border-t space-between font-bold" style="margin-top: 4px; padding-top: 4px;">
                <span>(=) Saldo Teórico Calculado:</span>
                <span>${report.calculatedCash.toLocaleString("pt-AO")} Kz</span>
              </div>
            </div>

            <div class="border-t py-1 font-bold" style="font-size: 11px;">
              <div class="space-between">
                <span>(=) Dinheiro Contado / Declarado:</span>
                <span>${report.declaredCash.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div class="space-between" style="font-size: 12px; margin-top: 4px;">
                <span>Diferença / Status:</span>
                <span>${isPerfect ? "CAIXA EXATO (0 Kz)" : isOver ? `SOBRA (+${report.difference.toLocaleString("pt-AO")} Kz)` : `QUEBRA (${report.difference.toLocaleString("pt-AO")} Kz)`}</span>
              </div>
            </div>

            <div class="border-t text-center" style="margin-top: 15px; padding-top: 10px; font-size: 9px;">
              ___________________________<br />
              Assinatura do Operador<br /><br />
              ___________________________<br />
              Conferido por (Supervisão)
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                isPerfect
                  ? "bg-emerald-100 text-emerald-700"
                  : isOver
                  ? "bg-blue-100 text-blue-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isPerfect ? "✓" : "!"}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Resumo de Fecho do Caixa</h4>
              <p className="text-[11px] text-slate-500">{report.pointName} • {report.operatorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Card do Status do Fecho Cego */}
        <div
          className={`p-3.5 rounded-2xl border ${
            isPerfect
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : isOver
              ? "bg-blue-50 border-blue-200 text-blue-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {isPerfect ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={18} className={isOver ? "text-blue-600" : "text-rose-600"} />
            )}
            <span className="font-bold text-xs uppercase tracking-wide">
              {isPerfect
                ? "Caixa Perfeito (Sem Discrepâncias)"
                : isOver
                ? `Sobra de Caixa (+${report.difference.toLocaleString("pt-AO")} Kz)`
                : `Quebra de Caixa (${report.difference.toLocaleString("pt-AO")} Kz)`}
            </span>
          </div>
          <p className="text-[11px] mt-1 text-slate-600">
            {isPerfect
              ? "O valor contado físico bateu perfeitamente com o total de operações do sistema."
              : isOver
              ? "Existe dinheiro a mais na gaveta em relação ao registrado pelo sistema."
              : "Existe falta de dinheiro físico na gaveta em relação ao registrado pelo sistema."}
          </p>
        </div>

        {/* Tabela do Apuramento */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Fundo Inicial de Abertura:</span>
            <span className="font-semibold text-slate-800">{report.openingCash.toLocaleString("pt-AO")} Kz</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Vendas em Dinheiro:</span>
            <span className="font-semibold text-emerald-700">+{report.totalSalesCash.toLocaleString("pt-AO")} Kz</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Saídas / Despesas do Caixa:</span>
            <span className="font-semibold text-rose-700">-{report.totalExpenses.toLocaleString("pt-AO")} Kz</span>
          </div>
          <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
            <span>Saldo Teórico Esperado:</span>
            <span>{report.calculatedCash.toLocaleString("pt-AO")} Kz</span>
          </div>
          <div className="border-t border-slate-200 pt-1.5 flex justify-between font-extrabold text-sm text-slate-900">
            <span>Dinheiro Contado Declarado:</span>
            <span>{report.declaredCash.toLocaleString("pt-AO")} Kz</span>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Printer size={15} />
            Imprimir Comprovativo Térmico
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
