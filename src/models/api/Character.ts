// ─── Character API types ───────────────────────────────────────────────────────

export interface Character {
	id: string
	name: string
	level: number | null
	class: string
	covenant: string | null
	warband: string | null
	ownerUserId: string | null
	ownerUserName: string | null
	createdAt: string
	updatedAt: string
}

export interface CreateCharacterRequest {
	name: string
	level?: number | null
	class: string
	covenant?: string | null
	warband?: string | null
	ownerUserId?: string | null
}

export interface UpdateCharacterRequest {
	name: string
	level?: number | null
	class: string
	covenant?: string | null
	warband?: string | null
	ownerUserId?: string | null
}
