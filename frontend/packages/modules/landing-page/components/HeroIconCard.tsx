'use client';
import { Icon } from '@app-launch-kit/components/primitives/icon';
import { useColorMode } from '@app-launch-kit/utils/contexts/ColorModeContext';
import {
  Tooltip,
  TooltipContent,
  TooltipText,
} from '@app-launch-kit/components/primitives/tooltip';
import { Button } from '@app-launch-kit/components/primitives/button';
import { Platform } from 'react-native';

const HeroIconCard = ({
  lightModeIcon,
  darkModeIcon,
  name,
  index,
}: {
  lightModeIcon: () => JSX.Element;
  darkModeIcon: () => JSX.Element;
  name: string;
  index: number;
}) => {
  const { colorMode } = useColorMode();
  
  const buttonContent = (
    <Button
      className={`p-3 ${index === 6 ? 'hidden md:flex' : ''}  ${index === 4 || index === 5 ? 'hidden sm:flex' : ''} rounded-lg flex-none bg-background-50 h-[60px] w-[60px] md:h-20 md:w-20 items-center justify-center`}
    >
      <Icon as={colorMode == 'light' ? lightModeIcon : darkModeIcon} />
    </Button>
  );

  // Tooltips don't work well on native (no hover support), so skip them
  if (Platform.OS !== 'web') {
    return buttonContent;
  }

  return (
    <Tooltip
      placement="top"
      trigger={(triggerProps) => {
        return (
          <Button
            {...triggerProps}
            className={`p-3 ${index === 6 ? 'hidden md:flex' : ''}  ${index === 4 || index === 5 ? 'hidden sm:flex' : ''} rounded-lg flex-none bg-background-50 h-[60px] w-[60px] md:h-20 md:w-20 items-center justify-center`}
          >
            <Icon as={colorMode == 'light' ? lightModeIcon : darkModeIcon} />
          </Button>
        );
      }}
    >
      <TooltipContent>
        <TooltipText>{name}</TooltipText>
      </TooltipContent>
    </Tooltip>
  );
};

export default HeroIconCard;
