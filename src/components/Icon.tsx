import React from 'react';
import { ReactComponent as ArrowDown } from '../icons/system/arrow-down.svg';
import { ReactComponent as ArrowUp } from '../icons/system/arrow-up.svg';
import { ReactComponent as ArrowLeft } from '../icons/system/arrow-left.svg';
import { ReactComponent as Check } from '../icons/system/check.svg';
import { ReactComponent as Cancel } from '../icons/system/cancel.svg';
import { ReactComponent as ChevronUp } from '../icons/system/chevron-up.svg';
import { ReactComponent as ChevronDown } from '../icons/system/chevron-down.svg';
import { ReactComponent as Hint } from '../icons/system/hint.svg';
import { ReactComponent as Loader } from '../icons/system/loader.svg';
import { ReactComponent as More } from '../icons/system/more.svg';
import { ReactComponent as Pools } from '../icons/system/pools.svg';
import { ReactComponent as SpeachBubble } from '../icons/system/speech-bubble.svg';
import { ReactComponent as Star } from '../icons/system/star.svg';
import { ReactComponent as Swap } from '../icons/system/swap.svg';
import { ReactComponent as SwapGradient } from '../icons/system/swap-gradient.svg';
import { ReactComponent as Transfer } from '../icons/system/transfer.svg';
import { ReactComponent as Settings } from '../icons/system/settings.svg';
import { ReactComponent as Copy } from '../icons/system/copy.svg';
import { ReactComponent as External } from '../icons/system/external.svg';
import { ReactComponent as Twitter } from '../icons/system/twitter.svg';
import { ReactComponent as Telegram } from '../icons/system/telegram.svg';
import { ReactComponent as Github } from '../icons/system/github.svg';
import { ReactComponent as Warning } from '../icons/system/warning.svg';

interface IIconProps {
  name: string;
  className?: string;
  size?: string;
  color?: string;
}

interface IColorMapping {
  [key: string]: string;
}

interface ISizeMapping {
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
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'arrow-down': ArrowDown,
  'arrow-up': ArrowUp,
  'arrow-left': ArrowLeft,
  hint: Hint,
  loader: Loader,
  more: More,
  pools: Pools,
  'speach-bubble': SpeachBubble,
  star: Star,
  swap: Swap,
  'swap-gradient': SwapGradient,
  transfer: Transfer,
  settings: Settings,
  copy: Copy,
  external: External,
  twitter: Twitter,
  telegram: Telegram,
  github: Github,
  warning: Warning,
};

const colorMapping: IColorMapping = {
  white: 'is-white',
  gray: 'is-gray',
  gradient: 'is-gradient',
  danger: 'is-danger',
  success: 'is-success',
};

const sizeMapping: ISizeMapping = {
  small: 'is-small',
};

const Icon = ({ name, className = '', color = 'white', size = '' }: IIconProps) => {
  const iconName = color === 'gradient' ? `${name}-gradient` : name;
  const TheIcon = icons[iconName];
  return (
    <>
      <TheIcon className={`icon ${className} ${colorMapping[color]} ${sizeMapping[size]}`} />
    </>
  );
};

export default Icon;
