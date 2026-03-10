import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
  interface TypographyVariantsOptions {
    mono?: React.CSSProperties;
  }
}

const bpValues = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } as const;
const up = (key: keyof typeof bpValues) => `@media (min-width:${bpValues[key]}px)`;
const down = (key: keyof typeof bpValues) => `@media (max-width:${bpValues[key] - 0.05}px)`;

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#15BFFD',
    },
    accent: {
      main: '#9C37FD',
    },
    secondary: {
      main: '#6DC3FF',
    },
    info: {
      main: '#FFFFFF',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.68)',
    },
    background: {
      default: '#080B2A',
      paper: '#101441',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: 16,
    mono: {
      fontFamily: 'monospace',
    },
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #15BFFD',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          [down('md')]: {
            fontSize: 12,
            fontWeight: 400,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: 15,
          padding: '12px 16px',
        },
        input: {
          padding: 0,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: 16,
        },
        body1: {
          fontSize: 14,
          fontWeight: 300,
          [up('md')]: {
            fontSize: 16,
            fontWeight: 400,
          },
        },
        h3: {
          fontFamily: 'var(--font-clash-display), ClashDisplay-Variable, sans-serif',
          fontWeight: 600,
          fontSize: 40,
          [up('md')]: {
            fontSize: 49,
          },
        },
        h4: {
          fontFamily: 'var(--font-clash-display), ClashDisplay-Variable, sans-serif',
          fontWeight: 600,
          fontSize: 36,
          [up('md')]: {
            fontSize: 45,
          },
        },
        h5: {
          fontFamily: 'var(--font-clash-display), ClashDisplay-Variable, sans-serif',
          fontWeight: 600,
          fontSize: 29,
        },
        h6: {
          fontFamily: 'var(--font-clash-display), ClashDisplay-Variable, sans-serif',
          fontWeight: 500,
          fontSize: 18,
          [up('md')]: {
            fontSize: 21,
            fontWeight: 600,
            lineHeight: '60px',
          },
        },
        subtitle1: {
          fontFamily: 'var(--font-clash-display), ClashDisplay-Variable, sans-serif',
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: '1px',
          [up('md')]: {
            fontSize: 20,
          },
        },
        caption: {
          fontSize: 14,
        },
        body2: {
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.68)',
          [up('sm')]: {
            fontSize: 14,
            fontWeight: 300,
          },
          [up('md')]: {
            fontSize: 15,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          [down('md')]: {
            fontSize: 13,
            fontWeight: 400,
          },
        },
        outlined: {
          textTransform: 'capitalize',
          position: 'relative',
          paddingLeft: '24px',
          paddingRight: '24px',
          color: '#6DC3FF',
          border: 0,
          '--border': '1px',
          '--radius': '4px',
          '--t': 0,
          '--path': '0 0px,20px 0,100% 0,100% calc(100% - 16px),calc(100% - 20px) 100%,0 100%',
          mask: 'paint(rounded-shape)',
          background: 'transparent',

          '&:before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            '--t': 1,
            background: 'linear-gradient(152.14deg, #15BFFD 9.96%, #9C37FD 100%)',
            mask: 'paint(rounded-shape)',
          },
          '&:hover': {
            border: 0,
          },
        },
        outlinedSecondary: {
          color: '#15BFFD',
          '&:before': {
            background: '#15BFFD',
          },
        },
        text: {
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 0,
        },
        contained: {
          textTransform: 'capitalize',
          position: 'relative',
          color: '#FFFFFF',
          border: 0,
          '--border': '1px',
          '--radius': '4px',
          '--t': 0,
          '--path': '0 0px,20px 0,100% 0,100% calc(100% - 16px),calc(100% - 20px) 100%,0 100%',
          mask: 'paint(rounded-shape)',
          background: 'linear-gradient(92.49deg, #06AEEC 0.4%, #9C37FD 86.02%)',

          '&:hover': {
            border: 0,
          },
        },
      },
      variants: [
        {
          props: { variant: 'outlined', color: 'info' },
          style: {
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            '&:before': {
              background: 'rgba(255, 255, 255, 0.02)',
            },
          },
        },
      ],
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          [down('md')]: {
            fontSize: 12,
            fontWeight: 400,
          },
        },
        rounded: {
          position: 'relative',
          border: 0,
          backgroundColor: '#1B2262',
          color: '#A8AABF',
          '--border': '1px',
          '--radius': '4px',
          '--t': 0,
          '--path': '0 0px,0 0,100% 0,100% calc(100% - 8px),calc(100% -12px) 100%,0 100%',
          WebkitMask: 'paint(rounded-shape)',
          height: '32px',

          '&:hover': {
            border: 0,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderBottom: '1px solid rgba(217, 217, 217, 0.3)',
          padding: 0,
        },
        content: {
          marginTop: 8,
          marginBottom: 8,
          '&.Mui-expanded': {
            marginTop: 8,
            marginBottom: 8,
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px 0 0 0',
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          '&.Mui-active': {
            color: '#000',
          },
          '&.Mui-active .MuiTableSortLabel-icon': {
            color: '#000',
          },
        },
      },
    },
  },
});

export default theme;
