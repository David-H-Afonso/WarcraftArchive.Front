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
		updateUser: (id: string) => `/admin/users/${id}`,
		orphansSummary: '/admin/orphans',
		claimOrphanCharacter: (id: string) => `/admin/orphans/characters/${id}/claim`,
		claimOrphanContent: (id: string) => `/admin/orphans/contents/${id}/claim`,
		deleteOrphanCharacter: (id: string) => `/admin/orphans/characters/${id}`,
		deleteOrphanContent: (id: string) => `/admin/orphans/contents/${id}`,
		deleteOrphanTracking: (id: string) => `/admin/orphans/trackings/${id}`,
		deleteAllOrphans: '/admin/orphans',
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
	data: {
		exportCharacters: '/admin/data/export/characters',
		exportContent: '/admin/data/export/content',
		exportProgress: '/admin/data/export/progress',
		importCharacters: '/admin/data/import/characters',
		importContent: '/admin/data/import/content',
		importProgress: '/admin/data/import/progress',
	},
	reset: {
		daily: '/admin/reset/daily',
		weekly: '/admin/reset/weekly',
	},
}

export type ApiRoutes = typeof apiRoutes
