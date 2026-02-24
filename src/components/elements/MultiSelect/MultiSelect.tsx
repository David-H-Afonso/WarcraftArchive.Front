import React from 'react'
import './MultiSelect.scss'

export interface MultiSelectOption {
	value: string | number
	label: string
	color?: string
}

interface MultiSelectProps {
	options: MultiSelectOption[]
	values: (string | number)[]
	onChange: (values: (string | number)[]) => void
	disabled?: boolean
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
	options,
	values,
	onChange,
	disabled = false,
}) => {
	const toggle = (val: string | number) => {
		if (values.includes(val)) {
			onChange(values.filter((v) => v !== val))
		} else {
			onChange([...values, val])
		}
	}

	return (
		<div className={`multi-select ${disabled ? 'multi-select--disabled' : ''}`}>
			{options.map((opt) => {
				const active = values.includes(opt.value)
				return (
					<button
						key={opt.value}
						type='button'
						className={`multi-select__chip ${active ? 'multi-select__chip--active' : ''}`}
						style={active && opt.color ? { background: opt.color, borderColor: opt.color } : {}}
						onClick={() => toggle(opt.value)}>
						{opt.color && !active && (
							<span className='multi-select__color-dot' style={{ background: opt.color }} />
						)}
						{opt.label}
					</button>
				)
			})}
		</div>
	)
}
