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
	'Warrior': '#C69B6D',
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

export const WOW_RACE_COLORS: Record<string, string> = {
	// Alliance
	'Human': '#D2B48C',
	'Dwarf': '#B87333',
	'Gnome': '#FFB6C1',
	'Night Elf': '#6A5ACD',
	'Draenei': '#5DADE2',
	'Worgen': '#4B4B4B',
	'Void Elf': '#4B0082',
	'Lightforged Draenei': '#FFD700',
	'Dark Iron Dwarf': '#8B0000',
	'Kul Tiran': '#2F4F4F',
	'Mechagnome': '#9FA8A3',
	// Horde
	'Orc': '#4CAF50',
	'Undead': '#6D6875',
	'Tauren': '#8B4513',
	'Troll': '#1E90FF',
	'Blood Elf': '#C41E3A',
	'Goblin': '#7FFF00',
	'Nightborne': '#7B68EE',
	'Highmountain Tauren': '#A0522D',
	"Mag'har Orc": '#6B4226',
	'Zandalari Troll': '#D4AF37',
	'Vulpera': '#C68642',
	// Neutral
	'Pandaren': '#F5F5F5',
	'Dracthyr': '#2ECC71',
	'Earthen': '#C8B89A',
}

export const WOW_EXPANSIONS = [
	'The Last Titan',
	'Midnight',
	'The War Within',
	'Dragonflight',
	'Shadowlands',
	'Battle for Azeroth',
	'Legion',
	'Warlords of Draenor',
	'Mists of Pandaria',
	'Cataclysm',
	'Wrath of the Lich King',
	'The Burning Crusade',
	'Classic',
] as const

export type WowExpansion = (typeof WOW_EXPANSIONS)[number]

export const WOW_EXPANSION_COLORS: Record<string, string> = {
	'Classic': '#C79C3A',
	'The Burning Crusade': '#1EFF00',
	'Wrath of the Lich King': '#00B4FF',
	'Cataclysm': '#FF7A00',
	'Mists of Pandaria': '#00C853',
	'Warlords of Draenor': '#8B5A2B',
	'Legion': '#00FF96',
	'Battle for Azeroth': '#2E6FFF',
	'Shadowlands': '#4C5EFF',
	'Dragonflight': '#C41E3A',
	'The War Within': '#FF7A00',
	'Midnight': '#6A0DAD',
	'The Last Titan': '#D4AF37',
}

export function getExpansionColor(expansion: string): string {
	return WOW_EXPANSION_COLORS[expansion] ?? '#8890b5'
}

export const WOW_COVENANTS = ['Kyrian', 'Necrolords', 'Night Fae', 'Venthyr'] as const

export type WowCovenant = (typeof WOW_COVENANTS)[number]

// ─── Difficulty ───────────────────────────────────────────────────────────────
// Unified bitmask values matching DifficultyFlags on the backend.
// Used both for Content.allowedDifficulties bitmask AND single Tracking.difficulty.
// LFR=1, Normal=2, Heroic=4, Mythic=8.
export const DIFFICULTIES = [
	{ value: 1, label: 'LFR', color: '#6b8cff' },
	{ value: 2, label: 'Normal', color: '#57c55a' },
	{ value: 4, label: 'Heroic', color: '#e8a44a' },
	{ value: 8, label: 'Mythic', color: '#e86a6a' },
] as const

export function getDifficultyLabel(value: number): string {
	return DIFFICULTIES.find((d) => d.value === value)?.label ?? `Diff${value}`
}

export function getDifficultyColor(value: number): string {
	return DIFFICULTIES.find((d) => d.value === value)?.color ?? '#8890b5'
}

/** Returns the difficulty flag values set in the bitmask. */
export function parseDifficultyBitmask(bitmask: number): number[] {
	return DIFFICULTIES.filter((d) => (bitmask & d.value) !== 0).map((d) => d.value)
}

// ─── Tracking status ─────────────────────────────────────────────────────────
// NotStarted=0, Pending=1, InProgress=2, LastDay=3, LastWeek=4, Finished=5
export const TRACKING_STATUSES = [
	{ value: 0, label: 'Not Started', color: '#8890b5' },
	{ value: 1, label: 'Pending', color: '#e8a44a' },
	{ value: 2, label: 'In Progress', color: '#7c8cff' },
	{ value: 3, label: 'Last Day', color: '#a855f7' },
	{ value: 4, label: 'Last Week', color: '#7c5cbf' },
	{ value: 5, label: 'Finished', color: '#57c55a' },
] as const

export function getStatusLabel(value: number): string {
	return TRACKING_STATUSES.find((s) => s.value === value)?.label ?? `Status${value}`
}

/** @deprecated Status labels are now per-value (LastDay=3, LastWeek=4). Use getStatusLabel() directly. */
export function getStatusLabelForFrequency(status: number, _frequency: number): string {
	return getStatusLabel(status)
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
