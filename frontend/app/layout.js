import "../app/globals.css";

export const metadata = {
  title: "PostPilot - Describe Once, Post Everywhere",
  description: "Create platform-ready posting packages from descriptions, data, and assets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
