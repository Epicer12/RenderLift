import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_URL } from "@/lib/site";

// Social preview card (1200x630), drawn at build time in the site's dark style.
export const alt = "RenderLift: free Blender cloud rendering on Google Colab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
    const logo = await readFile(join(process.cwd(), "public", "logo.png"));
    const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: "#0B0D10",
                    color: "#E6E8EB",
                    padding: 72,
                    borderTop: "8px solid #4F8CFF",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoSrc} width={96} height={84} alt="" />
                    <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: 4 }}>
                        <span style={{ color: "#4F8CFF" }}>RENDER&nbsp;</span>
                        <span style={{ color: "#ff7a1a" }}>LIFT</span>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, display: "flex" }}>
                        Free Blender cloud rendering
                    </div>
                    <div style={{ fontSize: 40, color: "#9AA0A6", display: "flex" }}>
                        Render your .blend files on Google Colab GPUs, with your own Google Drive.
                    </div>
                </div>

                <div style={{ fontSize: 28, color: "#6b7686", display: "flex", letterSpacing: 2 }}>
                    {SITE_URL.replace(/^https?:\/\//, "")}
                </div>
            </div>
        ),
        size
    );
}
