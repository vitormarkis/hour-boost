import "@/styles/globals.css"
import "@/styles/neon-fx.css"
import type { AppProps } from "next/app"
import { Barlow } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "next-themes"
import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient()

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      {...pageProps}
      localization={ptBR}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
      >
        <QueryClientProvider client={queryClient}>
          <main className={cn(barlow.className)}>
            <Component {...pageProps} />
          </main>
          <Toaster position="bottom-left" />
        </QueryClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  )
}
