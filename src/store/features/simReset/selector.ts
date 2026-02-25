import type { RootState } from '../../index'

export const selectSimDailyReset = (state: RootState) => state.simReset.daily
export const selectSimWeeklyReset = (state: RootState) => state.simReset.weekly
export const selectRefetchToken = (state: RootState) => state.simReset.refetchToken
