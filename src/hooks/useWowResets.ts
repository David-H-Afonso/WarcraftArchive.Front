import { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks'
import {
	setSimulatedReset,
	selectSimDailyReset,
	selectSimWeeklyReset,
	incrementRefetchToken,
} from '@/store/features/simReset'
import { resetService } from '@/services'

// US WoW reset times (UTC):
//   Daily  → every day at 15:00 UTC  (10:00 AM US Central)
//   Weekly → every Tuesday at 15:00 UTC

const RESET_HOUR_UTC = 15 // 15:00 UTC
const WEEKLY_DOW = 2 // Tuesday (0 = Sunday)

function getNextDailyReset(now: Date): Date {
	const next = new Date(now)
	next.setUTCHours(RESET_HOUR_UTC, 0, 0, 0)
	if (next <= now) next.setUTCDate(next.getUTCDate() + 1)
	return next
}

function getNextWeeklyReset(now: Date): Date {
	const next = new Date(now)
	next.setUTCHours(RESET_HOUR_UTC, 0, 0, 0)
	next.setUTCSeconds(0, 0)
	const currentDay = next.getUTCDay()
	let daysUntil = (WEEKLY_DOW - currentDay + 7) % 7
	if (daysUntil === 0 && next <= now) daysUntil = 7
	next.setUTCDate(next.getUTCDate() + daysUntil)
	return next
}

function getPrevDailyReset(now: Date): Date {
	const prev = new Date(now)
	prev.setUTCHours(RESET_HOUR_UTC, 0, 0, 0)
	if (prev > now) prev.setUTCDate(prev.getUTCDate() - 1)
	return prev
}

function getPrevWeeklyReset(now: Date): Date {
	const prev = new Date(now)
	prev.setUTCHours(RESET_HOUR_UTC, 0, 0, 0)
	prev.setUTCSeconds(0, 0)
	const currentDay = prev.getUTCDay()
	let daysSince = (currentDay - WEEKLY_DOW + 7) % 7
	if (daysSince === 0 && prev > now) daysSince = 7
	prev.setUTCDate(prev.getUTCDate() - daysSince)
	return prev
}

function toHMS(ms: number): string {
	const totalSecs = Math.max(0, Math.floor(ms / 1000))
	const d = Math.floor(totalSecs / 86400)
	const h = Math.floor((totalSecs % 86400) / 3600)
	const m = Math.floor((totalSecs % 3600) / 60)
	const s = totalSecs % 60
	if (d > 0) return `${d}d ${h}h ${String(m).padStart(2, '0')}m`
	if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
	return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export interface WowResets {
	daily: string
	weekly: string
}

export function useWowResets(): WowResets {
	const dispatch = useAppDispatch()
	const simDaily = useAppSelector(selectSimDailyReset)
	const simWeekly = useAppSelector(selectSimWeeklyReset)

	// Guard: ensure we only fire the API call once per simulation trigger
	const firedRef = useRef<{ daily: boolean; weekly: boolean }>({ daily: false, weekly: false })
	// Guard for real server resets: track the last reset time we already fired for
	const lastRealResetRef = useRef<{ daily: Date | null; weekly: Date | null }>({
		daily: null,
		weekly: null,
	})

	// Reset the sim guard when a new simulation is set
	useEffect(() => {
		firedRef.current.daily = false
	}, [simDaily])
	useEffect(() => {
		firedRef.current.weekly = false
	}, [simWeekly])

	const [resets, setResets] = useState<WowResets>(() => {
		const now = new Date()
		return {
			daily: toHMS(getNextDailyReset(now).getTime() - now.getTime()),
			weekly: toHMS(getNextWeeklyReset(now).getTime() - now.getTime()),
		}
	})

	useEffect(() => {
		const tick = () => {
			const now = new Date()

			// ── Simulation: fire daily reset API when countdown hits 0 ──────────
			if (simDaily && !firedRef.current.daily && now >= new Date(simDaily)) {
				firedRef.current.daily = true
				resetService
					.triggerDaily()
					.then(() => dispatch(incrementRefetchToken()))
					.catch(console.error)
					.finally(() => dispatch(setSimulatedReset({ type: 'daily', at: null })))
			}

			// ── Simulation: fire weekly reset API when countdown hits 0 ─────────────────
			if (simWeekly && !firedRef.current.weekly && now >= new Date(simWeekly)) {
				firedRef.current.weekly = true
				resetService
					.triggerWeekly()
					.then(() => dispatch(incrementRefetchToken()))
					.catch(console.error)
					.finally(() => dispatch(setSimulatedReset({ type: 'weekly', at: null })))
			}

			// ── Real server reset: detect when the actual daily reset time passes ──
			// If no sim is active, check whether a new real reset has just occurred.
			if (!simDaily) {
				const prevDaily = getPrevDailyReset(now)
				const lastFired = lastRealResetRef.current.daily
				if (lastFired === null || prevDaily > lastFired) {
					// First tick after mount (lastFired===null) just records without firing
					if (lastFired !== null) {
						dispatch(incrementRefetchToken())
					}
					lastRealResetRef.current.daily = prevDaily
				}
			}

			if (!simWeekly) {
				const prevWeekly = getPrevWeeklyReset(now)
				const lastFired = lastRealResetRef.current.weekly
				if (lastFired === null || prevWeekly > lastFired) {
					if (lastFired !== null) {
						dispatch(incrementRefetchToken())
					}
					lastRealResetRef.current.weekly = prevWeekly
				}
			}

			// ── Pick real or simulated next reset time for display ───────────────
			const simDailyDate = simDaily ? new Date(simDaily) : null
			const simWeeklyDate = simWeekly ? new Date(simWeekly) : null

			const nextDaily = simDailyDate && simDailyDate > now ? simDailyDate : getNextDailyReset(now)
			const nextWeekly =
				simWeeklyDate && simWeeklyDate > now ? simWeeklyDate : getNextWeeklyReset(now)

			setResets({
				daily: toHMS(nextDaily.getTime() - now.getTime()),
				weekly: toHMS(nextWeekly.getTime() - now.getTime()),
			})
		}

		tick()
		const id = setInterval(tick, 1000)
		return () => clearInterval(id)
	}, [simDaily, simWeekly, dispatch])

	return resets
}
