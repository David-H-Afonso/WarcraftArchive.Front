import React from 'react'
import { Modal } from '../Modal/Modal'

interface ConfirmDialogProps {
	open: boolean
	title?: string
	message: string
	confirmLabel?: string
	onConfirm: () => void
	onCancel: () => void
	danger?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	open,
	title = 'Confirm',
	message,
	confirmLabel = 'Confirm',
	onConfirm,
	onCancel,
	danger = true,
}) => {
	return (
		<Modal open={open} title={title} onClose={onCancel} width='380px'>
			<p style={{ margin: '0 0 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
				{message}
			</p>
			<div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
				<button className='btn btn-secondary btn-sm' onClick={onCancel}>
					Cancel
				</button>
				<button
					className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
					onClick={onConfirm}>
					{confirmLabel}
				</button>
			</div>
		</Modal>
	)
}
