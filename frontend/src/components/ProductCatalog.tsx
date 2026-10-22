import React, { useState } from "react";
import { CatalogItem } from "../constants/catalog";
import { Plus, Edit2, Check } from "lucide-react";

interface ProductCatalogProps {
  products: CatalogItem[];
  onAddToCart: (product: CatalogItem, customPrice?: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("TODAS");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

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

  return (
    <div className="flex flex-col gap-3">
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
