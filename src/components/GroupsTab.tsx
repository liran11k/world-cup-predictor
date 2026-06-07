import { useState } from 'react';
import type { AppData } from '../types';
import { GROUP_NAMES } from '../data/initialData';
import { groupColor } from '../groupColors';
import { computeGroupStandings } from '../standings';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

export default function GroupsTab({ data, setData }: Props) {
  const [activeGroup, setActiveGroup] = useState(GROUP_NAMES[0]);
  const c = groupColor(activeGroup);

  const teamOf = (id: string) => data.teams.find((t) => t.id === id);

  const setScore = (matchId: string, side: 'home' | 'away', value: string) => {
    const num = value === '' ? null : Math.max(0, Number(value));
    setData((prev) => ({
      ...prev,
      groupMatches: prev.groupMatches.map((m) =>
        m.id === matchId
          ? { ...m, [side === 'home' ? 'homeScore' : 'awayScore']: num }
          : m,
      ),
    }));
  };

  const groupMatches = data.groupMatches.filter((m) => m.group === activeGroup);
  const standings = computeGroupStandings(activeGroup, data.teams, data.groupMatches);
  const maxPoints = Math.max(1, ...standings.map((s) => s.points));

  return (
    <div className="grid lg:grid-cols-[auto_1fr] gap-5">
      <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:w-20 lg:sticky lg:top-20 lg:self-start">
        {GROUP_NAMES.map((g) => {
          const gc = groupColor(g);
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-3 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                activeGroup === g
                  ? `bg-gradient-to-br ${gc.gradient} text-white shadow-lg scale-105`
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className={`bg-gradient-to-l ${c.gradient} px-5 py-3.5 text-white font-bold flex items-center justify-between`}>
            <span>טבלת בית {activeGroup}</span>
            <span className="text-xs font-normal bg-white/20 rounded-full px-3 py-1">דירוג חי לפי התוצאות שמילאת</span>
          </div>
          <div className="divide-y divide-slate-100">
            {standings.map((row, idx) => {
              const team = teamOf(row.teamId);
              const qualifies = idx < 2;
              const maybeThird = idx === 2;
              return (
                <div key={row.teamId} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      qualifies
                        ? 'bg-emerald-500 text-white'
                        : maybeThird
                          ? 'bg-amber-400 text-white'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-2xl shrink-0">{team?.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{team?.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="h-1.5 flex-1 max-w-[140px] bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-l ${c.gradient} rounded-full transition-all`}
                          style={{ width: `${(row.points / maxPoints) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {row.played} משחקים · {row.won}נ {row.drawn}ת {row.lost}פ
                      </span>
                    </div>
                  </div>
                  <div className="text-center shrink-0 hidden sm:block">
                    <div className="text-[11px] text-slate-400">הפרש</div>
                    <div className="font-semibold text-sm">{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</div>
                  </div>
                  <div className="text-center shrink-0 w-12">
                    <div className="text-[11px] text-slate-400">נק'</div>
                    <div className="font-extrabold text-lg text-slate-700">{row.points}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 text-xs text-slate-400 flex flex-wrap gap-4 bg-slate-50 border-t border-slate-100">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 bg-emerald-500 rounded-full" /> עולה ישירות לשלב הבא</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 bg-amber-400 rounded-full" /> עשויה לעלות כמקום שלישי מוביל</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 font-bold text-slate-700 border-b border-slate-100 flex items-center gap-2">
            <span>⚽</span> תוצאות משחקי בית {activeGroup}
          </div>
          <div className="divide-y divide-slate-100">
            {groupMatches.map((m) => {
              const home = teamOf(m.homeTeamId);
              const away = teamOf(m.awayTeamId);
              return (
                <div key={m.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                  <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                    <span className="text-sm font-medium truncate">{home?.name}</span>
                    <span className="text-xl shrink-0">{home?.flag}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 rounded-full px-2 py-1.5">
                    <input
                      type="number"
                      min={0}
                      value={m.homeScore ?? ''}
                      onChange={(e) => setScore(m.id, 'home', e.target.value)}
                      className="w-10 text-center bg-white border border-slate-200 rounded-full py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                    <span className="text-slate-300 font-bold">:</span>
                    <input
                      type="number"
                      min={0}
                      value={m.awayScore ?? ''}
                      onChange={(e) => setScore(m.id, 'away', e.target.value)}
                      className="w-10 text-center bg-white border border-slate-200 rounded-full py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{away?.flag}</span>
                    <span className="text-sm font-medium truncate">{away?.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
