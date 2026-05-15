import type { TimeWindow } from '../types';

const OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '12M', label: '12 Months' },
];

interface Props {
  value: TimeWindow;
  onChange: (w: TimeWindow) => void;
}

export function TimeWindowSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-navy-800 border border-navy-600 rounded-lg p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-navy-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
