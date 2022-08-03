import IconToken from '../components/IconToken';

export const formatIcons = (icons: string[], size: 'default' | 'large' = 'default') =>
  icons &&
  icons.length > 0 &&
  icons.map((item, index) => (
    <IconToken size={size} key={index} className={index === 1 ? 'ms-n2' : ''} symbol={item} />
  ));
