import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { Loader2, BarChart2 } from 'lucide-react';
import type { Vulnerability } from '../types';

interface VendorRow {
  vendor: string;
  kev: number;
  nvd: number;
  osv: number;
  total: number;
}

interface Props {
  vulns: Vulnerability[];
  isLoading: boolean;
  selectedVendor: string;
  onVendorSelect: (vendor: string) => void;
}

const LIMIT_OPTIONS = [15, 25, 40];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d: VendorRow = payload[0]?.payload;
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-lg p-3 shadow-xl text-xs min-w-[160px]">
      <p className="text-slate-200 font-medium mb-2 truncate max-w-[200px]">{label}</p>
      {d.kev > 0 && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-amber-400">KEV</span>
          <span className="text-white font-mono">{d.kev}</span>
        </div>
      )}
      {d.nvd > 0 && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-blue-400">NVD</span>
          <span className="text-white font-mono">{d.nvd}</span>
        </div>
      )}
      {d.osv > 0 && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-emerald-400">OSV</span>
          <span className="text-white font-mono">{d.osv}</span>
        </div>
      )}
      <div className="flex justify-between gap-4 mt-2 pt-2 border-t border-navy-600">
        <span className="text-slate-400">Total</span>
        <span className="text-white font-mono font-semibold">{d.total}</span>
      </div>
    </div>
  );
}

export function VendorChart({ vulns, isLoading, selectedVendor, onVendorSelect }: Props) {
  const [limit, setLimit] = useState(15);

  const rows = useMemo((): VendorRow[] => {
    const map = new Map<string, VendorRow>();
    for (const v of vulns) {
      if (!v.vendor) continue;
      const key = v.vendor;
      const row = map.get(key) ?? { vendor: key, kev: 0, nvd: 0, osv: 0, total: 0 };
      if (v.source === 'KEV') row.kev++;
      else if (v.source === 'NVD') row.nvd++;
      else row.osv++;
      row.total++;
      map.set(key, row);
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }, [vulns, limit]);

  const withVendorCount = useMemo(
    () => vulns.filter(v => v.vendor).length,
    [vulns]
  );

  // recharts vertical layout renders data[0] at the top, so highest-count first = largest at top
  const chartData = rows;

  const barHeight = 28;
  const chartHeight = Math.max(180, chartData.length * barHeight + 40);

  return (
    <div className="rounded-xl border border-navy-600 bg-navy-900 p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-white font-semibold">Vulnerabilities by Vendor</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {withVendorCount.toLocaleString()} of {vulns.length.toLocaleString()} entries have vendor data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedVendor !== 'ALL' && (
            <button
              onClick={() => onVendorSelect('ALL')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              ✕ Clear filter
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Top</span>
            <div className="flex rounded-lg overflow-hidden border border-navy-600">
              {LIMIT_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setLimit(n)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    limit === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-navy-800 text-slate-400 hover:text-white hover:bg-navy-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Source legend */}
      <div className="flex items-center gap-4 mb-4">
        {[
          { label: 'KEV', color: '#f59e0b' },
          { label: 'NVD', color: '#3b82f6' },
          { label: 'OSV', color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
        <span className="text-xs text-slate-600 ml-2">Click a bar to filter the catalog</span>
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          <span className="ml-2 text-slate-500 text-sm">Loading vendor data…</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-slate-500 text-sm">No vendor data available for this window.</p>
        </div>
      ) : (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 60, bottom: 0, left: 0 }}
              barSize={16}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#1e3a5f' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="vendor"
                width={130}
                tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
                  const vendor = payload.value;
                  const isSelected = selectedVendor === vendor;
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      textAnchor="end"
                      fill={isSelected ? '#60a5fa' : '#94a3b8'}
                      fontSize={11}
                      fontWeight={isSelected ? 600 : 400}
                      style={{ cursor: 'pointer' }}
                    >
                      {vendor.length > 16 ? vendor.slice(0, 15) + '…' : vendor}
                    </text>
                  );
                }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e3a5f55' }} />
              <Bar dataKey="kev" stackId="a" fill="#f59e0b" isAnimationActive={false}
                onClick={(d: VendorRow) => onVendorSelect(selectedVendor === d.vendor ? 'ALL' : d.vendor)}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.vendor}
                    fill="#f59e0b"
                    opacity={selectedVendor === 'ALL' || selectedVendor === entry.vendor ? 1 : 0.3}
                  />
                ))}
              </Bar>
              <Bar dataKey="nvd" stackId="a" fill="#3b82f6" isAnimationActive={false}
                onClick={(d: VendorRow) => onVendorSelect(selectedVendor === d.vendor ? 'ALL' : d.vendor)}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.vendor}
                    fill="#3b82f6"
                    opacity={selectedVendor === 'ALL' || selectedVendor === entry.vendor ? 1 : 0.3}
                  />
                ))}
              </Bar>
              <Bar dataKey="osv" stackId="a" fill="#10b981" radius={[0, 3, 3, 0]} isAnimationActive={false}
                onClick={(d: VendorRow) => onVendorSelect(selectedVendor === d.vendor ? 'ALL' : d.vendor)}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.vendor}
                    fill="#10b981"
                    opacity={selectedVendor === 'ALL' || selectedVendor === entry.vendor ? 1 : 0.3}
                  />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  style={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  formatter={(v: number, entry: VendorRow) =>
                    entry?.osv > 0 ? v : ''
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
