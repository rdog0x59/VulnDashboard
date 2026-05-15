import { useState } from 'react';
import { Search, Loader2, PackageSearch } from 'lucide-react';
import { useOSVSearch } from '../hooks/useOSV';
import { OSV_ECOSYSTEMS } from '../lib/osv';
import { VulnTable } from './VulnTable';

export function OsvSearch() {
  const [packageName, setPackageName] = useState('');
  const [ecosystem, setEcosystem] = useState('npm');
  const [submitted, setSubmitted] = useState<{ name: string; eco: string } | null>(null);

  const { data, isLoading, isError, error } = useOSVSearch(
    submitted?.name ?? '',
    submitted?.eco ?? 'npm',
    !!submitted
  );

  function handleSearch() {
    if (!packageName.trim()) return;
    setSubmitted({ name: packageName.trim(), eco: ecosystem });
  }

  return (
    <div className="rounded-xl border border-navy-600 bg-navy-900 p-5">
      <div className="flex items-center gap-3 mb-4">
        <PackageSearch className="w-5 h-5 text-emerald-400" />
        <div>
          <h2 className="text-white font-semibold">OSV Package Search</h2>
          <p className="text-slate-500 text-xs mt-0.5">Search open-source vulnerabilities by package</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={ecosystem}
          onChange={(e) => setEcosystem(e.target.value)}
          className="px-3 py-2 bg-navy-800 border border-navy-600 rounded-lg text-sm text-slate-300
            focus:outline-none focus:border-emerald-500 transition"
        >
          {OSV_ECOSYSTEMS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <input
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Package name (e.g. lodash)"
          className="flex-1 min-w-0 px-4 py-2 bg-navy-800 border border-navy-600 rounded-lg
            text-sm text-slate-200 placeholder-slate-600 focus:outline-none
            focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm
            font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {isError && (
        <p className="mt-3 text-red-400 text-sm">
          Failed to search OSV: {(error as Error)?.message}
        </p>
      )}

      {data && submitted && (
        <div className="mt-4">
          {data.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">
              No vulnerabilities found for <span className="text-slate-300 font-mono">{submitted.name}</span> in {submitted.eco}.
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-3">
                Found <span className="text-emerald-400 font-mono">{data.length}</span> vulnerabilities for{' '}
                <span className="text-slate-300 font-mono">{submitted.name}</span> ({submitted.eco})
              </p>
              <VulnTable vulns={data} isLoading={false} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
