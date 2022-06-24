import React from 'react';
import { ReactComponent as ArrowDown } from '../icons/system/arrow-down.svg';
import { ReactComponent as Check } from '../icons/system/check.svg';
import { ReactComponent as Cancel } from '../icons/system/cancel.svg';
import { ReactComponent as Chevron } from '../icons/system/chevron.svg';
import { ReactComponent as Hint } from '../icons/system/hint.svg';
import { ReactComponent as Loader } from '../icons/system/loader.svg';
import { ReactComponent as More } from '../icons/system/more.svg';
import { ReactComponent as Pools } from '../icons/system/pools.svg';
import { ReactComponent as SpeachBubble } from '../icons/system/speech-bubble.svg';
import { ReactComponent as Star } from '../icons/system/star.svg';
import { ReactComponent as Swap } from '../icons/system/swap.svg';
import { ReactComponent as Transfer } from '../icons/system/transfer.svg';
import { ReactComponent as Settings } from '../icons/system/settings.svg';

interface IIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

interface IColorMapping {
  [key: string]: string;
}

interface IIconMapping {
  [key: string]: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
}

const icons: IIconMapping = {
  check: Check,
  cancel: Cancel,
  chevron: Chevron,
  'arrow-down': ArrowDown,
  hint: Hint,
  loader: Loader,
  more: More,
  pools: Pools,
  'speach-bubble': SpeachBubble,
  star: Star,
  swap: Swap,
  transfer: Transfer,
  settings: Settings,
};

const colorMapping: IColorMapping = {
  white: 'is-white',
  gray: 'is-gray',
  gradient: 'is-gradient',
};

const Icon = ({ name, className = '', color = 'white' }: IIconProps) => {
  const TheIcon = icons[name];
  return (
    <>
      <TheIcon className={`icon ${className} ${colorMapping[color]}`} />
    </>
  );
};

export default Icon;
