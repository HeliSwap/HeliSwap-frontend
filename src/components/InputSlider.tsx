import React, { useState } from 'react';
import ButtonPercentage from './ButtonPercentage';

const InputSlider = () => {
  const buttonValues = ['25', '50', '75', '100'];
  const [sliderValue, setSliderValue] = useState('100');

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setSliderValue(value);
  };

  return (
    <div className="container-input-token mb-4">
      <p className="text-micro">Amount</p>

      <div className="d-flex justify-content-between align-items-start">
        <span className="text-title text-numeric">{sliderValue}%</span>

        <div className="d-flex mt-2">
          {buttonValues.map((value: string, index: number) => (
            <ButtonPercentage
              className={index !== 0 ? 'ms-3' : ''}
              handleButtonClick={setSliderValue}
              percentageAmount={value}
              isSelected={value === sliderValue}
            />
          ))}
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
