import React from 'react';

interface IInputDaySliderProps {
  sliderValue: string;
  maxValue: string;
  minValue: string;
  handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputDaySlider = ({
  sliderValue,
  maxValue,
  handleSliderChange,
  minValue,
}: IInputDaySliderProps) => {
  return (
    <div className="container-input-token is-readonly mb-4">
      <p className="text-micro">Days</p>

      <div className="d-flex justify-content-between align-items-start">
        <span className="text-title text-numeric">{sliderValue}</span>
      </div>

      <div className="mt-3">
        <input
          value={sliderValue}
          onChange={handleSliderChange}
          type="range"
          min={minValue}
          max={maxValue}
          className="form-range"
        ></input>
      </div>
    </div>
  );
};

export default InputDaySlider;
