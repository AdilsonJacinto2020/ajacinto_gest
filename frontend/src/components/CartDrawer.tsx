import React from "react";
import { CartItem } from "../types";
import { Trash2, Plus, Minus, ReceiptText, Phone, CreditCard } from "lucide-react";

interface CartDrawerProps {
  cart: CartItem[];
  clientName: string;
  clientNif: string;
  clientPhone: string;
  paymentMethod: "CASH" | "TPA" | "TRANSFER";
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateRecipient: (id: string, recipient: string) => void;
  onRemoveItem: (id: string) => void;
  onClientNameChange: (val: string) => void;
  onClientNifChange: (val: string) => void;
  onClientPhoneChange: (val: string) => void;
  onPaymentMethodChange: (val: "CASH" | "TPA" | "TRANSFER") => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  clientName,
  clientNif,
  clientPhone,
  paymentMethod,
  onUpdateQuantity,
  onUpdateRecipient,
  onRemoveItem,
  onClientNameChange,
  onClientNifChange,
  onClientPhoneChange,
  onPaymentMethodChange,
  onCheckout,
}) => {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <ReceiptText className="text-brand-600" size={20} />
            <h3 className="font-bold text-base text-slate-800">Fatura Atual</h3>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
            {cart.length} {cart.length === 1 ? "item" : "itens"}
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-sm">Nenhum produto selecionado.</p>
            <p className="text-xs mt-1">Toque nos pacotes ao lado para adicionar à fatura.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 mb-4">
            {cart.map((item) => {
              const isTv = item.operator === "ZAP" || item.operator === "DSTV";
              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                        {item.operator}
                      </span>
                      <h5 className="font-semibold text-xs text-slate-800 mt-0.5">{item.name}</h5>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500">
                    {isTv ? (
                      <CreditCard size={14} className="text-slate-400 shrink-0" />
                    ) : (
                      <Phone size={14} className="text-slate-400 shrink-0" />
                    )}
                    <input
                      type="text"
                      placeholder={isTv ? "Nº do Cartão ZAP/DStv *" : "Nº Telemóvel Unitel/Africell *"}
                      value={item.recipient}
                      onChange={(e) => onUpdateRecipient(item.id, e.target.value)}
                      className="w-full text-xs outline-none bg-transparent font-mono placeholder:font-sans placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-bold text-xs text-slate-900">
                      {(item.price * item.quantity).toLocaleString("pt-AO")} Kz
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Dados do Cliente
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nome do Cliente (opcional)"
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              className="col-span-2 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="NIF Cliente (opcional)"
              value={clientNif}
              onChange={(e) => onClientNifChange(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="Tel. Cliente (opcional)"
              value={clientPhone}
              onChange={(e) => onClientPhoneChange(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Forma de Pagamento
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(["CASH", "TPA", "TRANSFER"] as const).map((method) => {
              const labels = {
                CASH: "Dinheiro",
                TPA: "Multicaixa",
                TRANSFER: "Express/Transf",
              };
              return (
                <button
                  key={method}
                  onClick={() => onPaymentMethodChange(method)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    paymentMethod === method
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {labels[method]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{subtotal.toLocaleString("pt-AO")} Kz</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>IVA (0% Isento):</span>
            <span>0,00 Kz</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>TOTAL:</span>
            <span className="text-brand-600">{total.toLocaleString("pt-AO")} Kz</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <ReceiptText size={18} />
          Emitir Fatura / Talão
        </button>
      </div>
    </div>
  );
};
