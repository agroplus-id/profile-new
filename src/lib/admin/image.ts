// Perkecil logo ke PNG (mempertahankan transparansi) agar muat di dokumen Firestore (batas 1 MB).
export function resizeLogo(file: Blob, maxSide = 420): Promise<string> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
			const canvas = document.createElement('canvas');
			canvas.width = Math.max(1, Math.round(img.width * scale));
			canvas.height = Math.max(1, Math.round(img.height * scale));
			canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			resolve(canvas.toDataURL('image/png'));
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Gagal membaca gambar'));
		};
		img.src = url;
	});
}
