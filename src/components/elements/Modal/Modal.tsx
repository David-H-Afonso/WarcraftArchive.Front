import React, { useEffect } from 'react'
import './Modal.scss'

interface ModalProps {
	open: boolean
	title: string
	onClose: () => void
	children: React.ReactNode
	width?: string
}

export const Modal: React.FC<ModalProps> = ({
	open,
	title,
	onClose,
	children,
	width = '480px',
}) => {
	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [open, onClose])

	if (!open) return null

	return (
		<div className='modal-overlay' onMouseDown={onClose}>
			<div className='modal' style={{ maxWidth: width }} onMouseDown={(e) => e.stopPropagation()}>
				<div className='modal__header'>
					<h3 className='modal__title'>{title}</h3>
					<button className='modal__close' onClick={onClose} aria-label='Close'>
						×
					</button>
				</div>
				<div className='modal__body'>{children}</div>
			</div>
		</div>
	)
}
