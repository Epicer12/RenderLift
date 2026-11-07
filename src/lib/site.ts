// Public address and search/preview text, shared by the metadata, robots.txt and sitemap.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://render-lift.vercel.app").replace(/\/$/, "");

export const SITE_NAME = "RenderLift";
export const SITE_TITLE = "RenderLift: Free Blender Cloud Rendering on Google Colab";
export const SITE_DESCRIPTION =
    "Render your .blend files for free on Google Colab GPUs. Upload to your own Google Drive, pick your settings, and RenderLift writes the Colab notebook for you.";
