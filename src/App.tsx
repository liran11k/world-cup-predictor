import { useEffect, useState } from 'react';
import type { AppData } from './types';
import { loadData, saveData, exportToFile, importFromFile } from './storage';
import TeamsTab from './components/TeamsTab';
import GroupsTab from './components/GroupsTab';
import KnockoutTab from './components/KnockoutTab';
import SummaryTab from './components/SummaryTab';

type TabId = 'teams' | 'groups' | 'knockout' | 'summary';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'teams', label: 'נבחרות', icon: '🌍' },
  { id: 'groups', label: 'בתים', icon: '📋' },
  { id: 'knockout', label: 'נוקאאוט', icon: '🏆' },
  { id: 'summary', label: 'הניחוש שלי', icon: '⭐' },
];

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<TabId>('teams');

  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleImport = async (file: File) => {
    try {
      const imported = await importFromFile(file);
      setData(imported);
    } catch {
      alert('קובץ לא תקין');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      <header className="relative overflow-hidden bg-gradient-to-l from-emerald-600 via-emerald-500 to-teal-500 text-white">
        <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-5 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow">⚽</span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">מנבא המונדיאל 2026</h1>
              <p className="text-sm text-emerald-50/80">בנה את הניחוש המושלם שלך — מהבתים ועד הגמר</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => exportToFile(data)}
              className="bg-white/15 hover:bg-white/25 backdrop-blur px-3.5 py-2 rounded-full font-medium transition-colors"
            >
              ⬇️ ייצוא נתונים
            </button>
            <label className="bg-white/15 hover:bg-white/25 backdrop-blur px-3.5 py-2 rounded-full font-medium cursor-pointer transition-colors">
              ⬆️ ייבוא נתונים
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto py-2.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 ${
                tab === t.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-105'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {tab === 'teams' && <TeamsTab data={data} setData={setData} />}
        {tab === 'groups' && <GroupsTab data={data} setData={setData} />}
        {tab === 'knockout' && <KnockoutTab data={data} setData={setData} />}
        {tab === 'summary' && <SummaryTab data={data} setData={setData} />}
      </main>
    </div>
  );
}
