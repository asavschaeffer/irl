import LogoDark from '@app-launch-kit/assets/icons/Logo/LogoDark';
import LogoLight from '@app-launch-kit/assets/icons/Logo/LogoLight';
import { Box } from '@app-launch-kit/components/primitives/box';
import { useColorMode } from '@app-launch-kit/utils/contexts/ColorModeContext';
import { View, ActivityIndicator, Text } from 'react-native';

export const Loading = () => {
  const { colorMode } = useColorMode();
  
  // Use inline styles for native compatibility
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colorMode === 'light' ? '#fff' : '#121212' 
    }}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={{ 
        marginTop: 16, 
        color: colorMode === 'light' ? '#1B1F2C' : '#fff',
        fontSize: 16 
      }}>
        Loading...
      </Text>
    </View>
  );
};
