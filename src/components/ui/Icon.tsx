import { Icon as IconifyIcon } from '@iconify/react'
import { TABLER_ICONS, TABLER_ICONS_FILLED } from '@/constants/ui'

type IconName = keyof typeof TABLER_ICONS

type Props = {
  name: IconName
  className?: string
  size?: number
  filled?: boolean
}

export function Icon({ name, className = '', size = 16, filled = false }: Props) {
  let iconName = filled ? TABLER_ICONS_FILLED[name] : TABLER_ICONS[name]
  
  if (name === 'sort' && filled) {
    iconName = TABLER_ICONS.sortActive
  } else if (name === 'sort' && !filled) {
    iconName = TABLER_ICONS.sort
  }
  
  return (
    <IconifyIcon 
      icon={iconName} 
      className={`transition-all duration-200 ${className}`}
      width={size}
      height={size}
    />
  )
}
