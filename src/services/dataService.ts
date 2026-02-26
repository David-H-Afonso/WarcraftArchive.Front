import { customFetch } from '@/utils/customFetch'
import { apiRoutes } from '@/environments'

export interface ImportResult {
	imported: number
	duplicated: number
	errored: number
	errors: string[]
}

export interface OrphanCharacter {
	id: string
	name: string
	class: string
	race: string | null
	level: number | null
	createdAt: string
}

export interface OrphanContent {
	id: string
	name: string
	expansion: string
	allowedDifficulties: number
	createdAt: string
}

export interface OrphanTracking {
	id: string
	characterId: string
	characterName: string
	characterOwned: boolean
	contentId: string
	contentName: string
	contentOwned: boolean
	difficulty: number
	createdAt: string
}

export interface OrphansSummary {
	characters: OrphanCharacter[]
	contents: OrphanContent[]
	trackings: OrphanTracking[]
}

function triggerDownload(text: string, filename: string) {
	const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

export const dataService = {
	async exportCharacters(): Promise<void> {
		const text = await customFetch<string>(apiRoutes.data.exportCharacters)
		triggerDownload(text, 'characters.csv')
	},

	async exportContent(): Promise<void> {
		const text = await customFetch<string>(apiRoutes.data.exportContent)
		triggerDownload(text, 'content.csv')
	},

	async exportProgress(): Promise<void> {
		const text = await customFetch<string>(apiRoutes.data.exportProgress)
		triggerDownload(text, 'progress.csv')
	},

	async importCharacters(csvText: string): Promise<ImportResult> {
		return customFetch(apiRoutes.data.importCharacters, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: csvText,
		})
	},

	async importContent(csvText: string): Promise<ImportResult> {
		return customFetch(apiRoutes.data.importContent, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: csvText,
		})
	},

	async importProgress(csvText: string): Promise<ImportResult> {
		return customFetch(apiRoutes.data.importProgress, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: csvText,
		})
	},

	async getOrphans(): Promise<OrphansSummary> {
		return customFetch(apiRoutes.admin.orphansSummary)
	},

	async claimOrphanCharacter(id: string, userId: string): Promise<void> {
		return customFetch(apiRoutes.admin.claimOrphanCharacter(id), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId }),
		})
	},

	async claimOrphanContent(id: string, userId: string): Promise<void> {
		return customFetch(apiRoutes.admin.claimOrphanContent(id), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId }),
		})
	},

	async deleteOrphanCharacter(id: string): Promise<void> {
		return customFetch(apiRoutes.admin.deleteOrphanCharacter(id), { method: 'DELETE' })
	},

	async deleteOrphanContent(id: string): Promise<void> {
		return customFetch(apiRoutes.admin.deleteOrphanContent(id), { method: 'DELETE' })
	},

	async deleteOrphanTracking(id: string): Promise<void> {
		return customFetch(apiRoutes.admin.deleteOrphanTracking(id), { method: 'DELETE' })
	},

	async deleteAllOrphans(): Promise<{
		deletedTrackings: number
		deletedCharacters: number
		deletedContents: number
	}> {
		return customFetch(apiRoutes.admin.deleteAllOrphans, { method: 'DELETE' })
	},
}
