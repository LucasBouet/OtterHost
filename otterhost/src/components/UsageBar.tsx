type UsageBarProps = {
  title: string;
  subtitle?: string;
  used: number;
  total: number;
  unit?: string;
  color?: string;
};

function UsageBar({ title, subtitle, used, total, unit = "", color = "bg-purple-500" }: UsageBarProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const value = Math.min(100, Math.max(0, percentage));

  return (
    <div className="bg-[#0b1220] border border-slate-700/40 rounded-xl p-5 text-white w-full">
      {/* Header */}
      <div className="mb-4">
        <p className="font-semibold">{title}</p>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-700/40 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>

      {/* Values */}
      <div className="flex justify-between mt-4 text-sm text-slate-300">
        <span>
          <span className="text-slate-400">Usage </span>
          {used.toFixed(2)} {unit}
        </span>

        <span>
          <span className="text-slate-400">Capacity </span>
          {total.toFixed(2)} {unit}
        </span>
      </div>

      {/* Percentage */}
      <div className="text-right text-sm text-slate-400 mt-1">
        {value.toFixed(1)}%
      </div>
    </div>
  );
}

export default UsageBar;
