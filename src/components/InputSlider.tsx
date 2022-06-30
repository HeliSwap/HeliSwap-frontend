import React, { useState } from 'react';

const InputSlider = () => {
  const [sliderValue, setSliderValue] = useState('100');

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setSliderValue(value);
  };

  const handlePercentageButtonClick = (percentage: string) => {
    setSliderValue(percentage);
  };

  return (
    <div className="container-input-token mb-4">
      <p className="text-micro">Amount</p>

      <div className="d-flex justify-content-between align-items-start">
        <span className="text-title text-numeric">{sliderValue}%</span>

        <div className="d-flex mt-2">
          <span
            onClick={() => handlePercentageButtonClick('25')}
            className="badge bg-secondary mx-2"
          >
            25%
          </span>
          <span
            onClick={() => handlePercentageButtonClick('50')}
            className="badge bg-secondary mx-2"
          >
            50%
          </span>
          <span
            onClick={() => handlePercentageButtonClick('75')}
            className="badge bg-secondary mx-2"
          >
            75%
          </span>
          <span
            onClick={() => handlePercentageButtonClick('100')}
            className="badge bg-secondary mx-2"
          >
            MAX
          </span>
        </div>
      </div>

      <div className="mt-3">
        <input
          value={sliderValue}
          onChange={handleSliderChange}
          type="range"
          min="0"
          max="100"
          className="form-range"
        ></input>
      </div>
    </div>
  );
};

export default InputSlider;
