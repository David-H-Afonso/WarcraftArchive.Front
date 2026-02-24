// ─── Character API types ───────────────────────────────────────────────────────

export interface Character {
	id: string
	name: string
	level: number | null
	class: string
	race: string | null
	covenant: string | null
	warbandId: string | null
	warbandName: string | null
	warbandColor: string | null
	ownerUserId: string | null
	ownerUserName: string | null
	createdAt: string
	updatedAt: string
}

export interface CreateCharacterRequest {
	name: string
	level?: number | null
	class: string
	race?: string | null
	covenant?: string | null
	warbandId?: string | null
	ownerUserId?: string | null
}

export interface UpdateCharacterRequest {
	name: string
	level?: number | null
	class: string
	race?: string | null
	covenant?: string | null
	warbandId?: string | null
	ownerUserId?: string | null
}
