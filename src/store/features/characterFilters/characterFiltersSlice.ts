import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface CharacterFiltersState {
	filterClass: string | null
	filterWarband: string | null
	filterRace: string | null
	sortBy: string | null
}

const initialState: CharacterFiltersState = {
	filterClass: null,
	filterWarband: null,
	filterRace: null,
	sortBy: 'warband',
}

const characterFiltersSlice = createSlice({
	name: 'characterFilters',
	initialState,
	reducers: {
		setFilterClass(state, action: PayloadAction<string | null>) {
			state.filterClass = action.payload
		},
		setFilterWarband(state, action: PayloadAction<string | null>) {
			state.filterWarband = action.payload
		},
		setFilterRace(state, action: PayloadAction<string | null>) {
			state.filterRace = action.payload
		},
		setSortBy(state, action: PayloadAction<string | null>) {
			state.sortBy = action.payload
		},
	},
})

export const { setFilterClass, setFilterWarband, setFilterRace, setSortBy } =
	characterFiltersSlice.actions
export const characterFiltersReducer = characterFiltersSlice.reducer
