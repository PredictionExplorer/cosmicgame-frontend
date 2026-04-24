import localFont from 'next/font/local';

export const clashDisplay = localFont({
  src: [
    {
      path: '../public/fonts/ClashDisplay/fonts/ClashDisplay-Variable.woff2',
      weight: '200 700',
      style: 'normal',
    },
  ],
  variable: '--font-clash-display',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const inter = localFont({
  src: [
    { path: '../public/fonts/Inter/fonts/Inter-Light.ttf', weight: '300', style: 'normal' },
    { path: '../public/fonts/Inter/fonts/Inter-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Inter/fonts/Inter-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/Inter/fonts/Inter-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/Inter/fonts/Inter-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});
