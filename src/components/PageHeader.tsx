import React from 'react';
import Icon from './Icon';
import Settings from './Settings';

interface IPageHeaderProps {
  title: string;
  handleBackClick?: () => void;
}

const PageHeader = ({ title, handleBackClick }: IPageHeaderProps) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-6">
      {handleBackClick ? (
        <span className="cursor-pointer" onClick={handleBackClick}>
          <Icon name="arrow-left" />
        </span>
      ) : null}

      <h1 className="text-subheader text-light">{title}</h1>
      <Settings />
    </div>
  );
};

export default PageHeader;
