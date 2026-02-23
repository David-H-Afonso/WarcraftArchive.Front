import React, { useState } from 'react'
import { environment } from '@/environments'

export const SystemSection: React.FC = () => {
	const [result, setResult] = useState<unknown>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const checkHealth = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await fetch(`${environment.baseUrl}/health`)
			const text = await response.text()
			setResult({ status: response.status, body: text })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='section-body'>
			<button className='btn btn-primary' onClick={checkHealth} disabled={loading}>
				{loading ? 'Checking…' : 'GET /health'}
			</button>
			{error && <p className='result-error'>{error}</p>}
			{result !== null && (
				<pre className='result-json'>
					<code>{JSON.stringify(result, null, 2)}</code>
				</pre>
			)}
		</div>
	)
}
