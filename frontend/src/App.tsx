import { useState, useEffect, useCallback } from "react";
import { Operator, INITIAL_PRODUCTS, CatalogItem, COMPANY_INFO } from "./constants/catalog";
import {
  CartItem,
  SalePointState,
  WalletState,
  TransferRecord,
  BalanceAdjustmentRecord,
  SaleInvoiceRecord,
} from "./types";
import { OperatorTabs } from "./components/OperatorTabs";
import { ProductCatalog } from "./components/ProductCatalog";
import { CartDrawer } from "./components/CartDrawer";
import { PointShiftManager } from "./components/PointShiftManager";
import { ThermalReceipt } from "./components/ThermalReceipt";
import { ShiftReportModal } from "./components/ShiftReportModal";
import { ToastContainer, ToastMessage, ToastType } from "./components/Toast";
import { ShiftCloseReport } from "./types";
import { generateInvoicePDF, InvoicePrintData } from "./utils/pdfGenerator";
import { Smartphone } from "lucide-react";

import { api, API_BASE } from "./api";
const PM_LABEL: Record<string, string> = {
  CASH: "Dinheiro",
  TPA: "Multicaixa",
  TRANSFER: "Transferência Express",
};

const fmtDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString("pt-AO");
};

export default function App() {
  const [activeOperator, setActiveOperator] = useState<Operator>("UNITEL");
  const [catalog] = useState<CatalogItem[]>(INITIAL_PRODUCTS);

  // Os dados vêm SEMPRE da base de dados, através do servidor.
  // Já não existem pontos, carteiras ou faturas "de demonstração" guardados só no telemóvel.
  const [points, setPoints] = useState<SalePointState[]>([]);
  const [activePointId, setActivePointId] = useState<string>("");
  const [wallets, setWallets] = useState<WalletState[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [adjustments, setAdjustments] = useState<BalanceAdjustmentRecord[]>([]);
  const [invoices, setInvoices] = useState<SaleInvoiceRecord[]>([]);

  // Sistema de Toasts Elegantes
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fail = (title: string, e: unknown) =>
    showToast(title, e instanceof Error ? e.message : "Erro inesperado.", "error");

  // Lê tudo da base de dados. É chamado ao abrir, ao voltar à app e depois de cada gravação,
  // por isso o que se vê no ecrã é sempre o que está guardado.
  const loadAll = useCallback(async () => {
    try {
      const [pts, wls, trs, adj, inv] = await Promise.all([
        api<SalePointState[]>("/points"),
        api<WalletState[]>("/wallets"),
        api<TransferRecord[]>("/transfers"),
        api<BalanceAdjustmentRecord[]>("/points/adjustments"),
        api<SaleInvoiceRecord[]>("/invoices"),
      ]);
      setPoints(pts.map((p) => ({ ...p, currentCashBalance: Number(p.currentCashBalance) })));
      setWallets(wls.map((w) => ({ ...w, balance: Number(w.balance) })));
      setTransfers(trs.map((t) => ({ ...t, amount: Number(t.amount), createdAt: fmtDate(t.createdAt) })));
      setAdjustments(
        adj.map((a) => ({
          ...a,
          previousBalance: Number(a.previousBalance),
          newBalance: Number(a.newBalance),
          difference: Number(a.difference),
          createdAt: fmtDate(a.createdAt),
        }))
      );
      setInvoices(
        inv.map((i) => ({
          ...i,
          total: Number(i.total),
          paymentMethod: PM_LABEL[i.paymentMethod] ?? i.paymentMethod,
          createdAt: fmtDate(i.createdAt),
          items: i.items?.map((it) => ({
            ...it,
            unitPrice: Number(it.unitPrice),
            totalPrice: Number(it.totalPrice),
          })),
        }))
      );
      setActivePointId((cur) => (pts.some((p) => p.id === cur) ? cur : pts[0]?.id ?? ""));
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadAll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadAll]);
  // Criar novo Ponto de Venda
  const handleCreatePoint = async (
    name: string,
    location: string,
    assignedOperator: string,
    initialCash: number
  ) => {
    try {
      const pt = await api<SalePointState>("/points", {
        body: { name, location, assignedOperatorName: assignedOperator, initialCash },
      });
      await loadAll();
      setActivePointId(pt.id);
      showToast("Ponto Criado", `Ponto "${name}" guardado na base de dados!`, "success");
    } catch (e) {
      fail("Não foi possível criar o ponto", e);
    }
  };

  // Atualizar / Renomear Ponto e alocar operador
  const handleUpdatePoint = async (
    pointId: string,
    name: string,
    location: string,
    assignedOperator: string
  ) => {
    try {
      await api(`/points/${pointId}/update`, {
        body: { name, location, assignedOperatorName: assignedOperator },
      });
      await loadAll();
      showToast("Ponto Atualizado", "Dados e responsável guardados com sucesso!", "success");
    } catch (e) {
      fail("Não foi possível atualizar o ponto", e);
    }
  };

  // Registar Saída / Despesa de Caixa no Ponto
  const handleAddExpense = async (
    pointId: string,
    amount: number,
    reason: string,
    operator: string
  ) => {
    try {
      await api(`/points/${pointId}/expenses`, {
        body: { amount, reason, operatorName: operator },
      });
      await loadAll();
      showToast("Saída Registada", `Valor: ${amount.toLocaleString("pt-AO")} Kz\nMotivo: ${reason}`, "info");
    } catch (e) {
      fail("Não foi possível registar a saída", e);
    }
  };
  // Carrinho e Fatura
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState<string>("");
  const [clientNif, setClientNif] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TPA" | "TRANSFER">("CASH");

  const [thermalData, setThermalData] = useState<InvoicePrintData | null>(null);
  const [shiftReport, setShiftReport] = useState<ShiftCloseReport | null>(null);

  const handleAddToCart = (product: CatalogItem, customPrice?: number) => {
    const finalPrice = customPrice !== undefined && customPrice > 0 ? customPrice : product.price;

    setCart((prev) => [
      ...prev,
      {
        id: `${product.id}-${Date.now()}`,
        catalogId: product.id,
        operator: product.operator,
        name: product.name,
        category: product.category,
        price: finalPrice,
        recipient: "",
        quantity: 1,
      },
    ]);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const newQ = it.quantity + delta;
            return newQ > 0 ? { ...it, quantity: newQ } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleUpdateRecipient = (id: string, recipient: string) => {
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, recipient } : it))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  const handleOpenShift = async (pointId: string, operatorName: string, openingCash: number) => {
    try {
      await api(`/points/${pointId}/open`, { body: { operatorName, openingCash } });
      await loadAll();
      showToast("Turno Aberto", `Operador: ${operatorName}`, "success");
    } catch (e) {
      fail("Não foi possível abrir o turno", e);
    }
  };

  const handleCloseShift = async (pointId: string, declaredCash: number) => {
    const point = points.find((p) => p.id === pointId);

    try {
      const data = await api<any>(`/points/${pointId}/close`, { body: { declaredCash } });
      const calculated = Number(data?.calculatedCash ?? point?.currentCashBalance ?? 0);
      const diff = declaredCash - calculated;

      // Gerar relatório de fecho para exibição e impressão de comprovativo
      const report: ShiftCloseReport = {
        pointName: point?.name || "Ponto de Venda",
        operatorName: point?.currentOperatorName || "Operador",
        closedAt: new Date().toLocaleString("pt-AO"),
        openingCash: Number(data?.shift?.openingCash ?? 0),
        calculatedCash: calculated,
        declaredCash,
        difference: diff,
        totalSalesCash: Math.max(0, calculated),
        totalExpenses: 0,
      };

      setShiftReport(report);
      showToast(
        diff === 0 ? "Turno Encerrado (Sem Quebra)" : diff > 0 ? "Sobra de Caixa Registada" : "Quebra de Caixa Registada",
        `Operador: ${report.operatorName}\nDeclarado: ${declaredCash.toLocaleString("pt-AO")} Kz (Dif: ${diff.toLocaleString("pt-AO")} Kz)`,
        diff === 0 ? "success" : "info"
      );
      await loadAll();
    } catch (e) {
      fail("Não foi possível encerrar o turno", e);
    }
  };

  const handleTransferBalance = async (
    originName: string,
    destinationName: string,
    amount: number,
    operator: string,
    reason?: string
  ) => {
    try {
      await api("/transfers", {
        body: { originName, destinationName, amount, transferredBy: operator, reason },
      });
      await loadAll();
      showToast(
        "Transferência Efetuada",
        `Montante: ${amount.toLocaleString("pt-AO")} Kz\n[${originName}] ➔ [${destinationName}]`,
        "success"
      );
    } catch (e) {
      fail("Transferência não efetuada", e);
    }
  };

  // Ajustar Saldo de Ponto com Histórico
  const handleAdjustPointBalance = async (
    pointId: string,
    newBalance: number,
    reason: string,
    operator: string
  ) => {
    const pt = points.find((p) => p.id === pointId);
    try {
      await api(`/points/${pointId}/adjust-balance`, {
        body: { newBalance, reason, operatorName: operator },
      });
      await loadAll();
      showToast(
        "Saldo Retificado",
        `Ponto: "${pt?.name}"\nNovo Saldo: ${newBalance.toLocaleString("pt-AO")} Kz\nMotivo: ${reason}`,
        "success"
      );
    } catch (e) {
      fail("Não foi possível retificar o saldo", e);
    }
  };

  // Ajustar Saldo de Carteira com Histórico
  const handleAdjustWalletBalance = async (
    walletId: string,
    newBalance: number,
    reason: string,
    operator: string
  ) => {
    const wl = wallets.find((w) => w.id === walletId);
    try {
      await api(`/wallets/${walletId}/adjust-balance`, {
        body: { newBalance, reason, operatorName: operator },
      });
      await loadAll();
      showToast(
        "Carteira Retificada",
        `Conta: "${wl?.name}"\nNovo Saldo: ${newBalance.toLocaleString("pt-AO")} Kz\nMotivo: ${reason}`,
        "success"
      );
    } catch (e) {
      fail("Não foi possível retificar a carteira", e);
    }
  };

  // Reinicialização Geral de Dados
  // Só acontece a pedido explícito: confirmação "LIMPAR" (no ecrã) + chave de administrador
  // (definida no servidor em ADMIN_RESET_KEY). Sem a chave, o servidor recusa.
  const handleResetSystemData = async () => {
    const key = window.prompt(
      "REINICIAR TODOS OS DADOS\n\nIntroduza a chave de administrador (ADMIN_RESET_KEY) para confirmar.\nCancele para não apagar nada."
    );
    if (!key) {
      showToast("Reinicialização Cancelada", "Nada foi apagado.", "info");
      return;
    }
    try {
      await api("/admin/reset-data", {
        headers: { "x-admin-key": key },
        body: {
          confirm: "LIMPAR",
          operatorName: "Administrador",
          reason: "Reinicialização manual de saldos e histórico",
        },
      });
      setCart([]);
      await loadAll();
      showToast(
        "Sistema Reinicializado",
        "Saldos zerados (0 Kz), históricos limpos e numeração de faturas reiniciada.",
        "success"
      );
    } catch (e) {
      fail("Reinicialização recusada", e);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || saving) return;

    const missingRecipient = cart.find((it) => !it.recipient.trim());
    if (missingRecipient) {
      showToast(
        "Destinatário em Falta",
        `Por favor preencha o número do telemóvel ou cartão para "${missingRecipient.name}"!`,
        "error"
      );
      return;
    }

    const currentPoint = points.find((p) => p.id === activePointId) || points[0];
    if (!currentPoint) {
      showToast("Sem Ponto de Venda", "Não há ponto de venda carregado. Verifique a ligação ao servidor.", "error");
      return;
    }

    const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
    setSaving(true);
    try {
      // A fatura só existe depois de o servidor a gravar. O número vem da base de dados.
      const saved = await api<any>("/invoices", {
        body: {
          clientName: clientName.trim() || "Consumidor Final",
          clientNif: clientNif.trim() || undefined,
          clientPhone: clientPhone.trim() || undefined,
          paymentMethod,
          salePointId: currentPoint.id,
          operatorName: currentPoint.currentOperatorName || "Operador",
          items: cart.map((it) => ({
            operator: it.operator,
            name: it.name,
            recipient: it.recipient.trim(),
            quantity: it.quantity,
            price: it.price,
          })),
        },
      });

      const printData: InvoicePrintData = {
        invoiceNumber: saved.invoiceNumber,
        date: fmtDate(saved.createdAt),
        clientName: saved.clientName || "Consumidor Final",
        clientNif: clientNif.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        paymentMethod: PM_LABEL[paymentMethod] ?? paymentMethod,
        operatorName: saved.operatorName || "Operador",
        pointName: currentPoint.name,
        items: cart.map((it) => ({
          operator: it.operator,
          productName: it.name,
          recipient: it.recipient.trim(),
          quantity: it.quantity,
          unitPrice: it.price,
          totalPrice: it.price * it.quantity,
        })),
        subtotal,
        taxRate: 0,
        taxAmount: 0,
        total: Number(saved.total ?? subtotal),
      };

      setThermalData(printData);
      showToast("Venda Registada com Sucesso", `Fatura ${printData.invoiceNumber} emitida e guardada!`, "success");
      setCart([]);
      setClientName("");
      setClientNif("");
      setClientPhone("");
      await loadAll();
    } catch (e) {
      // Nada foi gravado: o carrinho fica como está para tentar de novo.
      fail("Fatura NÃO emitida", e);
    } finally {
      setSaving(false);
    }
  };

  const currentProducts = catalog.filter((p) => p.operator === activeOperator);

  return (
    <main className="min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-36 sm:w-48 flex items-center">
              <img
                src="/logo.png"
                alt="ADIJACINTO Logo"
                className="max-h-full object-contain"
              />
            </div>
            <div className="hidden md:block pl-3 border-l border-slate-200">
              <span className="text-[11px] text-slate-500">
                NIF: {COMPANY_INFO.nif} | {COMPANY_INFO.address}
              </span>
            </div>
          </div>

          {/* <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <Smartphone size={13} /> Mobile-First React
            </span>
          </div> */}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        {offline && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-3.5 text-xs space-y-2">
            <p className="font-bold">⚠️ Sem ligação à base de dados. Nada do que fizer agora será guardado.</p>
            <p className="text-rose-800">
              Servidor configurado: <span className="font-mono break-all">{API_BASE}</span>
            </p>
            <button
              onClick={loadAll}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
            >
              Tentar de novo
            </button>
          </div>
        )}

        {points.length > 0 ? (
          <PointShiftManager
            points={points}
            wallets={wallets}
            transfers={transfers}
            adjustments={adjustments}
            invoices={invoices}
            activePointId={activePointId}
            onSelectPoint={setActivePointId}
            onOpenShift={handleOpenShift}
            onCloseShift={handleCloseShift}
            onTransferBalance={handleTransferBalance}
            onCreatePoint={handleCreatePoint}
            onUpdatePoint={handleUpdatePoint}
            onAddExpense={handleAddExpense}
            onAdjustPointBalance={handleAdjustPointBalance}
            onAdjustWalletBalance={handleAdjustWalletBalance}
            onResetSystemData={handleResetSystemData}
            onNotify={showToast}
          />
        ) : (
          !offline && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-600">
              {loaded ? "Ainda não há pontos de venda na base de dados." : "A carregar dados da base de dados…"}
            </div>
          )
        )}

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Catálogo de Recargas & Planos
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Unitel • Africell • ZAP • DStv
            </span>
          </div>

          <OperatorTabs
            activeOperator={activeOperator}
            onChange={(op) => setActiveOperator(op)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8">
            <ProductCatalog
              products={currentProducts}
              onAddToCart={handleAddToCart}
            />
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <CartDrawer
              cart={cart}
              clientName={clientName}
              clientNif={clientNif}
              clientPhone={clientPhone}
              paymentMethod={paymentMethod}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateRecipient={handleUpdateRecipient}
              onRemoveItem={handleRemoveItem}
              onClientNameChange={setClientName}
              onClientNifChange={setClientNif}
              onClientPhoneChange={setClientPhone}
              onPaymentMethodChange={setPaymentMethod}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {thermalData && (
        <ThermalReceipt
          data={thermalData}
          onClose={() => setThermalData(null)}
          onUpdateDate={(newDate) => {
            setThermalData((prev) => (prev ? { ...prev, date: newDate } : null));
            setInvoices((prev) =>
              prev.map((inv) =>
                inv.invoiceNumber === thermalData.invoiceNumber
                  ? { ...inv, createdAt: newDate }
                  : inv
              )
            );
          }}
          onShowToast={showToast}
        />
      )}

      {shiftReport && (
        <ShiftReportModal
          report={shiftReport}
          onClose={() => setShiftReport(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}
