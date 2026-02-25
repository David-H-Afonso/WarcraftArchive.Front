import { customFetch } from '@/utils/customFetch'
import { apiRoutes } from '@/environments'

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

	async importCharacters(csvText: string): Promise<{ imported: number }> {
		return customFetch(apiRoutes.data.importCharacters, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: csvText,
		})
	},

	async importContent(csvText: string): Promise<{ imported: number }> {
		return customFetch(apiRoutes.data.importContent, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: csvText,
		})
	},

	async importProgress(csvText: string): Promise<{ imported: number; skipped: number }> {
		return customFetch(apiRoutes.data.importProgress, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: csvText,
		})
	},
}
