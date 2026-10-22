import React, { useEffect, useState } from "react";
import { CatalogItem, Operator } from "../constants/catalog";
import { Plus, Edit2, Check, Sparkles } from "lucide-react";

const OPERATORS: { value: Operator; label: string }[] = [
  { value: "UNITEL", label: "Unitel" },
  { value: "AFRICELL", label: "Africell" },
  { value: "ZAP", label: "ZAP" },
  { value: "DSTV", label: "DStv" },
];

interface ProductCatalogProps {
  products: CatalogItem[];
  onAddToCart: (product: CatalogItem, customPrice?: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("TODAS");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Coringa: item livre (operadora + descrição + valor) para o que não está no catálogo
  const [coringaOpen, setCoringaOpen] = useState(false);
  const [coringaOp, setCoringaOp] = useState<Operator>(products[0]?.operator ?? "UNITEL");
  const [coringaDesc, setCoringaDesc] = useState("");
  const [coringaPrice, setCoringaPrice] = useState("");
  const [coringaOk, setCoringaOk] = useState(false);

  // Ao mudar de separador (Unitel/Africell/...), o Coringa sugere essa operadora
  const tabOperator = products[0]?.operator;
  useEffect(() => {
    if (tabOperator) setCoringaOp(tabOperator);
  }, [tabOperator]);

  const categories = ["TODAS", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "TODAS" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.price.toString().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleStartEdit = (product: CatalogItem) => {
    setEditingPriceId(product.id);
    setTempPrice(product.price);
  };

  const handleSaveAndAdd = (product: CatalogItem) => {
    onAddToCart(product, tempPrice);
    setEditingPriceId(null);
  };

  const handleAddCoringa = (e: React.FormEvent) => {
    e.preventDefault();
    const name = coringaDesc.trim();
    const price = Math.round(Number(coringaPrice.replace(",", ".")) * 100) / 100;
    if (!name || !Number.isFinite(price) || price <= 0) return;

    onAddToCart({
      id: `coringa-${Date.now()}`,
      operator: coringaOp,
      category: "Coringa",
      name,
      price,
      recipientType: coringaOp === "ZAP" || coringaOp === "DSTV" ? "CARTAO" : "TELEFONE",
    });

    setCoringaDesc("");
    setCoringaPrice("");
    setCoringaOk(true);
    window.setTimeout(() => setCoringaOk(false), 2500);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl">
        <button
          type="button"
          onClick={() => setCoringaOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Sparkles size={15} /> Coringa
            <span className="text-[11px] font-medium text-slate-500">item livre: escolha a operadora, descreva e dê o valor</span>
          </span>
          <span className="text-xs font-semibold text-slate-500">{coringaOpen ? "Fechar" : "Abrir"}</span>
        </button>

        {coringaOpen && (
          <form onSubmit={handleAddCoringa} className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-12 gap-2">
            <select
              value={coringaOp}
              onChange={(e) => setCoringaOp(e.target.value as Operator)}
              className="sm:col-span-3 border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white"
            >
              {OPERATORS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              required
              value={coringaDesc}
              onChange={(e) => setCoringaDesc(e.target.value)}
              placeholder="Descrição (ex.: Pacote especial 3GB)"
              className="sm:col-span-5 border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
            />
            <input
              required
              type="number"
              min="1"
              step="0.01"
              inputMode="decimal"
              value={coringaPrice}
              onChange={(e) => setCoringaPrice(e.target.value)}
              placeholder="Valor (Kz)"
              className="sm:col-span-2 border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="sm:col-span-2 bg-slate-900 hover:bg-brand-600 text-white text-sm font-bold rounded-xl px-3 py-2.5 active:scale-95 transition-all"
            >
              Adicionar
            </button>
            {coringaOk && (
              <p className="sm:col-span-12 text-xs font-semibold text-emerald-600">✓ Adicionado ao carrinho</p>
            )}
          </form>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Buscar plano, pacote ou valor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
        {filteredProducts.map((product) => {
          const isEditing = editingPriceId === product.id;

          return (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-150 group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {product.category}
                </span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-2 mb-2">
                  {product.name}
                </h4>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(Number(e.target.value))}
                      className="w-full text-xs p-1 border border-brand-500 rounded font-bold"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveAndAdd(product)}
                      className="p-1 bg-brand-600 text-white rounded hover:bg-brand-700"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Preço</span>
                      <span className="font-bold text-sm text-slate-900">
                        {product.price.toLocaleString("pt-AO")} Kz
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(product)}
                        title="Editar preço deste item"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => onAddToCart(product)}
                        className="p-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-all active:scale-90"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
