import { useState } from 'react';
import type { Team } from '../types';

interface Props {
  team: Team;
  onClose: () => void;
  onSave: (team: Team) => void;
}

type SectionId = 'squad' | 'qualification' | 'playStyle' | 'context';

const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
  { id: 'squad', label: 'הסגל', icon: '👥' },
  { id: 'qualification', label: 'דרך המוקדמות', icon: '🎫' },
  { id: 'playStyle', label: 'סגנון משחק', icon: '🎯' },
  { id: 'context', label: 'מומנטום והקשר', icon: '📰' },
];

function Field({
  label,
  value,
  editing,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  multiline?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="text-right bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
      <div className="text-xs font-semibold text-emerald-700 mb-1.5">{label}</div>
      {editing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        )
      ) : (
        <p className="text-sm text-slate-600 whitespace-pre-wrap min-h-[1.5em] leading-relaxed">
          {value || <span className="text-slate-400">לא הוזן מידע עדיין — לחץ "עריכה" כדי להוסיף</span>}
        </p>
      )}
    </div>
  );
}

function CheckField({
  label,
  checked,
  editing,
  onChange,
}: {
  label: string;
  checked: boolean;
  editing: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={!editing}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export default function TeamModal({ team, onClose, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Team>(team);
  const [section, setSection] = useState<SectionId>('squad');

  const startEdit = () => {
    setDraft(team);
    setEditing(true);
  };

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(team);
    setEditing(false);
  };

  const view = editing ? draft : team;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[fadeIn_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-l from-emerald-600 to-teal-500 text-white rounded-t-3xl px-6 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {editing ? (
              <input
                type="text"
                value={draft.flag}
                onChange={(e) => setDraft({ ...draft, flag: e.target.value })}
                className="w-14 text-2xl text-center border border-white/40 bg-white/10 rounded-lg"
              />
            ) : (
              <span className="text-4xl drop-shadow">{view.flag}</span>
            )}
            <div className="min-w-0">
              {editing ? (
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="text-lg font-bold border border-white/40 bg-white/10 rounded-lg px-2 py-1 text-white placeholder-white/60"
                />
              ) : (
                <h2 className="text-xl font-bold truncate">{view.name}</h2>
              )}
              <span className="text-xs text-emerald-50/80">בית {view.group}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {editing ? (
              <>
                <button onClick={save} className="bg-white text-emerald-700 text-sm font-semibold px-3.5 py-1.5 rounded-full hover:bg-emerald-50 transition-colors">
                  שמירה ✓
                </button>
                <button onClick={cancel} className="bg-white/15 text-sm px-3.5 py-1.5 rounded-full hover:bg-white/25 transition-colors">
                  ביטול
                </button>
              </>
            ) : (
              <button onClick={startEdit} className="bg-white/15 text-sm font-medium px-3.5 py-1.5 rounded-full hover:bg-white/25 transition-colors">
                ✏️ עריכה
              </button>
            )}
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none px-1">
              ×
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 px-6 pt-4 flex-wrap">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-full border transition-all ${
                section === s.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-3">
          {section === 'squad' && (
            <>
              <Field
                label="שחקנים בכירים / כוכבים"
                value={view.squad.starPlayers}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, squad: { ...draft.squad, starPlayers: v } })}
              />
              <Field
                label="גיבוש ואיכות הקבוצה"
                value={view.squad.cohesion}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, squad: { ...draft.squad, cohesion: v } })}
              />
              <Field
                label="הערות נוספות"
                value={view.squad.notes}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, squad: { ...draft.squad, notes: v } })}
              />
            </>
          )}

          {section === 'qualification' && (
            <>
              <Field
                label="סיכום הדרך במוקדמות"
                value={view.qualification.summary}
                editing={editing}
                multiline
                onChange={(v) =>
                  setDraft({ ...draft, qualification: { ...draft.qualification, summary: v } })
                }
              />
              <div className="flex flex-wrap gap-4">
                <CheckField
                  label="סיימה במקום הראשון"
                  checked={view.qualification.finishedFirst}
                  editing={editing}
                  onChange={(v) =>
                    setDraft({ ...draft, qualification: { ...draft.qualification, finishedFirst: v } })
                  }
                />
                <CheckField
                  label="הייתה בלתי מנוצחת"
                  checked={view.qualification.unbeaten}
                  editing={editing}
                  onChange={(v) =>
                    setDraft({ ...draft, qualification: { ...draft.qualification, unbeaten: v } })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="שערים שכבשה"
                  value={view.qualification.goalsFor?.toString() ?? ''}
                  editing={editing}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      qualification: { ...draft.qualification, goalsFor: v === '' ? null : Number(v) },
                    })
                  }
                />
                <Field
                  label="שערים שספגה"
                  value={view.qualification.goalsAgainst?.toString() ?? ''}
                  editing={editing}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      qualification: { ...draft.qualification, goalsAgainst: v === '' ? null : Number(v) },
                    })
                  }
                />
              </div>
            </>
          )}

          {section === 'playStyle' && (
            <>
              <Field
                label="סגנון משחק כללי (התקפי / הגנתי / שליטה ועוד)"
                value={view.playStyle.type}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, playStyle: { ...draft.playStyle, type: v } })}
              />
              <Field
                label="כיצד מתמודדת מול קבוצות 'בונקר' שסוגרות מאחור"
                value={view.playStyle.vsBunker}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, playStyle: { ...draft.playStyle, vsBunker: v } })}
              />
              <Field
                label="כיצד מתמודדת מול קבוצות מתפרצות (קונטרה)"
                value={view.playStyle.vsCounterAttack}
                editing={editing}
                multiline
                onChange={(v) =>
                  setDraft({ ...draft, playStyle: { ...draft.playStyle, vsCounterAttack: v } })
                }
              />
              <Field
                label="כיצד מתמודדת מול קבוצות פיזיות"
                value={view.playStyle.vsPhysical}
                editing={editing}
                multiline
                onChange={(v) =>
                  setDraft({ ...draft, playStyle: { ...draft.playStyle, vsPhysical: v } })
                }
              />
              <Field
                label="הערות נוספות"
                value={view.playStyle.notes}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, playStyle: { ...draft.playStyle, notes: v } })}
              />
            </>
          )}

          {section === 'context' && (
            <>
              <Field
                label="מומנטום נוכחי (פציעות, מצב רוח, הכנה לטורניר)"
                value={view.context.momentum}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, context: { ...draft.context, momentum: v } })}
              />
              <Field
                label="פציעות / זמינות שחקנים מרכזיים"
                value={view.context.injuries}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, context: { ...draft.context, injuries: v } })}
              />
              <Field
                label="היסטוריה ומסורת (כמה זמן לא עלו, הישגי עבר וכו')"
                value={view.context.history}
                editing={editing}
                multiline
                onChange={(v) => setDraft({ ...draft, context: { ...draft.context, history: v } })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
