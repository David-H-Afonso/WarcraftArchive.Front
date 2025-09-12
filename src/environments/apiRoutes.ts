/**
 * API endpoints configuration
 * Centralized location for all API routes used across the application
 */
export const apiRoutes = {
	/** Example API endpoints */
	example: {
		/** Pokemon metadata endpoint */
		url: '/url/example',
		/** Add more example endpoints here */
		// users: '/api/users',
		// posts: '/api/posts',
	},

	/** Authentication endpoints */
	auth: {
		// login: '/auth/login',
		// logout: '/auth/logout',
		// refresh: '/auth/refresh',
	},

	/** User management endpoints */
	users: {
		// list: '/api/users',
		// profile: '/api/users/profile',
		// update: '/api/users/update',
	},

	/** Add more API route groups as needed */
} as const

/**
 * Type for API routes structure
 * Provides type safety when accessing routes
 */
export type ApiRoutes = typeof apiRoutes
