import { Capacitor } from "@capacitor/core"
import { Keyboard } from "@capacitor/keyboard"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"
import { App as CapApp } from "@capacitor/app"

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

export function getPlatform(): string {
  return Capacitor.getPlatform()
}

export async function initCapacitorPlugins(): Promise<void> {
  if (!isNativePlatform()) return

  try {
    await SplashScreen.hide()
  } catch {
    // Plugin not available
  }

  try {
    await StatusBar.setStyle({ style: Style.Light })
  } catch {
    // Plugin not available
  }

  try {
    await Keyboard.setResizeMode({ mode: "body" as unknown as import("@capacitor/keyboard").KeyboardResize })
  } catch {
    // Plugin not available
  }
}

export async function setupBackButton(onBack: () => void): Promise<void> {
  if (!isNativePlatform()) return

  await CapApp.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
    } else {
      onBack()
    }
  })
}
