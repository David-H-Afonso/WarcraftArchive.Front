import React, { useState } from 'react'
import { trackingService } from '@/services'
import type { Tracking } from '@/models/api/Tracking'
import { DIFFICULTY_LABELS, FREQUENCY_LABELS, STATUS_LABELS } from '@/utils/enumHelpers'

const difficultyOptions = Object.entries(DIFFICULTY_LABELS)
const frequencyOptions = Object.entries(FREQUENCY_LABELS)
const statusOptions = Object.entries(STATUS_LABELS)

export const TrackingsSection: React.FC = () => {
	const [trackings, setTrackings] = useState<Tracking[]>([])
	const [result, setResult] = useState<unknown>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<string | null>(null)

	// Filters
	const [fCharacterId, setFCharacterId] = useState('')
	const [fStatus, setFStatus] = useState('')
	const [fFrequency, setFFrequency] = useState('')
	const [fExpansion, setFExpansion] = useState('')

	// Create
	const [cCharacterId, setCCharacterId] = useState('')
	const [cContentId, setCContentId] = useState('')
	const [cDifficulty, setCDifficulty] = useState('1')
	const [cFrequency, setCFrequency] = useState('2')
	const [cStatus, setCStatus] = useState('0')
	const [cComment, setCComment] = useState('')

	// Edit
	const [editId, setEditId] = useState('')
	const [editDifficulty, setEditDifficulty] = useState('1')
	const [editFrequency, setEditFrequency] = useState('2')
	const [editStatus, setEditStatus] = useState('0')
	const [editComment, setEditComment] = useState('')

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
			const list = await trackingService.getAll({
				characterId: fCharacterId || undefined,
				status: fStatus !== '' ? parseInt(fStatus) : undefined,
				frequency: fFrequency !== '' ? parseInt(fFrequency) : undefined,
				expansion: fExpansion || undefined,
			})
			setTrackings(list)
			return list
		})

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault()
		run('create', async () => {
			const t = await trackingService.create({
				characterId: cCharacterId,
				contentId: cContentId,
				difficulty: parseInt(cDifficulty),
				frequency: parseInt(cFrequency),
				status: parseInt(cStatus),
				comment: cComment || null,
			})
			setCCharacterId('')
			setCContentId('')
			setCDifficulty('1')
			setCFrequency('2')
			setCStatus('0')
			setCComment('')
			return t
		})
	}

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault()
		run('update', async () => {
			const t = await trackingService.update(editId, {
				difficulty: parseInt(editDifficulty),
				frequency: parseInt(editFrequency),
				status: parseInt(editStatus),
				comment: editComment || null,
			})
			setEditId('')
			return t
		})
	}

	const handleDelete = (id: string) =>
		run('delete', async () => {
			await trackingService.delete(id)
			setTrackings((prev) => prev.filter((t) => t.id !== id))
			return { deleted: id }
		})

	return (
		<div className='section-body'>
			<div className='filter-row'>
				<input
					placeholder='Character ID'
					value={fCharacterId}
					onChange={(e) => setFCharacterId(e.target.value)}
				/>
				<select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
					<option value=''>All statuses</option>
					{statusOptions.map(([k, v]) => (
						<option key={k} value={k}>
							{v}
						</option>
					))}
				</select>
				<select value={fFrequency} onChange={(e) => setFFrequency(e.target.value)}>
					<option value=''>All frequencies</option>
					{frequencyOptions.map(([k, v]) => (
						<option key={k} value={k}>
							{v}
						</option>
					))}
				</select>
				<input
					placeholder='Expansion'
					value={fExpansion}
					onChange={(e) => setFExpansion(e.target.value)}
				/>
				<button className='btn btn-secondary' onClick={handleGetAll} disabled={!!loading}>
					{loading === 'getAll' ? '…' : 'Search'}
				</button>
			</div>

			{trackings.length > 0 && (
				<div className='list-table'>
					<table>
						<thead>
							<tr>
								<th>Character</th>
								<th>Content</th>
								<th>Difficulty</th>
								<th>Frequency</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{trackings.map((t) => (
								<tr key={t.id}>
									<td>{t.characterName}</td>
									<td>{t.contentName}</td>
									<td>{DIFFICULTY_LABELS[t.difficulty]}</td>
									<td>{FREQUENCY_LABELS[t.frequency]}</td>
									<td>{STATUS_LABELS[t.status]}</td>
									<td>
										<button
											className='btn btn-xs btn-outline'
											onClick={() => {
												setEditId(t.id)
												setEditDifficulty(t.difficulty.toString())
												setEditFrequency(t.frequency.toString())
												setEditStatus(t.status.toString())
												setEditComment(t.comment ?? '')
											}}>
											Edit
										</button>{' '}
										<button
											className='btn btn-xs btn-danger'
											onClick={() => handleDelete(t.id)}
											disabled={!!loading}>
											Del
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<fieldset className='sub-form'>
				<legend>Create Tracking</legend>
				<form className='inline-form' onSubmit={handleCreate}>
					<div className='form-row'>
						<div className='form-group'>
							<label>Character ID</label>
							<input
								value={cCharacterId}
								onChange={(e) => setCCharacterId(e.target.value)}
								required
							/>
						</div>
						<div className='form-group'>
							<label>Content ID</label>
							<input value={cContentId} onChange={(e) => setCContentId(e.target.value)} required />
						</div>
						<div className='form-group'>
							<label>Difficulty</label>
							<select value={cDifficulty} onChange={(e) => setCDifficulty(e.target.value)}>
								{difficultyOptions.map(([k, v]) => (
									<option key={k} value={k}>
										{v}
									</option>
								))}
							</select>
						</div>
						<div className='form-group'>
							<label>Frequency</label>
							<select value={cFrequency} onChange={(e) => setCFrequency(e.target.value)}>
								{frequencyOptions.map(([k, v]) => (
									<option key={k} value={k}>
										{v}
									</option>
								))}
							</select>
						</div>
						<div className='form-group'>
							<label>Status</label>
							<select value={cStatus} onChange={(e) => setCStatus(e.target.value)}>
								{statusOptions.map(([k, v]) => (
									<option key={k} value={k}>
										{v}
									</option>
								))}
							</select>
						</div>
						<div className='form-group'>
							<label>Comment</label>
							<input value={cComment} onChange={(e) => setCComment(e.target.value)} />
						</div>
					</div>
					<button type='submit' className='btn btn-primary' disabled={!!loading}>
						{loading === 'create' ? '…' : 'Create'}
					</button>
				</form>
			</fieldset>

			{editId && (
				<fieldset className='sub-form'>
					<legend>Update Tracking</legend>
					<form className='inline-form' onSubmit={handleUpdate}>
						<div className='form-row'>
							<div className='form-group'>
								<label>Difficulty</label>
								<select value={editDifficulty} onChange={(e) => setEditDifficulty(e.target.value)}>
									{difficultyOptions.map(([k, v]) => (
										<option key={k} value={k}>
											{v}
										</option>
									))}
								</select>
							</div>
							<div className='form-group'>
								<label>Frequency</label>
								<select value={editFrequency} onChange={(e) => setEditFrequency(e.target.value)}>
									{frequencyOptions.map(([k, v]) => (
										<option key={k} value={k}>
											{v}
										</option>
									))}
								</select>
							</div>
							<div className='form-group'>
								<label>Status</label>
								<select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
									{statusOptions.map(([k, v]) => (
										<option key={k} value={k}>
											{v}
										</option>
									))}
								</select>
							</div>
							<div className='form-group'>
								<label>Comment</label>
								<input value={editComment} onChange={(e) => setEditComment(e.target.value)} />
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
