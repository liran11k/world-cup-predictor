import { buildInitialData } from './data/initialData';
import type { AppData } from './types';

const STORAGE_KEY = 'world-cup-predictor-data-v1';

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return buildInitialData();
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return buildInitialData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportToFile(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'world-cup-predictor-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string) as AppData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
