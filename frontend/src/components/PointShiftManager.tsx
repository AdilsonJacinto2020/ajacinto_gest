import React, { useState } from "react";
import {
  SalePointState,
  WalletState,
  TransferRecord,
  BalanceAdjustmentRecord,
  SaleInvoiceRecord,
} from "../types";
import {
  Store,
  DollarSign,
  ArrowRightLeft,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Edit3,
  TrendingDown,
  UserPlus,
  SlidersHorizontal,
  History,
  Receipt,
  RotateCcw,
} from "lucide-react";

interface PointShiftManagerProps {
  points: SalePointState[];
  wallets: WalletState[];
  transfers: TransferRecord[];
  adjustments: BalanceAdjustmentRecord[];
  invoices: SaleInvoiceRecord[];
  activePointId: string;
  onSelectPoint: (pointId: string) => void;
  onOpenShift: (pointId: string, operatorName: string, openingCash: number) => void;
  onCloseShift: (pointId: string, declaredCash: number) => void;
  onTransferBalance: (
    originName: string,
    destinationName: string,
    amount: number,
    operator: string,
    reason?: string
  ) => void;
  onCreatePoint: (name: string, location: string, assignedOperator: string, initialCash: number) => void;
  onUpdatePoint: (pointId: string, name: string, location: string, assignedOperator: string) => void;
  onAddExpense: (pointId: string, amount: number, reason: string, operator: string) => void;
  onAdjustPointBalance: (pointId: string, newBalance: number, reason: string, operator: string) => void;
  onAdjustWalletBalance: (walletId: string, newBalance: number, reason: string, operator: string) => void;
  onResetSystemData?: () => void;
  onNotify?: (title: string, desc?: string, type?: "success" | "info" | "error") => void;
}

export const PointShiftManager: React.FC<PointShiftManagerProps> = ({
  points,
  wallets,
  transfers,
  adjustments,
  invoices,
  activePointId,
  onSelectPoint,
  onOpenShift,
  onCloseShift,
  onTransferBalance,
  onCreatePoint,
  onUpdatePoint,
  onAddExpense,
  onAdjustPointBalance,
  onAdjustWalletBalance,
  onResetSystemData,
  onNotify,
}) => {
  const notify = (title: string, desc?: string, type: "success" | "info" | "error" = "info") => {
    if (onNotify) {
      onNotify(title, desc, type);
    } else {
      alert(`${title}\n${desc || ""}`);
    }
  };
  const activePoint = points.find((p) => p.id === activePointId) || points[0];

  const [operatorInput, setOperatorInput] = useState<string>(
    activePoint?.assignedOperatorName || "Adilson Jacinto"
  );
  const [openingCashInput, setOpeningCashInput] = useState<number>(50000);
  const [declaredCashInput, setDeclaredCashInput] = useState<number>(0);

  // Modais
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showCreatePointModal, setShowCreatePointModal] = useState<boolean>(false);
  const [showEditPointModal, setShowEditPointModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [resetConfirmationText, setResetConfirmationText] = useState<string>("");

  // Estados formulário transferência
  const [transferOrigin, setTransferOrigin] = useState<string>("Caixa Geral (Empresa)");
  const [transferDest, setTransferDest] = useState<string>(points[0]?.name || "Ponto Morro Bento");
  const [transferAmount, setTransferAmount] = useState<number>(50000);
  const [transferReason, setTransferReason] = useState<string>("Reforço de Caixa / Movimentação");

  // Estados formulário criar/editar ponto
  const [newPointName, setNewPointName] = useState<string>("");
  const [newPointLocation, setNewPointLocation] = useState<string>("");
  const [newPointOperator, setNewPointOperator] = useState<string>("");
  const [newPointInitialCash, setNewPointInitialCash] = useState<number>(0);

  const [editName, setEditName] = useState<string>("");
  const [editLocation, setEditLocation] = useState<string>("");
  const [editOperator, setEditOperator] = useState<string>("");

  // Despesa
  const [expenseAmount, setExpenseAmount] = useState<number>(2000);
  const [expenseReason, setExpenseReason] = useState<string>("Água / Lanche / Logística");

  // Ajuste / Retificação de Saldo
  const [adjustTargetType, setAdjustTargetType] = useState<"POINT" | "WALLET">("POINT");
  const [adjustTargetId, setAdjustTargetId] = useState<string>(activePoint?.id || "");
  const [adjustNewBalance, setAdjustNewBalance] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>("");

  // Histórico tab
  const [historyTab, setHistoryTab] = useState<"SALES" | "ADJUSTMENTS" | "TRANSFERS">("SALES");

  // Cálculos consolidados
  const totalPointsCash = points.reduce((acc, p) => acc + Number(p.currentCashBalance || 0), 0);
  const totalWallets = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);
  const totalGlobalConsolidado = totalPointsCash + totalWallets;

  // Filtragem de vendas do ponto atual
  const pointInvoices = invoices.filter(
    (inv) =>
      inv.salePoint?.id === activePoint?.id ||
      inv.salePoint?.name === activePoint?.name
  );
  const totalVendidoNoPonto = pointInvoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0);
  const totalVendidoDinheiro = pointInvoices
    .filter((inv) => inv.paymentMethod === "Dinheiro" || inv.paymentMethod === "CASH")
    .reduce((acc, inv) => acc + Number(inv.total || 0), 0);
  const totalVendidoTpa = totalVendidoNoPonto - totalVendidoDinheiro;

  const handleOpen = () => {
    if (!operatorInput.trim()) {
      notify("Atenção", "Informe o nome do operador para abrir o ponto!", "error");
      return;
    }
    onOpenShift(activePoint.id, operatorInput, openingCashInput);
  };

  const handleClose = () => {
    onCloseShift(activePoint.id, declaredCashInput);
  };

  const handleExecuteTransfer = () => {
    if (transferAmount <= 0) {
      notify("Valor Inválido", "Informe um montante superior a zero!", "error");
      return;
    }
    if (transferOrigin === transferDest) {
      notify("Operação Inválida", "A origem e o destino da transferência não podem ser iguais!", "error");
      return;
    }
    onTransferBalance(
      transferOrigin,
      transferDest,
      transferAmount,
      operatorInput,
      transferReason
    );
    setShowTransferModal(false);
  };

  const handleExecuteCreatePoint = () => {
    if (!newPointName.trim()) {
      notify("Campo Obrigatório", "Dê um nome ao Ponto de Venda!", "error");
      return;
    }
    onCreatePoint(newPointName, newPointLocation, newPointOperator, newPointInitialCash);
    setShowCreatePointModal(false);
    setNewPointName("");
    setNewPointLocation("");
    setNewPointOperator("");
    setNewPointInitialCash(0);
  };

  const handleOpenEdit = () => {
    if (!activePoint) return;
    setEditName(activePoint.name);
    setEditLocation(activePoint.location);
    setEditOperator(activePoint.assignedOperatorName || "");
    setShowEditPointModal(true);
  };

  const handleExecuteUpdatePoint = () => {
    if (!editName.trim()) {
      notify("Campo Obrigatório", "O nome do ponto não pode ficar vazio!", "error");
      return;
    }
    onUpdatePoint(activePoint.id, editName, editLocation, editOperator);
    setShowEditPointModal(false);
  };

  const handleExecuteExpense = () => {
    if (expenseAmount <= 0) {
      notify("Valor Inválido", "Informe um valor de saída válido!", "error");
      return;
    }
    if (!expenseReason.trim()) {
      notify("Campo Obrigatório", "Descreva o motivo da saída!", "error");
      return;
    }
    if (expenseAmount > activePoint.currentCashBalance) {
      notify("Saldo Insuficiente", "Saldo em caixa insuficiente para esta saída!", "error");
      return;
    }
    onAddExpense(
      activePoint.id,
      expenseAmount,
      expenseReason,
      activePoint.currentOperatorName || operatorInput
    );
    setShowExpenseModal(false);
    setExpenseAmount(2000);
    setExpenseReason("Água / Lanche / Logística");
  };

  const handleOpenAdjust = (type: "POINT" | "WALLET", targetId: string) => {
    setAdjustTargetType(type);
    setAdjustTargetId(targetId);
    if (type === "POINT") {
      const p = points.find((pt) => pt.id === targetId) || activePoint;
      setAdjustNewBalance(Number(p.currentCashBalance || 0));
    } else {
      const w = wallets.find((wal) => wal.id === targetId) || wallets[0];
      setAdjustNewBalance(Number(w.balance || 0));
    }
    setAdjustReason("");
    setShowAdjustModal(true);
  };

  const handleExecuteAdjust = () => {
    if (!adjustReason.trim()) {
      notify("Justificação Obrigatória", "É obrigatório informar o motivo/justificativa para corrigir o saldo!", "error");
      return;
    }
    if (adjustTargetType === "POINT") {
      onAdjustPointBalance(
        adjustTargetId,
        adjustNewBalance,
        adjustReason,
        activePoint.currentOperatorName || operatorInput
      );
    } else {
      onAdjustWalletBalance(
        adjustTargetId,
        adjustNewBalance,
        adjustReason,
        activePoint.currentOperatorName || operatorInput
      );
    }
    setShowAdjustModal(false);
  };

  const transferLocations = [
    ...wallets.map((w) => w.name),
    ...points.map((p) => p.name),
  ];

  return (
    <div className="space-y-4">
      {/* CARD DO VALOR TOTAL CIRCULANTE CONSOLIDADO */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Fundo Global da Empresa (Circulante & Saldos)
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
            {totalGlobalConsolidado.toLocaleString("pt-AO")}{" "}
            <span className="text-emerald-400 text-lg font-bold">Kz</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dinheiro em Caixa nos Pontos:{" "}
            <strong className="text-white font-semibold">{totalPointsCash.toLocaleString("pt-AO")} Kz</strong> |
            Carteiras & Caixa Geral:{" "}
            <strong className="text-white font-semibold">{totalWallets.toLocaleString("pt-AO")} Kz</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setResetConfirmationText("");
              setShowResetConfirmModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-700/60 rounded-2xl text-xs font-medium text-slate-300 hover:text-rose-300 transition-colors"
            title="Reiniciar/limpar dados e zerar saldos"
          >
            <RotateCcw size={13} className="text-rose-400" />
            Reiniciar Dados
          </button>

          <button
            onClick={() => handleOpenAdjust("POINT", activePoint.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl text-xs font-medium text-slate-200 transition-colors"
            title="Corrigir valores atuais com registo de histórico"
          >
            <SlidersHorizontal size={14} className="text-emerald-400" />
            Corrigir Saldos
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-2xl text-xs font-medium text-slate-200 transition-colors"
          >
            <History size={14} className="text-brand-400" />
            Ver Históricos
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold transition-colors"
          >
            <ArrowRightLeft size={14} />
            Mover Dinheiro
          </button>
        </div>
      </div>

      {/* Saldos das Carteiras Oficiais com botão rápido de ajuste */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {wallets.map((wallet) => {
          const isLow = Number(wallet.balance) < 50000;
          return (
            <div
              key={wallet.id}
              className={`rounded-2xl p-3.5 border shadow-sm flex flex-col justify-between transition-colors ${
                isLow
                  ? "bg-amber-50/60 border-amber-300"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {wallet.name}
                </span>
                <div className="flex items-center gap-1">
                  {isLow && (
                    <span
                      title="Saldo baixo (menos de 50.000 Kz). Faça recarga para evitar bloqueio nas vendas!"
                      className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded"
                    >
                      Baixo
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenAdjust("WALLET", wallet.id)}
                    title="Ajustar saldo desta carteira"
                    className="text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <SlidersHorizontal size={12} />
                  </button>
                </div>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {Number(wallet.balance).toLocaleString("pt-AO")} Kz
              </div>
            </div>
          );
        })}
      </div>

      {/* Seleção do Ponto de Venda e Painel de Vendas */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Store size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Ponto Ativo:</span>
              <button
                onClick={handleOpenEdit}
                title="Editar dados do ponto e operador fixo"
                className="text-slate-400 hover:text-slate-700 p-0.5"
              >
                <Edit3 size={13} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <select
                value={activePointId}
                onChange={(e) => {
                  onSelectPoint(e.target.value);
                  const pt = points.find((p) => p.id === e.target.value);
                  if (pt?.assignedOperatorName) setOperatorInput(pt.assignedOperatorName);
                }}
                className="font-bold text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
              >
                {points.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.assignedOperatorName ? `(Resp: ${p.assignedOperatorName})` : ""}
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

        {/* Resumo de Vendas do Ponto e Botões */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-2xl text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">
              Vendido neste Ponto
            </div>
            <div className="text-xs font-black text-brand-700">
              {totalVendidoNoPonto.toLocaleString("pt-AO")} Kz
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Dinheiro: {totalVendidoDinheiro.toLocaleString("pt-AO")} | TPA: {totalVendidoTpa.toLocaleString("pt-AO")}
            </div>
          </div>

          <button
            onClick={() => {
              setTransferOrigin(activePoint.name);
              setTransferDest("Caixa Geral (Empresa)");
              setTransferAmount(Math.min(50000, Number(activePoint.currentCashBalance || 0)));
              setTransferReason("Sangria de Caixa / Recolha para Sede");
              setShowTransferModal(true);
            }}
            title="Recolher dinheiro deste ponto para o Caixa Geral / Cofre"
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-2xs"
          >
            <ArrowRightLeft size={14} className="text-amber-600" />
            Sangria / Recolha
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-2xs"
          >
            <TrendingDown size={14} />
            Saída / Despesa
          </button>

          <button
            onClick={() => setShowCreatePointModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-2xs"
          >
            <PlusCircle size={14} />
            Novo Ponto
          </button>
        </div>
      </div>

      {/* Caixa de Controle do Turno */}
      <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200">
        {!activePoint?.isOpen ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800">
              <Clock size={18} className="text-brand-600" />
              <h4 className="font-bold text-sm">Fazer Abertura do Ponto / Iniciar o Dia</h4>
            </div>
            <p className="text-xs text-slate-500">
              Indique quem está a assumir o atendimento neste ponto e o fundo de caixa inicial.
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
                  Operador no Caixa:{" "}
                  <span className="font-semibold text-slate-800">
                    {activePoint.currentOperatorName}
                  </span>{" "}
                  | Caixa Disponível:{" "}
                  <span className="font-bold text-slate-900">
                    {Number(activePoint.currentCashBalance).toLocaleString("pt-AO")} Kz
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                placeholder="Valor contado"
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

      {/* MODAL: CORREÇÃO / RETIFICAÇÃO DE SALDOS COM AUDITORIA */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="text-emerald-600" size={20} />
                <h4 className="font-bold text-base text-slate-900">
                  Corrigir Saldo & Gravar Histórico
                </h4>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Tipo de Conta / Alvo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustTargetType("POINT");
                      setAdjustTargetId(activePoint.id);
                      setAdjustNewBalance(Number(activePoint.currentCashBalance || 0));
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      adjustTargetType === "POINT"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Ponto de Venda
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustTargetType("WALLET");
                      setAdjustTargetId(wallets[0]?.id || "");
                      setAdjustNewBalance(Number(wallets[0]?.balance || 0));
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      adjustTargetType === "WALLET"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Carteira / Caixa Central
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Selecionar Conta Específica
                </label>
                <select
                  value={adjustTargetId}
                  onChange={(e) => {
                    setAdjustTargetId(e.target.value);
                    if (adjustTargetType === "POINT") {
                      const pt = points.find((p) => p.id === e.target.value);
                      if (pt) setAdjustNewBalance(Number(pt.currentCashBalance || 0));
                    } else {
                      const wl = wallets.find((w) => w.id === e.target.value);
                      if (wl) setAdjustNewBalance(Number(wl.balance || 0));
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                >
                  {adjustTargetType === "POINT"
                    ? points.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Atual: {Number(p.currentCashBalance).toLocaleString("pt-AO")} Kz)
                        </option>
                      ))
                    : wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} (Atual: {Number(w.balance).toLocaleString("pt-AO")} Kz)
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Novo Saldo Correto (Kz) *
                </label>
                <input
                  type="number"
                  value={adjustNewBalance}
                  onChange={(e) => setAdjustNewBalance(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Motivo / Justificação da Alteração *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Contagem física final do dia, correção de entrada manual..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleExecuteAdjust}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Gravar Novo Saldo & Registar
              </button>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-3 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICOS COMPLETOS (VENDAS POR PONTO, AJUSTES E TRANSFERÊNCIAS) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="text-brand-600" size={20} />
                <h4 className="font-bold text-base text-slate-900">
                  Painel de Históricos & Rastreabilidade
                </h4>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Abas */}
            <div className="flex gap-2 pt-3 pb-2 border-b border-slate-100">
              <button
                onClick={() => setHistoryTab("SALES")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  historyTab === "SALES"
                    ? "bg-brand-50 text-brand-700 border border-brand-200"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Receipt size={14} /> Vendas no Ponto ({pointInvoices.length})
              </button>
              <button
                onClick={() => setHistoryTab("ADJUSTMENTS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  historyTab === "ADJUSTMENTS"
                    ? "bg-brand-50 text-brand-700 border border-brand-200"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <RotateCcw size={14} /> Ajustes de Saldo ({adjustments.length})
              </button>
              <button
                onClick={() => setHistoryTab("TRANSFERS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  historyTab === "TRANSFERS"
                    ? "bg-brand-50 text-brand-700 border border-brand-200"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <ArrowRightLeft size={14} /> Movimentações ({transfers.length})
              </button>
            </div>

            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-2">
              {historyTab === "SALES" && (
                <div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    Histórico de faturas emitidas para: <strong>{activePoint.name}</strong>
                  </div>
                  {pointInvoices.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Nenhuma venda registrada neste ponto ainda.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pointInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              {inv.invoiceNumber} • {inv.clientName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {inv.createdAt} | Op: {inv.operatorName} | Pagamento:{" "}
                              {inv.paymentMethod}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-sm text-brand-700">
                              {Number(inv.total).toLocaleString("pt-AO")} Kz
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {historyTab === "ADJUSTMENTS" && (
                <div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    Registo de todas as alterações manuais e correções de saldo:
                  </div>
                  {adjustments.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Nenhum ajuste manual de saldo registrado até ao momento.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {adjustments.map((adj) => (
                        <div
                          key={adj.id}
                          className="bg-slate-50 p-3 rounded-2xl border border-slate-200"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">
                              {adj.targetName}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                adj.difference >= 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {adj.difference >= 0 ? "+" : ""}
                              {Number(adj.difference).toLocaleString("pt-AO")} Kz
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            De <strong>{Number(adj.previousBalance).toLocaleString("pt-AO")} Kz</strong> para{" "}
                            <strong>{Number(adj.newBalance).toLocaleString("pt-AO")} Kz</strong>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Motivo: <em>"{adj.reason}"</em> | Resp: {adj.adjustedBy} | {adj.createdAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {historyTab === "TRANSFERS" && (
                <div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    Histórico de movimentações de saldo entre caixas e pontos:
                  </div>
                  {transfers.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Nenhuma movimentação realizada ainda.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transfers.map((tr) => (
                        <div
                          key={tr.id}
                          className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              {tr.originName} ➔ {tr.destinationName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {tr.createdAt} | Resp: {tr.transferredBy}
                              {tr.reason ? ` | Motivo: ${tr.reason}` : ""}
                            </div>
                          </div>
                          <div className="text-right font-black text-sm text-slate-900">
                            {Number(tr.amount).toLocaleString("pt-AO")} Kz
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CRIAR NOVO PONTO DE VENDA */}
      {showCreatePointModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="text-brand-600" size={20} />
                <h4 className="font-bold text-base text-slate-900">Novo Ponto de Venda</h4>
              </div>
              <button
                onClick={() => setShowCreatePointModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Nome do Ponto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ponto Quiosque 3, Balcão Samba"
                  value={newPointName}
                  onChange={(e) => setNewPointName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Localização / Morada
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rua Direita da Samba, junto à paragem"
                  value={newPointLocation}
                  onChange={(e) => setNewPointLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Operador Alocado / Responsável Fixo
                </label>
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <UserPlus size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ex: Maria Teresa, João Pedro"
                    value={newPointOperator}
                    onChange={(e) => setNewPointOperator(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Fundo de Caixa Inicial (Kz)
                </label>
                <input
                  type="number"
                  value={newPointInitialCash}
                  onChange={(e) => setNewPointInitialCash(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleExecuteCreatePoint}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Guardar e Criar Ponto
              </button>
              <button
                onClick={() => setShowCreatePointModal(false)}
                className="px-4 py-3 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR PONTO / NOMEAR RESPONSÁVEL */}
      {showEditPointModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="text-brand-600" size={20} />
                <h4 className="font-bold text-base text-slate-900">Configurar Ponto</h4>
              </div>
              <button
                onClick={() => setShowEditPointModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Nome do Ponto de Venda *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Localização / Bairro
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Responsável / Operador Alocado
                </label>
                <input
                  type="text"
                  value={editOperator}
                  onChange={(e) => setEditOperator(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleExecuteUpdatePoint}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Atualizar Dados
              </button>
              <button
                onClick={() => setShowEditPointModal(false)}
                className="px-4 py-3 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTAR SAÍDA / DESPESA DE CAIXA */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-rose-600" size={20} />
                <h4 className="font-bold text-base text-slate-900">
                  Registar Saída de Dinheiro (Caixa)
                </h4>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-rose-50 text-rose-800 p-2.5 rounded-xl text-xs font-medium">
                Ponto: <strong>{activePoint.name}</strong> | Saldo em Caixa:{" "}
                <strong>{Number(activePoint.currentCashBalance).toLocaleString("pt-AO")} Kz</strong>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Valor da Saída (Kz) *
                </label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-rose-600 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Motivo / Justificação *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Água, Lanche, Compra de rolos térmicos, Transporte"
                  value={expenseReason}
                  onChange={(e) => setExpenseReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleExecuteExpense}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Confirmar Saída
              </button>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-3 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TRANSFERÊNCIA ENTRE PONTOS / CAIXA GERAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="text-brand-600" size={20} />
                <h4 className="font-bold text-base text-slate-900">
                  Transferir / Movimentar Saldo
                </h4>
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
                  Valor a Transferir (Kz) *
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Motivo / Observação
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Ex: Fundo de maneio, recolha de sangria"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
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

      {/* MODAL: CONFIRMAÇÃO DE REINICIALIZAÇÃO GERAL DE DADOS */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Reiniciar Dados do Sistema</h4>
                  <p className="text-[11px] text-slate-500">Zerar saldos e limpar movimentações</p>
                </div>
              </div>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs space-y-1.5 leading-relaxed">
              <p className="font-bold">⚠️ Esta ação irá executar as seguintes tarefas:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11.5px] text-rose-800">
                <li>Zerar saldos das carteiras (Unitel, Africell, ZAP/DStv, Caixa Geral) para 0 Kz.</li>
                <li>Zerar dinheiro em caixa de todos os pontos de venda para 0 Kz.</li>
                <li>Limpar faturas, histórico de despesas e turnos anteriores.</li>
                <li>Reiniciar a numeração da fatura para <strong>FR 2026/0001</strong>.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Para confirmar, digite <span className="font-mono font-bold text-rose-600">LIMPAR</span> abaixo:
              </label>
              <input
                type="text"
                placeholder="LIMPAR"
                value={resetConfirmationText}
                onChange={(e) => setResetConfirmationText(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                disabled={resetConfirmationText !== "LIMPAR"}
                onClick={() => {
                  if (onResetSystemData) {
                    onResetSystemData();
                  }
                  setShowResetConfirmModal(false);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Sim, Reiniciar Tudo Agora
              </button>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-3 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200"
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
