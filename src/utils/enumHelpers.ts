// ─── Enum integer mappings ─────────────────────────────────────────────────────
// These mirror the backend integer enums exactly.

// Difficulty: LFR=0, Normal=1, Heroic=2, Mythic=3
export const DIFFICULTY_LABELS: Record<number, string> = {
	0: 'LFR',
	1: 'Normal',
	2: 'Heroic',
	3: 'Mythic',
}

// Frequency: Hourly=0, Daily=1, Weekly=2, Monthly=3
export const FREQUENCY_LABELS: Record<number, string> = {
	0: 'Hourly',
	1: 'Daily',
	2: 'Weekly',
	3: 'Monthly',
}

// Status: NotStarted=0, Pending=1, InProgress=2, LastWeek=3, Finished=4
export const STATUS_LABELS: Record<number, string> = {
	0: 'Not Started',
	1: 'Pending',
	2: 'In Progress',
	3: 'Last Week',
	4: 'Finished',
}

// DifficultyFlags bitmask: LFR=1, Normal=2, Heroic=4, Mythic=8
export const DIFFICULTY_FLAGS: Array<{ label: string; value: number }> = [
	{ label: 'LFR', value: 1 },
	{ label: 'Normal', value: 2 },
	{ label: 'Heroic', value: 4 },
	{ label: 'Mythic', value: 8 },
]

// MotiveFlags bitmask: Mounts=1, Transmog=2, Reputation=4, Anima=8, Achievement=16
export const MOTIVE_FLAGS: Array<{ label: string; value: number }> = [
	{ label: 'Mounts', value: 1 },
	{ label: 'Transmog', value: 2 },
	{ label: 'Reputation', value: 4 },
	{ label: 'Anima', value: 8 },
	{ label: 'Achievement', value: 16 },
]

/** Convert a bitmask integer to a list of matching labels. */
export function bitmaskToLabels(
	value: number,
	flags: Array<{ label: string; value: number }>
): string[] {
	return flags.filter((f) => (value & f.value) !== 0).map((f) => f.label)
}

/** Convert a list of flag values to a combined bitmask integer. */
export function labelsToBitmask(values: number[]): number {
	return values.reduce((acc, v) => acc | v, 0)
}
