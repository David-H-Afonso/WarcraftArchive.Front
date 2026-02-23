import React, { useState } from 'react'
import { authService } from '@/services'

export const AdminSection: React.FC = () => {
	const [email, setEmail] = useState('')
	const [userName, setUserName] = useState('')
	const [password, setPassword] = useState('')
	const [isAdmin, setIsAdmin] = useState(false)
	const [result, setResult] = useState<unknown>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setResult(null)
		try {
			const user = await authService.createUser({ email, userName, password, isAdmin })
			setResult(user)
			setEmail('')
			setUserName('')
			setPassword('')
			setIsAdmin(false)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='section-body'>
			<form className='inline-form' onSubmit={handleCreate}>
				<div className='form-row'>
					<div className='form-group'>
						<label>Email</label>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='user@example.com'
							required
						/>
					</div>
					<div className='form-group'>
						<label>Username</label>
						<input
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
							placeholder='username'
							required
						/>
					</div>
					<div className='form-group'>
						<label>Password</label>
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='••••••••'
							required
						/>
					</div>
					<div className='form-group form-check'>
						<label>
							<input
								type='checkbox'
								checked={isAdmin}
								onChange={(e) => setIsAdmin(e.target.checked)}
							/>{' '}
							Admin
						</label>
					</div>
				</div>
				<button type='submit' className='btn btn-primary' disabled={loading}>
					{loading ? 'Creating…' : 'Create User'}
				</button>
			</form>

			{error && <p className='result-error'>{error}</p>}
			{result !== null && (
				<pre className='result-json'>
					<code>{JSON.stringify(result, null, 2)}</code>
				</pre>
			)}
		</div>
	)
}
