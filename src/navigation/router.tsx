import { createHashRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from '@/components/Auth'
import { AppLayout } from '@/layouts'
import { Login } from '@/components/Auth'
import { ProgressPage } from '@/components/Progress'
import { CharactersPage } from '@/components/Characters'
import { ContentPage } from '@/components/Content'
import { AdminPage } from '@/components/Admin'

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
		path: '/',
		element: (
			<ProtectedRoute>
				<AppLayout>
					<ProgressPage />
				</AppLayout>
			</ProtectedRoute>
		),
	},
	{
		path: '/characters',
		element: (
			<ProtectedRoute>
				<AppLayout>
					<CharactersPage />
				</AppLayout>
			</ProtectedRoute>
		),
	},
	{
		path: '/content',
		element: (
			<ProtectedRoute>
				<AppLayout>
					<ContentPage />
				</AppLayout>
			</ProtectedRoute>
		),
	},
	{
		path: '/admin',
		element: (
			<ProtectedRoute>
				<AppLayout>
					<AdminPage />
				</AppLayout>
			</ProtectedRoute>
		),
	},
	{
		path: '*',
		element: <Navigate to='/' replace />,
	},
])
