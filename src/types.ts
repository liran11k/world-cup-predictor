export interface Squad {
  starPlayers: string;
  cohesion: string;
  notes: string;
}

export interface Qualification {
  summary: string;
  finishedFirst: boolean;
  unbeaten: boolean;
  goalsFor: number | null;
  goalsAgainst: number | null;
}

export interface PlayStyle {
  type: string;
  vsBunker: string;
  vsCounterAttack: string;
  vsPhysical: string;
  notes: string;
}

export interface Context {
  momentum: string;
  injuries: string;
  history: string;
}

export interface Team {
  id: string;
  name: string;
  flag: string;
  group: string;
  squad: Squad;
  qualification: Qualification;
  playStyle: PlayStyle;
  context: Context;
}

export interface GroupMatch {
  id: string;
  group: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface KnockoutMatch {
  id: string;
  round: KnockoutRound;
  slot: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeSource: string | null;
  awaySource: string | null;
  homeScore: number | null;
  awayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
}

export type KnockoutRound = 'R32' | 'R16' | 'QF' | 'SF' | 'F3' | 'F';

export interface Prediction {
  championId: string | null;
  topScorer: string;
  notes: string;
}

export interface AppData {
  teams: Team[];
  groupMatches: GroupMatch[];
  knockoutMatches: KnockoutMatch[];
  prediction: Prediction;
}
