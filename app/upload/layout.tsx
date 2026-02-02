import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prześlij plik",
  description: "Wgraj plik od dostawcy w formacie XLSX, XLS, CSV lub XML. Wskaż wiersz z nagłówkami.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: "/upload",
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

