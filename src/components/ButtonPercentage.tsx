import React from 'react';

interface IButtonPercentageProps {
  handleButtonClick: (percentageAmount: string) => void;
  isSelected?: boolean;
  percentageAmount: string;
  className?: string;
}

const ButtonPercentage = ({
  handleButtonClick,
  isSelected = false,
  percentageAmount,
  className,
}: IButtonPercentageProps) => {
  const buttonLabel = percentageAmount === '100' ? 'MAX' : `${percentageAmount}%`;
  return (
    <span
      onClick={() => handleButtonClick(percentageAmount)}
      className={`btn-percentage ${isSelected ? 'is-active' : ''}  ${className}`}
    >
      {buttonLabel}
    </span>
  );
};

export default ButtonPercentage;
