import React, { useState } from 'react';

import Icon from './Icon';

interface IExpandContentProps {
  title: string;
  children: string | JSX.Element | JSX.Element[];
}

const ExpandContent = ({ title, children }: IExpandContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleContentClick = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="container-expandable mt-4">
      <div
        onClick={handleToggleContentClick}
        className="d-flex justify-content-between align-items-center cursor-pointer"
      >
        <h2 className="text-main text-bold">{title}</h2>
        <Icon name={`${isExpanded ? 'minus' : 'plus'}`} />
      </div>
      {isExpanded ? (
        <div>
          <hr className="separator-expand my-6" />
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default ExpandContent;
