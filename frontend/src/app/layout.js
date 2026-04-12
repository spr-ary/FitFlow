import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'FitFlow — Gym Management System',
  description: 'Gym Membership & Class Booking System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}