import React, { useState } from 'react'
import { contentService } from '@/services'
import type { Content } from '@/models/api/Content'
import { DIFFICULTY_FLAGS, bitmaskToLabels } from '@/utils/enumHelpers'

const FlagCheckboxes: React.FC<{
	flags: Array<{ label: string; value: number }>
	value: number
	onChange: (v: number) => void
}> = ({ flags, value, onChange }) => (
	<div className='flag-group'>
		{flags.map((f) => (
			<label key={f.value} className='flag-label'>
				<input
					type='checkbox'
					checked={(value & f.value) !== 0}
					onChange={(e) => {
						const next = e.target.checked ? value | f.value : value & ~f.value
						onChange(next)
					}}
				/>{' '}
				{f.label}
			</label>
		))}
	</div>
)

export const ContentsSection: React.FC = () => {
	const [contents, setContents] = useState<Content[]>([])
	const [result, setResult] = useState<unknown>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<string | null>(null)

	// Filter
	const [filterName, setFilterName] = useState('')
	const [filterExpansion, setFilterExpansion] = useState('')

	// Create
	const [cName, setCName] = useState('')
	const [cExpansion, setCExpansion] = useState('')
	const [cComment, setCComment] = useState('')
	const [cDiff, setCDiff] = useState(0)
	const [cMotives, setCMotives] = useState<string[]>([])

	// Edit
	const [editId, setEditId] = useState('')
	const [editName, setEditName] = useState('')
	const [editExpansion, setEditExpansion] = useState('')
	const [editComment, setEditComment] = useState('')
	const [editDiff, setEditDiff] = useState(0)
	const [editMotives, setEditMotives] = useState<string[]>([])

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
			const list = await contentService.getAll({
				name: filterName || undefined,
				expansion: filterExpansion || undefined,
			})
			setContents(list)
			return list
		})

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault()
		run('create', async () => {
			const c = await contentService.create({
				name: cName,
				expansion: cExpansion,
				comment: cComment || null,
				allowedDifficulties: cDiff,
				motiveIds: cMotives,
			})
			setCName('')
			setCExpansion('')
			setCComment('')
			setCDiff(0)
			setCMotives([])
			return c
		})
	}

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault()
		run('update', async () => {
			const c = await contentService.update(editId, {
				name: editName,
				expansion: editExpansion,
				comment: editComment || null,
				allowedDifficulties: editDiff,
				motiveIds: editMotives,
			})
			setEditId('')
			return c
		})
	}

	const handleDelete = (id: string) =>
		run('delete', async () => {
			await contentService.delete(id)
			setContents((prev) => prev.filter((c) => c.id !== id))
			return { deleted: id }
		})

	return (
		<div className='section-body'>
			<div className='filter-row'>
				<input
					placeholder='Filter by name'
					value={filterName}
					onChange={(e) => setFilterName(e.target.value)}
				/>
				<input
					placeholder='Filter by expansion'
					value={filterExpansion}
					onChange={(e) => setFilterExpansion(e.target.value)}
				/>
				<button className='btn btn-secondary' onClick={handleGetAll} disabled={!!loading}>
					{loading === 'getAll' ? '…' : 'Search'}
				</button>
			</div>

			{contents.length > 0 && (
				<div className='list-table'>
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Expansion</th>
								<th>Difficulties</th>
								<th>Motives</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{contents.map((c) => (
								<tr key={c.id}>
									<td>{c.name}</td>
									<td>{c.expansion}</td>
									<td>{bitmaskToLabels(c.allowedDifficulties, DIFFICULTY_FLAGS).join(', ')}</td>
									<td>{c.motives.map((m) => m.name).join(', ')}</td>
									<td>
										<button
											className='btn btn-xs btn-outline'
											onClick={() => {
												setEditId(c.id)
												setEditName(c.name)
												setEditExpansion(c.expansion)
												setEditComment(c.comment ?? '')
												setEditDiff(c.allowedDifficulties)
												setEditMotives(c.motives.map((m) => m.id))
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
				<legend>Create Content</legend>
				<form className='inline-form' onSubmit={handleCreate}>
					<div className='form-row'>
						<div className='form-group'>
							<label>Name</label>
							<input value={cName} onChange={(e) => setCName(e.target.value)} required />
						</div>
						<div className='form-group'>
							<label>Expansion</label>
							<input value={cExpansion} onChange={(e) => setCExpansion(e.target.value)} required />
						</div>
						<div className='form-group'>
							<label>Comment</label>
							<input value={cComment} onChange={(e) => setCComment(e.target.value)} />
						</div>
					</div>
					<div className='form-row'>
						<div className='form-group'>
							<label>Allowed Difficulties</label>
							<FlagCheckboxes flags={DIFFICULTY_FLAGS} value={cDiff} onChange={setCDiff} />
						</div>
						<div className='form-group'>
							<label>Motives</label>
							{/* Motives: use new Content tab */}
						</div>
					</div>
					<button type='submit' className='btn btn-primary' disabled={!!loading}>
						{loading === 'create' ? '…' : 'Create'}
					</button>
				</form>
			</fieldset>

			{editId && (
				<fieldset className='sub-form'>
					<legend>Update Content</legend>
					<form className='inline-form' onSubmit={handleUpdate}>
						<div className='form-row'>
							<div className='form-group'>
								<label>Name</label>
								<input value={editName} onChange={(e) => setEditName(e.target.value)} required />
							</div>
							<div className='form-group'>
								<label>Expansion</label>
								<input
									value={editExpansion}
									onChange={(e) => setEditExpansion(e.target.value)}
									required
								/>
							</div>
							<div className='form-group'>
								<label>Comment</label>
								<input value={editComment} onChange={(e) => setEditComment(e.target.value)} />
							</div>
						</div>
						<div className='form-row'>
							<div className='form-group'>
								<label>Allowed Difficulties</label>
								<FlagCheckboxes flags={DIFFICULTY_FLAGS} value={editDiff} onChange={setEditDiff} />
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

// Suppress unused import warning
