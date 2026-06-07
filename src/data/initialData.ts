import type { AppData, GroupMatch, KnockoutMatch, Team } from '../types';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function emptyTeam(id: string, group: string, label: string): Team {
  return {
    id,
    name: label,
    flag: '🏳️',
    group,
    squad: { starPlayers: '', cohesion: '', notes: '' },
    qualification: {
      summary: '',
      finishedFirst: false,
      unbeaten: false,
      goalsFor: null,
      goalsAgainst: null,
    },
    playStyle: {
      type: '',
      vsBunker: '',
      vsCounterAttack: '',
      vsPhysical: '',
      notes: '',
    },
    context: { momentum: '', injuries: '', history: '' },
  };
}

function buildTeams(): Team[] {
  const teams: Team[] = [];
  GROUPS.forEach((group, gi) => {
    for (let i = 0; i < 4; i++) {
      const id = `${group}${i + 1}`;
      teams.push(emptyTeam(id, group, `נבחרת ${gi * 4 + i + 1}`));
    }
  });
  return teams;
}

function buildGroupMatches(teams: Team[]): GroupMatch[] {
  const matches: GroupMatch[] = [];
  GROUPS.forEach((group) => {
    const groupTeams = teams.filter((t) => t.group === group);
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        matches.push({
          id: `${group}-${groupTeams[i].id}-${groupTeams[j].id}`,
          group,
          homeTeamId: groupTeams[i].id,
          awayTeamId: groupTeams[j].id,
          homeScore: null,
          awayScore: null,
        });
      }
    }
  });
  return matches;
}

function buildKnockoutMatches(): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];

  const r32Sources: [string, string][] = [
    ['1A', '2B'], ['1C', '2D'], ['1E', '2F'], ['1G', '2H'],
    ['1I', '2J'], ['1K', '2L'], ['1B', '2A'], ['1D', '2C'],
    ['1F', '2E'], ['1H', '2G'], ['1J', '2I'], ['1L', '2K'],
    ['3rd #1', '3rd #2'], ['3rd #3', '3rd #4'],
    ['3rd #5', '3rd #6'], ['3rd #7', '3rd #8'],
  ];

  const make = (
    round: KnockoutMatch['round'],
    slot: number,
    homeSource: string | null,
    awaySource: string | null,
  ): KnockoutMatch => ({
    id: `${round}-${slot}`,
    round,
    slot,
    homeTeamId: null,
    awayTeamId: null,
    homeSource,
    awaySource,
    homeScore: null,
    awayScore: null,
    penaltyHomeScore: null,
    penaltyAwayScore: null,
  });

  r32Sources.forEach(([h, a], i) => {
    matches.push(make('R32', i, h, a));
  });

  for (let i = 0; i < 8; i++) {
    matches.push(
      make('R16', i, `מנצח/ת R32 #${i * 2 + 1}`, `מנצח/ת R32 #${i * 2 + 2}`),
    );
  }
  for (let i = 0; i < 4; i++) {
    matches.push(
      make('QF', i, `מנצח/ת R16 #${i * 2 + 1}`, `מנצח/ת R16 #${i * 2 + 2}`),
    );
  }
  for (let i = 0; i < 2; i++) {
    matches.push(
      make('SF', i, `מנצח/ת רבע גמר #${i * 2 + 1}`, `מנצח/ת רבע גמר #${i * 2 + 2}`),
    );
  }
  matches.push(make('F3', 0, 'מפסיד/ת חצי גמר #1', 'מפסיד/ת חצי גמר #2'));
  matches.push(make('F', 0, 'מנצח/ת חצי גמר #1', 'מנצח/ת חצי גמר #2'));

  return matches;
}

export function buildInitialData(): AppData {
  const teams = buildTeams();
  return {
    teams,
    groupMatches: buildGroupMatches(teams),
    knockoutMatches: buildKnockoutMatches(),
    prediction: { championId: null, topScorer: '', notes: '' },
  };
}

export const GROUP_NAMES = GROUPS;
