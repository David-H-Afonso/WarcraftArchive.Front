export interface AuthUser {
	userId: string
	email: string
	userName: string
	isAdmin: boolean
}

export interface AuthState {
	isAuthenticated: boolean
	user: AuthUser | null
	accessToken: string | null
	refreshToken: string | null
	loading: boolean
	error: string | null
}
