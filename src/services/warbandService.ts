import { customFetch } from '../utils'
import { apiRoutes } from '../environments'
import type { Warband, CreateWarbandRequest, UpdateWarbandRequest } from '../models/api/Warband'

export const warbandService = {
	async getAll(): Promise<Warband[]> {
		return customFetch<Warband[]>(apiRoutes.warbands.base)
	},

	async getById(id: string): Promise<Warband> {
		return customFetch<Warband>(apiRoutes.warbands.byId(id))
	},

	async create(req: CreateWarbandRequest): Promise<Warband> {
		return customFetch<Warband>(apiRoutes.warbands.base, {
			method: 'POST',
			body: req,
		})
	},

	async update(id: string, req: UpdateWarbandRequest): Promise<Warband> {
		return customFetch<Warband>(apiRoutes.warbands.byId(id), {
			method: 'PUT',
			body: req,
		})
	},

	async delete(id: string): Promise<void> {
		return customFetch<void>(apiRoutes.warbands.byId(id), { method: 'DELETE' })
	},
}
