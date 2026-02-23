import { customFetch } from '../utils'
import { apiRoutes } from '../environments'
import type {
	Tracking,
	CreateTrackingRequest,
	UpdateTrackingRequest,
	TrackingFilters,
} from '../models/api/Tracking'

export const trackingService = {
	async getAll(filters?: TrackingFilters): Promise<Tracking[]> {
		const params: Record<string, string | number | boolean> = {}
		if (filters) {
			if (filters.characterId !== undefined) params['characterId'] = filters.characterId
			if (filters.status !== undefined) params['status'] = filters.status
			if (filters.frequency !== undefined) params['frequency'] = filters.frequency
			if (filters.expansion !== undefined) params['expansion'] = filters.expansion
			if (filters.motive !== undefined) params['motive'] = filters.motive
		}
		return customFetch<Tracking[]>(apiRoutes.trackings.base, { params })
	},

	async getById(id: string): Promise<Tracking> {
		return customFetch<Tracking>(apiRoutes.trackings.byId(id))
	},

	async create(req: CreateTrackingRequest): Promise<Tracking> {
		return customFetch<Tracking>(apiRoutes.trackings.base, {
			method: 'POST',
			body: req,
		})
	},

	async update(id: string, req: UpdateTrackingRequest): Promise<Tracking> {
		return customFetch<Tracking>(apiRoutes.trackings.byId(id), {
			method: 'PUT',
			body: req,
		})
	},

	async delete(id: string): Promise<void> {
		return customFetch<void>(apiRoutes.trackings.byId(id), { method: 'DELETE' })
	},
}
