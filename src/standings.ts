import type { GroupMatch, Team } from './types';

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

function emptyRow(teamId: string): StandingRow {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  };
}

export function computeGroupStandings(group: string, teams: Team[], matches: GroupMatch[]): StandingRow[] {
  const groupTeams = teams.filter((t) => t.group === group);
  const rows = new Map<string, StandingRow>();
  groupTeams.forEach((t) => rows.set(t.id, emptyRow(t.id)));

  matches
    .filter((m) => m.group === group && m.homeScore !== null && m.awayScore !== null)
    .forEach((m) => {
      const home = rows.get(m.homeTeamId);
      const away = rows.get(m.awayTeamId);
      if (!home || !away) return;
      const hs = m.homeScore as number;
      const as = m.awayScore as number;

      home.played += 1;
      away.played += 1;
      home.goalsFor += hs;
      home.goalsAgainst += as;
      away.goalsFor += as;
      away.goalsAgainst += hs;

      if (hs > as) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (hs < as) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
      }
    });

  rows.forEach((r) => {
    r.goalDiff = r.goalsFor - r.goalsAgainst;
  });

  return Array.from(rows.values()).sort(
    (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor,
  );
}

export function isGroupComplete(group: string, matches: GroupMatch[]): boolean {
  return matches
    .filter((m) => m.group === group)
    .every((m) => m.homeScore !== null && m.awayScore !== null);
}
