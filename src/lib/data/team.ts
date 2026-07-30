import gabriel from '$lib/assets/images/team/gabriel.svg';
import muhammad from '$lib/assets/images/team/muhammad.svg';
import rusdi from '$lib/assets/images/team/rusdi.svg';
import nabiel from '$lib/assets/images/team/nabiel.svg';
import marsel from '$lib/assets/images/team/marsel.svg';

import drmochamad from '$lib/assets/images/team/drmochamad.svg';
import yuniar from '$lib/assets/images/team/yuniar.svg';
import inggang from '$lib/assets/images/team/inggang.svg';
import shobari from '$lib/assets/images/team/shobari.svg';
import ayudha from '$lib/assets/images/team/ayudha.svg';

import khaelano from '$lib/assets/images/team/khaelano.svg';
import akmal from '$lib/assets/images/team/akmal.svg';
import filzah from '$lib/assets/images/team/filzah.svg';
import jenar from '$lib/assets/images/team/jenar.svg';
import george from '$lib/assets/images/team/george.svg';
import tessya from '$lib/assets/images/team/tessya.svg';
import salma from '$lib/assets/images/team/salma.svg';

export interface TeamMember {
	name: string;
	role?: string;
	image: string;
	linkedin?: string;
	instagram?: string;
	scholar?: string;
}

export const leadershipTeam: TeamMember[] = [
	{
		name: 'Gabriel Salindeho',
		role: 'Founder, Chief Executive Officer',
		image: gabriel,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Muhammad Rizky Alfiansyah',
		role: 'Co-Founder, Chief Finance Officer',
		image: muhammad,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Rusdi Alifia Zahwa',
		role: 'Chief Operational Officer',
		image: rusdi,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Nabiel Tatra Edi Firdaus',
		role: 'Co-Founder, Data Analyst',
		image: nabiel,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Marsel Sampurna',
		role: 'Co-Founder, Secretary',
		image: marsel,
		linkedin: '#',
		instagram: '#'
	}
];

export const advisors: TeamMember[] = [
	{
		name: 'Dr. Mochammad Syamsul Hadi',
		image: drmochamad,
		linkedin: '#',
		instagram: '#',
		scholar: '#'
	},
	{
		name: 'Yuniar Ponco Prananto',
		image: yuniar,
		linkedin: '#',
		instagram: '#',
		scholar: '#'
	},
	{
		name: 'Inggang Perwangsa Nuralam',
		image: inggang,
		linkedin: '#',
		instagram: '#',
		scholar: '#'
	},
	{
		name: 'Shobari Karim',
		image: shobari,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Ayudha Pradhana',
		image: ayudha,
		linkedin: '#',
		instagram: '#'
	}
];

export const teamMembers: TeamMember[] = [
	{
		name: 'Khaelano Abroor Maulana',
		role: 'Backend & App Developer',
		image: khaelano,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Akmal Fadlullah',
		role: 'Backend & App Developer',
		image: akmal,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Filzah Mufidah',
		role: 'Web Developer',
		image: filzah,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Jenar Mahes Aditia',
		role: 'Legal',
		image: jenar,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'George Richie Matthew',
		role: 'Content & Communications',
		image: george,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Tessya Amala Anugrah',
		role: 'Public Relations',
		image: tessya,
		linkedin: '#',
		instagram: '#'
	},
	{
		name: 'Salma Sulistyo Putri',
		role: 'Graphic Design',
		image: salma,
		linkedin: '#',
		instagram: '#'
	}
];
