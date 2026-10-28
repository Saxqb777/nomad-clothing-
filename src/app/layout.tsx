import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Archivo, Courier_Prime } from "next/font/google";
import "./globals.css";
import { NomadProvider } from "@/components/state/store";
import { SvgDefs } from "@/components/brand/SvgDefs";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Print faces for the tees themselves, subset to the glyphs the prints use.
const PRINT_FACES = [
  "Metal+Mania",
  "Pirata+One",
  "Monoton",
  "Rock+Salt",
  "Bangers",
  "Special+Elite",
  "Rye",
  "Abril+Fatface",
  "Rubik+Mono+One",
  "Cormorant+Garamond:ital,wght@1,500;1,600",
];
const PRINT_TEXT = encodeURIComponent(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'&.-–:/ ",
);
const PRINT_FONTS_HREF = `https://fonts.googleapis.com/css2?${PRINT_FACES.map((f) => `family=${f}`).join("&")}&text=${PRINT_TEXT}&display=swap`;

export const metadata: Metadata = {
  title: "NOMAD — one-of-one vintage band tees, found on the road",
  description:
    "A demo rack of one-of-one vintage band tees. Every tee was found somewhere in the world. Flip through the rail.",
  metadataBase: new URL("https://nomad-clothing.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#ecebe6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${archivo.variable} ${courier.variable} h-full`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={PRINT_FONTS_HREF} />
      </head>
      <body className="min-h-full flex flex-col">
        <SvgDefs />
        <NomadProvider>{children}</NomadProvider>
      </body>
    </html>
  );
}
