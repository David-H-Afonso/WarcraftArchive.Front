import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface SimResetState {
	daily: string | null // ISO timestamp — when the simulated daily reset fires
	weekly: string | null // ISO timestamp — when the simulated weekly reset fires
	refetchToken: number // incremented each time a reset fires — pages subscribe to re-fetch
}

const initialState: SimResetState = {
	daily: null,
	weekly: null,
	refetchToken: 0,
}

const simResetSlice = createSlice({
	name: 'simReset',
	initialState,
	reducers: {
		setSimulatedReset(
			state,
			action: PayloadAction<{ type: 'daily' | 'weekly'; at: string | null }>
		) {
			if (action.payload.type === 'daily') state.daily = action.payload.at
			else state.weekly = action.payload.at
		},
		incrementRefetchToken(state) {
			state.refetchToken += 1
		},
	},
})

export const { setSimulatedReset, incrementRefetchToken } = simResetSlice.actions
export const simResetReducer = simResetSlice.reducer
