import ToasterProvider from "@/components/ToasterProvide";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";


export const metadata = {
  title: "AI ATS Resume Analyzer",
  description: "AI-powered ATS Resume Analyzer built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}