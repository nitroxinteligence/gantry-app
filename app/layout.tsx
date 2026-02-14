import type { Metadata } from "next"
import { Manrope, Sora } from "next/font/google"

import "./globals.css"

import { Providers } from "./providers"
import { cn } from "@/lib/utilidades"

const fonteCorpo = Manrope({
  subsets: ["latin"],
  variable: "--fonte-corpo",
  display: "swap",
})

const fonteTitulo = Sora({
  subsets: ["latin"],
  variable: "--fonte-titulo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Builders Performance",
  description:
    "App central de rotina diária para alunos da comunidade Builders.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          fonteCorpo.variable,
          fonteTitulo.variable
        )}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
        >
          Pular para o conteúdo principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
