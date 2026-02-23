import React, { useState } from 'react'
import { useAppSelector } from '@/store/hooks/hooks'
import { selectIsAdmin } from '@/store/features/auth'
import { SystemSection } from './sections/SystemSection'
import { AuthSection } from './sections/AuthSection'
import { AdminSection } from './sections/AdminSection'
import { CharactersSection } from './sections/CharactersSection'
import { ContentsSection } from './sections/ContentsSection'
import { TrackingsSection } from './sections/TrackingsSection'
import { DashboardSection } from './sections/DashboardSection'
import './Playground.scss'

interface Section {
	id: string
	title: string
	component: React.ReactNode
	adminOnly?: boolean
}

export const Playground: React.FC = () => {
	const isAdmin = useAppSelector(selectIsAdmin)
	const [open, setOpen] = useState<Record<string, boolean>>({
		system: true,
		auth: false,
		admin: false,
		characters: false,
		contents: false,
		trackings: false,
		dashboard: false,
	})

	const sections: Section[] = [
		{ id: 'system', title: '🖥️ System', component: <SystemSection /> },
		{ id: 'auth', title: '🔑 Auth', component: <AuthSection /> },
		{ id: 'admin', title: '👑 Admin', component: <AdminSection />, adminOnly: true },
		{ id: 'characters', title: '🧝 Characters', component: <CharactersSection /> },
		{ id: 'contents', title: '⚔️ Contents', component: <ContentsSection /> },
		{ id: 'trackings', title: '📋 Trackings', component: <TrackingsSection /> },
		{ id: 'dashboard', title: '📊 Dashboard', component: <DashboardSection /> },
	]

	const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

	return (
		<div className='playground'>
			<h1 className='playground-title'>WarcraftArchive Playground</h1>
			<p className='playground-subtitle'>API explorer – test all endpoints from the browser</p>

			{sections
				.filter((s) => !s.adminOnly || isAdmin)
				.map((s) => (
					<div key={s.id} className={`section-card ${open[s.id] ? 'section-card--open' : ''}`}>
						<button className='section-header' onClick={() => toggle(s.id)}>
							<span>{s.title}</span>
							<span className='section-chevron'>{open[s.id] ? '▲' : '▼'}</span>
						</button>
						{open[s.id] && s.component}
					</div>
				))}
		</div>
	)
}
