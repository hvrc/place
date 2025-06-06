import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "hvrc",
  description: "place",
  icons: {
    icon: "/images/logos/icon.png",
  },
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
