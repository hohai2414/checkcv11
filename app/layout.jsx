import './globals.css';

export const metadata = {
  title: 'CV Matcher với Gemini API',
  description: 'Hệ thống so sánh CV và Job Description động',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
