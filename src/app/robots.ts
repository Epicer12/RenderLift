import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Login-only pages and the API have nothing for search engines
            disallow: ["/api/", "/new"],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
