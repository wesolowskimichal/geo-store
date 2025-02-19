import { CircleXIcon } from 'lucide-react';

type Props = {
  flagUnicode: string;
};

const convertUnicodeToEmoji = (unicode: string) =>
  unicode
    .split(' ')
    .map((code) => {
      const hex = code.replace('U+', '');
      return String.fromCodePoint(parseInt(hex, 16));
    })
    .join('');

export const Flag = ({ flagUnicode }: Props) => {
  const emoji =
    flagUnicode.length > 0 ? (
      convertUnicodeToEmoji(flagUnicode)
    ) : (
      <CircleXIcon />
    );
  return <div>{emoji}</div>;
};
