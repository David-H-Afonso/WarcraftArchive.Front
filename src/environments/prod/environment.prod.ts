// environment.prod.ts
import { apiRoutes } from '../apiRoutes'

function getApiBaseUrl(): string {
	// Runtime config injected by Docker entrypoint (replaces WARCRAFT_API_URL_PLACEHOLDER)
	// If API_BASE_URL="" (empty string) → use relative paths (nginx proxies to backend)
	// If API_BASE_URL="http://server:2004" → use that host directly
	const runtimeEnv = typeof window !== 'undefined' ? (window as any).ENV : undefined
	if (runtimeEnv !== undefined) {
		const runtimeUrl: string | undefined = runtimeEnv?.VITE_API_BASE_URL
		// Only skip if it's the unsubstituted placeholder (container env var not set at all)
		if (runtimeUrl !== undefined && runtimeUrl !== 'WARCRAFT_API_URL_PLACEHOLDER') {
			return runtimeUrl // '' = same-origin (nginx proxy), or full URL
		}
	}

	// Build-time env var
	if (import.meta.env.VITE_API_BASE_URL) {
		return import.meta.env.VITE_API_BASE_URL
	}

	// Legacy runtime keys
	if (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_URL) {
		return (window as any).ENV.VITE_API_URL
	}
	if (import.meta.env.VITE_API_URL) {
		return import.meta.env.VITE_API_URL as string
	}

	// Fallback: same origin (works if frontend and backend share a host/proxy)
	return ''
}

export const environment = {
	baseUrl: getApiBaseUrl(),
	apiRoutes,
}
