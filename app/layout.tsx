import '../styles/globals.css'

export const metadata = {
  title: 'Uniclub',
  description: '함께 읽고, 함께 성장하는 독서모임',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
