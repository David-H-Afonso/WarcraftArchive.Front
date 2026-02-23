import type { Tracking } from './Tracking'

export interface WeeklyDashboardResponse {
	total: number
	notStarted: number
	pending: number
	inProgress: number
	lastWeek: number
	finished: number
	items: Tracking[]
}
