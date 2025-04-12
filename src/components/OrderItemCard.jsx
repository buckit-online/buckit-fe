import React, { useState, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import VegLogo from '../assets/vegLogo.png';
import NonVegLogo from '../assets/nonvegLogo.png';

function OrderItemCard({ dish, onAddToOrder }) {
  const [showAddButton, setShowAddButton] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (quantity > 0) {
      onAddToOrder(dish, quantity);
    }
  }, [quantity]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);

  const decrementQuantity = () => {
    if (quantity === 1) {
      setShowAddButton(true);
      setQuantity(0);
    } else {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddClick = () => {
    setShowAddButton(false);
    setQuantity(1);
  };

  const toggleDescription = () => setIsExpanded(!isExpanded);

  return (
    <div className='relative flex justify-between items-center w-[90vw] px-2 py-3 my-1.5 rounded-2xl border-2 border-gray shadow-lg bg-user_comp'>

      {/* Dish name, price, and description */}
      <div className='flex flex-col justify-between gap-1 h-full w-[73%]'>
        <div className='flex flex-col justify-between items-start mb-2 h-full'>
          <div className='capitalize text-md font-montserrat-600 w-full rounded-xl'>
            {dish.dishName}
          </div>
          <div className='font-montserrat-500 text-sm mt-auto w-full'>{`Rs.${dish.dishPrice}`}</div>
        </div>
        
        <div className='text-xs font-montserrat-400 w-full' style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
          <span
            className={`${isExpanded ? '' : 'truncate'} inline-block`}
            style={{
              display: isExpanded ? 'block' : 'flex',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...(isExpanded
                ? {}
                : {
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }),
            }}
          >
            {dish.dishDescription}
          </span>
          {dish.dishDescription.length > 50 && (
            <button
              onClick={toggleDescription} 
              className='text-black font-montserrat-300 text-xs'
            >
              {isExpanded ? 'Read less' : 'Read more'}...
            </button>
          )}
        </div>
      </div>

      {/* Add button and type */}

        {/* Veg/Non-Veg Logo */}
        <div className='absolute top-2 right-2'>
          {dish.dishType === 'VEG' ? (
            <img src={VegLogo} alt="Veg Logo" className='h-5 w-5' />
          ) : (
            <img src={NonVegLogo} alt="Non Veg Logo" className='h-5 w-5' />
          )}
        </div>

        {/* Conditional rendering for Add button or Quantity input */}
        <div className='absolute bottom-3 right-2'>
          {showAddButton ? (
            <div className='flex justify-center items-center bg-user_blue hover:opacity-90 px-2 rounded-full'>
              <button 
                className='text-black uppercase font-montsarret font-montserrat-700 text-xs px-2 py-1'
                onClick={handleAddClick}
              >
                Add
              </button>
            </div>
          ) : (
            <div className='flex justify-between px-2 bg-user_blue mt-1 rounded-xl'>
              <button onClick={decrementQuantity}>
                <FaMinus className='text-black scale-75 pr-1' />
              </button>
              <span className='text-center bg-white px-2'>{quantity}</span>
              <button onClick={incrementQuantity}>
                <FaPlus className='text-black scale-75 pl-1' />
              </button>
            </div>
          )}
        </div>
    </div>
  );
}

export default OrderItemCard;
