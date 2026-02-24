import React, { useState, useEffect } from 'react'
import { authService, warbandService, userMotiveService } from '@/services'
import type { UserDto } from '@/models/api/Auth'
import type { Warband, CreateWarbandRequest } from '@/models/api/Warband'
import type { UserMotive, CreateUserMotiveRequest } from '@/models/api/UserMotive'
import { Modal } from '@/components/elements/Modal/Modal'
import { ConfirmDialog } from '@/components/elements/ConfirmDialog/ConfirmDialog'
import { TagBadge } from '@/components/elements/TagBadge/TagBadge'
import './AdminPage.scss'

// ─── Users section ────────────────────────────────────────────────────────────
const UsersSection: React.FC = () => {
	const [users, setUsers] = useState<UserDto[]>([])
	const [loading, setLoading] = useState(true)
	const [showCreate, setShowCreate] = useState(false)
	const [form, setForm] = useState({ email: '', userName: '', password: '', isAdmin: false })
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

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
							</tr>
						))}
					</tbody>
				</table>
			)}

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
			setItems(data)
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
					{items.map((w) => (
						<div key={w.id} className='admin-tag-row'>
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
			setItems(data)
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

// ─── Main page ────────────────────────────────────────────────────────────────
export const AdminPage: React.FC = () => {
	return (
		<div className='admin-page'>
			<div className='admin-page__header'>
				<h1 className='admin-page__title'>Admin</h1>
			</div>
			<div className='admin-page__body'>
				<UsersSection />
				<WarbandsSection />
				<MotivesSection />
			</div>
		</div>
	)
}
