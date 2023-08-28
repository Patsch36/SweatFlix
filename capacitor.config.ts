import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.patsch36.sweatflix',
  appName: 'SweatFlix',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      // backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      // androidScaleType: "CENTER_CROP",
      showSpinner: false,
      // androidSpinnerStyle: "large",
      // iosSpinnerStyle: "small",
      // spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      // layoutName: "launch_screen",
      // useDialog: true,
    },
  }
};

export default config;
