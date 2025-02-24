import { Loader, SearchIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

type Props = {
  value: string;
  isDisabled: boolean;
  isLoading: boolean;
  setValue: (value: string) => void;
  onFindClick: () => void;
};

export const Header = ({
  value,
  isDisabled,
  isLoading,
  setValue,
  onFindClick,
}: Props) => (
  <div className="flex gap-4">
    <Input
      type="text"
      placeholder="Enter an IP address or URL"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
    <Button variant="outline" onClick={onFindClick} disabled={isDisabled}>
      {isLoading ? <Loader className="animate-spin" /> : <SearchIcon />}
      Find
    </Button>
  </div>
);
