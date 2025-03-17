// app/layout.tsx
import Providers from '@/app/providers';
import ToastProvider from '@/components/ToastProvider';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import EmotionCacheProvider from '@/components/EmotionCacheProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: 'lightgray',
          margin: 0,
          minHeight: '100vh',
        }}
      >
        <Providers>
          <EmotionCacheProvider>
            {children}
            <ThemeSwitcher />
            <ToastProvider />
          </EmotionCacheProvider>
        </Providers>
      </body>
    </html>
  );
}