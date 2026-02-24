// ─── Content API types ─────────────────────────────────────────────────────────
// AllowedDifficulties bitmask: LFR=1, Normal=2, Heroic=4, Mythic=8

import type { UserMotive } from './UserMotive'

export interface Content {
	id: string
	name: string
	expansion: string
	comment: string | null
	allowedDifficulties: number
	motives: UserMotive[]
	createdAt: string
	updatedAt: string
}

export interface CreateContentRequest {
	name: string
	expansion: string
	comment?: string | null
	allowedDifficulties: number
	motiveIds: string[]
}

export interface UpdateContentRequest {
	name: string
	expansion: string
	comment?: string | null
	allowedDifficulties: number
	motiveIds: string[]
}
