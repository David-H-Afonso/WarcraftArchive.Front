import { useState, useEffect } from 'react'

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
			setResets({
				daily: toHMS(getNextDailyReset(now).getTime() - now.getTime()),
				weekly: toHMS(getNextWeeklyReset(now).getTime() - now.getTime()),
			})
		}
		const id = setInterval(tick, 1000)
		return () => clearInterval(id)
	}, [])

	return resets
}
