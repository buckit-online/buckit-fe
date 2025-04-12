import React from 'react';
import { FaAngleDown } from 'react-icons/fa';

function DropDown({ title, listItems = [], isOpen, onToggle }) {
  return (
    <div className="relative bg-[#3295E866] rounded-3xl w-full">
      <button
        onClick={onToggle}
        className="flex justify-between text-sm font-montserrat-400 items-center w-full px-4 py-1"
      >
        <div>{title}</div>
        <FaAngleDown
          className={`transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Smooth transition effect */}
      <div
        className={`flex flex-col absolute top-7 w-full z-10 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
        }}
      >
        {listItems.length > 0 ? (
          listItems.map((item, index) => (
            <div
              key={index}
              className="py-0.5 flex justify-around cursor-pointer bg-white w-full rounded-3xl text-sm capitalize border-2 border-blue mt-0.5"
            >
              <div className='w-1/2 pl-4'>{item.addOnName || item.variantName}</div>
              <div className='w-1/2 pl-8'>Rs. {item.addOnPrice || item.variantPrice}</div>
            </div>
          ))
        ) : (
          <div className="py-0.5 flex justify-around bg-white cursor-pointer w-full rounded-3xl text-sm capitalize border-2 border-blue my-0.5">
            No items found
          </div>
        )}
      </div>
    </div>
  );
}

export default DropDown;
