import React, { useState, useRef, useEffect } from 'react'
import './SearchableSelect.scss'

export interface SelectOption {
	value: string
	label: string
	color?: string
}

interface SearchableSelectProps {
	options: SelectOption[]
	value: string | null
	onChange: (value: string | null) => void
	placeholder?: string
	clearable?: boolean
	disabled?: boolean
	className?: string
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
	options,
	value,
	onChange,
	placeholder = 'Select...',
	clearable = true,
	disabled = false,
	className = '',
}) => {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [dropStyle, setDropStyle] = useState<React.CSSProperties>({})
	const containerRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const selected = options.find((o) => o.value === value) ?? null

	const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))

	useEffect(() => {
		const onClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false)
				setSearch('')
			}
		}
		document.addEventListener('mousedown', onClickOutside)
		return () => document.removeEventListener('mousedown', onClickOutside)
	}, [])

	const handleToggle = () => {
		if (disabled) return
		if (open) {
			setOpen(false)
			setSearch('')
			return
		}
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect()
			setDropStyle({
				position: 'fixed',
				top: rect.bottom + 2,
				left: rect.left,
				width: rect.width,
				right: 'auto',
			})
		}
		setOpen(true)
		setTimeout(() => inputRef.current?.focus(), 10)
	}

	const handleSelect = (opt: SelectOption) => {
		onChange(opt.value)
		setOpen(false)
		setSearch('')
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onChange(null)
	}

	return (
		<div
			ref={containerRef}
			className={`searchable-select ${open ? 'searchable-select--open' : ''} ${disabled ? 'searchable-select--disabled' : ''} ${className}`}>
			<div className='searchable-select__control' onClick={handleToggle}>
				{selected ? (
					<span className='searchable-select__value'>
						{selected.color && (
							<span
								className='searchable-select__color-dot'
								style={{ background: selected.color }}
							/>
						)}
						{selected.label}
					</span>
				) : (
					<span className='searchable-select__placeholder'>{placeholder}</span>
				)}
				<div className='searchable-select__actions'>
					{clearable && value && (
						<button
							type='button'
							className='searchable-select__clear'
							onClick={handleClear}
							aria-label='Clear'>
							×
						</button>
					)}
					<span className='searchable-select__arrow'>{open ? '▲' : '▼'}</span>
				</div>
			</div>

			{open && (
				<div className='searchable-select__dropdown' style={dropStyle}>
					<input
						ref={inputRef}
						type='text'
						className='searchable-select__search'
						placeholder='Search...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onBlur={(e) => {
							if (!containerRef.current?.contains(e.relatedTarget as Node)) {
								setOpen(false)
								setSearch('')
							}
						}}
					/>
					<ul className='searchable-select__list'>
						{filtered.length === 0 ? (
							<li className='searchable-select__no-results'>No results</li>
						) : (
							filtered.map((opt) => (
								<li
									key={opt.value}
									className={`searchable-select__option ${opt.value === value ? 'searchable-select__option--selected' : ''}`}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => handleSelect(opt)}>
									{opt.color && (
										<span
											className='searchable-select__color-dot'
											style={{ background: opt.color }}
										/>
									)}
									{opt.label}
								</li>
							))
						)}
					</ul>
				</div>
			)}
		</div>
	)
}
