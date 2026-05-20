import { FiMinus, FiPlus } from "react-icons/fi";

const QuantitySelector = ({ value, onChange, max = 999, min = 1 }) => {
  const dec = () => { if (value > min) onChange(value - 1); };
  const inc = () => { if (value < max) onChange(value + 1); };

  return (
    <div className="flex items-center gap-0 border border-slate-200 rounded-xl overflow-hidden w-fit">
      <button
        onClick={dec}
        disabled={value <= min}
        className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiMinus size={16} />
      </button>
      <span className="w-14 h-11 flex items-center justify-center font-bold text-slate-800 border-x border-slate-200 text-base select-none">
        {value}
      </span>
      <button
        onClick={inc}
        disabled={value >= max}
        className="w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiPlus size={16} />
      </button>
    </div>
  );
};

export default QuantitySelector;
