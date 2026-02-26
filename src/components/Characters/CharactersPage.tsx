import React, { useState, useEffect, useCallback } from 'react'
import { characterService, warbandService } from '@/services'
import type {
	Character,
	CreateCharacterRequest,
	UpdateCharacterRequest,
} from '@/models/api/Character'
import type { Warband } from '@/models/api/Warband'
import { Modal } from '@/components/elements/Modal/Modal'
import { ConfirmDialog } from '@/components/elements/ConfirmDialog/ConfirmDialog'
import { SearchableSelect } from '@/components/elements/SearchableSelect/SearchableSelect'
import { TagBadge } from '@/components/elements/TagBadge/TagBadge'
import {
	WOW_CLASSES,
	WOW_CLASS_COLORS,
	WOW_RACES,
	WOW_RACE_COLORS,
	WOW_COVENANTS,
	WOW_COVENANT_COLORS,
} from '@/utils/wowConstants'
import type { WowCovenant } from '@/utils/wowConstants'
import type { SelectOption } from '@/components/elements/SearchableSelect/SearchableSelect'
import './CharactersPage.scss'

// ─── Character form modal ─────────────────────────────────────────────────────
interface CharacterFormProps {
	open: boolean
	character: Character | null
	warbands: Warband[]
	onSave: () => void
	onClose: () => void
}

const CharacterForm: React.FC<CharacterFormProps> = ({
	open,
	character,
	warbands,
	onSave,
	onClose,
}) => {
	const blank: CreateCharacterRequest = {
		name: '',
		level: null,
		class: '',
		race: null,
		covenant: null,
		warbandId: null,
		ownerUserId: null,
	}

	const [form, setForm] = useState<CreateCharacterRequest>(blank)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (character) {
			setForm({
				name: character.name,
				level: character.level,
				class: character.class,
				race: character.race,
				covenant: character.covenant,
				warbandId: character.warbandId,
				ownerUserId: character.ownerUserId,
			})
		} else {
			setForm(blank)
		}
		setError(null)
	}, [character, open])

	const classOptions: SelectOption[] = WOW_CLASSES.map((c) => ({
		value: c,
		label: c,
		color: WOW_CLASS_COLORS[c],
	}))

	const raceOptions: SelectOption[] = WOW_RACES.map((r) => ({
		value: r,
		label: r,
		color: WOW_RACE_COLORS[r],
	}))

	const covenantOptions: SelectOption[] = WOW_COVENANTS.map((c) => ({
		value: c,
		label: c,
		color: WOW_COVENANT_COLORS[c],
	}))

	const warbandOptions: SelectOption[] = warbands.map((w) => ({
		value: w.id,
		label: w.name,
		color: w.color ?? undefined,
	}))

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!form.class) {
			setError('Class is required')
			return
		}
		setSaving(true)
		setError(null)
		try {
			const req: CreateCharacterRequest = {
				...form,
				level: form.level ? Number(form.level) : null,
			}
			if (character) {
				await characterService.update(character.id, req as UpdateCharacterRequest)
			} else {
				await characterService.create(req)
			}
			onSave()
			onClose()
		} catch (e: unknown) {
			setError((e as Error).message ?? 'Failed to save character')
		} finally {
			setSaving(false)
		}
	}

	return (
		<Modal
			open={open}
			title={character ? `Edit ${character.name}` : 'New Character'}
			onClose={onClose}
			width='520px'>
			<form onSubmit={handleSubmit} className='char-form'>
				<div className='char-form__grid'>
					<div className='form-group'>
						<label>Name *</label>
						<input
							type='text'
							required
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>
					<div className='form-group'>
						<label>Level (1–90)</label>
						<input
							type='number'
							min={1}
							max={90}
							value={form.level ?? ''}
							onChange={(e) => {
								const v = e.target.value === '' ? null : Number(e.target.value)
								setForm({ ...form, level: v })
							}}
						/>
					</div>
					<div className='form-group'>
						<label>Class *</label>
						<SearchableSelect
							options={classOptions}
							value={form.class || null}
							onChange={(v) => setForm({ ...form, class: v ?? '' })}
							placeholder='Select class...'
							clearable={false}
						/>
					</div>
					<div className='form-group'>
						<label>Race</label>
						<SearchableSelect
							options={raceOptions}
							value={form.race ?? null}
							onChange={(v) => setForm({ ...form, race: v })}
							placeholder='Select race...'
						/>
					</div>
					<div className='form-group'>
						<label>Covenant</label>
						<SearchableSelect
							options={covenantOptions}
							value={form.covenant ?? null}
							onChange={(v) => setForm({ ...form, covenant: v })}
							placeholder='Select covenant...'
						/>
					</div>
					<div className='form-group'>
						<label>Warband</label>
						<SearchableSelect
							options={warbandOptions}
							value={form.warbandId ?? null}
							onChange={(v) => setForm({ ...form, warbandId: v })}
							placeholder='Select warband...'
						/>
					</div>
				</div>
				{error && <p className='char-form__error'>{error}</p>}
				<div className='char-form__actions'>
					<button type='button' className='btn btn-secondary btn-sm' onClick={onClose}>
						Cancel
					</button>
					<button type='submit' className='btn btn-primary btn-sm' disabled={saving}>
						{saving ? 'Saving...' : 'Save'}
					</button>
				</div>
			</form>
		</Modal>
	)
}

// ─── Character card ───────────────────────────────────────────────────────────
interface CharacterCardProps {
	character: Character
	onEdit: (c: Character) => void
	onDelete: (c: Character) => void
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onEdit, onDelete }) => {
	const classColor = WOW_CLASS_COLORS[character.class] ?? '#7c8cff'
	const raceColor = WOW_RACE_COLORS[character.race ?? ''] ?? undefined

	return (
		<div className='char-card'>
			<div className='char-card__class-bar' style={{ background: classColor }} />
			<div className='char-card__body'>
				<div className='char-card__header'>
					<span className='char-card__name'>{character.name}</span>
					{character.level && <span className='char-card__level'>Lv {character.level}</span>}
				</div>
				<div className='char-card__tags'>
					{character.class && <TagBadge label={character.class} color={classColor} size='sm' />}
					{character.race && <TagBadge label={character.race} color={raceColor} size='sm' />}
					{character.covenant && (
						<TagBadge
							label={character.covenant}
							color={WOW_COVENANT_COLORS[character.covenant as WowCovenant] ?? '#a855f7'}
							size='sm'
						/>
					)}
					{character.warbandName && (
						<TagBadge
							label={character.warbandName}
							color={character.warbandColor ?? undefined}
							size='sm'
						/>
					)}
				</div>
			</div>
			<div className='char-card__actions'>
				<button className='btn btn-outline btn-xs' onClick={() => onEdit(character)}>
					Edit
				</button>
				<button className='btn btn-danger btn-xs' onClick={() => onDelete(character)}>
					Del
				</button>
			</div>
		</div>
	)
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const CharactersPage: React.FC = () => {
	const [characters, setCharacters] = useState<Character[]>([])
	const [warbands, setWarbands] = useState<Warband[]>([])
	const [loading, setLoading] = useState(true)
	const [editTarget, setEditTarget] = useState<Character | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<Character | null>(null)
	const [filterClass, setFilterClass] = useState<string | null>(null)
	const [filterWarband, setFilterWarband] = useState<string | null>(null)
	const [filterRace, setFilterRace] = useState<string | null>(null)
	const [sortBy, setSortBy] = useState<string | null>(null)

	const load = useCallback(async () => {
		try {
			setLoading(true)
			const [chars, bands] = await Promise.all([characterService.getAll(), warbandService.getAll()])
			setCharacters(Array.isArray(chars) ? chars : [])
			setWarbands(Array.isArray(bands) ? bands : [])
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	const openCreate = () => {
		setEditTarget(null)
		setShowForm(true)
	}

	const openEdit = (c: Character) => {
		setEditTarget(c)
		setShowForm(true)
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		try {
			await characterService.delete(deleteTarget.id)
			setDeleteTarget(null)
			load()
		} catch (e) {
			console.error(e)
		}
	}

	const classFilterOptions: SelectOption[] = WOW_CLASSES.map((c) => ({
		value: c,
		label: c,
		color: WOW_CLASS_COLORS[c],
	}))

	const raceFilterOptions: SelectOption[] = WOW_RACES.map((r) => ({
		value: r,
		label: r,
		color: WOW_RACE_COLORS[r],
	}))

	const warbandFilterOptions: SelectOption[] = warbands.map((w) => ({
		value: w.id,
		label: w.name,
		color: w.color ?? undefined,
	}))

	const sortOptions: SelectOption[] = [
		{ value: 'warband', label: 'Warband' },
		{ value: 'class', label: 'Class' },
		{ value: 'race', label: 'Race' },
		{ value: 'level', label: 'Level' },
	]

	let displayed = characters
	if (filterClass) displayed = displayed.filter((c) => c.class === filterClass)
	if (filterWarband) displayed = displayed.filter((c) => c.warbandId === filterWarband)
	if (filterRace) displayed = displayed.filter((c) => c.race === filterRace)
	if (sortBy) {
		displayed = [...displayed].sort((a, b) => {
			switch (sortBy) {
				case 'warband':
					return (a.warbandName ?? '').localeCompare(b.warbandName ?? '')
				case 'class':
					return a.class.localeCompare(b.class)
				case 'race':
					return (a.race ?? '').localeCompare(b.race ?? '')
				case 'level':
					return (b.level ?? 0) - (a.level ?? 0)
				default:
					return 0
			}
		})
	}

	return (
		<div className='characters-page'>
			<div className='characters-page__header'>
				<h1 className='characters-page__title'>Characters</h1>
				<div className='characters-page__toolbar'>
					<div style={{ width: '180px' }}>
						<SearchableSelect
							options={classFilterOptions}
							value={filterClass}
							onChange={setFilterClass}
							placeholder='Filter by class...'
						/>
					</div>
					<div style={{ width: '160px' }}>
						<SearchableSelect
							options={raceFilterOptions}
							value={filterRace}
							onChange={setFilterRace}
							placeholder='Filter by race...'
						/>
					</div>
					<div style={{ width: '170px' }}>
						<SearchableSelect
							options={warbandFilterOptions}
							value={filterWarband}
							onChange={setFilterWarband}
							placeholder='Filter by warband...'
						/>
					</div>
					<div style={{ width: '150px' }}>
						<SearchableSelect
							options={sortOptions}
							value={sortBy}
							onChange={setSortBy}
							placeholder='Sort by...'
						/>
					</div>
					<button className='btn btn-primary btn-sm' onClick={openCreate}>
						+ New Character
					</button>
				</div>
			</div>

			{loading ? (
				<p className='characters-page__empty'>Loading...</p>
			) : displayed.length === 0 ? (
				<p className='characters-page__empty'>No characters found.</p>
			) : (
				<div className='characters-grid'>
					{displayed.map((c) => (
						<CharacterCard key={c.id} character={c} onEdit={openEdit} onDelete={setDeleteTarget} />
					))}
				</div>
			)}

			<CharacterForm
				open={showForm}
				character={editTarget}
				warbands={warbands}
				onSave={load}
				onClose={() => setShowForm(false)}
			/>

			<ConfirmDialog
				open={!!deleteTarget}
				message={`Delete character "${deleteTarget?.name}"? All trackings for this character will also be deleted.`}
				confirmLabel='Delete'
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	)
}
