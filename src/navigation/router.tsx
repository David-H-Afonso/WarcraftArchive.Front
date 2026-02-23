import { createHashRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from '@/components/Auth'
import { AppLayout } from '@/layouts'
import { Login } from '@/components/Auth'
import { Playground } from '@/components/Playground'

export const router = createHashRouter([
	{
		path: '/login',
		element: (
			<PublicRoute>
				<Login />
			</PublicRoute>
		),
	},
	{
		path: '/playground',
		element: (
			<ProtectedRoute>
				<AppLayout>
					<Playground />
				</AppLayout>
			</ProtectedRoute>
		),
	},
	{
		path: '/',
		element: <Navigate to='/playground' replace />,
	},
	{
		path: '*',
		element: <Navigate to='/playground' replace />,
	},
])
