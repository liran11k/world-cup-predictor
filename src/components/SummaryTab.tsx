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

  const teamName = (id: string | null) => (id ? data.teams.find((t) => t.id === id)?.name ?? id : '—');
  const teamFlag = (id: string | null) => (id ? data.teams.find((t) => t.id === id)?.flag ?? '' : '');

  const setPrediction = (patch: Partial<AppData['prediction']>) => {
    setData((prev) => ({ ...prev, prediction: { ...prev.prediction, ...patch } }));
  };

  const finalMatch = matches.find((m) => m.round === 'F' && m.slot === 0);
  const thirdPlaceMatch = matches.find((m) => m.round === 'F3' && m.slot === 0);
  const semis = matches.filter((m) => m.round === 'SF');

  return (
    <div className="space-y-5">
      {!qualifiers && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-4 text-sm">
          השלם קודם את כל משחקי הבתים והנוקאאוט כדי לראות תחזית מלאה — אבל אתה כבר יכול לרשום כאן את הניחוש האישי שלך.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="font-semibold mb-3">הניחוש האישי שלי</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">הנבחרת שלדעתי תזכה במונדיאל</label>
            <select
              value={data.prediction.championId ?? ''}
              onChange={(e) => setPrediction({ championId: e.target.value || null })}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
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
            <label className="block text-xs font-semibold text-slate-500 mb-1">מלך השערים שלדעתי</label>
            <input
              type="text"
              value={data.prediction.topScorer}
              onChange={(e) => setPrediction({ topScorer: e.target.value })}
              placeholder="שם השחקן ונבחרתו"
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1">למה? (נימוקים, התחושות שלך)</label>
          <textarea
            value={data.prediction.notes}
            onChange={(e) => setPrediction({ notes: e.target.value })}
            rows={4}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {qualifiers && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="font-semibold mb-3">התחזית שעולה מהבתים והברקט שמילאת</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-center">
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{ROUND_LABELS.SF} — מחצית 1</div>
              <div className="font-medium">
                {teamFlag(semis[0]?.homeTeamId ?? null)} {teamName(semis[0]?.homeTeamId ?? null)} נגד{' '}
                {teamName(semis[0]?.awayTeamId ?? null)} {teamFlag(semis[0]?.awayTeamId ?? null)}
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{ROUND_LABELS.SF} — מחצית 2</div>
              <div className="font-medium">
                {teamFlag(semis[1]?.homeTeamId ?? null)} {teamName(semis[1]?.homeTeamId ?? null)} נגד{' '}
                {teamName(semis[1]?.awayTeamId ?? null)} {teamFlag(semis[1]?.awayTeamId ?? null)}
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{ROUND_LABELS.F3}</div>
              <div className="font-medium">
                {teamFlag(thirdPlaceMatch?.homeTeamId ?? null)} {teamName(thirdPlaceMatch?.homeTeamId ?? null)} נגד{' '}
                {teamName(thirdPlaceMatch?.awayTeamId ?? null)} {teamFlag(thirdPlaceMatch?.awayTeamId ?? null)}
              </div>
            </div>
          </div>

          <div className="mt-4 border-2 border-emerald-300 bg-emerald-50 rounded-lg p-5 text-center">
            <div className="text-xs text-emerald-600 mb-1">{ROUND_LABELS.F}</div>
            <div className="text-lg font-bold mb-2">
              {teamFlag(finalMatch?.homeTeamId ?? null)} {teamName(finalMatch?.homeTeamId ?? null)} נגד{' '}
              {teamName(finalMatch?.awayTeamId ?? null)} {teamFlag(finalMatch?.awayTeamId ?? null)}
            </div>
            {championFromBracket ? (
              <div className="text-xl font-bold text-emerald-700">
                🏆 האלופה לפי הברקט שמילאת: {teamFlag(championFromBracket)} {teamName(championFromBracket)}
              </div>
            ) : (
              <div className="text-sm text-slate-400">מלא את תוצאת הגמר כדי לגלות מי האלופה לפי התחזית שלך</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
