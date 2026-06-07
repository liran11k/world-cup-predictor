import type { AppData } from '../types';
import { computeQualifiers, getChampion, propagateKnockout, ROUND_LABELS } from '../knockout';

interface Props {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

export default function SummaryTab({ data, setData }: Props) {
  const qualifiers = computeQualifiers(data);
  const matches = propagateKnockout(data.knockoutMatches);
  const championFromBracket = getChampion(matches);

  const teamName = (id: string | null) => (id ? data.teams.find((t) => t.id === id)?.name ?? id : 'טרם נקבע');
  const teamFlag = (id: string | null) => (id ? data.teams.find((t) => t.id === id)?.flag ?? '' : '🏳️');

  const setPrediction = (patch: Partial<AppData['prediction']>) => {
    setData((prev) => ({ ...prev, prediction: { ...prev.prediction, ...patch } }));
  };

  const finalMatch = matches.find((m) => m.round === 'F' && m.slot === 0);
  const thirdPlaceMatch = matches.find((m) => m.round === 'F3' && m.slot === 0);
  const semis = matches.filter((m) => m.round === 'SF');

  const MatchPreview = ({ label, home, away }: { label: string; home: string | null; away: string | null }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
      <div className="text-[11px] font-semibold text-emerald-600 mb-2">{label}</div>
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <span className="text-2xl">{teamFlag(home)}</span>
        <span className="truncate max-w-[90px]">{teamName(home)}</span>
        <span className="text-slate-300 text-xs">VS</span>
        <span className="truncate max-w-[90px]">{teamName(away)}</span>
        <span className="text-2xl">{teamFlag(away)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {!qualifiers && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl p-4 text-sm flex items-center gap-3">
          <span className="text-2xl">💡</span>
          השלם קודם את כל משחקי הבתים והנוקאאוט כדי לראות תחזית מלאה — אבל אתה כבר יכול לרשום כאן את הניחוש האישי שלך.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">⭐ הניחוש האישי שלי</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">🏆 הנבחרת שלדעתי תזכה במונדיאל</label>
            <select
              value={data.prediction.championId ?? ''}
              onChange={(e) => setPrediction({ championId: e.target.value || null })}
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="">בחירה...</option>
              {data.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flag} {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">⚽ מלך השערים שלדעתי</label>
            <input
              type="text"
              value={data.prediction.topScorer}
              onChange={(e) => setPrediction({ topScorer: e.target.value })}
              placeholder="שם השחקן ונבחרתו"
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">📝 למה? (נימוקים, התחושות שלך)</label>
          <textarea
            value={data.prediction.notes}
            onChange={(e) => setPrediction({ notes: e.target.value })}
            rows={4}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </div>

      {qualifiers && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🔮 התחזית שעולה מהבתים והברקט שמילאת</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <MatchPreview label={`${ROUND_LABELS.SF} — מחצית 1`} home={semis[0]?.homeTeamId ?? null} away={semis[0]?.awayTeamId ?? null} />
            <MatchPreview label={`${ROUND_LABELS.SF} — מחצית 2`} home={semis[1]?.homeTeamId ?? null} away={semis[1]?.awayTeamId ?? null} />
            <MatchPreview label={ROUND_LABELS.F3} home={thirdPlaceMatch?.homeTeamId ?? null} away={thirdPlaceMatch?.awayTeamId ?? null} />
          </div>

          <div className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white p-6 text-center">
            <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-50/80 mb-2">{ROUND_LABELS.F}</div>
              <div className="flex items-center justify-center gap-3 text-xl font-bold mb-3">
                <span className="text-3xl">{teamFlag(finalMatch?.homeTeamId ?? null)}</span>
                <span>{teamName(finalMatch?.homeTeamId ?? null)}</span>
                <span className="text-white/60 text-sm font-normal">נגד</span>
                <span>{teamName(finalMatch?.awayTeamId ?? null)}</span>
                <span className="text-3xl">{teamFlag(finalMatch?.awayTeamId ?? null)}</span>
              </div>
              {championFromBracket ? (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-5 py-2.5 text-lg font-extrabold">
                  🏆 האלופה לפי הברקט שלך: {teamFlag(championFromBracket)} {teamName(championFromBracket)}
                </div>
              ) : (
                <div className="text-sm text-emerald-50/80">מלא את תוצאת הגמר כדי לגלות מי האלופה לפי התחזית שלך</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
