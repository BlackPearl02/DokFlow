import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dokflow.pl";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/upload", "/map", "/download", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

