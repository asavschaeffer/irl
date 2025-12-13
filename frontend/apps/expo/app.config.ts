import { ExpoConfig, ConfigContext } from 'expo/config';
import fs from 'fs';
import path from 'path';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'App Launch Kit',
  slug: 'app-launch-kit',
  // In templates, Firebase config files are often not committed. Avoid hard failure
  // when they are missing; users can add them later when enabling Firebase builds.
  ios: {
    ...config.ios,
    googleServicesFile: (() => {
      const p = path.join(__dirname, 'GoogleService-Info.plist');
      return fs.existsSync(p) ? './GoogleService-Info.plist' : undefined;
    })(),
  },
  android: {
    ...config.android,
    googleServicesFile: (() => {
      const p = path.join(__dirname, 'google-services.json');
      return fs.existsSync(p) ? './google-services.json' : undefined;
    })(),
  },
  extra: {
    ...config?.extra,
  },
  // plugins:[
  //   ...config.plugins!,
  //     [
  //       "@react-native-google-signin/google-signin",
  //       {
  //         "iosURLScheme": "com.googleusercontent.apps.339982569827-41u3c9a67997u48h0s3k0k3i61kaim6t"
  //       }
  //     ]
  // ]
});
