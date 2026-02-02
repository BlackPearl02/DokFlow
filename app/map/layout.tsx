import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapuj i sprawdź",
  description: "Przypisz kolumny z pliku do pól ERP (symbol/index/EAN, ilość, cena). Kody muszą odpowiadać Optimie.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: "/map",
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

