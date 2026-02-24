import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks'
import './Header.scss'
import { selectCurrentUser, selectIsAdmin } from '@/store/features/auth'
import { logoutUser } from '@/store/features/auth'

export const Header: React.FC = () => {
	const dispatch = useAppDispatch()
	const user = useAppSelector(selectCurrentUser)
	const isAdmin = useAppSelector(selectIsAdmin)

	const handleLogout = () => {
		dispatch(logoutUser())
	}

	return (
		<header className='app-header'>
			<div className='header-content'>
				<span className='header-logo'>⚔️ WarcraftArchive</span>

				<nav className='header-nav'>
					<NavLink
						to='/'
						className={({ isActive }) =>
							`header-nav__tab ${isActive ? 'header-nav__tab--active' : ''}`
						}
						end>
						Progress
					</NavLink>
					<NavLink
						to='/characters'
						className={({ isActive }) =>
							`header-nav__tab ${isActive ? 'header-nav__tab--active' : ''}`
						}>
						Characters
					</NavLink>
					<NavLink
						to='/content'
						className={({ isActive }) =>
							`header-nav__tab ${isActive ? 'header-nav__tab--active' : ''}`
						}>
						Content
					</NavLink>
					{isAdmin && (
						<NavLink
							to='/admin'
							className={({ isActive }) =>
								`header-nav__tab ${isActive ? 'header-nav__tab--active' : ''}`
							}>
							Admin
						</NavLink>
					)}
				</nav>

				<div className='header-user'>
					{user && (
						<>
							<span className='header-username'>
								{user.userName}
								{isAdmin && <span className='header-admin-badge'>admin</span>}
							</span>
							<button className='btn btn-sm btn-outline' onClick={handleLogout}>
								Logout
							</button>
						</>
					)}
				</div>
			</div>
		</header>
	)
}
