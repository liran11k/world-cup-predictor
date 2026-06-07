import { useMemo, useState } from 'react';
import type { AppData, Team } from '../types';
import { GROUP_NAMES } from '../data/initialData';
import { groupColor } from '../groupColors';
import TeamModal from './TeamModal';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

export default function TeamsTab({ data, setData }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredTeams = useMemo(() => {
    return data.teams.filter((t) => {
      if (groupFilter !== 'all' && t.group !== groupFilter) return false;
      if (search.trim() && !t.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [data.teams, groupFilter, search]);

  const selectedTeam = data.teams.find((t) => t.id === selectedTeamId) ?? null;

  const updateTeam = (updated: Team) => {
    setData((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => (t.id === updated.id ? updated : t)),
    }));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="חיפוש נבחרת..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pr-10 pl-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setGroupFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              groupFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            הכל
          </button>
          {GROUP_NAMES.map((g) => {
            const c = groupColor(g);
            return (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  groupFilter === g ? `${c.bg} ${c.text} ring-2 ${c.ring} scale-105` : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                }`}
              >
                בית {g}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredTeams.map((team) => {
          const c = groupColor(team.group);
          return (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className="group bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 transition-all text-center flex flex-col items-center gap-2"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">{team.flag}</span>
              <span className="font-semibold text-sm leading-tight">{team.name}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                בית {team.group}
              </span>
            </button>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center text-slate-400 py-16">לא נמצאו נבחרות התואמות לחיפוש</div>
      )}

      {selectedTeam && (
        <TeamModal
          team={selectedTeam}
          onClose={() => setSelectedTeamId(null)}
          onSave={updateTeam}
        />
      )}
    </div>
  );
}
