import { customFetch } from '../utils'
import { apiRoutes } from '../environments'
import type { WeeklyDashboardResponse } from '../models/api/Dashboard'

export const dashboardService = {
	async getWeekly(): Promise<WeeklyDashboardResponse> {
		return customFetch<WeeklyDashboardResponse>(apiRoutes.dashboard.weekly)
	},
}
