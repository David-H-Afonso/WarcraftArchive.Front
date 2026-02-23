// ─── Content API types ─────────────────────────────────────────────────────────
// AllowedDifficulties bitmask: LFR=1, Normal=2, Heroic=4, Mythic=8
// Motives bitmask: Mounts=1, Transmog=2, Reputation=4, Anima=8, Achievement=16

export interface Content {
	id: string
	name: string
	expansion: string
	comment: string | null
	allowedDifficulties: number
	motives: number
	createdAt: string
	updatedAt: string
}

export interface CreateContentRequest {
	name: string
	expansion: string
	comment?: string | null
	allowedDifficulties: number
	motives: number
}

export interface UpdateContentRequest {
	name: string
	expansion: string
	comment?: string | null
	allowedDifficulties: number
	motives: number
}
