import { customFetch } from '@/utils/customFetch'
import { apiRoutes } from '@/environments'

export interface ResetResult {
	affected: number
	message: string
}

export const resetService = {
	triggerDaily(): Promise<ResetResult> {
		return customFetch<ResetResult>(apiRoutes.reset.daily, { method: 'POST' })
	},

	triggerWeekly(): Promise<ResetResult> {
		return customFetch<ResetResult>(apiRoutes.reset.weekly, { method: 'POST' })
	},
}
