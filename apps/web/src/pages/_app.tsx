import { Toaster } from "@/components/ui/sonner"
import { barlow } from "@/fonts"
import { cn } from "@/lib/utils"
import "@/styles/globals.css"
import "@/styles/neon-fx.css"
import { ptBR } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "next-themes"
import type { AppProps } from "next/app"
import { Analytics } from "@vercel/analytics/react"

const queryClient = new QueryClient()

import { useMediaQuery } from "@/components/hooks"
import { useIsomorphicLayoutEffect } from "react-use"

export default function App({ Component, pageProps }: AppProps) {
  const isLessDesktop = useMediaQuery("(max-width: 896px)")

  useIsomorphicLayoutEffect(() => {
    document.body.style.setProperty("--font-family", barlow.style.fontFamily)
    document.body.className = cn(barlow.className, barlow.variable)
  }, [])

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
          <main className={cn(barlow.className, barlow.variable)}>
            <Component {...pageProps} />
            <Analytics />
          </main>
          {isLessDesktop && <Toaster position="top-center" />}
          {!isLessDesktop && <Toaster position="bottom-left" />}
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        </QueryClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  )
}
