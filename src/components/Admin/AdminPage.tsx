import React, { useState, useEffect, useRef } from 'react'
import { authService, warbandService, userMotiveService, dataService } from '@/services'
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks'
import { patchCurrentUser, selectCurrentUser, selectIsAdmin } from '@/store/features/auth'
import {
	setSimulatedReset,
	selectSimDailyReset,
	selectSimWeeklyReset,
	selectRefetchToken,
} from '@/store/features/simReset'
import type { UserDto } from '@/models/api/Auth'
import type { UpdateUserRequest } from '@/models/api/Auth'
import type { Warband, CreateWarbandRequest } from '@/models/api/Warband'
import type { UserMotive, CreateUserMotiveRequest } from '@/models/api/UserMotive'
import type { ImportResult, OrphansSummary } from '@/services/dataService'
import { Modal } from '@/components/elements/Modal/Modal'
import { ConfirmDialog } from '@/components/elements/ConfirmDialog/ConfirmDialog'
import { TagBadge } from '@/components/elements/TagBadge/TagBadge'
import { TRACKING_STATUSES } from '@/utils/wowConstants'
import {
	setStatusLabel,
	resetStatusLabel,
	resetAllStatusLabels,
} from '@/store/features/statusLabels'
import type { RootState } from '@/store'
import './AdminPage.scss'

// ─── Users section ────────────────────────────────────────────────────────────
const UsersSection: React.FC = () => {
	const dispatch = useAppDispatch()
	const currentUser = useAppSelector(selectCurrentUser)
	const [users, setUsers] = useState<UserDto[]>([])
	const [loading, setLoading] = useState(true)
	const [showCreate, setShowCreate] = useState(false)
	const [editTarget, setEditTarget] = useState<UserDto | null>(null)
	const [form, setForm] = useState({ email: '', userName: '', password: '', isAdmin: false })
	const [editForm, setEditForm] = useState<UpdateUserRequest & { password: string }>({
		email: '',
		userName: '',
		isAdmin: false,
		isActive: true,
		password: '',
	})
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null)
	const [deleting, setDeleting] = useState(false)

	const load = async () => {
		try {
			setLoading(true)
			const data = await authService.getUsers()
			setUsers(data)
		} catch (e: unknown) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [])

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setError(null)
		try {
			await authService.createUser(form)
			setShowCreate(false)
			setForm({ email: '', userName: '', password: '', isAdmin: false })
			load()
		} catch (e: unknown) {
			setError((e as Error).message ?? 'Failed to create user')
		} finally {
			setSaving(false)
		}
	}

	const openEdit = (u: UserDto) => {
		setEditTarget(u)
		setEditForm({
			email: u.email,
			userName: u.userName,
			isAdmin: u.isAdmin,
			isActive: u.isActive,
			password: '',
		})
	}

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editTarget) return
		setSaving(true)
		setError(null)
		try {
			const req: UpdateUserRequest = {
				email: editForm.email,
				userName: editForm.userName,
				isAdmin: editForm.isAdmin,
				isActive: editForm.isActive,
				password: editForm.password || undefined,
			}
			const updated = await authService.updateUser(editTarget.id, req)
			if (currentUser?.userId === editTarget.id) {
				dispatch(
					patchCurrentUser({
						userId: updated.id,
						userName: updated.userName,
						email: updated.email,
						isAdmin: updated.isAdmin,
					})
				)
			}
			setEditTarget(null)
			load()
		} catch (e: unknown) {
			setError((e as Error).message ?? 'Failed to update user')
		} finally {
			setSaving(false)
		}
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		setDeleting(true)
		try {
			await authService.deleteUser(deleteTarget.id)
			setDeleteTarget(null)
			load()
		} catch (e: unknown) {
			setError((e as Error).message ?? 'Failed to delete user')
		} finally {
			setDeleting(false)
		}
	}

	return (
		<section className='admin-section'>
			<div className='admin-section__header'>
				<h2 className='admin-section__title'>Users</h2>
				<button className='btn btn-primary btn-sm' onClick={() => setShowCreate(true)}>
					+ New User
				</button>
			</div>

			{loading ? (
				<p className='admin-empty'>Loading...</p>
			) : (
				<table className='admin-table'>
					<thead>
						<tr>
							<th>Username</th>
							<th>Email</th>
							<th>Role</th>
							<th>Status</th>
							<th>Created</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<tr key={u.id}>
								<td>{u.userName}</td>
								<td className='admin-table__muted'>{u.email}</td>
								<td>
									{u.isAdmin ? (
										<TagBadge label='Admin' color='#e8a44a' size='sm' />
									) : (
										<TagBadge label='User' size='sm' />
									)}
								</td>
								<td>
									{u.isActive ? (
										<TagBadge label='Active' color='#57c55a' size='sm' />
									) : (
										<TagBadge label='Inactive' color='#ff5c6c' size='sm' />
									)}
								</td>
								<td className='admin-table__muted'>{new Date(u.createdAt).toLocaleDateString()}</td>
								<td className='admin-table__actions'>
									<button className='btn btn-outline btn-xs' onClick={() => openEdit(u)}>
										Edit
									</button>
									<button
										className='btn btn-danger btn-xs'
										disabled={u.id === currentUser?.userId}
										title={
											u.id === currentUser?.userId
												? 'Cannot delete your own account'
												: `Delete ${u.userName}`
										}
										onClick={() => setDeleteTarget(u)}>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{/* Create modal */}
			<Modal open={showCreate} title='New User' onClose={() => setShowCreate(false)}>
				<form onSubmit={handleCreate} className='admin-form'>
					<div className='form-group'>
						<label>Username</label>
						<input
							type='text'
							required
							value={form.userName}
							onChange={(e) => setForm({ ...form, userName: e.target.value })}
						/>
					</div>
					<div className='form-group'>
						<label>Email</label>
						<input
							type='email'
							required
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
						/>
					</div>
					<div className='form-group'>
						<label>Password</label>
						<input
							type='password'
							required
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
						/>
					</div>
					<div className='form-group form-group--inline'>
						<label>
							<input
								type='checkbox'
								checked={form.isAdmin}
								onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
							/>{' '}
							Admin
						</label>
					</div>
					{error && <p className='admin-form__error'>{error}</p>}
					<div className='admin-form__actions'>
						<button
							type='button'
							className='btn btn-secondary btn-sm'
							onClick={() => setShowCreate(false)}>
							Cancel
						</button>
						<button type='submit' className='btn btn-primary btn-sm' disabled={saving}>
							{saving ? 'Creating...' : 'Create'}
						</button>
					</div>
				</form>
			</Modal>

			{/* Edit modal */}
			<Modal
				open={!!editTarget}
				title={`Edit ${editTarget?.userName ?? 'User'}`}
				onClose={() => setEditTarget(null)}
				width='420px'>
				<form onSubmit={handleEdit} className='admin-form'>
					<div className='form-group'>
						<label>Username</label>
						<input
							type='text'
							required
							value={editForm.userName}
							onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
						/>
					</div>
					<div className='form-group'>
						<label>Email</label>
						<input
							type='email'
							required
							value={editForm.email}
							onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
						/>
					</div>
					<div className='form-group'>
						<label>
							New Password{' '}
							<span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
								(leave blank to keep)
							</span>
						</label>
						<input
							type='password'
							value={editForm.password}
							onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
						/>
					</div>
					<div className='admin-form__checks-row'>
						<label className='admin-form__check-label'>
							<input
								type='checkbox'
								checked={editForm.isAdmin}
								onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
							/>{' '}
							Admin
						</label>
						<label className='admin-form__check-label'>
							<input
								type='checkbox'
								checked={editForm.isActive}
								onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
							/>{' '}
							Active
						</label>
					</div>
					{error && <p className='admin-form__error'>{error}</p>}
					<div className='admin-form__actions'>
						<button
							type='button'
							className='btn btn-secondary btn-sm'
							onClick={() => setEditTarget(null)}>
							Cancel
						</button>
						<button type='submit' className='btn btn-primary btn-sm' disabled={saving}>
							{saving ? 'Saving...' : 'Save'}
						</button>
					</div>
				</form>
			</Modal>

			{/* Delete confirm */}
			<ConfirmDialog
				open={!!deleteTarget}
				title='Delete User'
				message={`Delete "${deleteTarget?.userName}"? This will permanently remove all their characters, content and tracking data.`}
				confirmLabel={deleting ? 'Deleting...' : 'Delete'}
				danger={true}
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</section>
	)
}

// ─── Warbands section ─────────────────────────────────────────────────────────
const WarbandsSection: React.FC = () => {
	const [items, setItems] = useState<Warband[]>([])
	const [loading, setLoading] = useState(true)
	const [editing, setEditing] = useState<Warband | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<Warband | null>(null)
	const [form, setForm] = useState<CreateWarbandRequest>({ name: '', color: '#7c8cff' })
	const [saving, setSaving] = useState(false)

	const load = async () => {
		try {
			setLoading(true)
			const data = await warbandService.getAll()
			setItems(Array.isArray(data) ? data : [])
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [])

	const openCreate = () => {
		setEditing(null)
		setForm({ name: '', color: '#7c8cff' })
		setShowForm(true)
	}

	const openEdit = (w: Warband) => {
		setEditing(w)
		setForm({ name: w.name, color: w.color ?? '#7c8cff' })
		setShowForm(true)
	}

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		try {
			if (editing) {
				await warbandService.update(editing.id, form)
			} else {
				await warbandService.create(form)
			}
			setShowForm(false)
			load()
		} catch (e) {
			console.error(e)
		} finally {
			setSaving(false)
		}
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		try {
			await warbandService.delete(deleteTarget.id)
			setDeleteTarget(null)
			load()
		} catch (e) {
			console.error(e)
		}
	}

	const moveWarband = async (index: number, direction: -1 | 1) => {
		const newItems = [...items]
		const swapIndex = index + direction
		if (swapIndex < 0 || swapIndex >= newItems.length) return
		;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]
		const reordered = newItems.map((w, i) => ({ ...w, sortOrder: i }))
		setItems(reordered)
		try {
			await warbandService.reorder(reordered.map((w) => ({ id: w.id, sortOrder: w.sortOrder })))
		} catch (e) {
			console.error(e)
			load()
		}
	}

	return (
		<section className='admin-section'>
			<div className='admin-section__header'>
				<h2 className='admin-section__title'>Warbands</h2>
				<button className='btn btn-primary btn-sm' onClick={openCreate}>
					+ New Warband
				</button>
			</div>

			{loading ? (
				<p className='admin-empty'>Loading...</p>
			) : items.length === 0 ? (
				<p className='admin-empty'>No warbands yet.</p>
			) : (
				<div className='admin-tags-list'>
					{items.map((w, idx) => (
						<div key={w.id} className='admin-tag-row'>
							<div className='admin-tag-row__order'>
								<button
									className='btn btn-outline btn-xs'
									disabled={idx === 0}
									onClick={() => moveWarband(idx, -1)}
									title='Move up'>
									&#9650;
								</button>
								<button
									className='btn btn-outline btn-xs'
									disabled={idx === items.length - 1}
									onClick={() => moveWarband(idx, 1)}
									title='Move down'>
									&#9660;
								</button>
							</div>
							<TagBadge label={w.name} color={w.color ?? undefined} />
							<div className='admin-tag-row__actions'>
								<button className='btn btn-outline btn-xs' onClick={() => openEdit(w)}>
									Edit
								</button>
								<button className='btn btn-danger btn-xs' onClick={() => setDeleteTarget(w)}>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			<Modal
				open={showForm}
				title={editing ? 'Edit Warband' : 'New Warband'}
				onClose={() => setShowForm(false)}
				width='360px'>
				<form onSubmit={handleSave} className='admin-form'>
					<div className='form-group'>
						<label>Name</label>
						<input
							type='text'
							required
							maxLength={18}
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>
					<div className='form-group'>
						<label>Color</label>
						<div className='admin-color-row'>
							<input
								type='color'
								value={form.color ?? '#7c8cff'}
								onChange={(e) => setForm({ ...form, color: e.target.value })}
							/>
							<span className='admin-color-preview'>{form.color}</span>
						</div>
					</div>
					<div className='admin-form__actions'>
						<button
							type='button'
							className='btn btn-secondary btn-sm'
							onClick={() => setShowForm(false)}>
							Cancel
						</button>
						<button type='submit' className='btn btn-primary btn-sm' disabled={saving}>
							{saving ? 'Saving...' : 'Save'}
						</button>
					</div>
				</form>
			</Modal>

			<ConfirmDialog
				open={!!deleteTarget}
				message={`Delete warband "${deleteTarget?.name}"? Characters in this warband will be unassigned.`}
				confirmLabel='Delete'
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</section>
	)
}

// ─── Motives section ──────────────────────────────────────────────────────────
const MotivesSection: React.FC = () => {
	const [items, setItems] = useState<UserMotive[]>([])
	const [loading, setLoading] = useState(true)
	const [editing, setEditing] = useState<UserMotive | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<UserMotive | null>(null)
	const [form, setForm] = useState<CreateUserMotiveRequest>({ name: '', color: '#7c8cff' })
	const [saving, setSaving] = useState(false)

	const load = async () => {
		try {
			setLoading(true)
			const data = await userMotiveService.getAll()
			setItems(Array.isArray(data) ? data : [])
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [])

	const openCreate = () => {
		setEditing(null)
		setForm({ name: '', color: '#7c8cff' })
		setShowForm(true)
	}

	const openEdit = (m: UserMotive) => {
		setEditing(m)
		setForm({ name: m.name, color: m.color ?? '#7c8cff' })
		setShowForm(true)
	}

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		try {
			if (editing) {
				await userMotiveService.update(editing.id, form)
			} else {
				await userMotiveService.create(form)
			}
			setShowForm(false)
			load()
		} catch (e) {
			console.error(e)
		} finally {
			setSaving(false)
		}
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		try {
			await userMotiveService.delete(deleteTarget.id)
			setDeleteTarget(null)
			load()
		} catch (e) {
			console.error(e)
		}
	}

	return (
		<section className='admin-section'>
			<div className='admin-section__header'>
				<h2 className='admin-section__title'>Motives</h2>
				<button className='btn btn-primary btn-sm' onClick={openCreate}>
					+ New Motive
				</button>
			</div>

			{loading ? (
				<p className='admin-empty'>Loading...</p>
			) : items.length === 0 ? (
				<p className='admin-empty'>No motives yet.</p>
			) : (
				<div className='admin-tags-list'>
					{items.map((m) => (
						<div key={m.id} className='admin-tag-row'>
							<TagBadge label={m.name} color={m.color ?? undefined} />
							<div className='admin-tag-row__actions'>
								<button className='btn btn-outline btn-xs' onClick={() => openEdit(m)}>
									Edit
								</button>
								<button className='btn btn-danger btn-xs' onClick={() => setDeleteTarget(m)}>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			<Modal
				open={showForm}
				title={editing ? 'Edit Motive' : 'New Motive'}
				onClose={() => setShowForm(false)}
				width='360px'>
				<form onSubmit={handleSave} className='admin-form'>
					<div className='form-group'>
						<label>Name</label>
						<input
							type='text'
							required
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>
					<div className='form-group'>
						<label>Color</label>
						<div className='admin-color-row'>
							<input
								type='color'
								value={form.color ?? '#7c8cff'}
								onChange={(e) => setForm({ ...form, color: e.target.value })}
							/>
							<span className='admin-color-preview'>{form.color}</span>
						</div>
					</div>
					<div className='admin-form__actions'>
						<button
							type='button'
							className='btn btn-secondary btn-sm'
							onClick={() => setShowForm(false)}>
							Cancel
						</button>
						<button type='submit' className='btn btn-primary btn-sm' disabled={saving}>
							{saving ? 'Saving...' : 'Save'}
						</button>
					</div>
				</form>
			</Modal>

			<ConfirmDialog
				open={!!deleteTarget}
				message={`Delete motive "${deleteTarget?.name}"?`}
				confirmLabel='Delete'
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</section>
	)
}

// ─── Status Labels section ──────────────────────────────────────────────────
const StatusLabelsSection: React.FC = () => {
	const dispatch = useAppDispatch()
	const labels = useAppSelector((s: RootState) => s.statusLabels.labels)
	const [edits, setEdits] = useState<Record<number, string>>(() => ({ ...labels }))

	// Keep local edits in sync when store changes (e.g. after reset)
	useEffect(() => {
		setEdits({ ...labels })
	}, [labels])

	const handleSave = (value: number) => {
		const trimmed = (edits[value] ?? '').trim()
		if (trimmed) dispatch(setStatusLabel({ value, label: trimmed }))
	}

	const handleReset = (value: number) => {
		dispatch(resetStatusLabel(value))
	}

	const handleResetAll = () => {
		dispatch(resetAllStatusLabels())
	}

	return (
		<section className='admin-section'>
			<div className='admin-section__header'>
				<h2 className='admin-section__title'>Status Labels</h2>
				<button className='btn btn-outline btn-sm' onClick={handleResetAll}>
					Reset all
				</button>
			</div>
			<p className='admin-empty' style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
				Customise the display name for each tracking status (useful for translations).
			</p>
			<div className='admin-tags-list'>
				{TRACKING_STATUSES.map((s) => (
					<div key={s.value} className='admin-tag-row'>
						<span className='admin-status-dot' style={{ background: s.color }} />
						<input
							type='text'
							className='admin-status-label-input'
							maxLength={40}
							value={edits[s.value] ?? s.label}
							onChange={(e) => setEdits((prev) => ({ ...prev, [s.value]: e.target.value }))}
							onBlur={() => handleSave(s.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSave(s.value)}
						/>
						<div className='admin-tag-row__actions'>
							<button className='btn btn-outline btn-xs' onClick={() => handleReset(s.value)}>
								Reset
							</button>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

// ─── Import result formatter ──────────────────────────────────────────────────
function formatImportResult(r: ImportResult): string {
	const parts = [`✅ ${r.imported} imported`]
	if (r.duplicated) parts.push(`⚠️ ${r.duplicated} duplicate(s) skipped`)
	if (r.errored) parts.push(`❌ ${r.errored} error(s)`)
	const errorLines = r.errors?.length ? '\n' + r.errors.join('\n') : ''
	return parts.join(' · ') + errorLines
}

// ─── Import / Export section ──────────────────────────────────────────────────
type ImportTarget = 'characters' | 'content' | 'progress'

const ImportExportSection: React.FC = () => {
	const [busy, setBusy] = useState<string | null>(null)
	const [result, setResult] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [pendingTarget, setPendingTarget] = useState<ImportTarget | null>(null)

	const withBusy = async (key: string, fn: () => Promise<void>) => {
		setBusy(key)
		setResult(null)
		try {
			await fn()
		} catch (e: unknown) {
			setResult(`Error: ${(e as Error).message}`)
		} finally {
			setBusy(null)
		}
	}

	const handleExport = (target: ImportTarget) =>
		withBusy(`export-${target}`, async () => {
			if (target === 'characters') await dataService.exportCharacters()
			else if (target === 'content') await dataService.exportContent()
			else await dataService.exportProgress()
		})

	const handleImportClick = (target: ImportTarget) => {
		setPendingTarget(target)
		fileInputRef.current?.click()
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		e.target.value = ''
		if (!file || !pendingTarget) return
		const target = pendingTarget
		setPendingTarget(null)
		await withBusy(`import-${target}`, async () => {
			const text = await file.text()
			if (target === 'characters') {
				const r = await dataService.importCharacters(text)
				setResult(formatImportResult(r))
			} else if (target === 'content') {
				const r = await dataService.importContent(text)
				setResult(formatImportResult(r))
			} else {
				const r = await dataService.importProgress(text)
				setResult(formatImportResult(r))
			}
		})
	}

	const ITEMS: { key: ImportTarget; label: string }[] = [
		{ key: 'characters', label: 'Characters' },
		{ key: 'content', label: 'Content' },
		{ key: 'progress', label: 'Progress' },
	]

	return (
		<section className='admin-section'>
			<div className='admin-section__header'>
				<h2 className='admin-section__title'>Import / Export</h2>
			</div>
			<div className='admin-import-export'>
				<input
					ref={fileInputRef}
					type='file'
					accept='.csv,text/csv,text/plain'
					style={{ display: 'none' }}
					onChange={handleFileChange}
				/>
				{ITEMS.map(({ key, label }) => (
					<div key={key} className='admin-import-export__row'>
						<span className='admin-import-export__label'>{label}</span>
						<div className='admin-import-export__actions'>
							<button
								className='btn btn-outline btn-sm'
								disabled={!!busy}
								onClick={() => handleExport(key)}>
								{busy === `export-${key}` ? 'Exporting…' : '↓ Export CSV'}
							</button>
							<button
								className='btn btn-outline btn-sm'
								disabled={!!busy}
								onClick={() => handleImportClick(key)}>
								{busy === `import-${key}` ? 'Importing…' : '↑ Import CSV'}
							</button>
						</div>
					</div>
				))}
				{result && <p className='admin-import-export__result'>{result}</p>}
			</div>
		</section>
	)
}

// ─── Orphans section ─────────────────────────────────────────────────────────
const OrphansSection: React.FC = () => {
	const [data, setData] = useState<OrphansSummary | null>(null)
	const [users, setUsers] = useState<UserDto[]>([])
	const [loading, setLoading] = useState(true)
	const [busy, setBusy] = useState<string | null>(null)
	const [claimTarget, setClaimTarget] = useState<{
		type: 'characters' | 'contents'
		id: string
	} | null>(null)
	const [claimUserId, setClaimUserId] = useState('')
	const [confirmNuke, setConfirmNuke] = useState(false)
	const [result, setResult] = useState<string | null>(null)

	const load = async () => {
		setLoading(true)
		try {
			const [orphans, userList] = await Promise.all([
				dataService.getOrphans(),
				authService.getUsers(),
			])
			setData(orphans)
			setUsers(userList)
		} catch (e: unknown) {
			setResult(`Error loading orphans: ${(e as Error).message}`)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [])

	const withBusy = async (key: string, fn: () => Promise<void>) => {
		setBusy(key)
		setResult(null)
		try {
			await fn()
		} catch (e: unknown) {
			setResult(`Error: ${(e as Error).message}`)
		} finally {
			setBusy(null)
		}
	}

	const handleDelete = (type: 'characters' | 'contents' | 'trackings', id: string) =>
		withBusy(id, async () => {
			if (type === 'characters') await dataService.deleteOrphanCharacter(id)
			else if (type === 'contents') await dataService.deleteOrphanContent(id)
			else await dataService.deleteOrphanTracking(id)
			await load()
		})

	const openClaim = (type: 'characters' | 'contents', id: string) => {
		setClaimTarget({ type, id })
		setClaimUserId(users[0]?.id ?? '')
	}

	const handleClaim = async () => {
		if (!claimTarget || !claimUserId) return
		await withBusy(claimTarget.id, async () => {
			if (claimTarget.type === 'characters')
				await dataService.claimOrphanCharacter(claimTarget.id, claimUserId)
			else await dataService.claimOrphanContent(claimTarget.id, claimUserId)
			setClaimTarget(null)
			await load()
		})
	}

	const handleNukeAll = async () => {
		setConfirmNuke(false)
		await withBusy('nuke', async () => {
			const r = await dataService.deleteAllOrphans()
			setResult(
				`Deleted: ${r.deletedCharacters} character(s), ${r.deletedContents} content(s), ${r.deletedTrackings} tracking(s)`
			)
			await load()
		})
	}

	const total =
		(data?.characters.length ?? 0) + (data?.contents.length ?? 0) + (data?.trackings.length ?? 0)

	return (
		<section className='admin-section'>
			<div className='admin-section__header'>
				<h2 className='admin-section__title'>
					Orphaned Records
					{!loading && total > 0 && <span className='admin-orphans__badge'>{total}</span>}
				</h2>
				{!loading && total > 0 && (
					<button
						className='btn btn-danger btn-sm'
						disabled={!!busy}
						onClick={() => setConfirmNuke(true)}>
						Delete All
					</button>
				)}
			</div>

			{loading ? (
				<p className='admin-empty'>Loading…</p>
			) : total === 0 ? (
				<p className='admin-empty'>No orphaned records found.</p>
			) : (
				<div className='admin-orphans'>
					{/* Characters */}
					{data!.characters.length > 0 && (
						<div className='admin-orphans__group'>
							<div className='admin-orphans__group-title'>
								Characters ({data!.characters.length})
							</div>
							<table className='admin-table'>
								<thead>
									<tr>
										<th>Name</th>
										<th>Class</th>
										<th>Race</th>
										<th>Level</th>
										<th className='admin-table__actions'></th>
									</tr>
								</thead>
								<tbody>
									{data!.characters.map((c) => (
										<tr key={c.id}>
											<td>{c.name}</td>
											<td>{c.class}</td>
											<td className='admin-table__muted'>{c.race ?? '—'}</td>
											<td className='admin-table__muted'>{c.level ?? '—'}</td>
											<td className='admin-table__actions'>
												<div className='admin-orphans__row-actions'>
													<button
														className='btn btn-outline btn-xs'
														disabled={!!busy}
														onClick={() => openClaim('characters', c.id)}>
														Claim
													</button>
													<button
														className='btn btn-danger btn-xs'
														disabled={!!busy}
														onClick={() => handleDelete('characters', c.id)}>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{/* Contents */}
					{data!.contents.length > 0 && (
						<div className='admin-orphans__group'>
							<div className='admin-orphans__group-title'>Content ({data!.contents.length})</div>
							<table className='admin-table'>
								<thead>
									<tr>
										<th>Name</th>
										<th>Expansion</th>
										<th className='admin-table__actions'></th>
									</tr>
								</thead>
								<tbody>
									{data!.contents.map((c) => (
										<tr key={c.id}>
											<td>{c.name}</td>
											<td className='admin-table__muted'>{c.expansion}</td>
											<td className='admin-table__actions'>
												<div className='admin-orphans__row-actions'>
													<button
														className='btn btn-outline btn-xs'
														disabled={!!busy}
														onClick={() => openClaim('contents', c.id)}>
														Claim
													</button>
													<button
														className='btn btn-danger btn-xs'
														disabled={!!busy}
														onClick={() => handleDelete('contents', c.id)}>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{/* Trackings */}
					{data!.trackings.length > 0 && (
						<div className='admin-orphans__group'>
							<div className='admin-orphans__group-title'>Trackings ({data!.trackings.length})</div>
							<table className='admin-table'>
								<thead>
									<tr>
										<th>Character</th>
										<th>Content</th>
										<th>Issue</th>
										<th className='admin-table__actions'></th>
									</tr>
								</thead>
								<tbody>
									{data!.trackings.map((t) => (
										<tr key={t.id}>
											<td>{t.characterName}</td>
											<td>{t.contentName}</td>
											<td className='admin-table__muted admin-orphans__issue'>
												{!t.characterOwned && <span>orphan character</span>}
												{!t.contentOwned && <span>orphan content</span>}
											</td>
											<td className='admin-table__actions'>
												<button
													className='btn btn-danger btn-xs'
													disabled={!!busy}
													onClick={() => handleDelete('trackings', t.id)}>
													Delete
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{result && <p className='admin-orphans__result'>{result}</p>}

			{/* Claim Modal */}
			{claimTarget && (
				<Modal open={true} title='Claim Orphan' onClose={() => setClaimTarget(null)}>
					<div className='admin-form'>
						<p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
							Assign this orphaned record to a user.
						</p>
						<div className='form-group'>
							<label className='form-label'>User</label>
							<select
								className='form-input'
								value={claimUserId}
								onChange={(e) => setClaimUserId(e.target.value)}>
								{users.map((u) => (
									<option key={u.id} value={u.id}>
										{u.userName} ({u.email})
									</option>
								))}
							</select>
						</div>
						<div className='admin-form__actions'>
							<button className='btn btn-outline' onClick={() => setClaimTarget(null)}>
								Cancel
							</button>
							<button
								className='btn btn-primary'
								disabled={!claimUserId || !!busy}
								onClick={handleClaim}>
								Assign
							</button>
						</div>
					</div>
				</Modal>
			)}

			{/* Nuke confirmation */}
			{confirmNuke && (
				<ConfirmDialog
					open={true}
					title='Delete All Orphans'
					message={`This will permanently delete ${data!.characters.length} character(s), ${data!.contents.length} content(s) and ${data!.trackings.length} tracking(s). This cannot be undone.`}
					confirmLabel='Delete All'
					danger={true}
					onConfirm={handleNukeAll}
					onCancel={() => setConfirmNuke(false)}
				/>
			)}
		</section>
	)
}

// ─── Reset section ────────────────────────────────────────────────────────────
const SIMULATION_DELAY_MS = 10_000

const ResetSection: React.FC = () => {
	const dispatch = useAppDispatch()
	const simDaily = useAppSelector(selectSimDailyReset)
	const simWeekly = useAppSelector(selectSimWeeklyReset)
	const refetchToken = useAppSelector(selectRefetchToken)
	const [lastResult, setLastResult] = useState<string | null>(null)

	// Show confirmation once a reset actually fires (refetchToken increments)
	const prevTokenRef = useRef(refetchToken)
	useEffect(() => {
		if (refetchToken > prevTokenRef.current) {
			setLastResult('Reset triggered — statuses updated')
			prevTokenRef.current = refetchToken
		}
	}, [refetchToken])

	const handleSimulate = (type: 'daily' | 'weekly') => {
		const at = new Date(Date.now() + SIMULATION_DELAY_MS).toISOString()
		dispatch(setSimulatedReset({ type, at }))
		setLastResult(null)
	}

	const pendingDaily = simDaily !== null
	const pendingWeekly = simWeekly !== null

	return (
		<section className='admin-section'>
			<div className='admin-section__header'>
				<h2 className='admin-section__title'>Force Reset</h2>
			</div>
			<div className='admin-reset'>
				<p className='admin-reset__desc'>
					Simulate a WoW server reset. The countdown in the header will jump to{' '}
					<strong>10 seconds</strong>, then the reset fires and statuses update. Afterwards the real
					timer resumes.
				</p>
				<p className='admin-reset__desc'>
					<strong>Daily</strong> (daily-frequency only): Finished &rarr; LastDay &middot; LastDay /
					InProgress / Pending &rarr; NotStarted.
					<br />
					<strong>Weekly</strong> (weekly-frequency only, then also runs daily): Finished &rarr;
					LastWeek &middot; LastWeek / InProgress / Pending &rarr; NotStarted.
				</p>
				<div className='admin-reset__buttons'>
					<button
						className='btn btn-outline'
						disabled={pendingDaily}
						onClick={() => handleSimulate('daily')}>
						{pendingDaily ? '⏳ Daily reset in ~10s…' : '↺ Force Daily Reset'}
					</button>
					<button
						className='btn btn-outline'
						disabled={pendingWeekly}
						onClick={() => handleSimulate('weekly')}>
						{pendingWeekly ? '⏳ Weekly reset in ~10s…' : '↺ Force Weekly Reset'}
					</button>
				</div>
				{lastResult && <p className='admin-reset__result'>{lastResult}</p>}
			</div>
		</section>
	)
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const AdminPage: React.FC = () => {
	const isAdmin = useAppSelector(selectIsAdmin)
	return (
		<div className='admin-page'>
			<div className='admin-page__header'>
				<h1 className='admin-page__title'>Settings</h1>
			</div>
			<div className='admin-page__body'>
				{isAdmin && <UsersSection />}
				<WarbandsSection />
				<MotivesSection />
				<StatusLabelsSection />
				<ImportExportSection />
				{isAdmin && <OrphansSection />}
				{isAdmin && <ResetSection />}
			</div>
		</div>
	)
}
