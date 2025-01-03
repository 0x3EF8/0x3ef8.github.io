import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { ThemeProvider } from '@/src/components/theme/theme-provider';
import '@/src/styles/globals.css';
import '@/src/styles/custom.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://0x3ef8.github.io'),
  title: {
    default: 'Jay Patrick Cano | Self-Taught Developer',
    template: '%s | Jay Patrick Cano',
  },
  description:
    'Jay Patrick Cano is a self-taught developer from the Philippines, specializing in React, Node.js, and modern web technologies. Explore his projects and skills.',
  keywords: [
    'Jay Patrick Cano',
    'Developer',
    'Web Developer',
    'React',
    'Node.js',
    'Portfolio',
    'Philippines',
  ],
  authors: [{ name: 'Jay Patrick Cano', url: 'https://github.com/0x3EF8' }],
  creator: 'Jay Patrick Cano',
  publisher: 'Jay Patrick Cano',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Jay Patrick Cano | Self-Taught Developer',
    description:
      'Explore the projects and skills of Jay Patrick Cano, a self-taught developer from the Philippines specializing in modern web technologies.',
    url: 'https://0x3ef8.github.io',
    siteName: 'Jay Patrick Cano Portfolio',
    images: [
      {
        url: 'https://github.com/0x3EF8.png',
        width: 800,
        height: 800,
        alt: 'Jay Patrick Cano - Developer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jay Patrick Cano | Self-Taught Developer',
    description:
      'Discover the work of Jay Patrick Cano, a self-taught developer from the Philippines. View projects, skills, and more.',
    images: ['https://github.com/0x3EF8.png'],
    creator: '@0x3EF8',
  },
  icons: {
    icon: [
      {
        url: 'https://github.com/0x3EF8.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: 'https://github.com/0x3EF8.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: 'https://github.com/0x3EF8.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [{ rel: 'mask-icon', url: 'https://github.com/0x3EF8.png' }],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://0x3ef8.github.io',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='canonical' href='https://0x3ef8.github.io' />
        <link
          rel='alternate'
          hrefLang='x-default'
          href='https://0x3ef8.github.io'
        />
        <link rel='alternate' hrefLang='en' href='https://0x3ef8.github.io' />
        <meta name='theme-color' content='#ffffff' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <link rel='icon' href='https://github.com/0x3EF8.png' />
        <link rel='apple-touch-icon' href='https://github.com/0x3EF8.png' />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}