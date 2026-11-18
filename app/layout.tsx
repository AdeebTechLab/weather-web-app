import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'WeatherNow — Live Global Weather & 5-Day Forecast',
  description:
    'Live Global Weather & 5-Day Forecast dashboard with real-time meteorological data, dynamic atmospheric themes, geolocation, and unit conversion.',
  openGraph: {
    title: 'WeatherNow — Live Global Weather & 5-Day Forecast',
    description:
      'Live Global Weather & 5-Day Forecast dashboard with real-time meteorological data, dynamic atmospheric themes, geolocation, and unit conversion.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeatherNow — Live Global Weather & 5-Day Forecast',
    description:
      'Live Global Weather & 5-Day Forecast dashboard with real-time meteorological data, dynamic atmospheric themes, geolocation, and unit conversion.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased selection:bg-white/25" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
