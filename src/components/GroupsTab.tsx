import { useState } from 'react';
import type { AppData } from '../types';
import { GROUP_NAMES } from '../data/initialData';
import { computeGroupStandings } from '../standings';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

export default function GroupsTab({ data, setData }: Props) {
  const [activeGroup, setActiveGroup] = useState(GROUP_NAMES[0]);

  const teamName = (id: string) => data.teams.find((t) => t.id === id)?.name ?? id;
  const teamFlag = (id: string) => data.teams.find((t) => t.id === id)?.flag ?? '';

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

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-4">
      <div className="flex md:flex-col gap-1 overflow-x-auto md:w-16">
        {GROUP_NAMES.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`px-3 py-2 rounded text-sm font-semibold ${
              activeGroup === g ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 font-semibold text-sm border-b border-slate-200">
            טבלת בית {activeGroup}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="text-right px-3 py-2">#</th>
                <th className="text-right px-3 py-2">נבחרת</th>
                <th className="px-2 py-2">מ</th>
                <th className="px-2 py-2">נ</th>
                <th className="px-2 py-2">ת</th>
                <th className="px-2 py-2">ה</th>
                <th className="px-2 py-2">הפרש</th>
                <th className="px-2 py-2">נק'</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => (
                <tr
                  key={row.teamId}
                  className={`border-b border-slate-100 ${
                    idx < 2 ? 'bg-emerald-50' : idx === 2 ? 'bg-amber-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium flex items-center gap-2">
                    <span>{teamFlag(row.teamId)}</span>
                    {teamName(row.teamId)}
                  </td>
                  <td className="text-center px-2 py-2">{row.played}</td>
                  <td className="text-center px-2 py-2">{row.won}</td>
                  <td className="text-center px-2 py-2">{row.drawn}</td>
                  <td className="text-center px-2 py-2">{row.lost}</td>
                  <td className="text-center px-2 py-2">{row.goalDiff}</td>
                  <td className="text-center px-2 py-2 font-bold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-slate-400 flex gap-4">
            <span><span className="inline-block w-3 h-3 bg-emerald-100 align-middle ml-1 rounded-sm" /> עולה ישירות לשלב הבא</span>
            <span><span className="inline-block w-3 h-3 bg-amber-100 align-middle ml-1 rounded-sm" /> עשויה לעלות כמקום שלישי מוביל</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 font-semibold text-sm border-b border-slate-200">
            תוצאות משחקי בית {activeGroup}
          </div>
          <div className="divide-y divide-slate-100">
            {groupMatches.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <span className="flex-1 text-sm font-medium text-left truncate">
                  {teamFlag(m.homeTeamId)} {teamName(m.homeTeamId)}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={m.homeScore ?? ''}
                    onChange={(e) => setScore(m.id, 'home', e.target.value)}
                    className="w-12 text-center border border-slate-300 rounded px-1 py-1"
                  />
                  <span className="text-slate-400">:</span>
                  <input
                    type="number"
                    min={0}
                    value={m.awayScore ?? ''}
                    onChange={(e) => setScore(m.id, 'away', e.target.value)}
                    className="w-12 text-center border border-slate-300 rounded px-1 py-1"
                  />
                </div>
                <span className="flex-1 text-sm font-medium text-right truncate">
                  {teamName(m.awayTeamId)} {teamFlag(m.awayTeamId)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
