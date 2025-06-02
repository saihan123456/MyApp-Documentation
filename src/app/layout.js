import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'MyApp Documentation',
  description: 'Documentation for the MyApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
