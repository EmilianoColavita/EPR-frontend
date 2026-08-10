import type { Metadata } from "next";
import { Anton, Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E.P.R | Entrenamiento Para el Rendimiento",
  description:
    "No entrenamos por entrenar. Entrenamos para rendir. Centro de entrenamiento personalizado con el Head Coach Luciano Colavita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${barlowCondensed.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-epr-dark font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
