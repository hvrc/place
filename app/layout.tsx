import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "hvrc",
  description: "place",
  icons: {
    icon: "/icons/icon.png", // Updated path to match your icon location
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
