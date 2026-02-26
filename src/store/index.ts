import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { exampleFeatureReducer } from './features/exampleFeature'
import { authReducer } from './features/auth'
import { simResetReducer } from './features/simReset'
import { statusLabelsReducer } from './features/statusLabels'
import { characterFiltersReducer } from './features/characterFilters'

// Root persist config
const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['auth', 'statusLabels', 'characterFilters'], // simReset is intentionally NOT persisted
}

// Combine reducers
const rootReducer = combineReducers({
	exampleFeature: exampleFeatureReducer,
	auth: authReducer,
	simReset: simResetReducer,
	statusLabels: statusLabelsReducer,
	characterFilters: characterFiltersReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [
					'persist/FLUSH',
					'persist/REHYDRATE',
					'persist/PAUSE',
					'persist/PERSIST',
					'persist/PURGE',
					'persist/REGISTER',
				],
			},
		}),
	devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
