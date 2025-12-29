import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@tillless/ui/components';
import { ReduxProvider } from '../src/components/providers/ReduxProvider';

export const metadata: Metadata = {
  title: 'TillLess',
  description: 'Smart grocery shopping optimization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
