import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'IELTS Writing Trainer',
  description: 'Practice and simulate IELTS Writing with explainable scoring and examiner-style feedback.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
