<script lang="ts">
	let orderCode = $state('');
	let email = $state('');
	let phone = $state('');
	let isSubmitting = $state(false);
	let message = $state<string | null>(null);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		message = null;

		setTimeout(() => {
			isSubmitting = false;
			message = `Checking status for order "${orderCode}"...`;
		}, 800);
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

			{#if message}
				<div class="status-message" role="status">
					{message}
				</div>
			{/if}

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
		font-size: 1rem;
		font-weight: 600;
		color: #25330f;
		outline: none;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.form-field input:focus {
		border-color: #55683d;
		box-shadow:
			0 0 0 3px rgba(85, 104, 61, 0.18),
			0 10px 24px rgba(37, 51, 15, 0.08);
	}

	.field-hint {
		margin-top: 6px;
		padding-left: 6px;
		font-size: clamp(0.7rem, 0.8vw, 0.78rem);
		font-weight: 500;
		color: #4a5937;
		opacity: 0.88;
		line-height: 1.35;
	}

	.button-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 8px;
	}

	.track-btn {
		min-width: clamp(240px, 28vw, 330px);
		min-height: clamp(52px, 4.5vw, 60px);
		padding: 0 32px;
		background: #52653b;
		color: #ffffff;
		border: none;
		border-radius: 16px;
		font-size: clamp(1.05rem, 1.2vw, 1.2rem);
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 10px 22px rgba(82, 101, 59, 0.3);
		transition:
			background-color 0.2s ease,
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.track-btn:hover:not(:disabled) {
		background: #445430;
		transform: translateY(-2px);
		box-shadow: 0 14px 28px rgba(82, 101, 59, 0.4);
	}

	.track-btn:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 6px 16px rgba(82, 101, 59, 0.3);
	}

	.track-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.status-message {
		margin-top: 12px;
		padding: 12px clamp(16px, 2vw, 24px);
		border-radius: 12px;
		background: rgba(85, 104, 61, 0.12);
		color: #25330f;
		font-size: 0.92rem;
		font-weight: 600;
	}

	.barcode-note {
		margin-top: 12px;
		color: #25330f;
		font-size: clamp(0.88rem, 1vw, 1.02rem);
		font-weight: 600;
		font-style: italic;
	}

	.barcode-note span {
		font-weight: 700;
	}
</style>
