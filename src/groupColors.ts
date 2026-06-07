export const GROUP_COLORS: Record<string, { bg: string; text: string; ring: string; gradient: string }> = {
  A: { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-300', gradient: 'from-rose-400 to-rose-600' },
  B: { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-300', gradient: 'from-orange-400 to-orange-600' },
  C: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300', gradient: 'from-amber-400 to-amber-600' },
  D: { bg: 'bg-lime-100', text: 'text-lime-700', ring: 'ring-lime-300', gradient: 'from-lime-400 to-lime-600' },
  E: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-300', gradient: 'from-emerald-400 to-emerald-600' },
  F: { bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-300', gradient: 'from-teal-400 to-teal-600' },
  G: { bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-300', gradient: 'from-cyan-400 to-cyan-600' },
  H: { bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-300', gradient: 'from-sky-400 to-sky-600' },
  I: { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-300', gradient: 'from-indigo-400 to-indigo-600' },
  J: { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-300', gradient: 'from-violet-400 to-violet-600' },
  K: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', ring: 'ring-fuchsia-300', gradient: 'from-fuchsia-400 to-fuchsia-600' },
  L: { bg: 'bg-pink-100', text: 'text-pink-700', ring: 'ring-pink-300', gradient: 'from-pink-400 to-pink-600' },
};

export function groupColor(group: string) {
  return GROUP_COLORS[group] ?? GROUP_COLORS.A;
}
