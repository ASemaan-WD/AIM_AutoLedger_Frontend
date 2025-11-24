import type { Metadata, Viewport } from "next";
import { Inter, Public_Sans, JetBrains_Mono } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { cx } from "@/utils/cx";
import "@/styles/globals.css";

/**
 * AutoLedger Typography System
 * 
 * Inter (Semi-Bold 600, -2% tracking): Headings - authoritative, modern
 * Public Sans (Regular 400): Body text - developed by US Government (GSA), 
 *   neutral, trustworthy, accessible. Renders beautifully on "Bone" backgrounds.
 * JetBrains Mono: Numbers/Data - clarity for financial data, distinguishes 
 *   clickable data (Ledger Blue) from static data (Ink)
 */

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
    weight: ["400", "500", "600", "700"],
});

const publicSans = Public_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-public-sans",
    weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jetbrains-mono",
    weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
    title: "AutoLedger — Automated Ledger Management",
    description: "Streamline your financial operations with AutoLedger's automated accounting solutions",
};

export const viewport: Viewport = {
    themeColor: "#1554C0", /* Ledger Blue - the authoritative brand color */
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cx(
                inter.variable, 
                publicSans.variable, 
                jetbrainsMono.variable, 
                "bg-primary antialiased"
            )}>
                <RouteProvider>
                    <Theme>{children}</Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
