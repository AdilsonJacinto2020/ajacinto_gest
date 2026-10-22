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
  PlusCircle,
  Edit3,
  TrendingDown,
  UserPlus,
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
  onCreatePoint: (name: string, location: string, assignedOperator: string, initialCash: number) => void;
  onUpdatePoint: (pointId: string, name: string, location: string, assignedOperator: string) => void;
  onAddExpense: (pointId: string, amount: number, reason: string, operator: string) => void;
}

export const PointShiftManager: React.FC<PointShiftManagerProps> = ({
  points,
  wallets,
  activePointId,
  onSelectPoint,
  onOpenShift,
  onCloseShift,
  onTransferBalance,
  onCreatePoint,
  onUpdatePoint,
  onAddExpense,
}) => {
  const activePoint = points.find((p) => p.id === activePointId) || points[0];

  const [operatorInput, setOperatorInput] = useState<string>(activePoint?.assignedOperatorName || "Adilson Jacinto");
  const [openingCashInput, setOpeningCashInput] = useState<number>(50000);
  const [declaredCashInput, setDeclaredCashInput] = useState<number>(0);

  // Modais
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showCreatePointModal, setShowCreatePointModal] = useState<boolean>(false);
  const [showEditPointModal, setShowEditPointModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);

  // Estados dos formulários dos modais
  const [transferOrigin, setTransferOrigin] = useState<string>("Caixa Geral");
  const [transferDest, setTransferDest] = useState<string>(points[0]?.name || "Ponto Morro Bento");
  const [transferAmount, setTransferAmount] = useState<number>(100000);

  const [newPointName, setNewPointName] = useState<string>("");
  const [newPointLocation, setNewPointLocation] = useState<string>("");
  const [newPointOperator, setNewPointOperator] = useState<string>("");
  const [newPointInitialCash, setNewPointInitialCash] = useState<number>(0);

  const [editName, setEditName] = useState<string>("");
  const [editLocation, setEditLocation] = useState<string>("");
  const [editOperator, setEditOperator] = useState<string>("");

  const [expenseAmount, setExpenseAmount] = useState<number>(2000);
  const [expenseReason, setExpenseReason] = useState<string>("Água / Lanche / Logística");

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

  const handleExecuteCreatePoint = () => {
    if (!newPointName.trim()) {
      alert("Dê um nome ao Ponto de Venda!");
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
      alert("O nome do ponto não pode ficar vazio!");
      return;
    }
    onUpdatePoint(activePoint.id, editName, editLocation, editOperator);
    setShowEditPointModal(false);
  };

  const handleExecuteExpense = () => {
    if (expenseAmount <= 0) {
      alert("Informe um valor de saída válido!");
      return;
    }
    if (!expenseReason.trim()) {
      alert("Descreva o motivo da saída!");
      return;
    }
    if (expenseAmount > activePoint.currentCashBalance) {
      alert("Saldo em caixa insuficiente para esta saída!");
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

      {/* Seleção do Ponto de Venda, Ações e Botões */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Store size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Ponto de Venda:</span>
              <button
                onClick={handleOpenEdit}
                title="Editar nome do ponto e responsável"
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
                className="font-bold text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 focus:ring-2 focus:ring-brand-500 outline-none"
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

        {/* Botões de Ação do Ponto: Novo Ponto, Registar Saída e Transferência */}
        <div className="flex flex-wrap items-center gap-2">
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
            Criar Ponto
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <ArrowRightLeft size={14} />
            Transferir
          </button>
        </div>
      </div>

      {/* Caixa de Controle do Turno (Abertura / Fecho) */}
      <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200">
        {!activePoint?.isOpen ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800">
              <Clock size={18} className="text-brand-600" />
              <h4 className="font-bold text-sm">Fazer Abertura do Ponto / Iniciar o Dia</h4>
            </div>
            <p className="text-xs text-slate-500">
              Indique quem está a assumir o atendimento neste ponto e o fundo de caixa.
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
                  Operador no Caixa: <span className="font-semibold text-slate-800">{activePoint.currentOperatorName}</span> |
                  Caixa Disponível: <span className="font-bold text-slate-900">{Number(activePoint.currentCashBalance).toLocaleString("pt-AO")} Kz</span>
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
                  Nome do Ponto
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Localização
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
                  Operador Responsável Fixo
                </label>
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <UserPlus size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nome do operador fixo"
                    value={editOperator}
                    onChange={(e) => setEditOperator(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleExecuteUpdatePoint}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Salvar Alterações
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

      {/* MODAL 3: REGISTAR SAÍDA / DESPESA DE CAIXA NO PONTO */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-rose-600" size={20} />
                <h4 className="font-bold text-base text-slate-900">Registar Saída de Caixa</h4>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
              A quantia retirada sairá diretamente do caixa de <strong>{activePoint.name}</strong>.
              <br />
              Saldo disponível: <strong>{Number(activePoint.currentCashBalance).toLocaleString("pt-AO")} Kz</strong>
            </div>

            <div className="space-y-3">
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
