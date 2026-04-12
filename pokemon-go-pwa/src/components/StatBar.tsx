interface Props {
  label: string
  value: number
  max: number
}

export default function StatBar({ label, value, max }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 shrink-0 text-right text-gray-500 dark:text-gray-400">{label}</span>
      <span className="w-10 shrink-0 font-semibold">{value}</span>
      <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          style={{ width: `${pct}%` }}
          className="h-2 rounded-full bg-red-500"
        />
      </div>
    </div>
  )
}
