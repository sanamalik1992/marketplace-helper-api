export const metadata = {
  title: 'Marketplace Helper API',
  description: 'Backend API for the Marketplace Helper Chrome extension',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
