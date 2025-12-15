'use client';
import { ScrollView as RNScrollView } from 'react-native';
import { cssInterop } from 'nativewind';

// Apply cssInterop to enable className prop with NativeWind
cssInterop(RNScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export { RNScrollView as ScrollView };
