import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks'
import { loginUser, selectAuthLoading, selectAuthError, clearError } from '@/store/features/auth'
import './Login.scss'

export const Login: React.FC = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const loading = useAppSelector(selectAuthLoading)
	const error = useAppSelector(selectAuthError)

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		dispatch(clearError())
		const result = await dispatch(loginUser({ email, password }))
		if (loginUser.fulfilled.match(result)) {
			navigate('/playground')
		}
	}

	return (
		<div className='login-page'>
			<div className='login-card'>
				<h1 className='login-title'>⚔️ WarcraftArchive</h1>
				<p className='login-subtitle'>Sign in to continue</p>

				<form className='login-form' onSubmit={handleSubmit}>
					<div className='form-group'>
						<label htmlFor='email'>Email</label>
						<input
							id='email'
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='you@example.com'
							required
							disabled={loading}
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='password'>Password</label>
						<input
							id='password'
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='••••••••'
							required
							disabled={loading}
						/>
					</div>

					{error && <p className='login-error'>{error}</p>}

					<button type='submit' className='btn btn-primary btn-block' disabled={loading}>
						{loading ? 'Signing in…' : 'Sign In'}
					</button>
				</form>
			</div>
		</div>
	)
}
