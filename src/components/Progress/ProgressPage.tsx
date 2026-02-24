import React, { useState, useEffect, useCallback } from 'react'
import { trackingService, contentService, characterService, userMotiveService } from '@/services'
import type { Tracking, CreateTrackingRequest, UpdateTrackingRequest } from '@/models/api/Tracking'
import type { Content } from '@/models/api/Content'
import type { Character } from '@/models/api/Character'
import type { UserMotive } from '@/models/api/UserMotive'
import { Modal } from '@/components/elements/Modal/Modal'
import { ConfirmDialog } from '@/components/elements/ConfirmDialog/ConfirmDialog'
import { SearchableSelect } from '@/components/elements/SearchableSelect/SearchableSelect'
import { TagBadge } from '@/components/elements/TagBadge/TagBadge'
import {
	DIFFICULTIES,
	TRACKING_STATUSES,
	TRACKING_FREQUENCIES,
	getDifficultyLabel,
	getDifficultyColor,
	getStatusColor,
	parseDifficultyBitmask,
	WOW_CLASS_COLORS,
} from '@/utils/wowConstants'
import type { SelectOption } from '@/components/elements/SearchableSelect/SearchableSelect'
import './ProgressPage.scss'

// ─── Add tracking modal ───────────────────────────────────────────────────────
interface AddTrackingModalProps {
	open: boolean
	contents: Content[]
	characters: Character[]
	onSave: () => void
	onClose: () => void
}

const AddTrackingModal: React.FC<AddTrackingModalProps> = ({
	open,
	contents,
	characters,
	onSave,
	onClose,
}) => {
	const [form, setForm] = useState<CreateTrackingRequest>({
		characterId: '',
		contentId: '',
		difficulty: 1,
		frequency: 2,
		status: 0,
	})
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) return
		setForm({ characterId: '', contentId: '', difficulty: 1, frequency: 2, status: 0 })
		setError(null)
	}, [open])

	const selectedContent = contents.find((c) => c.id === form.contentId) ?? null
	const availableDiffs = selectedContent
		? parseDifficultyBitmask(selectedContent.allowedDifficulties)
		: []

	const contentOptions: SelectOption[] = contents.map((c) => ({
		value: c.id,
		label: c.name,
	}))

	const characterOptions: SelectOption[] = characters.map((c) => ({
		value: c.id,
		label: c.name,
		color: WOW_CLASS_COLORS[c.class] ?? undefined,
	}))

	const diffOptions = (selectedContent ? availableDiffs : DIFFICULTIES.map((d) => d.value)).map(
		(v) => {
			const d = DIFFICULTIES.find((x) => x.value === v)!
			return { value: String(v), label: d.label, color: d.color }
		}
	)

	const frequencyOptions: SelectOption[] = TRACKING_FREQUENCIES.map((f) => ({
		value: String(f.value),
		label: f.label,
	}))

	const statusOptions: SelectOption[] = TRACKING_STATUSES.map((s) => ({
		value: String(s.value),
		label: s.label,
		color: s.color,
	}))

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!form.characterId) {
			setError('Select a character')
			return
		}
		if (!form.contentId) {
			setError('Select content')
			return
		}
		setSaving(true)
		setError(null)
		try {
			await trackingService.create(form)
			onSave()
			onClose()
		} catch (e: unknown) {
			setError((e as Error).message ?? 'Failed to create tracking')
		} finally {
			setSaving(false)
		}
	}

	return (
		<Modal open={open} title='Add Tracking' onClose={onClose} width='480px'>
			<form onSubmit={handleSubmit} className='tracking-form'>
				<div className='form-group'>
					<label>Content *</label>
					<SearchableSelect
						options={contentOptions}
						value={form.contentId || null}
						onChange={(v) => {
							const newContent = contents.find((c) => c.id === v) ?? null
							const firstDiff = newContent
								? (parseDifficultyBitmask(newContent.allowedDifficulties)[0] ?? 1)
								: 1
							setForm({ ...form, contentId: v ?? '', difficulty: firstDiff })
						}}
						placeholder='Select content...'
						clearable={false}
					/>
				</div>
				<div className='form-group'>
					<label>Character *</label>
					<SearchableSelect
						options={characterOptions}
						value={form.characterId || null}
						onChange={(v) => setForm({ ...form, characterId: v ?? '' })}
						placeholder='Select character...'
						clearable={false}
					/>
				</div>
				<div className='form-group'>
					<label>Difficulty</label>
					<SearchableSelect
						options={diffOptions}
						value={String(form.difficulty)}
						onChange={(v) => setForm({ ...form, difficulty: Number(v) })}
						placeholder='Select difficulty...'
						clearable={false}
					/>
				</div>
				<div className='form-group'>
					<label>Frequency</label>
					<SearchableSelect
						options={frequencyOptions}
						value={String(form.frequency)}
						onChange={(v) => setForm({ ...form, frequency: Number(v) })}
						clearable={false}
					/>
				</div>
				<div className='form-group'>
					<label>Status</label>
					<SearchableSelect
						options={statusOptions}
						value={String(form.status ?? 0)}
						onChange={(v) => setForm({ ...form, status: Number(v) })}
						clearable={false}
					/>
				</div>
				{error && <p className='tracking-form__error'>{error}</p>}
				<div className='tracking-form__actions'>
					<button type='button' className='btn btn-secondary btn-sm' onClick={onClose}>
						Cancel
					</button>
					<button type='submit' className='btn btn-primary btn-sm' disabled={saving}>
						{saving ? 'Adding...' : 'Add'}
					</button>
				</div>
			</form>
		</Modal>
	)
}

// ─── Edit tracking modal ──────────────────────────────────────────────────────
interface EditTrackingModalProps {
	open: boolean
	tracking: Tracking | null
	contents: Content[]
	onSave: (id: string, req: UpdateTrackingRequest) => Promise<void>
	onClose: () => void
}

const EditTrackingModal: React.FC<EditTrackingModalProps> = ({
	open,
	tracking,
	contents,
	onSave,
	onClose,
}) => {
	const [form, setForm] = useState<UpdateTrackingRequest>({
		difficulty: 1,
		frequency: 2,
		status: 0,
		comment: null,
		lastCompletedAt: null,
	})
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open || !tracking) return
		setForm({
			difficulty: tracking.difficulty,
			frequency: tracking.frequency,
			status: tracking.status,
			comment: tracking.comment,
			lastCompletedAt: tracking.lastCompletedAt,
		})
		setError(null)
	}, [tracking, open])

	const content = contents.find((c) => c.id === tracking?.contentId) ?? null
	const availableDiffs = content
		? parseDifficultyBitmask(content.allowedDifficulties)
		: [0, 1, 2, 3]

	const diffOptions = availableDiffs.map((v) => {
		const d = DIFFICULTIES.find((x) => x.value === v)!
		return { value: String(v), label: d.label, color: d.color }
	})

	const statusOptions: SelectOption[] = TRACKING_STATUSES.map((s) => ({
		value: String(s.value),
		label: s.label,
		color: s.color,
	}))

	const frequencyOptions: SelectOption[] = TRACKING_FREQUENCIES.map((f) => ({
		value: String(f.value),
		label: f.label,
	}))

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!tracking) return
		setSaving(true)
		setError(null)
		try {
			await onSave(tracking.id, form)
			onClose()
		} catch (e: unknown) {
			setError((e as Error).message ?? 'Failed to save')
		} finally {
			setSaving(false)
		}
	}

	return (
		<Modal open={open} title='Edit Tracking' onClose={onClose} width='480px'>
			{tracking && (
				<form onSubmit={handleSubmit} className='tracking-form'>
					<div className='tracking-form__context'>
						<strong>{tracking.contentName}</strong>
						<span className='tracking-form__context-sep'> · </span>
						<span>{tracking.characterName}</span>
					</div>
					<div className='form-group'>
						<label>Difficulty</label>
						<SearchableSelect
							options={diffOptions}
							value={String(form.difficulty)}
							onChange={(v) => setForm({ ...form, difficulty: Number(v) })}
							clearable={false}
						/>
					</div>
					<div className='form-group'>
						<label>Status</label>
						<SearchableSelect
							options={statusOptions}
							value={String(form.status)}
							onChange={(v) => setForm({ ...form, status: Number(v) })}
							clearable={false}
						/>
					</div>
					<div className='form-group'>
						<label>Frequency</label>
						<SearchableSelect
							options={frequencyOptions}
							value={String(form.frequency)}
							onChange={(v) => setForm({ ...form, frequency: Number(v) })}
							clearable={false}
						/>
					</div>
					<div className='form-group'>
						<label>Comment</label>
						<textarea
							rows={2}
							value={form.comment ?? ''}
							onChange={(e) => setForm({ ...form, comment: e.target.value || null })}
						/>
					</div>
					<div className='form-group'>
						<label>Last Completed</label>
						<input
							type='date'
							value={
								form.lastCompletedAt
									? new Date(form.lastCompletedAt).toISOString().split('T')[0]
									: ''
							}
							onChange={(e) =>
								setForm({
									...form,
									lastCompletedAt: e.target.value ? new Date(e.target.value).toISOString() : null,
								})
							}
						/>
					</div>
					{error && <p className='tracking-form__error'>{error}</p>}
					<div className='tracking-form__actions'>
						<button type='button' className='btn btn-secondary btn-sm' onClick={onClose}>
							Cancel
						</button>
						<button type='submit' className='btn btn-primary btn-sm' disabled={saving}>
							{saving ? 'Saving...' : 'Save'}
						</button>
					</div>
				</form>
			)}
		</Modal>
	)
}

// ─── Tracking row ─────────────────────────────────────────────────────────────
interface TrackingRowProps {
	tracking: Tracking
	onUpdate: (id: string, changes: Partial<UpdateTrackingRequest>) => Promise<void>
	onEdit: (t: Tracking) => void
	onDelete: (t: Tracking) => void
}

const TrackingRow: React.FC<TrackingRowProps> = ({ tracking, onUpdate, onEdit, onDelete }) => {
	const [saving, setSaving] = useState(false)
	const classColor = WOW_CLASS_COLORS[tracking.characterClass] ?? '#7c8cff'
	const statusColor = getStatusColor(tracking.status)

	const handleStatusChange = async (val: string | null) => {
		if (val === null) return
		setSaving(true)
		try {
			await onUpdate(tracking.id, {
				status: Number(val),
				difficulty: tracking.difficulty,
				frequency: tracking.frequency,
			})
		} finally {
			setSaving(false)
		}
	}

	const handleFrequencyChange = async (val: string | null) => {
		if (val === null) return
		setSaving(true)
		try {
			await onUpdate(tracking.id, {
				status: tracking.status,
				difficulty: tracking.difficulty,
				frequency: Number(val),
			})
		} finally {
			setSaving(false)
		}
	}

	const statusOptions: SelectOption[] = TRACKING_STATUSES.map((s) => ({
		value: String(s.value),
		label: s.label,
		color: s.color,
	}))

	const frequencyOptions: SelectOption[] = TRACKING_FREQUENCIES.map((f) => ({
		value: String(f.value),
		label: f.label,
	}))

	return (
		<tr className={`tracking-row ${saving ? 'tracking-row--saving' : ''}`}>
			<td className='tracking-row__indent' />
			<td className='tracking-row__diff'>
				<TagBadge
					label={getDifficultyLabel(tracking.difficulty)}
					color={getDifficultyColor(tracking.difficulty)}
					size='sm'
				/>
			</td>
			<td className='tracking-row__character'>
				<div className='tracking-row__char-inner'>
					<span className='tracking-row__char-dot' style={{ background: classColor }} />
					<span className='tracking-row__char-name' style={{ color: classColor }}>
						{tracking.characterName}
					</span>
					{tracking.characterRace && (
						<span className='tracking-row__char-race'>{tracking.characterRace}</span>
					)}
				</div>
			</td>
			<td className='tracking-row__status'>
				<div className='tracking-row__select-wrap'>
					<span className='tracking-row__status-dot' style={{ background: statusColor }} />
					<SearchableSelect
						options={statusOptions}
						value={String(tracking.status)}
						onChange={handleStatusChange}
						clearable={false}
						className='tracking-row__select'
					/>
				</div>
			</td>
			<td className='tracking-row__freq'>
				<SearchableSelect
					options={frequencyOptions}
					value={String(tracking.frequency)}
					onChange={handleFrequencyChange}
					clearable={false}
					className='tracking-row__select'
				/>
			</td>
			<td className='tracking-row__last'>
				{tracking.lastCompletedAt ? (
					new Date(tracking.lastCompletedAt).toLocaleDateString()
				) : (
					<span className='tracking-row__never'>—</span>
				)}
			</td>
			<td className='tracking-row__actions'>
				<div className='tracking-row__action-btns'>
					<button className='btn btn-outline btn-xs' onClick={() => onEdit(tracking)}>
						Edit
					</button>
					<button className='btn btn-danger btn-xs' onClick={() => onDelete(tracking)}>
						×
					</button>
				</div>
			</td>
		</tr>
	)
}

// ─── Content group ────────────────────────────────────────────────────────────
interface ContentGroupProps {
	contentId: string
	contentName: string
	expansion: string
	trackings: Tracking[]
	onUpdate: (id: string, changes: Partial<UpdateTrackingRequest>) => Promise<void>
	onEdit: (t: Tracking) => void
	onDelete: (t: Tracking) => void
}

const ContentGroup: React.FC<ContentGroupProps> = ({
	contentName,
	expansion,
	trackings,
	onUpdate,
	onEdit,
	onDelete,
}) => {
	const [expanded, setExpanded] = useState(true)

	// summary stats
	const done = trackings.filter((t) => t.status === 4).length
	const total = trackings.length

	return (
		<>
			<tr className='content-group-row' onClick={() => setExpanded((e) => !e)}>
				<td colSpan={7}>
					<div className='content-group-row__inner'>
						<span className='content-group-row__toggle'>{expanded ? '▼' : '▶'}</span>
						<span className='content-group-row__name'>{contentName}</span>
						<TagBadge label={expansion} size='sm' />
						<span className='content-group-row__spacer' />
						<span className='content-group-row__count'>
							{done}/{total}
						</span>
					</div>
				</td>
			</tr>
			{expanded &&
				trackings.map((t) => (
					<TrackingRow
						key={t.id}
						tracking={t}
						onUpdate={onUpdate}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				))}
		</>
	)
}

// ─── Main progress page ───────────────────────────────────────────────────────
export const ProgressPage: React.FC = () => {
	const [trackings, setTrackings] = useState<Tracking[]>([])
	const [contents, setContents] = useState<Content[]>([])
	const [characters, setCharacters] = useState<Character[]>([])
	const [motives, setMotives] = useState<UserMotive[]>([])
	const [loading, setLoading] = useState(true)
	const [showAdd, setShowAdd] = useState(false)
	const [editTarget, setEditTarget] = useState<Tracking | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Tracking | null>(null)

	// Filters
	const [filterExpansion, setFilterExpansion] = useState<string | null>(null)
	const [filterMotive, setFilterMotive] = useState<string | null>(null)
	const [filterStatus, setFilterStatus] = useState<string | null>(null)

	const loadAll = useCallback(async () => {
		try {
			setLoading(true)
			const [t, c, ch, m] = await Promise.all([
				trackingService.getAll({
					expansion: filterExpansion ?? undefined,
					motiveId: filterMotive ?? undefined,
					status: filterStatus !== null ? Number(filterStatus) : undefined,
				}),
				contentService.getAll(),
				characterService.getAll(),
				userMotiveService.getAll(),
			])
			setTrackings(t)
			setContents(c)
			setCharacters(ch)
			setMotives(m)
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}, [filterExpansion, filterMotive, filterStatus])

	useEffect(() => {
		loadAll()
	}, [loadAll])

	const handleUpdate = async (id: string, changes: Partial<UpdateTrackingRequest>) => {
		const t = trackings.find((x) => x.id === id)
		if (!t) return
		const req: UpdateTrackingRequest = {
			difficulty: t.difficulty,
			frequency: t.frequency,
			status: t.status,
			comment: t.comment,
			lastCompletedAt: t.lastCompletedAt,
			...changes,
		}
		// Optimistic update
		setTrackings((prev) => prev.map((x) => (x.id === id ? { ...x, ...changes } : x)))
		await trackingService.update(id, req)
	}

	const handleEditSave = async (id: string, req: UpdateTrackingRequest) => {
		await trackingService.update(id, req)
		await loadAll()
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		try {
			await trackingService.delete(deleteTarget.id)
			setDeleteTarget(null)
			loadAll()
		} catch (e) {
			console.error(e)
		}
	}

	// Group by contentId
	const grouped = trackings.reduce<Record<string, Tracking[]>>((acc, t) => {
		if (!acc[t.contentId]) acc[t.contentId] = []
		acc[t.contentId].push(t)
		return acc
	}, {})

	const expansionOptions: SelectOption[] = [
		...Array.from(new Set(contents.map((c) => c.expansion))).map((e) => ({
			value: e,
			label: e,
		})),
	]

	const motiveOptions: SelectOption[] = motives.map((m) => ({
		value: m.id,
		label: m.name,
		color: m.color ?? undefined,
	}))

	const statusOptions: SelectOption[] = TRACKING_STATUSES.map((s) => ({
		value: String(s.value),
		label: s.label,
		color: s.color,
	}))

	return (
		<div className='progress-page'>
			<div className='progress-page__header'>
				<h1 className='progress-page__title'>Content Progress</h1>
				<div className='progress-page__toolbar'>
					<div style={{ width: '190px' }}>
						<SearchableSelect
							options={expansionOptions}
							value={filterExpansion}
							onChange={setFilterExpansion}
							placeholder='Expansion...'
						/>
					</div>
					<div style={{ width: '170px' }}>
						<SearchableSelect
							options={motiveOptions}
							value={filterMotive}
							onChange={setFilterMotive}
							placeholder='Motive...'
						/>
					</div>
					<div style={{ width: '160px' }}>
						<SearchableSelect
							options={statusOptions}
							value={filterStatus}
							onChange={setFilterStatus}
							placeholder='Status...'
						/>
					</div>
					<button className='btn btn-primary btn-sm' onClick={() => setShowAdd(true)}>
						+ Add Tracking
					</button>
				</div>
			</div>

			{loading ? (
				<p className='progress-page__empty'>Loading...</p>
			) : Object.keys(grouped).length === 0 ? (
				<p className='progress-page__empty'>No trackings found. Add one to get started.</p>
			) : (
				<div className='progress-table-wrapper'>
					<table className='progress-table'>
						<colgroup>
							<col style={{ width: '28px' }} />
							<col style={{ width: '100px' }} />
							<col style={{ width: '180px' }} />
							<col />
							<col style={{ width: '130px' }} />
							<col style={{ width: '120px' }} />
							<col style={{ width: '90px' }} />
						</colgroup>
						<thead>
							<tr>
								<th />
								<th>Difficulty</th>
								<th>Character</th>
								<th>Status</th>
								<th>Frequency</th>
								<th>Last completed</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{Object.entries(grouped).map(([contentId, rows]) => {
								const first = rows[0]
								return (
									<ContentGroup
										key={contentId}
										contentId={contentId}
										contentName={first.contentName}
										expansion={first.expansion}
										trackings={rows}
										onUpdate={handleUpdate}
										onEdit={setEditTarget}
										onDelete={setDeleteTarget}
									/>
								)
							})}
						</tbody>
					</table>
				</div>
			)}

			<AddTrackingModal
				open={showAdd}
				contents={contents}
				characters={characters}
				onSave={loadAll}
				onClose={() => setShowAdd(false)}
			/>

			<EditTrackingModal
				open={!!editTarget}
				tracking={editTarget}
				contents={contents}
				onSave={handleEditSave}
				onClose={() => setEditTarget(null)}
			/>

			<ConfirmDialog
				open={!!deleteTarget}
				message={`Remove tracking for "${deleteTarget?.characterName}" in "${deleteTarget?.contentName}" (${getDifficultyLabel(deleteTarget?.difficulty ?? 1)})?`}
				confirmLabel='Remove'
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	)
}
