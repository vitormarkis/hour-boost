import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { Barlow } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "next-themes"
import { ClerkProvider } from "@clerk/nextjs"

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
      >
        <main className={cn(barlow.className)}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </ClerkProvider>
  )
}
