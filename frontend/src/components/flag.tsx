import { CircleXIcon } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
  flagUnicode: string;
  fallback?: ReactNode;
};

const convertUnicodeToEmoji = (unicode: string) =>
  unicode
    .split(' ')
    .map((code) => {
      const hex = code.replace('U+', '');
      return String.fromCodePoint(parseInt(hex, 16));
    })
    .join('');

export const Flag = ({ flagUnicode, fallback = <CircleXIcon /> }: Props) => {
  return (
    <div>
      {flagUnicode.length > 0 ? convertUnicodeToEmoji(flagUnicode) : fallback}
    </div>
  );
};
