import localFont from 'next/font/local';

export const inter = localFont({
  src: [
    { path: '../public/fonts/Inter/fonts/Inter-Light.ttf', weight: '300', style: 'normal' },
    { path: '../public/fonts/Inter/fonts/Inter-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Inter/fonts/Inter-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/Inter/fonts/Inter-SemiBold.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export const clashDisplay = localFont({
  src: '../public/fonts/ClashDisplay/fonts/ClashDisplay-Variable.ttf',
  variable: '--font-clash-display',
  display: 'swap',
});
