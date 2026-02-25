import React, { useState, useEffect, useCallback } from 'react'
import { contentService, userMotiveService } from '@/services'
import type { Content, CreateContentRequest, UpdateContentRequest } from '@/models/api/Content'
import type { UserMotive } from '@/models/api/UserMotive'
import { Modal } from '@/components/elements/Modal/Modal'
import { ConfirmDialog } from '@/components/elements/ConfirmDialog/ConfirmDialog'
import { SearchableSelect } from '@/components/elements/SearchableSelect/SearchableSelect'
import { MultiSelect } from '@/components/elements/MultiSelect/MultiSelect'
import { TagBadge } from '@/components/elements/TagBadge/TagBadge'
import { WOW_EXPANSIONS, DIFFICULTIES, parseDifficultyBitmask } from '@/utils/wowConstants'
import type { SelectOption } from '@/components/elements/SearchableSelect/SearchableSelect'
import './ContentPage.scss'

// ─── Content form modal ───────────────────────────────────────────────────────
interface ContentFormProps {
	open: boolean
	content: Content | null
	motives: UserMotive[]
	onSave: () => void
	onClose: () => void
}

const ContentForm: React.FC<ContentFormProps> = ({ open, content, motives, onSave, onClose }) => {
	const blank: CreateContentRequest = {
		name: '',
		expansion: '',
		comment: null,
		allowedDifficulties: 0,
		motiveIds: [],
	}

	const [form, setForm] = useState<CreateContentRequest>(blank)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (content) {
			setForm({
				name: content.name,
				expansion: content.expansion,
				comment: content.comment,
				allowedDifficulties: content.allowedDifficulties,
				motiveIds: content.motives.map((m) => m.id),
			})
		} else {
			setForm(blank)
		}
		setError(null)
	}, [content, open])

	const expansionOptions: SelectOption[] = WOW_EXPANSIONS.map((e) => ({
		value: e,
		label: e,
	}))

	const motiveOptions = motives.map((m) => ({
		value: m.id,
		label: m.name,
		color: m.color ?? undefined,
	}))

	const diffBits = parseDifficultyBitmask(form.allowedDifficulties)

	const toggleDiff = (flag: number) => {
		const current = form.allowedDifficulties
		const next = current & flag ? current & ~flag : current | flag
		setForm({ ...form, allowedDifficulties: next })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!form.expansion) {
			setError('Expansion is required')
			return
		}
		if (form.allowedDifficulties === 0) {
			setError('Select at least one difficulty')
			return
		}
		setSaving(true)
		setError(null)
		try {
			if (content) {
				await contentService.update(content.id, form as UpdateContentRequest)
			} else {
				await contentService.create(form)
			}
			onSave()
			onClose()
		} catch (e: unknown) {
			setError((e as Error).message ?? 'Failed to save')
		} finally {
			setSaving(false)
		}
	}

	return (
		<Modal
			open={open}
			title={content ? `Edit ${content.name}` : 'New Content'}
			onClose={onClose}
			width='540px'>
			<form onSubmit={handleSubmit} className='content-form'>
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
					<label>Expansion *</label>
					<SearchableSelect
						options={expansionOptions}
						value={form.expansion || null}
						onChange={(v) => setForm({ ...form, expansion: v ?? '' })}
						placeholder='Select expansion...'
						clearable={false}
					/>
				</div>
				<div className='form-group'>
					<label>Difficulties *</label>
					<div className='content-form__diffs'>
						{DIFFICULTIES.map((d) => (
							<button
								key={d.value}
								type='button'
								className={`content-form__diff-chip ${diffBits.includes(d.value) ? 'content-form__diff-chip--active' : ''}`}
								style={
									diffBits.includes(d.value) ? { background: d.color, borderColor: d.color } : {}
								}
								onClick={() => toggleDiff(d.flag)}>
								{d.label}
							</button>
						))}
					</div>
				</div>
				<div className='form-group'>
					<label>Motives</label>
					<MultiSelect
						options={motiveOptions}
						values={form.motiveIds}
						onChange={(vals) => setForm({ ...form, motiveIds: vals as string[] })}
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
				{error && <p className='content-form__error'>{error}</p>}
				<div className='content-form__actions'>
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

// ─── Content row ──────────────────────────────────────────────────────────────
interface ContentRowProps {
	content: Content
	onEdit: (c: Content) => void
	onDelete: (c: Content) => void
}

const ContentRow: React.FC<ContentRowProps> = ({ content, onEdit, onDelete }) => {
	const diffs = parseDifficultyBitmask(content.allowedDifficulties)

	return (
		<tr className='content-row'>
			<td className='content-row__name'>{content.name}</td>
			<td className='content-row__expansion'>
				<TagBadge label={content.expansion} size='sm' />
			</td>
			<td className='content-row__diffs'>
				<div className='content-row__diffs-inner'>
					{diffs.map((bit) => {
						const d = DIFFICULTIES.find((x) => x.value === bit)!
						return <TagBadge key={bit} label={d.label} color={d.color} size='sm' />
					})}
				</div>
			</td>
			<td className='content-row__motives'>
				<div className='content-row__motives-inner'>
					{content.motives.map((m) => (
						<TagBadge key={m.id} label={m.name} color={m.color ?? undefined} size='sm' />
					))}
				</div>
			</td>
			<td className='content-row__comment'>
				{content.comment && (
					<span title={content.comment} className='content-row__comment-text'>
						{content.comment}
					</span>
				)}
			</td>
			<td className='content-row__actions'>
				<div className='content-row__action-btns'>
					<button className='btn btn-outline btn-xs' onClick={() => onEdit(content)}>
						Edit
					</button>
					<button className='btn btn-danger btn-xs' onClick={() => onDelete(content)}>
						Del
					</button>
				</div>
			</td>
		</tr>
	)
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const ContentPage: React.FC = () => {
	const [contents, setContents] = useState<Content[]>([])
	const [motives, setMotives] = useState<UserMotive[]>([])
	const [loading, setLoading] = useState(true)
	const [editTarget, setEditTarget] = useState<Content | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<Content | null>(null)
	const [filterExpansion, setFilterExpansion] = useState<string | null>(null)

	const load = useCallback(async () => {
		try {
			setLoading(true)
			const [data, motivesData] = await Promise.all([
				contentService.getAll(filterExpansion ? { expansion: filterExpansion } : undefined),
				userMotiveService.getAll(),
			])
			setContents(data)
			setMotives(motivesData)
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}, [filterExpansion])

	useEffect(() => {
		load()
	}, [load])

	const openCreate = () => {
		setEditTarget(null)
		setShowForm(true)
	}

	const openEdit = (c: Content) => {
		setEditTarget(c)
		setShowForm(true)
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		try {
			await contentService.delete(deleteTarget.id)
			setDeleteTarget(null)
			load()
		} catch (e) {
			console.error(e)
		}
	}

	const expansionOptions: SelectOption[] = WOW_EXPANSIONS.map((e) => ({
		value: e,
		label: e,
	}))

	return (
		<div className='content-page'>
			<div className='content-page__header'>
				<h1 className='content-page__title'>Content</h1>
				<div className='content-page__toolbar'>
					<div style={{ width: '220px' }}>
						<SearchableSelect
							options={expansionOptions}
							value={filterExpansion}
							onChange={setFilterExpansion}
							placeholder='Filter by expansion...'
						/>
					</div>
					<button className='btn btn-primary btn-sm' onClick={openCreate}>
						+ New Content
					</button>
				</div>
			</div>

			{loading ? (
				<p className='content-page__empty'>Loading...</p>
			) : contents.length === 0 ? (
				<p className='content-page__empty'>No content found.</p>
			) : (
				<div className='content-table-wrapper'>
					<table className='content-table'>
						<thead>
							<tr>
								<th>Name</th>
								<th>Expansion</th>
								<th>Difficulties</th>
								<th>Motives</th>
								<th>Comment</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{contents.map((c) => (
								<ContentRow key={c.id} content={c} onEdit={openEdit} onDelete={setDeleteTarget} />
							))}
						</tbody>
					</table>
				</div>
			)}

			<ContentForm
				open={showForm}
				content={editTarget}
				motives={motives}
				onSave={load}
				onClose={() => setShowForm(false)}
			/>

			<ConfirmDialog
				open={!!deleteTarget}
				message={`Delete "${deleteTarget?.name}"? All trackings for this content will also be deleted.`}
				confirmLabel='Delete'
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	)
}
