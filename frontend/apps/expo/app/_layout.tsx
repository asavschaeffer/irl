import '../globals.css';
import { GluestackUIProvider } from '@app-launch-kit/components/primitives/gluestack-ui-provider';
import {
  ColorModeProvider,
  useColorMode,
} from '@app-launch-kit/utils/contexts/ColorModeContext';
import { useReactNavigationDevTools } from '@dev-plugins/react-navigation';
import { SafeAreaView } from '@app-launch-kit/components/primitives/safe-area-view';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StatusBar } from 'react-native';
import {
  useFonts,
  Roboto_100Thin,
  Roboto_100Thin_Italic,
  Roboto_300Light,
  Roboto_300Light_Italic,
  Roboto_400Regular,
  Roboto_400Regular_Italic,
  Roboto_500Medium,
  Roboto_500Medium_Italic,
  Roboto_700Bold,
  Roboto_700Bold_Italic,
  Roboto_900Black,
  Roboto_900Black_Italic,
} from '@expo-google-fonts/roboto';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { SessionContextProvider } from '@app-launch-kit/modules/auth';
import { SplashScreen, Stack, useNavigationContainerRef } from 'expo-router';
import React, { useEffect } from 'react';
import AuthLoader from '@app-launch-kit/modules/landing-page/components/AuthLoader';
import { usePathname } from 'expo-router';
import { useRouter } from '@unitools/router';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    Roboto_100Thin,
    Roboto_100Thin_Italic,
    Roboto_300Light,
    Roboto_300Light_Italic,
    Roboto_400Regular,
    Roboto_400Regular_Italic,
    Roboto_500Medium,
    Roboto_500Medium_Italic,
    Roboto_700Bold,
    Roboto_700Bold_Italic,
    Roboto_900Black,
    Roboto_900Black_Italic,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ColorModeProvider>
        <Layout />
      </ColorModeProvider>
    </SafeAreaProvider>
  );
}

function Layout() {
  const navigationRef = useNavigationContainerRef();
  useReactNavigationDevTools(navigationRef);
  const { colorMode } = useColorMode();
  // this is needed for firebase otp native auth only.
  // after otp verification, it will redirect to this route by default.
  // so we need to handle the redirecting back to the page.
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (pathname === '/firebaseauth/link') router.back();
  }, [pathname]);
  
  const bgColor = colorMode === 'light' ? '#fff' : '#121212';
  
  return (
    <SessionContextProvider>
      <GluestackUIProvider mode={colorMode}>
        <AuthLoader>
          <StatusBar
            barStyle={colorMode === 'light' ? 'dark-content' : 'light-content'}
          />
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: bgColor,
              paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            }}
          >
            <Stack
              screenOptions={{
                headerShown: false,
                navigationBarColor: bgColor,
              }}
            />
          </SafeAreaView>
        </AuthLoader>
      </GluestackUIProvider>
    </SessionContextProvider>
  );
}
