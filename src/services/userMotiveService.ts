import { customFetch } from '../utils'
import { apiRoutes } from '../environments'
import type {
	UserMotive,
	CreateUserMotiveRequest,
	UpdateUserMotiveRequest,
} from '../models/api/UserMotive'

export const userMotiveService = {
	async getAll(): Promise<UserMotive[]> {
		return customFetch<UserMotive[]>(apiRoutes.motives.base)
	},

	async getById(id: string): Promise<UserMotive> {
		return customFetch<UserMotive>(apiRoutes.motives.byId(id))
	},

	async create(req: CreateUserMotiveRequest): Promise<UserMotive> {
		return customFetch<UserMotive>(apiRoutes.motives.base, {
			method: 'POST',
			body: req,
		})
	},

	async update(id: string, req: UpdateUserMotiveRequest): Promise<UserMotive> {
		return customFetch<UserMotive>(apiRoutes.motives.byId(id), {
			method: 'PUT',
			body: req,
		})
	},

	async delete(id: string): Promise<void> {
		return customFetch<void>(apiRoutes.motives.byId(id), { method: 'DELETE' })
	},
}
