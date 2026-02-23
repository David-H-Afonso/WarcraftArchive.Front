import { customFetch } from '../utils'
import { apiRoutes } from '../environments'
import type { Content, CreateContentRequest, UpdateContentRequest } from '../models/api/Content'

export const contentService = {
	async getAll(params?: { name?: string; expansion?: string }): Promise<Content[]> {
		return customFetch<Content[]>(apiRoutes.contents.base, {
			params: params as Record<string, string>,
		})
	},

	async getById(id: string): Promise<Content> {
		return customFetch<Content>(apiRoutes.contents.byId(id))
	},

	async create(req: CreateContentRequest): Promise<Content> {
		return customFetch<Content>(apiRoutes.contents.base, {
			method: 'POST',
			body: req,
		})
	},

	async update(id: string, req: UpdateContentRequest): Promise<Content> {
		return customFetch<Content>(apiRoutes.contents.byId(id), {
			method: 'PUT',
			body: req,
		})
	},

	async delete(id: string): Promise<void> {
		return customFetch<void>(apiRoutes.contents.byId(id), { method: 'DELETE' })
	},
}
