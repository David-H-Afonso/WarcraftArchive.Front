import React from 'react'
import './TagBadge.scss'

interface TagBadgeProps {
	label: string
	color?: string
	size?: 'sm' | 'md'
}

export const TagBadge: React.FC<TagBadgeProps> = ({ label, color, size = 'md' }) => {
	const bg = color ?? '#3a3d54'
	// Darken & desaturate for bg, use color for text
	return (
		<span
			className={`tag-badge tag-badge--${size}`}
			style={{
				background: `${bg}22`,
				color: color ?? 'var(--color-text-muted)',
				borderColor: `${bg}55`,
			}}>
			{color && <span className='tag-badge__dot' style={{ background: color }} />}
			{label}
		</span>
	)
}
