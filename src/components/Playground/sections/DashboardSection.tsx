import React, { useState } from 'react'
import { dashboardService } from '@/services'
import type { WeeklyDashboardResponse } from '@/models/api/Dashboard'

export const DashboardSection: React.FC = () => {
	const [data, setData] = useState<WeeklyDashboardResponse | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleLoad = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await dashboardService.getWeekly()
			setData(res)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='section-body'>
			<button className='btn btn-primary' onClick={handleLoad} disabled={loading}>
				{loading ? 'Loading…' : 'GET Weekly Dashboard'}
			</button>

			{data && (
				<div className='dashboard-summary'>
					<div className='dashboard-stats'>
						{(
							[
								['Total', data.total],
								['Not Started', data.notStarted],
								['Pending', data.pending],
								['In Progress', data.inProgress],
								['Last Week', data.lastWeek],
								['Finished', data.finished],
							] as [string, number][]
						).map(([label, count]) => (
							<div key={label} className='stat-card'>
								<span className='stat-value'>{count}</span>
								<span className='stat-label'>{label}</span>
							</div>
						))}
					</div>
					<pre className='result-json'>
						<code>{JSON.stringify(data.items, null, 2)}</code>
					</pre>
				</div>
			)}

			{error && <p className='result-error'>{error}</p>}
		</div>
	)
}
