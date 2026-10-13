export const toast = $state<{ message: string; error: boolean }>({ message: '', error: false });

let timer: ReturnType<typeof setTimeout> | undefined;

export function notify(message: string, error = false) {
	toast.message = message;
	toast.error = error;
	clearTimeout(timer);
	timer = setTimeout(() => (toast.message = ''), error ? 5000 : 2600);
}
