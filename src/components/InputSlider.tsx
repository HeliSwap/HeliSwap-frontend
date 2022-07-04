import React, { useState } from 'react';
import ButtonPercentage from './ButtonPercentage';

import { calculateShareByPercentage } from '../utils/tokenUtils';

interface IInputSliderProps {
  setLpInputValue: React.Dispatch<React.SetStateAction<string>>;
  totalLpAmount: string;
}

const InputSlider = ({ setLpInputValue, totalLpAmount }: IInputSliderProps) => {
  const buttonValues = ['25', '50', '75', '100'];
  const [sliderValue, setSliderValue] = useState('100');

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const { value } = target;

    setSliderValue(value);
    setLpInputValue(calculateShareByPercentage(value, totalLpAmount));
  };

  const handleButtonClick = (value: string) => {
    setSliderValue(value);
    setLpInputValue(calculateShareByPercentage(value, totalLpAmount));
  };

  return (
    <div className="container-input-token mb-4">
      <p className="text-micro">Amount</p>

      <div className="d-flex justify-content-between align-items-start">
        <span className="text-title text-numeric">{sliderValue}%</span>

        <div className="d-flex mt-2">
          {buttonValues.map((value: string, index: number) => (
            <ButtonPercentage
              key={index}
              className={index !== 0 ? 'ms-3' : ''}
              handleButtonClick={handleButtonClick}
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
