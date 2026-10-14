export type FilterOption = { value: string; label: string; count?: number };

export type FilterDef = {
	key: string;
	label: string;
	options: FilterOption[]; // nilai kosong = "Semua"
	variant?: 'chips' | 'select';
};

export type FilterState = {
	query: string;
	values: Record<string, string>;
	from: string;
	to: string;
	sort: string;
};

export const newFilter = (sort = '', keys: string[] = []): FilterState => ({
	query: '',
	values: Object.fromEntries(keys.map((k) => [k, ''])),
	from: '',
	to: '',
	sort
});

// Cocokkan teks dengan kata kunci pencarian (semua kata harus ada, tanpa peduli huruf besar/kecil).
export const matches = (query: string, ...parts: (string | undefined | null)[]) => {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	const hay = parts.filter(Boolean).join(' ').toLowerCase();
	return q.split(/\s+/).every((w) => hay.includes(w));
};

// Tanggal (yyyy-mm-dd) berada dalam rentang dari–sampai (kosong = tak dibatasi).
export const inRange = (iso: string | undefined, from: string, to: string) => {
	if (!from && !to) return true;
	const d = (iso ?? '').slice(0, 10);
	if (!d) return false;
	return (!from || d >= from) && (!to || d <= to);
};

export const countBy = <T>(rows: T[], pick: (r: T) => string) => {
	const m = new Map<string, number>();
	for (const r of rows) m.set(pick(r), (m.get(pick(r)) ?? 0) + 1);
	return m;
};
