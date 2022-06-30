import IconToken from '../components/IconToken';

export const formatIcons = (icons: string[]) =>
  icons &&
  icons.length > 0 &&
  icons.map((item, index) => (
    <IconToken key={index} className={index === 1 ? 'ms-n2' : ''} symbol={item} />
  ));
