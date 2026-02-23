import { customFetch } from '@/utils'
import { environment } from '@/environments'

// Legacy example service – kept for template compatibility, not used by WarcraftArchive.
export interface ExampleData {
	[key: string]: unknown
}

export async function getExampleService(): Promise<ExampleData> {
	return customFetch<ExampleData>(`${environment.baseUrl}/example`, {
		headers: { Accept: 'application/json' },
	})
}
