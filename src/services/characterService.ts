import { customFetch } from '../utils'
import { apiRoutes } from '../environments'
import type {
	Character,
	CreateCharacterRequest,
	UpdateCharacterRequest,
} from '../models/api/Character'

export const characterService = {
	async getAll(params?: { ownerUserId?: string }): Promise<Character[]> {
		return customFetch<Character[]>(apiRoutes.characters.base, {
			params: params as Record<string, string>,
		})
	},

	async getById(id: string): Promise<Character> {
		return customFetch<Character>(apiRoutes.characters.byId(id))
	},

	async create(req: CreateCharacterRequest): Promise<Character> {
		return customFetch<Character>(apiRoutes.characters.base, {
			method: 'POST',
			body: req,
		})
	},

	async update(id: string, req: UpdateCharacterRequest): Promise<Character> {
		return customFetch<Character>(apiRoutes.characters.byId(id), {
			method: 'PUT',
			body: req,
		})
	},

	async delete(id: string): Promise<void> {
		return customFetch<void>(apiRoutes.characters.byId(id), { method: 'DELETE' })
	},
}
