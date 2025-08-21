// library-seat-frontend/src/app/layout.tsx
import { AuthProvider } from '@/context/AuthContext';
import LoadingState from '@/components/LoadingState';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <LoadingState>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LoadingState>
      </body>
    </html>
  );
}