import { useState } from 'react';
import type { AppData, KnockoutMatch } from '../types';
import { computeQualifiers, propagateKnockout, ROUND_LABELS } from '../knockout';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

const ROUND_ORDER: KnockoutMatch['round'][] = ['R32', 'R16', 'QF', 'SF', 'F3', 'F'];
const ROUND_ICONS: Record<KnockoutMatch['round'], string> = {
  R32: '🔷',
  R16: '🔶',
  QF: '🔥',
  SF: '⚡',
  F3: '🥉',
  F: '🏆',
};

function TeamSide({
  flag,
  name,
  source,
  align,
}: {
  flag: string;
  name: string;
  source?: string | null;
  align: 'right' | 'left';
}) {
  return (
    <div className={`flex-1 min-w-0 flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : 'text-left'}`}>
      <span className="text-2xl shrink-0">{flag || '🏳️'}</span>
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{name}</div>
        {source && <div className="text-[11px] text-slate-400 truncate">{source}</div>}
      </div>
    </div>
  );
}

export default function KnockoutTab({ data, setData }: Props) {
  const qualifiers = computeQualifiers(data);
  const [activeRound, setActiveRound] = useState<KnockoutMatch['round']>('R32');

  if (!qualifiers) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 shadow-sm">
        <div className="text-5xl mb-3">⏳</div>
        <p className="text-lg font-semibold mb-1 text-slate-700">שלב הנוקאאוט ייפתח לאחר שתמלא את כל תוצאות הבתים</p>
        <p className="text-sm">עברו ללשונית "בתים" והשלימו את כל 72 המשחקים בכל 12 הבתים.</p>
      </div>
    );
  }

  const teamName = (id: string | null) => {
    if (!id) return 'טרם נקבע';
    return data.teams.find((t) => t.id === id)?.name ?? id;
  };
  const teamFlag = (id: string | null) => (id ? data.teams.find((t) => t.id === id)?.flag ?? '' : '');
  const qualifierLabel = (id: string | null) =>
    id ? qualifiers.find((q) => q.teamId === id)?.label ?? '' : '';

  const matches = propagateKnockout(data.knockoutMatches);

  const updateMatch = (id: string, patch: Partial<KnockoutMatch>) => {
    setData((prev) => ({
      ...prev,
      knockoutMatches: propagateKnockout(
        prev.knockoutMatches.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      ),
    }));
  };

  const setR32Team = (matchId: string, side: 'home' | 'away', teamId: string) => {
    updateMatch(matchId, { [side === 'home' ? 'homeTeamId' : 'awayTeamId']: teamId || null });
  };

  const setScore = (matchId: string, field: keyof KnockoutMatch, value: string) => {
    const num = value === '' ? null : Math.max(0, Number(value));
    updateMatch(matchId, { [field]: num });
  };

  const usedR32TeamIds = new Set(
    matches.filter((m) => m.round === 'R32').flatMap((m) => [m.homeTeamId, m.awayTeamId]).filter(Boolean) as string[],
  );

  const availableFor = (currentId: string | null) =>
    qualifiers.filter((q) => q.teamId === currentId || !usedR32TeamIds.has(q.teamId));

  const roundMatches = matches.filter((m) => m.round === activeRound).sort((a, b) => a.slot - b.slot);

  return (
    <div className="space-y-5">
      <details className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden group">
        <summary className="px-5 py-4 font-bold cursor-pointer flex items-center justify-between text-slate-700 list-none">
          <span className="flex items-center gap-2">🌟 32 הנבחרות שעלו לשלב הנוקאאוט</span>
          <span className="text-slate-400 text-sm group-open:rotate-180 transition-transform">⌄</span>
        </summary>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm px-5 pb-5">
          {qualifiers.map((q) => (
            <div key={q.teamId} className="bg-slate-50 rounded-2xl px-3 py-2 flex items-center gap-2">
              <span className="text-xl">{teamFlag(q.teamId)}</span>
              <div className="min-w-0">
                <div className="font-semibold truncate">{teamName(q.teamId)}</div>
                <div className="text-[11px] text-slate-400 truncate">{q.label}</div>
              </div>
            </div>
          ))}
        </div>
      </details>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {ROUND_ORDER.map((round) => (
          <button
            key={round}
            onClick={() => setActiveRound(round)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeRound === round
                ? 'bg-gradient-to-l from-emerald-600 to-teal-500 text-white shadow-md scale-105'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            <span>{ROUND_ICONS[round]}</span>
            {ROUND_LABELS[round]}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {roundMatches.map((m) => {
          const needsPenalties = m.homeScore !== null && m.awayScore !== null && m.homeScore === m.awayScore;
          const penaltiesUndecided =
            needsPenalties &&
            (m.penaltyHomeScore === null ||
              m.penaltyAwayScore === null ||
              m.penaltyHomeScore === m.penaltyAwayScore);
          const matchReady = !!m.homeTeamId && !!m.awayTeamId;

          return (
            <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-3">
                {activeRound === 'R32' ? (
                  <select
                    value={m.homeTeamId ?? ''}
                    onChange={(e) => setR32Team(m.id, 'home', e.target.value)}
                    className="flex-1 min-w-0 border border-slate-200 rounded-xl px-2 py-1.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="">בחירת נבחרת...</option>
                    {availableFor(m.homeTeamId).map((q) => (
                      <option key={q.teamId} value={q.teamId}>
                        {teamFlag(q.teamId)} {teamName(q.teamId)} — {q.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TeamSide flag={teamFlag(m.homeTeamId)} name={teamName(m.homeTeamId)} source={!m.homeTeamId ? m.homeSource : null} align="right" />
                )}

                <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 rounded-full px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    value={m.homeScore ?? ''}
                    onChange={(e) => setScore(m.id, 'homeScore', e.target.value)}
                    disabled={!matchReady}
                    className="w-9 text-center bg-white border border-slate-200 rounded-full py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-40"
                  />
                  <span className="text-slate-300 font-bold text-xs">:</span>
                  <input
                    type="number"
                    min={0}
                    value={m.awayScore ?? ''}
                    onChange={(e) => setScore(m.id, 'awayScore', e.target.value)}
                    disabled={!matchReady}
                    className="w-9 text-center bg-white border border-slate-200 rounded-full py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-40"
                  />
                </div>

                {activeRound === 'R32' ? (
                  <select
                    value={m.awayTeamId ?? ''}
                    onChange={(e) => setR32Team(m.id, 'away', e.target.value)}
                    className="flex-1 min-w-0 border border-slate-200 rounded-xl px-2 py-1.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-left"
                  >
                    <option value="">בחירת נבחרת...</option>
                    {availableFor(m.awayTeamId).map((q) => (
                      <option key={q.teamId} value={q.teamId}>
                        {teamFlag(q.teamId)} {teamName(q.teamId)} — {q.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TeamSide flag={teamFlag(m.awayTeamId)} name={teamName(m.awayTeamId)} source={!m.awayTeamId ? m.awaySource : null} align="left" />
                )}
              </div>

              {needsPenalties && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs bg-amber-50 text-amber-700 rounded-full py-1.5 px-3">
                  <span>🥅 שוויון — תוצאת פנדלים:</span>
                  <input
                    type="number"
                    min={0}
                    value={m.penaltyHomeScore ?? ''}
                    onChange={(e) => setScore(m.id, 'penaltyHomeScore', e.target.value)}
                    className="w-9 text-center border border-amber-200 rounded-full py-0.5 bg-white"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min={0}
                    value={m.penaltyAwayScore ?? ''}
                    onChange={(e) => setScore(m.id, 'penaltyAwayScore', e.target.value)}
                    className="w-9 text-center border border-amber-200 rounded-full py-0.5 bg-white"
                  />
                </div>
              )}
              {activeRound === 'R32' && m.homeTeamId && m.awayTeamId && (
                <div className="text-[11px] text-slate-400 text-center mt-2">
                  {qualifierLabel(m.homeTeamId)} מול {qualifierLabel(m.awayTeamId)}
                </div>
              )}
              {penaltiesUndecided && (
                <div className="text-[11px] text-amber-600 text-center mt-1">יש להזין תוצאת פנדלים שונה כדי לקבוע מנצח/ת</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
