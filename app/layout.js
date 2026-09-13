import './globals.css';

export const metadata = {
  title: 'OsureSync — Headless Ghost-Ad Sentinel',
  description: 'Zero-Access Ad Spend Waste Auditor for D2C Brands',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
    }
