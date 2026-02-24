// ─── UserMotive API types ──────────────────────────────────────────────────────

export interface UserMotive {
	id: string
	name: string
	color: string | null
	ownerUserId: string
	createdAt: string
	updatedAt: string
}

export interface CreateUserMotiveRequest {
	name: string
	color?: string | null
}

export interface UpdateUserMotiveRequest {
	name: string
	color?: string | null
}
