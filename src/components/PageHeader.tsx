import React from 'react';
import Settings from './Settings';

interface IPageHeaderProps {
  title: string;
}

const PageHeader = ({ title }: IPageHeaderProps) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-6">
      <h1 className="text-subheader text-light">{title}</h1>
      <Settings />
    </div>
  );
};

export default PageHeader;
