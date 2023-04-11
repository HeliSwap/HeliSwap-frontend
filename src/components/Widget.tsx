import Button from './Button';

interface IWidgetrops {
  resource: string;
  title: string;
  setCurrentAsset: (asset: string) => void;
}

const Widget = ({ resource, title, setCurrentAsset }: IWidgetrops) => {
  const handleAssetButtonClick = (asset: string) => {
    setCurrentAsset(asset);
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex">
            <h2 className="text-subheader">{title}</h2>
          </div>
        </div>

        <hr className="my-5" />

        <div className="d-flex">
          <Button size="small" onClick={() => handleAssetButtonClick('HBAR')}>
            Buy HBAR
          </Button>
          <Button size="small" onClick={() => handleAssetButtonClick('USDC')} className="ms-3">
            Buy USDC
          </Button>
        </div>

        <div className="ratio ratio-widget mt-4">
          <iframe title={title} src={resource}></iframe>
        </div>

        <div className="mt-5">
          <p className="text-micro">
            To on-ramp fiat currency, you will need to use services provided by a third party that
            is not owned or controlled by, or related to, Heliswap. When you rely on third party
            services in relation to your use of Heliswap, you should refer to their respective terms
            of service and privacy policies. Heliswap does not guarantee the performance of such
            third party services, sites and technologies and makes no warranty of any kind and is
            not responsible for any disruption, problem, damage, data loss, cost or inconvenience
            caused by such third party providers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Widget;
