export interface TestimonialItem {
	id: string;
	title: string;
	clientName: string;
	clientRole: string;
	clientCompany: string;
	category: string;
	date: string;
	summary: string;
	image?: string;
	rating?: number;
	published?: boolean;
	html?: string;
}

export const TESTIMONIAL_CATEGORIES = [
	'Estate & Farm',
	'Coffee Processor',
	'Roastery Partner',
	'Agritech Partner'
] as const;

export const defaultTestimonials: TestimonialItem[] = [
	{
		id: 'wandhe-estate-ferroir',
		title: 'Optimalisasi Fermentasi Liberica Wonosalam Melalui Monitoring Terintegrasi Ferroir',
		clientName: 'H. Wandhe',
		clientRole: 'Founder & Lead Grower',
		clientCompany: 'Wandhe Family Estate (Wonosalam)',
		category: 'Estate & Farm',
		date: '2026-01-18',
		rating: 5,
		summary:
			'Dengan sensor dan kontrol presisi Ferroir dari AgroPlus, risiko over-fermentation yang sering merusak karakter Liberica dapat kami antisipasi secara real-time. Konsistensi cup score kami meningkat stabil.',
		image: '',
		published: true,
		html: `<p>Sebagai petani dan pengolah kopi Liberica di dataran tinggi Wonosalam sejak puluhan tahun lalu, tantangan terbesar kami adalah menjaga konsistensi rasa pada setiap musim panen. Liberica memiliki kandungan gula buah yang tinggi sehingga sangat rentan terhadap over-fermentation jika suhu dan tekanan di dalam tangki tidak terpantau.</p>
<h3>Pendekatan Baru Bersama Ferroir</h3>
<p>Kolaborasi kami dengan <strong>AgroPlus.ID</strong> dimulai saat pengujian unit <em>Ferroir</em> pada akhir 2025. Yang paling membedakan adalah kemampuannya membaca dinamika fermentasi secara langsung tanpa harus membuka tangki anaerobik berulang kali. Setiap parameter—mulai dari kurva suhu hingga perkiraan pelepasan gas CO2—terpantau otomatis lewat aplikasi.</p>
<blockquote>"Ferroir bukan sekadar alat otomatisasi, melainkan jembatan antara kearifan lokal prosesor kopi dengan kepastian sains modern."</blockquote>
<h3>Hasil yang Terukur</h3>
<ul>
<li><strong>Stabilitas Cup Quality:</strong> Variasi rasa antar-batch turun lebih dari 35%.</li>
<li><strong>Efisiensi Waktu Kerja:</strong> Pengecekan manual harian berkurang hingga 70%.</li>
<li><strong>Nilai Tambah Paspor Kopi:</strong> Setiap batch kini memiliki data verifikasi digital yang diminati roastery premium.</li>
</ul>`
	},
	{
		id: 'boemi-lanjoet-fermego',
		title: 'Standarisasi Profil Rasa Kopi Spesialti Berbasis Data Fermentasi Digital',
		clientName: 'Rian Hendrawan',
		clientRole: 'Head of Processing & QC',
		clientCompany: 'Boemi Lanjoet Processor (Malang)',
		category: 'Coffee Processor',
		date: '2025-12-14',
		rating: 5,
		summary:
			'AgroPlus memberikan transparansi data yang belum pernah ada sebelumnya di fasilitas kami. Fermego sangat praktis dipasang di drum fermentasi yang sudah kami miliki tanpa renovasi mahal.',
		image: '',
		published: true,
		html: `<p>Di fasilitas Boemi Lanjoet, kami mengolah ribuan kilogram ceri kopi dari berbagai perkebunan mitra di Jawa Timur. Menjaga standar kualitas di volume sebesar ini adalah tantangan logistik dan teknis yang rumit.</p>
<h3>Fleksibilitas Tanpa Merombak Fasilitas</h3>
<p>Solusi <em>Fermego</em> dari AgroPlus sangat sesuai untuk kami karena desainnya yang modular dan fleksibel. Kami dapat memasang sensor pada drum ASA standar kami tanpa perlu mengganti seluruh infrastruktur fermentasi.</p>
<p>Notifikasi pintar saat proses fermentasi mendekati titik kritis memberi tim kami panduan pasti kapan harus menghentikan fermentasi dan memulai proses penjemuran di raised beds.</p>
<blockquote>"Fermego membuat proses fermentasi kami terukur, dapat diulang (repeatable), dan terdokumentasi untuk keperluan audit specialty coffee buyer luar negeri."</blockquote>`
	},
	{
		id: 'kolektif-roastery-traceability',
		title: 'Kepercayaan Konsumen Meningkat Berkat Verifikasi Asal Kopi yang Transparan',
		clientName: 'Sarah Novita',
		clientRole: 'Green Buyer & Q-Grader',
		clientCompany: 'Kolektif Roastery & Lab',
		category: 'Roastery Partner',
		date: '2025-11-20',
		rating: 5,
		summary:
			'Konsumen specialty coffee masa kini menuntut transparansi rantai pasok. Melalui integrasi CoffeeID AgroPlus, kami dapat menyajikan perjalanan biji kopi dari pohon hingga cangkir dengan elegan.',
		image: '',
		published: true,
		html: `<p>Sebagai roastery yang berfokus pada single-origin eksklusif, hubungan kepercayaan antara kami dan pelanggan dibangun atas kejujuran cerita asal biji kopi. Konsumen kami ingin tahu siapa petaninya, bagaimana cerinya difermentasi, dan di ketinggian berapa pohonnya tumbuh.</p>
<h3>CoffeeID: Nilai Jual Nyata untuk Roastery</h3>
<p>Kemitraan kami dengan AgroPlus memungkinkan kami menyematkan kode <strong>CoffeeID</strong> di setiap kemasan edisi terbatas. Pelanggan cukup memasukkan kode kemasan pada web untuk melihat peta interaktif kebun asal, profil prosesor, hingga catatan cupping resmi.</p>
<ul>
<li>Meningkatkan repeat order kopi edisi terbatas hingga 28%.</li>
<li>Membantu barista menjelaskan storytelling kopi kepada pelanggan secara visual.</li>
<li>Memastikan penghargaan setimpal bagi petani karena rekam jejak mereka tercatat permanen.</li>
</ul>`
	}
];

