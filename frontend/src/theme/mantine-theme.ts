import { createTheme, type MantineColorsTuple } from '@mantine/core'

/** Warm accent — Taekwondo energy */
const siaCoral: MantineColorsTuple = [
  '#fff4f2',
  '#ffe8e4',
  '#ffd5cc',
  '#ffb3a3',
  '#ff8f7a',
  '#ff6b52',
  '#f54a32',
  '#d63a24',
  '#b02e1c',
  '#8c2618',
]

/** Cool primary — clarity & motion */
const siaSky: MantineColorsTuple = [
  '#eef9ff',
  '#dcf2ff',
  '#b8e6ff',
  '#7ad4ff',
  '#38c0fc',
  '#0ea5e9',
  '#0284c7',
  '#0369a1',
  '#075985',
  '#0c4a6e',
]

export const mantineTheme = createTheme({
  primaryColor: 'siaSky',
  colors: {
    siaSky,
    siaCoral,
  },
  defaultRadius: 'md',
  fontFamily:
    '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily:
      '"Outfit", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '700',
  },
  defaultGradient: {
    from: 'siaSky.5',
    to: 'siaCoral.5',
    deg: 125,
  },
})
