import "./globals.css";

export const metadata = {
  title: "CLASH RX | CLANVERSE",
  description: "Clash of Clans clan, player, war and analytics dashboard",
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
