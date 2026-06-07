import type { AppData, KnockoutMatch } from '../types';
import { computeQualifiers, propagateKnockout, ROUND_LABELS } from '../knockout';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

const ROUND_ORDER: KnockoutMatch['round'][] = ['R32', 'R16', 'QF', 'SF', 'F3', 'F'];

export default function KnockoutTab({ data, setData }: Props) {
  const qualifiers = computeQualifiers(data);

  if (!qualifiers) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
        <p className="text-lg mb-2">⏳ שלב הנוקאאוט ייפתח לאחר שתמלא את כל תוצאות משחקי הבתים</p>
        <p className="text-sm">עברו ללשונית "בתים" והשלימו את כל 72 המשחקים בכל 12 הבתים.</p>
      </div>
    );
  }

  const teamName = (id: string | null) => {
    if (!id) return '—';
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

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold mb-3">32 הנבחרות שעלו לשלב הנוקאאוט</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          {qualifiers.map((q) => (
            <div key={q.teamId} className="border border-slate-200 rounded px-2 py-1.5 flex items-center gap-2">
              <span>{teamFlag(q.teamId)}</span>
              <div>
                <div className="font-medium">{teamName(q.teamId)}</div>
                <div className="text-[11px] text-slate-400">{q.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {ROUND_ORDER.map((round) => {
        const roundMatches = matches.filter((m) => m.round === round).sort((a, b) => a.slot - b.slot);
        return (
          <div key={round} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 font-semibold text-sm border-b border-slate-200">
              {ROUND_LABELS[round]}
            </div>
            <div className="divide-y divide-slate-100">
              {roundMatches.map((m) => {
                const needsPenalties = m.homeScore !== null && m.awayScore !== null && m.homeScore === m.awayScore;
                const penaltiesUndecided =
                  needsPenalties &&
                  (m.penaltyHomeScore === null ||
                    m.penaltyAwayScore === null ||
                    m.penaltyHomeScore === m.penaltyAwayScore);

                return (
                  <div key={m.id} className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        {round === 'R32' ? (
                          <div className="flex items-center gap-2">
                            <span>{teamFlag(m.homeTeamId)}</span>
                            <select
                              value={m.homeTeamId ?? ''}
                              onChange={(e) => setR32Team(m.id, 'home', e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-sm flex-1"
                            >
                              <option value="">בחירת נבחרת...</option>
                              {availableFor(m.homeTeamId).map((q) => (
                                <option key={q.teamId} value={q.teamId}>
                                  {teamName(q.teamId)} ({q.label})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="text-sm font-medium truncate">
                            {teamFlag(m.homeTeamId)} {teamName(m.homeTeamId)}
                            {!m.homeTeamId && (
                              <span className="text-xs text-slate-400 block">{m.homeSource}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min={0}
                          value={m.homeScore ?? ''}
                          onChange={(e) => setScore(m.id, 'homeScore', e.target.value)}
                          disabled={!m.homeTeamId || !m.awayTeamId}
                          className="w-12 text-center border border-slate-300 rounded px-1 py-1 disabled:bg-slate-50"
                        />
                        <span className="text-slate-400">:</span>
                        <input
                          type="number"
                          min={0}
                          value={m.awayScore ?? ''}
                          onChange={(e) => setScore(m.id, 'awayScore', e.target.value)}
                          disabled={!m.homeTeamId || !m.awayTeamId}
                          className="w-12 text-center border border-slate-300 rounded px-1 py-1 disabled:bg-slate-50"
                        />
                      </div>

                      <div className="flex-1 text-left">
                        {round === 'R32' ? (
                          <div className="flex items-center gap-2 justify-end">
                            <select
                              value={m.awayTeamId ?? ''}
                              onChange={(e) => setR32Team(m.id, 'away', e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-sm flex-1"
                            >
                              <option value="">בחירת נבחרת...</option>
                              {availableFor(m.awayTeamId).map((q) => (
                                <option key={q.teamId} value={q.teamId}>
                                  {teamName(q.teamId)} ({q.label})
                                </option>
                              ))}
                            </select>
                            <span>{teamFlag(m.awayTeamId)}</span>
                          </div>
                        ) : (
                          <div className="text-sm font-medium truncate text-left">
                            {!m.awayTeamId && (
                              <span className="text-xs text-slate-400 block">{m.awaySource}</span>
                            )}
                            {teamName(m.awayTeamId)} {teamFlag(m.awayTeamId)}
                          </div>
                        )}
                      </div>
                    </div>

                    {needsPenalties && (
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <span>תוצאה זהה — תוצאת פנדלים:</span>
                        <input
                          type="number"
                          min={0}
                          value={m.penaltyHomeScore ?? ''}
                          onChange={(e) => setScore(m.id, 'penaltyHomeScore', e.target.value)}
                          className="w-10 text-center border border-slate-300 rounded px-1 py-0.5"
                        />
                        <span>:</span>
                        <input
                          type="number"
                          min={0}
                          value={m.penaltyAwayScore ?? ''}
                          onChange={(e) => setScore(m.id, 'penaltyAwayScore', e.target.value)}
                          className="w-10 text-center border border-slate-300 rounded px-1 py-0.5"
                        />
                      </div>
                    )}
                    {round === 'R32' && m.homeTeamId && m.awayTeamId && (
                      <div className="text-[11px] text-slate-400 text-center">
                        {qualifierLabel(m.homeTeamId)} מול {qualifierLabel(m.awayTeamId)}
                      </div>
                    )}
                    {penaltiesUndecided && (
                      <div className="text-[11px] text-amber-600 text-center">תיקו — נדרשת תוצאת פנדלים כדי לקבוע מנצח</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
