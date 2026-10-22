import React from "react";
import { COMPANY_INFO } from "../constants/catalog";
import { InvoicePrintData } from "../utils/pdfGenerator";
import { Printer, X } from "lucide-react";

interface ThermalReceiptProps {
  data: InvoicePrintData;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer size={18} />
            <span className="font-semibold text-sm">Talão Térmico (80mm)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          <div
            id="thermal-receipt"
            className="font-mono text-xs text-slate-800 bg-white p-2 border border-dashed border-slate-300"
          >
            <div className="text-center font-bold text-sm mb-1">{COMPANY_INFO.shortName}</div>
            <div className="text-center text-[10px] uppercase text-slate-600 mb-1 leading-tight">
              {COMPANY_INFO.name}
            </div>
            <div className="text-center text-[11px] mb-1">NIF: {COMPANY_INFO.nif}</div>
            <div className="text-center text-[10px] text-slate-500 mb-2">
              {COMPANY_INFO.address}
            </div>

            <div className="border-t border-b border-dashed border-slate-400 py-1.5 my-2 text-center font-bold">
              FATURA - RECIBO: {data.invoiceNumber}
            </div>

            <div className="text-[10px] space-y-0.5 mb-2">
              <div>Data: {data.date}</div>
              <div>Ponto: {data.pointName}</div>
              <div>Operador: {data.operatorName}</div>
              <div>Cliente: {data.clientName || "Consumidor Final"}</div>
              {data.clientNif && <div>NIF: {data.clientNif}</div>}
              {data.clientPhone && <div>Tel: {data.clientPhone}</div>}
            </div>

            <div className="border-t border-dashed border-slate-400 py-1 font-bold flex justify-between text-[11px]">
              <span>ITEM / DESTINATÁRIO</span>
              <span>TOTAL</span>
            </div>

            <div className="divide-y divide-dashed divide-slate-200 mb-2">
              {data.items.map((item, idx) => (
                <div key={idx} className="py-1.5 text-[10px]">
                  <div className="font-semibold text-slate-900">
                    [{item.operator}] {item.productName}
                  </div>
                  <div className="text-slate-600">Dest: {item.recipient}</div>
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

            <div className="border-t border-dashed border-slate-400 pt-1.5 space-y-1 text-right text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{data.subtotal.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA (0%):</span>
                <span>0,00 Kz</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-1">
                <span>TOTAL A PAGAR:</span>
                <span>{data.total.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div className="text-left text-[10px] text-slate-600 mt-1">
                Pagamento: {data.paymentMethod}
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 mt-3 pt-2 text-center text-[9px] text-slate-500 leading-tight">
              Obrigado pela preferência!
              <br />
              {COMPANY_INFO.footerNotice}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all active:scale-95"
          >
            <Printer size={16} />
            Imprimir Talão
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-sm transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
