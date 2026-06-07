import { useMemo, useState } from 'react';
import type { AppData, Team } from '../types';
import { GROUP_NAMES } from '../data/initialData';
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
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="חיפוש נבחרת..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm flex-1 min-w-[180px]"
        />
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="all">כל הבתים</option>
          {GROUP_NAMES.map((g) => (
            <option key={g} value={g}>
              בית {g}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredTeams.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelectedTeamId(team.id)}
            className="bg-white border border-slate-200 rounded-lg p-3 hover:border-emerald-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-1"
          >
            <span className="text-3xl">{team.flag}</span>
            <span className="font-medium text-sm">{team.name}</span>
            <span className="text-xs text-slate-400">בית {team.group}</span>
          </button>
        ))}
      </div>

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
