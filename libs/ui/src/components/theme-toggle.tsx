"use client"

import { useTheme } from "next-themes"
import { Button } from "./button"

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      Toggle {theme === "dark" ? "Light" : "Dark"} Mode
    </Button>
  )
}
