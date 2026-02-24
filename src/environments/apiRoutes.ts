/**
 * API endpoints configuration — WarcraftArchive
 */
export const apiRoutes = {
	health: '/health',
	auth: {
		login: '/auth/login',
		refresh: '/auth/refresh',
		logout: '/auth/logout',
		logoutAll: '/auth/logout-all',
		me: '/auth/me',
	},
	admin: {
		createUser: '/admin/users',
		getUsers: '/admin/users',
	},
	characters: {
		base: '/characters',
		byId: (id: string) => `/characters/${id}`,
	},
	contents: {
		base: '/contents',
		byId: (id: string) => `/contents/${id}`,
	},
	trackings: {
		base: '/trackings',
		byId: (id: string) => `/trackings/${id}`,
	},
	warbands: {
		base: '/warbands',
		byId: (id: string) => `/warbands/${id}`,
	},
	motives: {
		base: '/motives',
		byId: (id: string) => `/motives/${id}`,
	},
	dashboard: {
		weekly: '/dashboard/weekly',
	},
}

export type ApiRoutes = typeof apiRoutes
