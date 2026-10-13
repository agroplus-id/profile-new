export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface Order {
	orderCode: string;
	customerName: string;
	email: string;
	phone: string;
	product: string;
	batch: string; // kode batch (ID dokumen di koleksi "batches")
	itemNumber?: number; // nomor kemasan dalam batch, mis. 1 dari 30
	status: OrderStatus;
	createdAt: string; // ISO
}

export const ORDER_STATUS: { key: OrderStatus; label: string; tone: '' | 'amber' | 'blue' | 'gray' }[] =
	[
		{ key: 'pending', label: 'Menunggu', tone: 'gray' },
		{ key: 'processing', label: 'Diproses', tone: 'amber' },
		{ key: 'shipped', label: 'Dikirim', tone: 'blue' },
		{ key: 'delivered', label: 'Selesai', tone: '' }
	];

// Kode pesanan jadi ID dokumen Firestore, jadi dinormalkan: huruf besar, tanpa spasi atau "/".
export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/[\s/]+/g, '-');
