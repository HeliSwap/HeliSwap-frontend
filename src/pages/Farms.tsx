import React from 'react';
import useFarms from '../hooks/useFarms';

const Farms = () => {
  const { farms } = useFarms();

  const haveFarms = farms.length > 0;

  return (
    <div className="d-flex justify-content-center">
      <div className="container-pools">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex">
            <h2 className={`text-subheader tab-title is-active mx-4 `}>Farms</h2>
          </div>
        </div>

        <hr />

        {haveFarms ? (
          <div>
            {farms.map((item, index) => (
              <div className="border rounded p-4" key={index}>
                <p>{item.stakingTokenAddress}</p>
                <p>{item.totalStaked}</p>
                {item.rewardsData.length > 0 &&
                  item.rewardsData.map((reward, rewardIndex) => (
                    <div key={rewardIndex}>
                      <p>{reward.address}</p>
                      <p>{reward.duration}</p>
                      <p>{reward.symbol}</p>
                      <p>{reward.totalAmount}</p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Farms;
