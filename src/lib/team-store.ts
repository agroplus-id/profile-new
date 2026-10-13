import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	updateDoc,
	writeBatch
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import { leadershipTeam, advisors, teamMembers, type TeamMember } from '$lib/data/team';

export type TeamGroup = 'leadership' | 'advisor' | 'team';

export const GROUP_LABELS: Record<TeamGroup, string> = {
	leadership: 'Leadership Team',
	advisor: 'Advisors',
	team: 'Team'
};

export interface TeamRecord {
	id: string;
	name: string;
	role: string;
	group: TeamGroup;
	order: number;
	image: string; // data URL atau URL https
	linkedin: string;
	instagram: string;
	scholar: string;
}

const COL = 'team';

export async function fetchTeam(): Promise<TeamRecord[]> {
	const snap = await getDocs(collection(db, COL));
	return snap.docs
		.map((d) => ({ id: d.id, ...(d.data() as Omit<TeamRecord, 'id'>) }))
		.sort((a, b) => a.order - b.order);
}

export function splitByGroup(records: TeamRecord[]) {
	const pick = (g: TeamGroup): TeamMember[] =>
		records
			.filter((r) => r.group === g)
			.map((r) => ({
				name: r.name,
				role: r.role || undefined,
				image: r.image,
				linkedin: r.linkedin || undefined,
				instagram: r.instagram || undefined,
				scholar: r.scholar || undefined
			}));
	return { leadership: pick('leadership'), advisor: pick('advisor'), team: pick('team') };
}

export type TeamInput = Omit<TeamRecord, 'id'>;

export const saveMember = (data: TeamInput) => addDoc(collection(db, COL), data);
export const updateMember = (id: string, data: Partial<TeamInput>) =>
	updateDoc(doc(db, COL, id), data);
export const removeMember = (id: string) => deleteDoc(doc(db, COL, id));

// Resize gambar ke JPEG kecil supaya muat di dokumen Firestore (batas 1 MB).
export function resizeToDataUrl(src: Blob | string, size = 500, quality = 0.82): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = typeof src === 'string' ? null : URL.createObjectURL(src);
		img.onload = () => {
			const scale = Math.min(1, size / Math.max(img.width, img.height));
			const canvas = document.createElement('canvas');
			canvas.width = Math.round(img.width * scale) || size;
			canvas.height = Math.round(img.height * scale) || size;
			const ctx = canvas.getContext('2d')!;
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			resolve(canvas.toDataURL('image/jpeg', quality));
		};
		img.onerror = () => reject(new Error('Gagal membaca gambar'));
		img.src = objectUrl ?? (src as string);
	});
}

// Impor data statis bawaan ke Firestore (sekali jalan, saat koleksi masih kosong).
export async function seedFromStatic(onProgress?: (done: number, total: number) => void) {
	const groups: [TeamGroup, TeamMember[]][] = [
		['leadership', leadershipTeam],
		['advisor', advisors],
		['team', teamMembers]
	];
	const total = groups.reduce((n, [, l]) => n + l.length, 0);
	let done = 0;
	let order = 0;
	const batch = writeBatch(db);
	for (const [group, list] of groups) {
		for (const m of list) {
			const image = await resizeToDataUrl(m.image);
			const ref = doc(collection(db, COL));
			batch.set(ref, {
				name: m.name,
				role: m.role ?? '',
				group,
				order: order++,
				image,
				linkedin: m.linkedin && m.linkedin !== '#' ? m.linkedin : '',
				instagram: m.instagram && m.instagram !== '#' ? m.instagram : '',
				scholar: m.scholar && m.scholar !== '#' ? m.scholar : ''
			} satisfies TeamInput);
			onProgress?.(++done, total);
		}
	}
	await batch.commit();
}
