import { useEffect, useState } from 'react';
import type { AppData } from './types';
import { loadData, saveData, exportToFile, importFromFile } from './storage';
import TeamsTab from './components/TeamsTab';
import GroupsTab from './components/GroupsTab';
import KnockoutTab from './components/KnockoutTab';
import SummaryTab from './components/SummaryTab';

type TabId = 'teams' | 'groups' | 'knockout' | 'summary';

const TABS: { id: TabId; label: string }[] = [
  { id: 'teams', label: 'נבחרות' },
  { id: 'groups', label: 'בתים' },
  { id: 'knockout', label: 'נוקאאוט' },
  { id: 'summary', label: 'הניחוש שלי' },
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
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-emerald-700 text-white px-6 py-4 shadow flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">⚽ מנבא המונדיאל 2026</h1>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => exportToFile(data)}
            className="bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded"
          >
            ייצוא נתונים
          </button>
          <label className="bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded cursor-pointer">
            ייבוא נתונים
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
      </header>

      <nav className="bg-white border-b border-slate-200 px-4 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto p-4">
        {tab === 'teams' && <TeamsTab data={data} setData={setData} />}
        {tab === 'groups' && <GroupsTab data={data} setData={setData} />}
        {tab === 'knockout' && <KnockoutTab data={data} setData={setData} />}
        {tab === 'summary' && <SummaryTab data={data} setData={setData} />}
      </main>
    </div>
  );
}
