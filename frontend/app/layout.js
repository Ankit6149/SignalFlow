import "../app/globals.css";

export const metadata = {
  title: "SignalFlow - Local Launch Kit Generator",
  description: "Create local-first developer launch assets from a repository.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
