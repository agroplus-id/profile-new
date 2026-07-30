<script lang="ts">
	import { goto } from '$app/navigation';
	import Swal from 'sweetalert2';

	let orderCode = $state('');
	let email = $state('');
	let phone = $state('');
	let isSubmitting = $state(false);

	const VALID_ORDER_CODE = 'AGP-190626-LBC67WNS67';
	const VALID_EMAIL = 'gabriels@student.ub.ac.id';
	const VALID_PHONE = '08987107687';

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;

		setTimeout(() => {
			isSubmitting = false;

			const inputOrder = orderCode.trim();
			const inputEmail = email.trim().toLowerCase();
			const inputPhone = phone.trim();

			if (
				inputOrder === VALID_ORDER_CODE &&
				inputEmail === VALID_EMAIL &&
				inputPhone === VALID_PHONE
			) {
				Swal.fire({
					icon: 'success',
					title: 'Verification Successful!',
					text: 'Redirecting to Bumi Kopi Passport...',
					timer: 1400,
					showConfirmButton: false,
					confirmButtonColor: '#55683d'
				}).then(() => {
					goto('/bumi-kopi');
				});
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Data Tidak Ditemukan',
					text: 'Kode pesanan, email, atau nomor telepon yang Anda masukkan salah. Silakan periksa kembali data Anda!',
					confirmButtonText: 'Coba Lagi',
					confirmButtonColor: '#55683d'
				});
			}
		}, 400);
	}
</script>

<section class="coffee-id-section" aria-labelledby="coffee-id-title">
	<div class="coffee-id-card">
		<h1 id="coffee-id-title" class="coffee-id-heading">CoffeeID</h1>
		<h2 class="coffee-id-subheading">Track Your Coffee</h2>

		<form class="coffee-id-form" onsubmit={handleSubmit}>
			<div class="form-field">
				<label for="order-code">Order Code</label>
				<input
					id="order-code"
					type="text"
					bind:value={orderCode}
					placeholder=""
					required
					autocomplete="off"
				/>
				<span class="field-hint"
					>You can find this in your order confirmation email or checkout success page.</span
				>
			</div>

			<div class="form-field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder=""
					required
					autocomplete="email"
				/>
				<span class="field-hint">The email address used at checkout.</span>
			</div>

			<div class="form-field">
				<label for="phone">Phone Number</label>
				<input
					id="phone"
					type="tel"
					bind:value={phone}
					placeholder=""
					required
					autocomplete="tel"
				/>
				<span class="field-hint"
					>The phone number of the recipient or the one used at checkout.</span
				>
			</div>

			<div class="button-wrapper">
				<button type="submit" class="track-btn" disabled={isSubmitting}>
					{isSubmitting ? 'Searching...' : 'Track the Beans'}
				</button>
			</div>

			<p class="barcode-note">
				Or scan your barcode on <span>the beloved Coffee Package*</span>
			</p>
		</form>
	</div>
</section>

<style>
	.coffee-id-section {
		padding: clamp(50px, 7vw, 90px) clamp(24px, 5vw, 60px) clamp(60px, 8vw, 110px);
		background: #f0f3f1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.coffee-id-card {
		width: 100%;
		max-width: 580px;
		text-align: center;
	}

	.coffee-id-heading {
		margin: 0;
		color: #55683d;
		font-size: clamp(3.4rem, 6.5vw, 5.5rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.01em;
	}

	.coffee-id-subheading {
		margin: 8px 0 clamp(32px, 4vw, 44px);
		color: #25330f;
		font-size: clamp(1.6rem, 2.6vw, 2.4rem);
		font-weight: 800;
		line-height: 1.1;
	}

	.coffee-id-form {
		display: flex;
		flex-direction: column;
		gap: clamp(20px, 2.5vw, 26px);
		width: 100%;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		text-align: left;
	}

	.form-field label {
		font-size: clamp(0.95rem, 1.1vw, 1.08rem);
		font-weight: 800;
		color: #25330f;
		margin-bottom: 8px;
		padding-left: 2px;
	}

	.form-field input {
		width: 100%;
		height: clamp(50px, 4.2vw, 58px);
		padding: 0 24px;
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.04);
		border-radius: 999px;
		box-shadow:
			0 10px 24px rgba(37, 51, 15, 0.06),
			inset 0 1px 2px rgba(0, 0, 0, 0.02);
		font-family: inherit;
		font-size: clamp(0.95rem, 1.1vw, 1.05rem);
		color: #25330f;
		outline: none;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.form-field input:focus {
		border-color: #55683d;
		box-shadow:
			0 10px 24px rgba(37, 51, 15, 0.12),
			0 0 0 3px rgba(85, 104, 61, 0.15);
	}

	.field-hint {
		margin-top: 8px;
		font-size: clamp(0.72rem, 0.85vw, 0.88rem);
		color: #728753;
		font-weight: 500;
		line-height: 1.35;
		padding-left: 2px;
	}

	.button-wrapper {
		margin-top: clamp(12px, 2vw, 20px);
	}

	.track-btn {
		width: 100%;
		height: clamp(52px, 4.5vw, 60px);
		background: #55683d;
		color: #ffffff;
		border: none;
		border-radius: 999px;
		font-family: inherit;
		font-size: clamp(1rem, 1.2vw, 1.18rem);
		font-weight: 800;
		cursor: pointer;
		box-shadow: 0 12px 28px rgba(85, 104, 61, 0.25);
		transition:
			background 0.2s ease,
			transform 0.15s ease,
			box-shadow 0.2s ease;
	}

	.track-btn:hover:not(:disabled) {
		background: #3e4e2a;
		transform: translateY(-2px);
		box-shadow: 0 16px 32px rgba(85, 104, 61, 0.35);
	}

	.track-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.track-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.barcode-note {
		margin-top: clamp(16px, 2.5vw, 24px);
		font-size: clamp(0.85rem, 1vw, 1.02rem);
		color: #728753;
		font-weight: 500;
	}

	.barcode-note span {
		color: #25330f;
		font-weight: 700;
	}

	@media (max-width: 480px) {
		.coffee-id-card {
			padding: 0;
		}
	}
</style>
