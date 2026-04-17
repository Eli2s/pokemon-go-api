interface Props {
  label: string
  value: number
  max: number
}

export default function StatBar({ label, value, max }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 shrink-0 text-slate-400">{label}</span>
      <span className="w-12 shrink-0 font-semibold text-white">{value}</span>
      <div className="h-2.5 flex-1 rounded-full bg-white/10">
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          style={{ width: `${pct}%` }}
          className="h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400"
        />
      </div>
    </div>
  )
}
