import React from 'react';
import Icon from './Icon';
import Settings from './Settings';

interface IPageHeaderProps {
  title: string;
  slippage?: string;
  handleBackClick?: () => void;
}

const PageHeader = ({ title, handleBackClick, slippage }: IPageHeaderProps) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 mb-lg-6">
      {handleBackClick ? (
        <span className="cursor-pointer" onClick={handleBackClick}>
          <Icon name="arrow-left" />
        </span>
      ) : null}

      <h1 className="text-subheader text-light">{title}</h1>
      {slippage ? <Settings slippage={slippage} /> : <div></div>}
    </div>
  );
};

export default PageHeader;
