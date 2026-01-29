// Capacitor CLI Configuration
// Run: npx cap init to initialize

module.exports = {
  appId: 'com.ichingbenessere.app',
  appName: 'I Ching del Benessere',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F9F7F2',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#C44D38'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#C44D38'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#F9F7F2'
    },
    Keyboard: {
      resize: 'body',
      style: 'light'
    }
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'I Ching',
    preferredContentMode: 'mobile'
  },
  android: {
    backgroundColor: '#F9F7F2',
    allowMixedContent: false
  }
};