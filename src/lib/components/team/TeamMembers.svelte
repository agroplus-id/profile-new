<script lang="ts">
	import { leadershipTeam, advisors, teamMembers, type TeamMember } from '$lib/data/team';
	import { fadeUp, staggerUp, slideDown, fadeScale, floatLoop } from '$lib/motion';
</script>

<section class="team-section" aria-label="Our Team Members">
	<div class="corner tl" aria-hidden="true">+</div>
	<div class="corner tr" aria-hidden="true">+</div>

	<div class="team-container">
		<!-- Leadership Team -->
		<div class="team-group">
			<h2 use:fadeUp class="group-title">Leadership Team</h2>
			<div use:staggerUp class="members-grid">
				{#each leadershipTeam as member}
					<div class="member-card">
						<div class="photo-box">
							<img src={member.image} alt={member.name} />
						</div>
						<h3 class="member-name">{member.name}</h3>
						{#if member.role}
							<p class="member-role">{member.role}</p>
						{/if}
						<div class="member-socials">
							{#if member.linkedin}
								<a href={member.linkedin} aria-label="{member.name} LinkedIn">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="#849962" xmlns="http://www.w3.org/2000/svg">
										<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
									</svg>
								</a>
							{/if}
							{#if member.instagram}
								<a href={member.instagram} aria-label="{member.name} Instagram">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="#849962" xmlns="http://www.w3.org/2000/svg">
										<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
									</svg>
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<hr class="section-divider" />

		<!-- Advisors -->
		<div class="team-group">
			<h2 use:fadeUp class="group-title">Advisors</h2>
			<div use:staggerUp class="members-grid">
				{#each advisors as member}
					<div class="member-card">
						<div class="photo-box">
							<img src={member.image} alt={member.name} />
						</div>
						<h3 class="member-name">{member.name}</h3>
						{#if member.role}
							<p class="member-role">{member.role}</p>
						{/if}
						<div class="member-socials">
							{#if member.linkedin}
								<a href={member.linkedin} aria-label="{member.name} LinkedIn">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="#849962" xmlns="http://www.w3.org/2000/svg">
										<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
									</svg>
								</a>
							{/if}
							{#if member.instagram}
								<a href={member.instagram} aria-label="{member.name} Instagram">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="#849962" xmlns="http://www.w3.org/2000/svg">
										<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
									</svg>
								</a>
							{/if}
							{#if member.scholar}
								<a href={member.scholar} aria-label="{member.name} Scholar">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="#849962" xmlns="http://www.w3.org/2000/svg">
										<path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4.13C5 19.34 8.13 21 12 21s7-1.66 7-3.69v-4.13l-7 3.82-7-3.82z"/>
									</svg>
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<hr class="section-divider" />

		<!-- Team -->
		<div class="team-group">
			<h2 use:fadeUp class="group-title">Team</h2>
			<div use:staggerUp class="members-grid">
				{#each teamMembers as member}
					<div class="member-card">
						<div class="photo-box">
							<img src={member.image} alt={member.name} />
						</div>
						<h3 class="member-name">{member.name}</h3>
						{#if member.role}
							<p class="member-role">{member.role}</p>
						{/if}
						<div class="member-socials">
							{#if member.linkedin}
								<a href={member.linkedin} aria-label="{member.name} LinkedIn">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="#849962" xmlns="http://www.w3.org/2000/svg">
										<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
									</svg>
								</a>
							{/if}
							{#if member.instagram}
								<a href={member.instagram} aria-label="{member.name} Instagram">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="#849962" xmlns="http://www.w3.org/2000/svg">
										<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
									</svg>
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.team-section {
		position: relative;
		background: #f0f3f1;
		padding: clamp(20px, 4vw, 50px) clamp(28px, 9vw, 140px) clamp(70px, 10vw, 130px);
	}

	.corner {
		position: absolute;
		color: #849962;
		font-size: 1.25rem;
		line-height: 1;
		font-weight: 600;
		pointer-events: none;
	}

	.tl {
		top: clamp(10px, 2vw, 24px);
		left: clamp(20px, 3vw, 44px);
	}
	.tr {
		top: clamp(10px, 2vw, 24px);
		right: clamp(20px, 3vw, 44px);
	}

	.team-container {
		max-width: 1140px;
		margin: 0 auto;
	}

	.team-group {
		margin-bottom: clamp(50px, 7vw, 90px);
	}

	.group-title {
		margin: 0 0 clamp(32px, 5vw, 54px);
		color: #45552d;
		font-size: clamp(2.4rem, 4.2vw, 3.8rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.02em;
	}

	.section-divider {
		border: 0;
		border-top: 1px solid rgba(69, 85, 45, 0.25);
		margin: clamp(40px, 6vw, 76px) 0;
	}

	.members-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: clamp(36px, 5vw, 68px) clamp(28px, 4vw, 52px);
	}

	.member-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.photo-box {
		width: 100%;
		aspect-ratio: 1 / 1;
		background: #d9d9d9;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 16px;
	}

	.photo-box img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
	}

	.member-name {
		margin: 0 0 4px;
		color: #25330f;
		font-size: clamp(1.05rem, 1.35vw, 1.28rem);
		font-weight: 800;
		line-height: 1.15;
	}

	.member-role {
		margin: 0 0 10px;
		color: #849962;
		font-size: clamp(0.85rem, 1vw, 1.02rem);
		font-weight: 700;
		line-height: 1.25;
	}

	.member-socials {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: auto;
	}

	.member-socials a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		transition: transform 0.15s ease;
	}

	.member-socials a:hover {
		transform: translateY(-2px);
	}

	@media (max-width: 900px) {
		.members-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 580px) {
		.members-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
