import { useState } from 'react';

import Widget from '../components/Widget';

import { C14BaseURL, C14AssetIds, C14BaseDefaultAsset } from '../constants';

const C14 = () => {
  const [currentAsset, setCurrentAsset] = useState(C14BaseDefaultAsset);

  return (
    <Widget
      setCurrentAsset={setCurrentAsset}
      resource={`${C14BaseURL}${C14AssetIds[currentAsset]}`}
      title="Buy Crypto with Fiat"
    />
  );
};

export default C14;
