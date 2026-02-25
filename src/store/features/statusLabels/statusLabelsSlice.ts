import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Default status labels matching TRACKING_STATUSES in wowConstants.ts
const DEFAULT_LABELS: Record<number, string> = {
	0: 'Not Started',
	1: 'Pending',
	2: 'In Progress',
	3: 'Last Day',
	4: 'Last Week',
	5: 'Finished',
}

interface StatusLabelsState {
	labels: Record<number, string>
}

const initialState: StatusLabelsState = {
	labels: { ...DEFAULT_LABELS },
}

const statusLabelsSlice = createSlice({
	name: 'statusLabels',
	initialState,
	reducers: {
		setStatusLabel(state, action: PayloadAction<{ value: number; label: string }>) {
			const { value, label } = action.payload
			if (label.trim()) {
				state.labels[value] = label.trim()
			}
		},
		resetStatusLabel(state, action: PayloadAction<number>) {
			state.labels[action.payload] = DEFAULT_LABELS[action.payload] ?? String(action.payload)
		},
		resetAllStatusLabels(state) {
			state.labels = { ...DEFAULT_LABELS }
		},
	},
})

export const { setStatusLabel, resetStatusLabel, resetAllStatusLabels } = statusLabelsSlice.actions
export const statusLabelsReducer = statusLabelsSlice.reducer

export const DEFAULT_STATUS_LABELS = DEFAULT_LABELS
