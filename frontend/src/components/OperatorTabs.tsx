import React from "react";
import { Operator } from "../constants/catalog";
import { Phone, Tv, Wifi } from "lucide-react";

interface OperatorTabsProps {
  activeOperator: Operator;
  onChange: (op: Operator) => void;
}

export const OperatorTabs: React.FC<OperatorTabsProps> = ({ activeOperator, onChange }) => {
  const tabs = [
    {
      id: "UNITEL" as Operator,
      label: "Unitel (mSeller)",
      icon: Phone,
      color: "bg-unitel text-white hover:bg-unitel-hover",
      inactiveColor: "bg-orange-50 text-unitel border-orange-200 hover:bg-orange-100",
      activeBorder: "ring-2 ring-unitel ring-offset-2",
    },
    {
      id: "AFRICELL" as Operator,
      label: "Africell (Afrimoney)",
      icon: Wifi,
      color: "bg-africell text-white hover:bg-africell-hover",
      inactiveColor: "bg-purple-50 text-africell border-purple-200 hover:bg-purple-100",
      activeBorder: "ring-2 ring-africell ring-offset-2",
    },
    {
      id: "ZAP" as Operator,
      label: "ZAP Satélite",
      icon: Tv,
      color: "bg-zap text-white hover:bg-zap-hover",
      inactiveColor: "bg-red-50 text-zap border-red-200 hover:bg-red-100",
      activeBorder: "ring-2 ring-zap ring-offset-2",
    },
    {
      id: "DSTV" as Operator,
      label: "DStv",
      icon: Tv,
      color: "bg-dstv text-white hover:bg-dstv-hover",
      inactiveColor: "bg-blue-50 text-dstv border-blue-200 hover:bg-blue-100",
      activeBorder: "ring-2 ring-dstv ring-offset-2",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeOperator === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all duration-200 active:scale-95 shadow-sm ${
              isActive
                ? `${tab.color} ${tab.activeBorder} shadow-md`
                : tab.inactiveColor
            }`}
          >
            <Icon size={16} />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
