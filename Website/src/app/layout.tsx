import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../lib/providers/theme-provider';
import { Toaster } from 'sonner';
import { AuthProvider } from '../hooks/useAuth';
import AuthInitializer from '../components/auth/AuthInitializer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://studentnest.com'),
  title: {
    default: 'Student Nest - Find Your Perfect Student Accommodation',
    template: '%s | Student Nest',
  },
  description: 'Connect with verified property owners near your college. Safe, transparent, and student-focused accommodation platform with 500+ students already housed.',
  keywords: [
    'student housing',
    'student accommodation',
    'pg near me',
    'hostel near college',
    'rooms for students',
    'verified property owners',
    'affordable student housing',
    'college accommodation',
  ],
  authors: [{ name: 'Student Nest' }],
  creator: 'Student Nest',
  publisher: 'Student Nest',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Student Nest',
    title: 'Student Nest - Find Your Perfect Student Accommodation',
    description: 'Connect with verified property owners near your college. Safe, transparent, and student-focused accommodation.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Student Nest - Student Housing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Nest - Find Your Perfect Student Accommodation',
    description: 'Connect with verified property owners near your college. Safe & transparent.',
    images: ['/og-image.png'],
    creator: '@studentnest',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: '32x32' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: { url: '/logo.png', type: 'image/png' },
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthInitializer>
              {children}
            </AuthInitializer>
          </AuthProvider>
          <Toaster
            richColors
            closeButton
            position="top-center"
            toastOptions={{
              className: 'font-sans',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
