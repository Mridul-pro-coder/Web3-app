import React from 'react'
import { useState } from 'react'
import { useNavigate , Link} from 'react-router-dom'
import { logo, sun } from '../assets';
import { navlinks } from '../constants';

type IconProps = {
  styles?: string;
  imgUrl: string;
  isActive?: string;
  disabled?: boolean;
  title?: string;
  handleClick?: () => void;
  name?: string;
};

const Icon: React.FC<IconProps> = ({ styles, imgUrl, isActive, disabled, title, handleClick, name }) => (
  <div className={`w-[48px] h-[48px] rounded-[10px] ${isActive === name ? 'bg-[#2c2f32]' : ''} 
  flex justify-center items-center ${!disabled && 'cursor-pointer'} ${styles}`} onClick={handleClick}>
    {!isActive ? (
      <img src={imgUrl} alt="fund_logo" className="w-1/2 h-1/2" />
    ) : (
      <img src={imgUrl} alt="fund_logo" className={`w-1/2 h-1/2 ${isActive !== undefined && name !== isActive?.toString() ? 'grayscale' : ''}`} />
    )}
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');



  return (
    <div className='flex justify-between items-center flex-col sticky top-5 h-[93vh]'>
      <Link to="/">
        <Icon styles="w-[52px] h-[52px] bg-[#2c2f32]" imgUrl={logo} />
      </Link>

      <div className="flex-1 flex flex-col justify-between items-center bg-[#1c1c24] rounded-[20px] w-[76px] py-4 mt-12">
        <div className="flex flex-col justify-center items-center gap-3">
          {navlinks.map((link) => (
            <Icon 
              key={link.name}
              {...link}
              isActive={active}
              handleClick={() => {
                if(!link.disabled) {
                  setActive(link.name);
                  navigate(link.link);
                }
              }}
            />
          ))}
        </div>
        <Icon styles="bg-[#1c1c24] shadow-secondary" imgUrl={sun} />

      </div>
    </div>
  )
}

export default Sidebar;