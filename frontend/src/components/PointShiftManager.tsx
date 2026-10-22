import React, { useState } from "react";
import { SalePointState, WalletState, TransferRecord } from "../types";
import {
  Store,
  DollarSign,
  ArrowRightLeft,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface PointShiftManagerProps {
  points: SalePointState[];
  wallets: WalletState[];
  transfers: TransferRecord[];
  activePointId: string;
  onSelectPoint: (pointId: string) => void;
  onOpenShift: (pointId: string, operatorName: string, openingCash: number) => void;
  onCloseShift: (pointId: string, declaredCash: number) => void;
  onTransferBalance: (
    originName: string,
    destinationName: string,
    amount: number,
    operator: string
  ) => void;
}

export const PointShiftManager: React.FC<PointShiftManagerProps> = ({
  points,
  wallets,
  activePointId,
  onSelectPoint,
  onOpenShift,
  onCloseShift,
  onTransferBalance,
}) => {
  const [operatorInput, setOperatorInput] = useState<string>("Adilson Jacinto");
  const [openingCashInput, setOpeningCashInput] = useState<number>(50000);
  const [declaredCashInput, setDeclaredCashInput] = useState<number>(0);

  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferOrigin, setTransferOrigin] = useState<string>("Caixa Geral");
  const [transferDest, setTransferDest] = useState<string>(points[0]?.name || "Ponto Morro Bento");
  const [transferAmount, setTransferAmount] = useState<number>(100000);

  const activePoint = points.find((p) => p.id === activePointId) || points[0];

  const handleOpen = () => {
    if (!operatorInput.trim()) {
      alert("Informe o nome do operador!");
      return;
    }
    onOpenShift(activePoint.id, operatorInput, openingCashInput);
  };

  const handleClose = () => {
    onCloseShift(activePoint.id, declaredCashInput);
  };

  const handleExecuteTransfer = () => {
    if (transferAmount <= 0) {
      alert("Informe um valor válido!");
      return;
    }
    onTransferBalance(transferOrigin, transferDest, transferAmount, operatorInput);
    setShowTransferModal(false);
  };

  const transferLocations = [
    "Caixa Geral (Empresa)",
    "Carteira mSeller (Unitel)",
    "Carteira Afrimoney (Africell)",
    "Telplay / ZAP / DStv",
    ...points.map((p) => p.name),
  ];

  return (
    <div className="space-y-4">
      {/* Saldos das Carteiras Oficiais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                {wallet.name}
              </span>
              <DollarSign size={14} className="text-brand-600" />
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900">
              {Number(wallet.balance).toLocaleString("pt-AO")} Kz
            </div>
          </div>
        ))}
      </div>

      {/* Seleção do Ponto de Venda e Transferências */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Store size={22} />
          </div>
          <div>
            <span className="text-xs text-slate-500">Ponto de Atendimento Ativo:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={activePointId}
                onChange={(e) => onSelectPoint(e.target.value)}
                className="font-bold text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {points.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.isOpen ? "🟢 Aberto" : "🔴 Fechado"})
                  </option>
                ))}
              </select>

              {activePoint?.isOpen ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 size={12} /> Aberto por {activePoint.currentOperatorName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <XCircle size={12} /> Ponto Fechado
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <ArrowRightLeft size={15} />
          Transferir Saldo / Fundo Geral
        </button>
      </div>

      {/* Caixa de Controle do Ponto (Abertura / Fecho) */}
      <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200">
        {!activePoint?.isOpen ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800">
              <Clock size={18} className="text-brand-600" />
              <h4 className="font-bold text-sm">Fazer Abertura do Ponto / Iniciar o Dia</h4>
            </div>
            <p className="text-xs text-slate-500">
              Declare o operador responsável e o fundo de maneio inicial em caixa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Operador do Turno
                </label>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <UserCheck size={16} className="text-slate-400" />
                  <input
                    type="text"
                    value={operatorInput}
                    onChange={(e) => setOperatorInput(e.target.value)}
                    className="w-full text-xs outline-none font-semibold text-slate-800"
                    placeholder="Nome do operador"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Fundo de Caixa Inicial (Kz)
                </label>
                <input
                  type="number"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(Number(e.target.value))}
                  className="w-full text-xs font-bold text-slate-800 bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleOpen}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Abrir Ponto de Venda
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {activePoint.name} está em Operação
                </div>
                <div className="text-xs text-slate-500">
                  Operador: <span className="font-semibold text-slate-800">{activePoint.currentOperatorName}</span> |
                  Caixa Atual: <span className="font-bold text-slate-900">{Number(activePoint.currentCashBalance).toLocaleString("pt-AO")} Kz</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                placeholder="Valor em caixa"
                value={declaredCashInput || ""}
                onChange={(e) => setDeclaredCashInput(Number(e.target.value))}
                className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white w-36 outline-none font-semibold"
              />
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                Encerrar Turno
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Transferência */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="text-brand-600" size={20} />
                <h4 className="font-bold text-base text-slate-900">Transferir Saldo / Fundo</h4>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Origem (De onde sai o valor)
                </label>
                <select
                  value={transferOrigin}
                  onChange={(e) => setTransferOrigin(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                >
                  {transferLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Destino (Para onde vai o valor)
                </label>
                <select
                  value={transferDest}
                  onChange={(e) => setTransferDest(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                >
                  {transferLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Valor a Transferir (Kz)
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleExecuteTransfer}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Confirmar Transferência
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-3 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
