import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks/hooks'
import { selectIsAuthenticated } from '@/store/features/auth'

interface PublicRouteProps {
	children: React.ReactNode
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
	const isAuthenticated = useAppSelector(selectIsAuthenticated)

	if (isAuthenticated) {
		return <Navigate to='/' replace />
	}

	return <>{children}</>
}
