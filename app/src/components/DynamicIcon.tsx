// ============================================================
// DynamicIcon — Renders a Lucide icon by string name
// ============================================================

import { memo } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps {
  name: string;
}

/**
 * Renders a Lucide React icon given its string name.
 * Falls back to HelpCircle if the icon name is not found.
 *
 * @example
 *   <DynamicIcon name="Home" size={24} />
 *   <DynamicIcon name="Terminal" className="text-white" />
 */
const DynamicIcon = memo(function DynamicIcon({
  name,
  ...props
}: DynamicIconProps & LucideProps) {
  const IconComp = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  return IconComp ? <IconComp {...props} /> : <Icons.HelpCircle {...props} />;
});

export default DynamicIcon;
