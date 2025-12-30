
import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

const IconRenderer: React.FC<IconRendererProps> = ({ name, className }) => {
  // Convert dash-case to PascalCase
  const pascalName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const IconComponent = (LucideIcons as any)[pascalName] || LucideIcons.Wrench;

  return <IconComponent className={className} />;
};

export default IconRenderer;
