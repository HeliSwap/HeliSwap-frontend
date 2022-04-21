import React from 'react';
import Swap from '../components/Swap';

interface IHomeProps {
  userId: string;
}

const Home = ({ userId }: IHomeProps) => {
  return (
    <div className="d-flex justify-content-center">
      <Swap userId={userId} />
    </div>
  );
};

export default Home;
