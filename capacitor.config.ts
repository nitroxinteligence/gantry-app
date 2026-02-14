import type { CapacitorConfig } from "@capacitor/cli"
import { KeyboardResize } from "@capacitor/keyboard"

const config: CapacitorConfig = {
  appId: "com.builders.performance",
  appName: "Builders Performance",
  webDir: "out",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FFFFFF",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#FFFFFF",
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Builders Performance",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
}

export default config
