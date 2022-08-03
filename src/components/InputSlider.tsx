import React from 'react';
import ButtonPercentage from './ButtonPercentage';

interface IInputSliderProps {
  sliderValue: string;
  handleButtonClick: (value: string) => void;
  handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputSlider = ({ sliderValue, handleButtonClick, handleSliderChange }: IInputSliderProps) => {
  const buttonValues = ['25', '50', '75', '100'];

  return (
    <div className="container-input-token is-readonly mb-4">
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
