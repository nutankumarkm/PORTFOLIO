"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-base-200)",
          "--normal-text": "var(--color-base-content)",
          "--normal-border": "var(--color-base-300)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
