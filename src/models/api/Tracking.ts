// ─── Tracking API types ────────────────────────────────────────────────────────
// Difficulty:  LFR=0, Normal=1, Heroic=2, Mythic=3
// Frequency:   Hourly=0, Daily=1, Weekly=2, Monthly=3
// Status:      NotStarted=0, Pending=1, InProgress=2, LastWeek=3, Finished=4

export interface Tracking {
	id: string
	characterId: string
	characterName: string
	contentId: string
	contentName: string
	expansion: string
	difficulty: number
	frequency: number
	status: number
	comment: string | null
	lastCompletedAt: string | null
	createdAt: string
	updatedAt: string
}

export interface CreateTrackingRequest {
	characterId: string
	contentId: string
	difficulty: number
	frequency: number
	status?: number
	comment?: string | null
	lastCompletedAt?: string | null
}

export interface UpdateTrackingRequest {
	difficulty: number
	frequency: number
	status: number
	comment?: string | null
	lastCompletedAt?: string | null
}

export interface TrackingFilters {
	characterId?: string
	status?: number
	frequency?: number
	expansion?: string
	motive?: number
}
