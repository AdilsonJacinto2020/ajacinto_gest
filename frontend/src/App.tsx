import { useState, useEffect } from "react";
import { Operator, INITIAL_PRODUCTS, CatalogItem, COMPANY_INFO } from "./constants/catalog";
import { CartItem, SalePointState, WalletState, TransferRecord } from "./types";
import { OperatorTabs } from "./components/OperatorTabs";
import { ProductCatalog } from "./components/ProductCatalog";
import { CartDrawer } from "./components/CartDrawer";
import { PointShiftManager } from "./components/PointShiftManager";
import { ThermalReceipt } from "./components/ThermalReceipt";
import { generateInvoicePDF, InvoicePrintData } from "./utils/pdfGenerator";
import { Smartphone } from "lucide-react";

const API_BASE = "http://localhost:4000";

export default function App() {
  const [activeOperator, setActiveOperator] = useState<Operator>("UNITEL");
  const [catalog] = useState<CatalogItem[]>(INITIAL_PRODUCTS);

  const [points, setPoints] = useState<SalePointState[]>([
    {
      id: "pt-1",
      name: "Ponto Morro Bento (Sede)",
      location: "Bairro Morro Bento, junto ao Imetro",
      currentCashBalance: 125000,
      isOpen: true,
      currentOperatorName: "Adilson Jacinto",
    },
    {
      id: "pt-2",
      name: "Ponto Balcão Imetro",
      location: "Rua do Imetro, Samba",
      currentCashBalance: 45000,
      isOpen: false,
      currentOperatorName: null,
    },
  ]);
  const [activePointId, setActivePointId] = useState<string>("pt-1");

  const [wallets, setWallets] = useState<WalletState[]>([
    { id: "w-1", type: "CAIXA_GERAL", name: "Caixa Geral (Empresa)", balance: 2500000 },
    { id: "w-2", type: "MSELLER", name: "mSeller (Unitel)", balance: 480000 },
    { id: "w-3", type: "AFRIMONEY", name: "Afrimoney (Africell)", balance: 320000 },
    { id: "w-4", type: "TELPLAY_ZAP", name: "Telplay / ZAP / DStv", balance: 650000 },
  ]);

  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  // Criar novo Ponto de Venda
  const handleCreatePoint = async (
    name: string,
    location: string,
    assignedOperator: string,
    initialCash: number
  ) => {
    try {
      const res = await fetch(`${API_BASE}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          assignedOperatorName: assignedOperator,
          initialCash,
        }),
      });
      const newPt = await res.json();
      if (newPt?.id) {
        setPoints((prev) => [...prev, newPt]);
        setActivePointId(newPt.id);
        alert(`Ponto "${name}" criado com sucesso!`);
        return;
      }
    } catch (e) {
      console.log("Modo local");
    }

    // Fallback local
    const newPt: SalePointState = {
      id: `pt-${Date.now()}`,
      name,
      location: location || "Luanda",
      assignedOperatorName: assignedOperator || null,
      currentCashBalance: initialCash || 0,
      isOpen: false,
      currentOperatorName: null,
    };
    setPoints((prev) => [...prev, newPt]);
    setActivePointId(newPt.id);
    alert(`Ponto "${name}" criado com sucesso!`);
  };

  // Atualizar / Renomear Ponto e alocar operador
  const handleUpdatePoint = async (
    pointId: string,
    name: string,
    location: string,
    assignedOperator: string
  ) => {
    try {
      await fetch(`${API_BASE}/points/${pointId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          assignedOperatorName: assignedOperator,
        }),
      });
    } catch (e) {
      console.log("Modo local");
    }

    setPoints((prev) =>
      prev.map((p) =>
        p.id === pointId
          ? {
              ...p,
              name,
              location,
              assignedOperatorName: assignedOperator,
            }
          : p
      )
    );
    alert("Dados do ponto atualizados com sucesso!");
  };

  // Registar Saída / Despesa de Caixa no Ponto
  const handleAddExpense = async (
    pointId: string,
    amount: number,
    reason: string,
    operator: string
  ) => {
    try {
      await fetch(`${API_BASE}/points/${pointId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          reason,
          operatorName: operator,
        }),
      });
    } catch (e) {
      console.log("Modo local");
    }

    setPoints((prev) =>
      prev.map((p) =>
        p.id === pointId
          ? {
              ...p,
              currentCashBalance: Math.max(0, Number(p.currentCashBalance) - amount),
            }
          : p
      )
    );
    alert(`Saída de ${amount.toLocaleString("pt-AO")} Kz registada com sucesso!\nMotivo: ${reason}`);
  };

  // Carrinho e Fatura
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState<string>("");
  const [clientNif, setClientNif] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TPA" | "TRANSFER">("CASH");

  const [thermalData, setThermalData] = useState<InvoicePrintData | null>(null);
  const [invoiceSeq, setInvoiceSeq] = useState<number>(1);

  // Carrega pontos e carteiras do NestJS se a API estiver disponível
  useEffect(() => {
    fetch(`${API_BASE}/points`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPoints(data);
          setActivePointId(data[0].id);
        }
      })
      .catch(() => console.log("Usando dados locais de pontos (API offline)"));

    fetch(`${API_BASE}/wallets`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWallets(data);
        }
      })
      .catch(() => console.log("Usando dados locais de carteiras"));
  }, []);

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
      await fetch(`${API_BASE}/points/${pointId}/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorName, openingCash }),
      });
    } catch (e) {
      console.log("Modo offline");
    }

    setPoints((prev) =>
      prev.map((p) => {
        if (p.id === pointId) {
          return {
            ...p,
            isOpen: true,
            currentOperatorName: operatorName,
            currentCashBalance: openingCash,
          };
        }
        return p;
      })
    );
  };

  const handleCloseShift = async (pointId: string, declaredCash: number) => {
    const point = points.find((p) => p.id === pointId);
    try {
      await fetch(`${API_BASE}/points/${pointId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declaredCash }),
      });
    } catch (e) {
      console.log("Modo offline");
    }

    alert(
      `Turno de ${point?.currentOperatorName} no ${point?.name} encerrado com sucesso!\nValor em Caixa Declarado: ${declaredCash.toLocaleString(
        "pt-AO"
      )} Kz`
    );

    setPoints((prev) =>
      prev.map((p) => {
        if (p.id === pointId) {
          return {
            ...p,
            isOpen: false,
            currentOperatorName: null,
          };
        }
        return p;
      })
    );
  };

  const handleTransferBalance = async (
    originName: string,
    destinationName: string,
    amount: number,
    operator: string
  ) => {
    try {
      await fetch(`${API_BASE}/transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originName,
          destinationName,
          amount,
          transferredBy: operator,
        }),
      });
    } catch (e) {
      console.log("Transferência offline");
    }

    setTransfers((prev) => [
      {
        id: `tr-${Date.now()}`,
        originName,
        destinationName,
        amount,
        createdAt: new Date().toLocaleString("pt-AO"),
        transferredBy: operator,
      },
      ...prev,
    ]);

    setWallets((prev) =>
      prev.map((w) => {
        if (originName.includes(w.name) || w.name.includes(originName)) {
          return { ...w, balance: Math.max(0, w.balance - amount) };
        }
        if (destinationName.includes(w.name) || w.name.includes(destinationName)) {
          return { ...w, balance: w.balance + amount };
        }
        return w;
      })
    );

    alert(`Transferência de ${amount.toLocaleString("pt-AO")} Kz realizada de [${originName}] para [${destinationName}]!`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const missingRecipient = cart.find((it) => !it.recipient.trim());
    if (missingRecipient) {
      alert(`Por favor preencha o número do telemóvel ou cartão para "${missingRecipient.name}"!`);
      return;
    }

    const currentPoint = points.find((p) => p.id === activePointId) || points[0];
    const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const invoiceNumber = `FR 2026/${String(invoiceSeq).padStart(4, "0")}`;

    const printData: InvoicePrintData = {
      invoiceNumber,
      date: new Date().toLocaleString("pt-AO"),
      clientName: clientName.trim() || "Consumidor Final",
      clientNif: clientNif.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      paymentMethod:
        paymentMethod === "CASH" ? "Dinheiro" : paymentMethod === "TPA" ? "Multicaixa" : "Transferência Express",
      operatorName: currentPoint.currentOperatorName || "Operador",
      pointName: currentPoint.name,
      items: cart.map((it) => ({
        operator: it.operator,
        productName: it.name,
        recipient: it.recipient,
        quantity: it.quantity,
        unitPrice: it.price,
        totalPrice: it.price * it.quantity,
      })),
      subtotal,
      taxRate: 0,
      taxAmount: 0,
      total: subtotal,
    };

    try {
      await fetch(`${API_BASE}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: printData.clientName,
          clientNif: printData.clientNif,
          clientPhone: printData.clientPhone,
          paymentMethod,
          salePointId: currentPoint.id,
          operatorName: printData.operatorName,
          items: cart,
        }),
      });
    } catch (e) {
      console.log("Venda em modo local");
    }

    generateInvoicePDF(printData);
    setThermalData(printData);

    // Abate nas carteiras
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      setWallets((prev) =>
        prev.map((w) => {
          if (item.operator === "UNITEL" && w.type === "MSELLER") {
            return { ...w, balance: Math.max(0, w.balance - itemTotal) };
          }
          if (item.operator === "AFRICELL" && w.type === "AFRIMONEY") {
            return { ...w, balance: Math.max(0, w.balance - itemTotal) };
          }
          if ((item.operator === "ZAP" || item.operator === "DSTV") && w.type === "TELPLAY_ZAP") {
            return { ...w, balance: Math.max(0, w.balance - itemTotal) };
          }
          return w;
        })
      );
    });

    if (paymentMethod === "CASH") {
      setPoints((prev) =>
        prev.map((p) =>
          p.id === currentPoint.id
            ? { ...p, currentCashBalance: Number(p.currentCashBalance) + subtotal }
            : p
        )
      );
    }

    setInvoiceSeq((prev) => prev + 1);
    setCart([]);
    setClientName("");
    setClientNif("");
    setClientPhone("");
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
              <span className="text-xs font-semibold text-slate-800 block">
                {COMPANY_INFO.name}
              </span>
              <span className="text-[11px] text-slate-500">
                NIF: {COMPANY_INFO.nif} | {COMPANY_INFO.address}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <Smartphone size={13} /> Mobile-First React
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        <PointShiftManager
          points={points}
          wallets={wallets}
          transfers={transfers}
          activePointId={activePointId}
          onSelectPoint={setActivePointId}
          onOpenShift={handleOpenShift}
          onCloseShift={handleCloseShift}
          onTransferBalance={handleTransferBalance}
          onCreatePoint={handleCreatePoint}
          onUpdatePoint={handleUpdatePoint}
          onAddExpense={handleAddExpense}
        />

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
        />
      )}
    </main>
  );
}
