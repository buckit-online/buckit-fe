import React from 'react';

function CategoryCard({ onClick, dishCategory, categoryImage }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundImage: `url(${categoryImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className='flex items-end justify-center overflow-hidden h-[145px] w-[145px] rounded-2xl flex-shrink-0 min-w-[145px]'
    >
      <div className='font-montserrat-500 text-white uppercase w-full truncate text-center bg-black bg-opacity-50'>
        {dishCategory}
      </div>
    </div>
  );
}

export default CategoryCard;
