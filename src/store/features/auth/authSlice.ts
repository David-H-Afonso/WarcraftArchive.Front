import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { authService } from '@/services'
import type { AuthState, AuthUser } from '../../../models/store/AuthState'
import type { LoginRequest, LoginResponse, RefreshResponse } from '../../../models/api/Auth'

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	accessToken: null,
	refreshToken: null,
	loading: false,
	error: null,
}

// ─── Thunks ────────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk<LoginResponse, LoginRequest, { rejectValue: string }>(
	'auth/login',
	async (credentials, { rejectWithValue }) => {
		try {
			return await authService.login(credentials)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Login failed'
			return rejectWithValue(message)
		}
	}
)

export const logoutUser = createAsyncThunk<
	void,
	void,
	{ rejectValue: string; state: { auth: AuthState } }
>('auth/logout', async (_, { getState, rejectWithValue }) => {
	try {
		const refreshToken = getState().auth.refreshToken
		if (refreshToken) {
			await authService.logout(refreshToken)
		}
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Logout failed'
		return rejectWithValue(message)
	}
})

export const initiateAuth = createAsyncThunk<AuthUser | null, void, { state: { auth: AuthState } }>(
	'auth/initiate',
	async (_, { getState }) => {
		const { accessToken } = getState().auth
		if (!accessToken) return null
		try {
			const me = await authService.me()
			return { userId: me.userId, email: me.email, userName: me.userName, isAdmin: me.isAdmin }
		} catch {
			return null
		}
	}
)

// ─── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials(state, action: PayloadAction<LoginResponse>) {
			const { userId, email, userName, isAdmin, accessToken, refreshToken } = action.payload
			state.isAuthenticated = true
			state.user = { userId, email, userName, isAdmin }
			state.accessToken = accessToken
			state.refreshToken = refreshToken
			state.loading = false
			state.error = null
		},
		setTokens(state, action: PayloadAction<RefreshResponse>) {
			state.accessToken = action.payload.accessToken
			state.refreshToken = action.payload.refreshToken
		},
		forceLogout(state) {
			state.isAuthenticated = false
			state.user = null
			state.accessToken = null
			state.refreshToken = null
			state.loading = false
			state.error = null
		},
		clearError(state) {
			state.error = null
		},
	},
	extraReducers: (builder) => {
		// loginUser
		builder.addCase(loginUser.pending, (state) => {
			state.loading = true
			state.error = null
		})
		builder.addCase(loginUser.fulfilled, (state, action) => {
			const { userId, email, userName, isAdmin, accessToken, refreshToken } = action.payload
			state.isAuthenticated = true
			state.user = { userId, email, userName, isAdmin }
			state.accessToken = accessToken
			state.refreshToken = refreshToken
			state.loading = false
			state.error = null
		})
		builder.addCase(loginUser.rejected, (state, action) => {
			state.loading = false
			state.error = action.payload ?? 'Unknown error'
		})

		// logoutUser
		builder.addCase(logoutUser.fulfilled, (state) => {
			state.isAuthenticated = false
			state.user = null
			state.accessToken = null
			state.refreshToken = null
			state.loading = false
			state.error = null
		})

		// initiateAuth
		builder.addCase(initiateAuth.fulfilled, (state, action) => {
			if (action.payload) {
				state.isAuthenticated = true
				state.user = action.payload
			} else {
				state.isAuthenticated = false
				state.user = null
				state.accessToken = null
				state.refreshToken = null
			}
		})
	},
})

export const { setCredentials, setTokens, forceLogout, clearError } = authSlice.actions
export default authSlice.reducer
