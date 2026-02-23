import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks'
import {
	selectCurrentUser,
	selectAccessToken,
	selectRefreshToken,
	logoutUser,
	setTokens,
	forceLogout,
} from '@/store/features/auth'
import { authService } from '@/services'

export const AuthSection: React.FC = () => {
	const dispatch = useAppDispatch()
	const user = useAppSelector(selectCurrentUser)
	const accessToken = useAppSelector(selectAccessToken)
	const refreshToken = useAppSelector(selectRefreshToken)

	const [result, setResult] = useState<unknown>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<string | null>(null)

	const run = async (key: string, fn: () => Promise<unknown>) => {
		setLoading(key)
		setError(null)
		setResult(null)
		try {
			const res = await fn()
			setResult(res ?? { ok: true })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error')
		} finally {
			setLoading(null)
		}
	}

	const handleMe = () => run('me', () => authService.me())

	const handleRefresh = () =>
		run('refresh', async () => {
			if (!refreshToken) throw new Error('No refresh token')
			const tokens = await authService.refresh({ refreshToken })
			dispatch(setTokens(tokens))
			return tokens
		})

	const handleLogout = () =>
		run('logout', async () => {
			await dispatch(logoutUser())
		})

	const handleLogoutAll = () =>
		run('logoutAll', async () => {
			await authService.logoutAll()
			dispatch(forceLogout())
		})

	return (
		<div className='section-body'>
			<div className='token-display'>
				<p>
					<strong>User:</strong> {user?.userName ?? '—'} | <strong>Admin:</strong>{' '}
					{user?.isAdmin ? 'Yes' : 'No'}
				</p>
				<p>
					<strong>Access token:</strong>{' '}
					<span className='token-preview'>
						{accessToken ? `${accessToken.slice(0, 30)}…` : '—'}
					</span>
				</p>
				<p>
					<strong>Refresh token:</strong>{' '}
					<span className='token-preview'>
						{refreshToken ? `${refreshToken.slice(0, 30)}…` : '—'}
					</span>
				</p>
			</div>

			<div className='btn-row'>
				<button className='btn btn-secondary' onClick={handleMe} disabled={!!loading}>
					{loading === 'me' ? '…' : 'GET /auth/me'}
				</button>
				<button className='btn btn-secondary' onClick={handleRefresh} disabled={!!loading}>
					{loading === 'refresh' ? '…' : 'POST /auth/refresh'}
				</button>
				<button className='btn btn-warning' onClick={handleLogout} disabled={!!loading}>
					{loading === 'logout' ? '…' : 'POST /auth/logout'}
				</button>
				<button className='btn btn-danger' onClick={handleLogoutAll} disabled={!!loading}>
					{loading === 'logoutAll' ? '…' : 'POST /auth/logout-all'}
				</button>
			</div>

			{error && <p className='result-error'>{error}</p>}
			{result !== null && (
				<pre className='result-json'>
					<code>{JSON.stringify(result, null, 2)}</code>
				</pre>
			)}
		</div>
	)
}
