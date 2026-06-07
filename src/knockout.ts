import { GROUP_NAMES } from './data/initialData';
import { computeGroupStandings, isGroupComplete, type StandingRow } from './standings';
import type { AppData, KnockoutMatch } from './types';

export interface Qualifier {
  teamId: string;
  label: string; // e.g. "1st place - Group A" or "Best 3rd place"
}

export function allGroupsComplete(data: AppData): boolean {
  return GROUP_NAMES.every((g) => isGroupComplete(g, data.groupMatches));
}

/** Returns the 32 qualified teams: top 2 of each group + best 8 third-placed teams. */
export function computeQualifiers(data: AppData): Qualifier[] | null {
  if (!allGroupsComplete(data)) return null;

  const winners: Qualifier[] = [];
  const runnersUp: Qualifier[] = [];
  const thirds: { row: StandingRow; group: string }[] = [];

  GROUP_NAMES.forEach((g) => {
    const standings = computeGroupStandings(g, data.teams, data.groupMatches);
    winners.push({ teamId: standings[0].teamId, label: `1️⃣ מקום ראשון בבית ${g}` });
    runnersUp.push({ teamId: standings[1].teamId, label: `2️⃣ מקום שני בבית ${g}` });
    thirds.push({ row: standings[2], group: g });
  });

  thirds.sort(
    (a, b) =>
      b.row.points - a.row.points ||
      b.row.goalDiff - a.row.goalDiff ||
      b.row.goalsFor - a.row.goalsFor,
  );

  const bestThirds = thirds.slice(0, 8).map((t, i) => ({
    teamId: t.row.teamId,
    label: `3️⃣ מקום שלישי מוביל #${i + 1} (בית ${t.group})`,
  }));

  return [...winners, ...runnersUp, ...bestThirds];
}

function matchWinner(m: KnockoutMatch): string | null {
  if (m.homeTeamId === null || m.awayTeamId === null) return null;
  if (m.homeScore === null || m.awayScore === null) return null;
  if (m.homeScore > m.awayScore) return m.homeTeamId;
  if (m.awayScore > m.homeScore) return m.awayTeamId;
  if (m.penaltyHomeScore !== null && m.penaltyAwayScore !== null) {
    if (m.penaltyHomeScore > m.penaltyAwayScore) return m.homeTeamId;
    if (m.penaltyAwayScore > m.penaltyHomeScore) return m.awayTeamId;
  }
  return null;
}

function matchLoser(m: KnockoutMatch): string | null {
  const winner = matchWinner(m);
  if (!winner || m.homeTeamId === null || m.awayTeamId === null) return null;
  return winner === m.homeTeamId ? m.awayTeamId : m.homeTeamId;
}

const ROUND_ORDER: KnockoutMatch['round'][] = ['R32', 'R16', 'QF', 'SF', 'F3', 'F'];

/** Propagates winners/losers from completed matches into the next round's slots. */
export function propagateKnockout(matches: KnockoutMatch[]): KnockoutMatch[] {
  const byRound = new Map<KnockoutMatch['round'], KnockoutMatch[]>();
  ROUND_ORDER.forEach((r) => byRound.set(r, matches.filter((m) => m.round === r).sort((a, b) => a.slot - b.slot)));

  const result = matches.map((m) => ({ ...m }));
  const findIn = (round: KnockoutMatch['round'], slot: number) =>
    result.find((m) => m.round === round && m.slot === slot)!;

  const r32 = byRound.get('R32')!;
  const r16 = byRound.get('R16')!;
  r16.forEach((_, i) => {
    const a = findIn('R32', i * 2);
    const b = findIn('R32', i * 2 + 1);
    const target = findIn('R16', i);
    target.homeTeamId = matchWinner(a);
    target.awayTeamId = matchWinner(b);
  });
  void r32;

  const qf = byRound.get('QF')!;
  qf.forEach((_, i) => {
    const a = findIn('R16', i * 2);
    const b = findIn('R16', i * 2 + 1);
    const target = findIn('QF', i);
    target.homeTeamId = matchWinner(a);
    target.awayTeamId = matchWinner(b);
  });

  const sf = byRound.get('SF')!;
  sf.forEach((_, i) => {
    const a = findIn('QF', i * 2);
    const b = findIn('QF', i * 2 + 1);
    const target = findIn('SF', i);
    target.homeTeamId = matchWinner(a);
    target.awayTeamId = matchWinner(b);
  });

  const sfA = findIn('SF', 0);
  const sfB = findIn('SF', 1);
  const f3 = findIn('F3', 0);
  f3.homeTeamId = matchLoser(sfA);
  f3.awayTeamId = matchLoser(sfB);

  const final = findIn('F', 0);
  final.homeTeamId = matchWinner(sfA);
  final.awayTeamId = matchWinner(sfB);

  return result;
}

export function getChampion(matches: KnockoutMatch[]): string | null {
  const final = matches.find((m) => m.round === 'F' && m.slot === 0);
  return final ? matchWinner(final) : null;
}

export const ROUND_LABELS: Record<KnockoutMatch['round'], string> = {
  R32: 'שלב ה-32',
  R16: 'שמינית גמר',
  QF: 'רבע גמר',
  SF: 'חצי גמר',
  F3: 'משחק על מקום שלישי',
  F: 'גמר',
};
