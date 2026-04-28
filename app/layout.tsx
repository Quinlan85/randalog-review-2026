import type { Metadata } from "next";
export const metadata: Metadata = { title: "Randal Óg | Game Reflection", description: "Game reflection tool" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
