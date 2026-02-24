import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { RouterProvider } from 'react-router-dom'
import { store, persistor } from './store'
import { initiateAuth } from './store/features/auth'
import { router } from '@/navigation/router'
import '@/assets/styles/index.scss'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate
				loading={null}
				persistor={persistor}
				onBeforeLift={async () => {
					await store.dispatch(initiateAuth())
				}}>
				<RouterProvider router={router} />
			</PersistGate>
		</Provider>
	</StrictMode>
)
