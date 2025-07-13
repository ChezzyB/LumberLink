// Fallback for using MaterialIcons on Android and web.

import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type IconSymbolProps = {
  name: ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
};

export function IconSymbol({ name, size = 24, color }: IconSymbolProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
