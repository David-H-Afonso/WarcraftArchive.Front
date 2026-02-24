// ─── World of Warcraft constants ──────────────────────────────────────────────

export const WOW_CLASSES = [
	'Death Knight',
	'Demon Hunter',
	'Druid',
	'Evoker',
	'Hunter',
	'Mage',
	'Monk',
	'Paladin',
	'Priest',
	'Rogue',
	'Shaman',
	'Warlock',
	'Warrior',
] as const

export type WowClass = (typeof WOW_CLASSES)[number]

export const WOW_CLASS_COLORS: Record<string, string> = {
	'Death Knight': '#C41E3A',
	'Demon Hunter': '#A330C9',
	'Druid': '#FF7C0A',
	'Evoker': '#33937F',
	'Hunter': '#AAD372',
	'Mage': '#3FC7EB',
	'Monk': '#00FF98',
	'Paladin': '#F48CBA',
	'Priest': '#FFFFFF',
	'Rogue': '#FFF468',
	'Shaman': '#0070DD',
	'Warlock': '#8788EE',
	'Warrior': '#C69B3A',
}

export const WOW_RACES = [
	// Alliance
	'Human',
	'Dwarf',
	'Night Elf',
	'Gnome',
	'Draenei',
	'Worgen',
	'Void Elf',
	'Lightforged Draenei',
	'Dark Iron Dwarf',
	'Kul Tiran',
	'Mechagnome',
	// Horde
	'Orc',
	'Undead',
	'Tauren',
	'Troll',
	'Blood Elf',
	'Goblin',
	'Nightborne',
	'Highmountain Tauren',
	"Mag'har Orc",
	'Zandalari Troll',
	'Vulpera',
	// Neutral
	'Pandaren',
	'Dracthyr',
	'Earthen',
] as const

export type WowRace = (typeof WOW_RACES)[number]

export const WOW_EXPANSIONS = [
	'The War Within',
	'Dragonflight',
	'Shadowlands',
	'Battle for Azeroth',
	'Legion',
	'Warlords of Draenor',
	'Cataclysm',
	'Wrath of the Lich King',
	'The Burning Crusade',
	'Classic',
] as const

export type WowExpansion = (typeof WOW_EXPANSIONS)[number]

export const WOW_COVENANTS = ['Kyrian', 'Necrolords', 'Night Fae', 'Venthyr'] as const

export type WowCovenant = (typeof WOW_COVENANTS)[number]

// ─── Difficulty ───────────────────────────────────────────────────────────────
// value = backend Difficulty enum (LFR=0, Normal=1, Heroic=2, Mythic=3)
// flag  = bitmask bit used in Content.AllowedDifficulties (LFR=1, Normal=2, Heroic=4, Mythic=8)
export const DIFFICULTIES = [
	{ value: 0, flag: 1, label: 'LFR', color: '#6b8cff' },
	{ value: 1, flag: 2, label: 'Normal', color: '#57c55a' },
	{ value: 2, flag: 4, label: 'Heroic', color: '#e8a44a' },
	{ value: 3, flag: 8, label: 'Mythic', color: '#e86a6a' },
] as const

export function getDifficultyLabel(value: number): string {
	return DIFFICULTIES.find((d) => d.value === value)?.label ?? `Diff${value}`
}

export function getDifficultyColor(value: number): string {
	return DIFFICULTIES.find((d) => d.value === value)?.color ?? '#8890b5'
}

/** Returns the enum values (0-3) of difficulties set in the bitmask. */
export function parseDifficultyBitmask(bitmask: number): number[] {
	return DIFFICULTIES.filter((d) => (bitmask & d.flag) !== 0).map((d) => d.value)
}

// ─── Tracking status ──────────────────────────────────────────────────────────
// NotStarted=0, Pending=1, InProgress=2, LastWeek=3, Finished=4
export const TRACKING_STATUSES = [
	{ value: 0, label: 'Not Started', color: '#8890b5' },
	{ value: 1, label: 'Pending', color: '#e8a44a' },
	{ value: 2, label: 'In Progress', color: '#7c8cff' },
	{ value: 3, label: 'Last Week', color: '#a855f7' },
	{ value: 4, label: 'Finished', color: '#57c55a' },
] as const

export function getStatusLabel(value: number): string {
	return TRACKING_STATUSES.find((s) => s.value === value)?.label ?? `Status${value}`
}

export function getStatusColor(value: number): string {
	return TRACKING_STATUSES.find((s) => s.value === value)?.color ?? '#8890b5'
}

// ─── Frequency ────────────────────────────────────────────────────────────────
// Hourly=0, Daily=1, Weekly=2, Monthly=3
export const TRACKING_FREQUENCIES = [
	{ value: 0, label: 'Hourly' },
	{ value: 1, label: 'Daily' },
	{ value: 2, label: 'Weekly' },
	{ value: 3, label: 'Monthly' },
] as const

export function getFrequencyLabel(value: number): string {
	return TRACKING_FREQUENCIES.find((f) => f.value === value)?.label ?? `Freq${value}`
}
