// ─── Warband API types ─────────────────────────────────────────────────────────

export interface Warband {
	id: string
	name: string
	color: string | null
	ownerUserId: string
	createdAt: string
	updatedAt: string
}

export interface CreateWarbandRequest {
	name: string
	color?: string | null
}

export interface UpdateWarbandRequest {
	name: string
	color?: string | null
}
