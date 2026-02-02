import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eksport i pobierz",
  description: "Plik CSV generowany jest na stronie mapowania kolumn po kliknięciu „Generuj i pobierz CSV\".",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: "/download",
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

