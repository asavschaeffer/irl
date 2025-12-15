'use client';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';

// Apply cssInterop to enable className prop with NativeWind
cssInterop(RNSafeAreaView, { className: 'style' });

export { RNSafeAreaView as SafeAreaView };
