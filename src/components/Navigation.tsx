import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const navigation = [
  {
    link: '/',
    name: 'swap',
    color: 'gray',
    text: 'Swap',
  },
  {
    link: '/pools',
    name: 'pools',
    color: 'gray',
    text: 'Pools',
  },
  {
    link: '/farms',
    name: 'farms',
    color: 'gray',
    text: 'Farms',
  },
];

const Navigation = () => {
  const getClasses = (isActive: boolean, index: number) => {
    const classes = ['link-menu'];
    if (index) {
      classes.push('mt-4');
    }
    if (isActive) {
      classes.push('is-active');
    }
    return classes;
  };

  return (
    <div className="d-flex flex-column">
      {navigation.map((item, index) => {
        return (
          <NavLink
            key={item.name}
            to={item.link}
            className={({ isActive }) => getClasses(isActive, index).join(' ')}
          >
            <span className="icon-menu">
              <Icon color={item.color} name={item.name} />
            </span>
            <span className="ms-4 d-none d-xxxl-inline-block">{item.text}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default Navigation;
