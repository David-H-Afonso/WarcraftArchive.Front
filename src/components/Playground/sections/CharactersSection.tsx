import React, { useState } from 'react'
import { characterService } from '@/services'
import type { Character } from '@/models/api/Character'

export const CharactersSection: React.FC = () => {
	const [characters, setCharacters] = useState<Character[]>([])
	const [result, setResult] = useState<unknown>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<string | null>(null)

	// Create form
	const [cName, setCName] = useState('')
	const [cClass, setCClass] = useState('')
	const [cLevel, setCLevel] = useState('')
	const [cCovenant, setCCovenant] = useState('')
	const [cWarband, setCWarband] = useState('')

	// Update form
	const [editId, setEditId] = useState('')
	const [editName, setEditName] = useState('')
	const [editClass, setEditClass] = useState('')
	const [editLevel, setEditLevel] = useState('')

	const run = async (key: string, fn: () => Promise<unknown>) => {
		setLoading(key)
		setError(null)
		setResult(null)
		try {
			const res = await fn()
			setResult(res)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error')
		} finally {
			setLoading(null)
		}
	}

	const handleGetAll = () =>
		run('getAll', async () => {
			const list = await characterService.getAll()
			setCharacters(list)
			return list
		})

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault()
		run('create', async () => {
			const ch = await characterService.create({
				name: cName,
				class: cClass,
				level: cLevel ? parseInt(cLevel) : null,
				covenant: cCovenant || null,
				warbandId: null,
			})
			setCName('')
			setCClass('')
			setCLevel('')
			setCCovenant('')
			setCWarband('')
			return ch
		})
	}

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault()
		run('update', async () => {
			const ch = await characterService.update(editId, {
				name: editName,
				class: editClass,
				level: editLevel ? parseInt(editLevel) : null,
			})
			setEditId('')
			setEditName('')
			setEditClass('')
			setEditLevel('')
			return ch
		})
	}

	const handleDelete = (id: string) =>
		run('delete', async () => {
			await characterService.delete(id)
			setCharacters((prev) => prev.filter((c) => c.id !== id))
			return { deleted: id }
		})

	return (
		<div className='section-body'>
			<div className='btn-row'>
				<button className='btn btn-secondary' onClick={handleGetAll} disabled={!!loading}>
					{loading === 'getAll' ? '…' : 'GET all characters'}
				</button>
			</div>

			{characters.length > 0 && (
				<div className='list-table'>
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Class</th>
								<th>Level</th>
								<th>Covenant</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{characters.map((c) => (
								<tr key={c.id}>
									<td className='mono'>{c.id.slice(0, 8)}…</td>
									<td>{c.name}</td>
									<td>{c.class}</td>
									<td>{c.level ?? '—'}</td>
									<td>{c.covenant ?? '—'}</td>
									<td>
										<button
											className='btn btn-xs btn-outline'
											onClick={() => {
												setEditId(c.id)
												setEditName(c.name)
												setEditClass(c.class)
												setEditLevel(c.level?.toString() ?? '')
											}}>
											Edit
										</button>{' '}
										<button
											className='btn btn-xs btn-danger'
											onClick={() => handleDelete(c.id)}
											disabled={!!loading}>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<fieldset className='sub-form'>
				<legend>Create Character</legend>
				<form className='inline-form' onSubmit={handleCreate}>
					<div className='form-row'>
						<div className='form-group'>
							<label>Name</label>
							<input value={cName} onChange={(e) => setCName(e.target.value)} required />
						</div>
						<div className='form-group'>
							<label>Class</label>
							<input value={cClass} onChange={(e) => setCClass(e.target.value)} required />
						</div>
						<div className='form-group'>
							<label>Level</label>
							<input type='number' value={cLevel} onChange={(e) => setCLevel(e.target.value)} />
						</div>
						<div className='form-group'>
							<label>Covenant</label>
							<input value={cCovenant} onChange={(e) => setCCovenant(e.target.value)} />
						</div>
						<div className='form-group'>
							<label>Warband</label>
							<input value={cWarband} onChange={(e) => setCWarband(e.target.value)} />
						</div>
					</div>
					<button type='submit' className='btn btn-primary' disabled={!!loading}>
						{loading === 'create' ? '…' : 'Create'}
					</button>
				</form>
			</fieldset>

			{editId && (
				<fieldset className='sub-form'>
					<legend>Update Character</legend>
					<form className='inline-form' onSubmit={handleUpdate}>
						<div className='form-row'>
							<div className='form-group'>
								<label>ID</label>
								<input value={editId} readOnly className='mono' />
							</div>
							<div className='form-group'>
								<label>Name</label>
								<input value={editName} onChange={(e) => setEditName(e.target.value)} required />
							</div>
							<div className='form-group'>
								<label>Class</label>
								<input value={editClass} onChange={(e) => setEditClass(e.target.value)} required />
							</div>
							<div className='form-group'>
								<label>Level</label>
								<input
									type='number'
									value={editLevel}
									onChange={(e) => setEditLevel(e.target.value)}
								/>
							</div>
						</div>
						<div className='btn-row'>
							<button type='submit' className='btn btn-primary' disabled={!!loading}>
								{loading === 'update' ? '…' : 'Update'}
							</button>
							<button type='button' className='btn btn-outline' onClick={() => setEditId('')}>
								Cancel
							</button>
						</div>
					</form>
				</fieldset>
			)}

			{error && <p className='result-error'>{error}</p>}
			{result !== null && (
				<pre className='result-json'>
					<code>{JSON.stringify(result, null, 2)}</code>
				</pre>
			)}
		</div>
	)
}
