import { environment } from '../environments'
import { apiRoutes } from '../environments'
import { customFetch } from '../utils'
import type {
	LoginRequest,
	LoginResponse,
	RefreshRequest,
	RefreshResponse,
	MeResponse,
	CreateUserRequest,
	UpdateUserRequest,
	UserDto,
} from '../models/api/Auth'

// login and refresh use raw fetch to avoid circular dependency with customFetch
export const authService = {
	async login(req: LoginRequest): Promise<LoginResponse> {
		const response = await fetch(`${environment.baseUrl}${apiRoutes.auth.login}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req),
		})
		if (!response.ok) {
			const err = await response.json().catch(() => ({ message: response.statusText }))
			throw new Error(err?.message ?? `Login failed: ${response.status}`)
		}
		return response.json()
	},

	async refresh(req: RefreshRequest): Promise<RefreshResponse> {
		const response = await fetch(`${environment.baseUrl}${apiRoutes.auth.refresh}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req),
		})
		if (!response.ok) throw new Error(`Refresh failed: ${response.status}`)
		return response.json()
	},

	async logout(refreshToken: string): Promise<void> {
		await customFetch(apiRoutes.auth.logout, {
			method: 'POST',
			body: { refreshToken },
		})
	},

	async logoutAll(): Promise<void> {
		await customFetch(apiRoutes.auth.logoutAll, { method: 'POST' })
	},

	async me(): Promise<MeResponse> {
		return customFetch<MeResponse>(apiRoutes.auth.me)
	},

	async createUser(req: CreateUserRequest): Promise<UserDto> {
		return customFetch<UserDto>(apiRoutes.admin.createUser, {
			method: 'POST',
			body: req,
		})
	},

	async updateUser(id: string, req: UpdateUserRequest): Promise<UserDto> {
		return customFetch<UserDto>(apiRoutes.admin.updateUser(id), {
			method: 'PUT',
			body: req,
		})
	},

	async getUsers(): Promise<UserDto[]> {
		return customFetch<UserDto[]>(apiRoutes.admin.getUsers)
	},
}
