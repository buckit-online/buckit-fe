import React, { useState, useEffect } from 'react';
import NonVegLogo from '../assets/nonvegLogo.png';
import VegLogo from '../assets/vegLogo.png';
import { FaCheck } from 'react-icons/fa'
import { useParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

function AdminItemCard({ dishName, dishPrice, dishType, dishCategory }) {
  const { cafeId } = useParams();
  const { token, load } = useAuth();
    
  const [isChecked, setIsChecked] = useState(true);  

  useEffect(() => {
    const fetchDishStatus = async () => {
  
      if (!token) {
        console.error('No token found');
        return;
      }
  
      try {
        const encodedDishName = encodeURIComponent(dishName);
        const encodedDishCategory = encodeURIComponent(dishCategory);
  
        const res = await fetch(
          `${
            import.meta.env.VITE_APP_URL
          }/server/menuDetails/getDishStatus/${cafeId}/${encodedDishName}/${encodedDishCategory}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (res.ok) {
          const { dishStatus } = await res.json(); 
          setIsChecked(dishStatus); 
        } else {
          console.error('Failed to fetch dish status, status code:', res.status);
        }
  
      } catch (error) {
        console.error('Error fetching dish status:', error);
      }
    };
  
    fetchDishStatus();
  }, [cafeId, dishName, dishCategory]);
  

  const onToggleStatus = async (dishName, newStatus) => {
    const token = localStorage.getItem('token'); 
  
    if (!token) {
      console.error('No token found');
      return;
    }
  
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/menuDetails/updateDishStatus/${cafeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dishName,
            dishCategory,
            dishStatus: newStatus,
          }),
        }
      );
  
      if (response.ok) {
        console.log('Dish status updated successfully');
      } else {
        console.error('Failed to update dish status');
      }
    } catch (error) {
      console.error('Error updating dish status:', error);
    }
  };

  const handleStatusToggle = () => {
    const newStatus = !isChecked; 
    setIsChecked(newStatus); 
    onToggleStatus(dishName, newStatus); 
  };

  return (
    <div className='flex flex-col justify-start items-center w-1/4 py-3 px-3 bg-[#0158A11A] rounded-3xl'>
      {/* Dish type icon */}
      <div className='flex justify-between items-center w-full'>
        <div>
          {dishType === 'VEG' ? (
            <img src={VegLogo} alt="Veg Logo" className='h-6 w-6' />
          ) : (
            <img src={NonVegLogo} alt="Non Veg Logo" className='h-6 w-6' />
          )}
        </div>
        <div className='flex items-center gap-2'>
          <div 
            onClick={handleStatusToggle}
            className='w-5 h-5 flex justify-center items-center rounded-full cursor-pointer border-2 border-black overflow-hidden'
          >
            {isChecked ? (
              <div className='text-black scale-75'>
                <FaCheck />
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      {/* Dish name */}
      <div className='flex justify-between items-center text-lg font-montsarret font-montserrat-700 w-full p-1 pt-1'>
        <div>{dishName}</div>
        <div className='font-montserrat-500 text-sm'>Rs {dishPrice}</div>
      </div>
    </div>
  );
}

export default AdminItemCard;
