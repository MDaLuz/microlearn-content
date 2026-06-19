export const Colors = {
  bg: '#07080F',
  surface: 'rgba(255,255,255,0.055)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.13)',
  borderStrong: 'rgba(255,255,255,0.2)',

  text: '#F2F3F8',
  textSecondary: '#A9AEC2',
  textMuted: '#7D8299',
  textDim: '#6B7088',

  teal: '#5BE0D8',
  tealLight: '#7FF0E6',
  tealSoft: 'rgba(91,224,216,0.15)',
  tealBorder: 'rgba(91,224,216,0.3)',
  blue: '#6FA8FF',
  blueLight: '#7CC0FF',
  purple: '#B7A0FF',

  // Discipline palettes
  disciplines: {
    Gardening: {
      gradient: ['#7DEBA0', '#39C9B0'] as [string, string],
      color: '#7DEBA0',
      soft: 'rgba(125,235,160,0.18)',
      darkText: '#06231B',
    },
    Legal: {
      gradient: ['#7CB6FF', '#6E78F0'] as [string, string],
      color: '#9CC4FF',
      soft: 'rgba(124,182,255,0.18)',
      darkText: '#061323',
    },
    Cardiometabolic: {
      gradient: ['#C79BFF', '#F58CC8'] as [string, string],
      color: '#D6AEFF',
      soft: 'rgba(199,155,255,0.18)',
      darkText: '#140820',
    },
    Communication: {
      gradient: ['#FFB347', '#FF7B54'] as [string, string],
      color: '#FFB347',
      soft: 'rgba(255,179,71,0.18)',
      darkText: '#1F0F00',
    },
  } as Record<string, { gradient: [string, string]; color: string; soft: string; darkText: string }>,
} as const;

export const MeshColors = {
  blob1: '#2FB6B0',   // teal — top right
  blob2: '#6E6BF0',   // indigo — mid left
  blob3: '#C062B6',   // pink — bottom right
  blob4: '#3A7BE0',   // blue — bottom left
} as const;
