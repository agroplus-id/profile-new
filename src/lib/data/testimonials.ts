export interface TestimonialItem {
	id: string;
	title: string;
	clientName: string;
	clientRole?: string;
	clientCompany?: string;
	category: string;
	date: string;
	summary?: string;
	image?: string;
	rating?: number;
	published?: boolean;
}

export const TESTIMONIAL_CATEGORIES = [
	'Estate & Farm',
	'Coffee Processor',
	'Roastery Partner',
	'Agritech Partner'
] as const;

export const defaultTestimonials: TestimonialItem[] = [
	{
		id: 'adam-maduarjo',
		title: 'Serah Terima Pembelian 1 IoT FERROIR',
		clientName: 'Adam',
		clientRole: 'Coffee Farmer',
		clientCompany: 'Maduarjo',
		category: 'Estate & Farm',
		date: '2026-11-03',
		rating: 5,
		summary: 'Coba coba dulu sek, kemarin masih lancar pake nya',
		image: '',
		published: true
	},
	{
		id: 'tamam-hambl',
		title: 'Serah Terima Pembelian 3 IoT FERROIR',
		clientName: 'Tamam',
		clientRole: 'Processor',
		clientCompany: 'Hambl team',
		category: 'Roastery Partner',
		date: '2026-11-03',
		rating: 5,
		summary: 'Akhirnya ga kebuang lagi 30+ kg kopi lagi kalo proses nya overfermented',
		image: '',
		published: true
	},
	{
		id: 'dept-kimia-csr',
		title: 'Penyerahan 2 IoT FERROIR kepada Departemen Kimia CSR Program',
		clientName: 'Departemen Kimia',
		clientRole: 'Research Partner',
		clientCompany: 'CSR Program AgroPlus.ID',
		category: 'Agritech Partner',
		date: '2026-10-28',
		rating: 5,
		summary: 'Dalam upaya mendukung keberlanjutan riset kopi, Agroplus.id memberikan 2 IoT Ferroir untuk menjadi alat pendukung dalam riset biokimia bidang fermentasi',
		image: '',
		published: true
	},
	{
		id: 'wandhe-wonosalam',
		title: 'Implementasi Monitoring Fermentasi Kopi Liberica Terkontrol',
		clientName: 'H. Wandhe',
		clientRole: 'Lead Grower',
		clientCompany: 'Wandhe Family Estate',
		category: 'Estate & Farm',
		date: '2026-10-15',
		rating: 5,
		summary: 'Risiko over-fermentation yang sering merusak karakter Liberica dapat kami antisipasi secara real-time. Konsistensi batch meningkat.',
		image: '',
		published: true
	},
	{
		id: 'boemi-lanjoet-malang',
		title: 'Standarisasi Profil Rasa Kopi Spesialti Berbasis Data Digital',
		clientName: 'Rian Hendrawan',
		clientRole: 'Head of Processing',
		clientCompany: 'Boemi Lanjoet Processor',
		category: 'Coffee Processor',
		date: '2026-09-24',
		rating: 5,
		summary: 'Fermego sangat praktis dipasang di drum fermentasi yang sudah kami miliki tanpa renovasi fasilitas yang mahal.',
		image: '',
		published: true
	},
	{
		id: 'kolektif-lab-surabaya',
		title: 'Integrasi Traceability CoffeeID untuk Kopi Single Origin Eksklusif',
		clientName: 'Sarah Novita',
		clientRole: 'Green Buyer & Q-Grader',
		clientCompany: 'Kolektif Roastery & Lab',
		category: 'Roastery Partner',
		date: '2026-09-02',
		rating: 5,
		summary: 'Konsumen specialty coffee saat ini sangat peduli traceability. Kemudahan scan CoffeeID AgroPlus membuat cerita kebun tersampaikan utuh.',
		image: '',
		published: true
	}
];
