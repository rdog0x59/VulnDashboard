import { ShieldAlert, Flame, TrendingUp, Bug } from 'lucide-react';
import type { Vulnerability } from '../types';
import { subWeeks } from 'date-fns';
import { isAfter } from 'date-fns';

interface Props {
  vulns: Vulnerability[];
  isLoading: boolean;
}

function Skeleton() {
  return <div className="h-8 w-16 bg-navy-700 rounded animate-pulse" />;
}

export function StatCards({ vulns, isLoading }: Props) {
  const now = new Date();
  const weekAgo = subWeeks(now, 1);

  const critical = vulns.filter((v) => v.severity === 'CRITICAL').length;
  const high = vulns.filter((v) => v.severity === 'HIGH').length;
  const exploited = vulns.filter((v) => v.isExploited).length;
  const newThisWeek = vulns.filter((v) => isAfter(v.publishedDate, weekAgo)).length;

  const cards = [
    {
      label: 'Total',
      value: vulns.length,
      icon: Bug,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Critical / High',
      value: `${critical} / ${high}`,
      icon: ShieldAlert,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    },
    {
      label: 'Actively Exploited',
      value: exploited,
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'New This Week',
      value: newThisWeek,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-xl border p-4 ${card.bg} flex items-start gap-3`}
          >
            <div className={`mt-0.5 ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">{card.label}</p>
              {isLoading ? (
                <Skeleton />
              ) : (
                <p className={`text-2xl font-semibold font-mono ${card.color}`}>
                  {card.value}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
