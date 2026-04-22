import { Box, type BoxProps } from '@mantine/core'
import type { ReactNode } from 'react'

type HeroBackdropProps = Omit<BoxProps, 'style'> & {
  imageUrl: string
  /** CSS color stops for overlay; keep text readable on bright sites */
  overlayGradient: string
  children: ReactNode
  style?: BoxProps['style']
}

/**
 * Full-width hero block with a cover photo and gradient overlay.
 * Overlay should include semi-opaque stops so copy stays readable.
 */
export function HeroBackdrop({
  imageUrl,
  overlayGradient,
  children,
  style,
  ...boxProps
}: HeroBackdropProps) {
  return (
    <Box
      pos="relative"
      {...boxProps}
      style={{
        ...style,
        backgroundImage: `${overlayGradient}, url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </Box>
  )
}
