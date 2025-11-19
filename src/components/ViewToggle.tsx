import { motion } from "framer-motion";

interface ViewToggleProps {
  value: "kanban" | "table";
  onChange: (mode: "kanban" | "table") => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="relative w-[180px] h-10 bg-[#f5f5f5] rounded-full flex items-center px-1">
      {/* Pallina animata */}
      <motion.div
        className="absolute w-[84px] h-8 bg-white rounded-full shadow-sm"
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        animate={{
          x: value === "kanban" ? 0 : 88,
        }}
      />

      {/* Label Pipeline */}
      <button
        type="button"
        className={`relative z-10 flex-1 text-center text-sm font-medium transition-colors ${
          value === "kanban" ? "text-black" : "text-neutral-500"
        }`}
        onClick={() => onChange("kanban")}
      >
        Pipeline
      </button>

      {/* Label Tabella */}
      <button
        type="button"
        className={`relative z-10 flex-1 text-center text-sm font-medium transition-colors ${
          value === "table" ? "text-black" : "text-neutral-500"
        }`}
        onClick={() => onChange("table")}
      >
        Tabella
      </button>
    </div>
  );
}