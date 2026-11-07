import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ConsentBanner } from "@/components/ConsentBanner";
import { DriveAccessBanner } from "@/components/DriveAccessBanner";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: '/logo.png',
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  // Resolve the session on the server so signed-in users get their dashboard
  // on first paint instead of a flash of the landing page.
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google tag (gtag.js) */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  // Consent Mode: no analytics cookies until the visitor accepts
                  gtag('consent', 'default', {
                    analytics_storage: 'denied',
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied'
                  });
                  try {
                    if (localStorage.getItem('renderlift_analytics_consent') === 'granted') {
                      gtag('consent', 'update', { analytics_storage: 'granted' });
                    }
                  } catch (e) {}

                  gtag('js', new Date());
                  gtag('config', '${gaId}', { allow_google_signals: false, allow_ad_personalization_signals: false });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Providers session={session}>
          <Navbar />
          <DriveAccessBanner />
          {children}
          <Footer />
          {gaId && <ConsentBanner />}
        </Providers>
      </body>
    </html>
  );
}
