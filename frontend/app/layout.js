import "../app/globals.css";

export const metadata = {
  title: "SignalFlow · Local Dev Pipeline",
  description: "Next.js App Router frontend for SignalFlow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
