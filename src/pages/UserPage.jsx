import React, { useEffect, useState } from 'react';
import UserLogo from '../assets/cafeNameLogo.png';
import PhoneLogo from '../assets/callLogo.png';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

function UserPage() {
  const { cafeId, tableId } = useParams();
  const { token, load } = useAuth();
  const navigate = useNavigate();
  const [cafeLogo, setCafeLogo] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCafeDetails = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_APP_URL
          }/server/cafeDetails/getCafeDetails/${cafeId}`
        );
        const data = await res.json();
        if (res.ok) {
          setCafeLogo(data.logoImg.url);
        } else {
          console.log(`Error: ${data.message}`);
        }
      } catch (err) {
        console.log('Failed to fetch cafe details');
      }
    };

    fetchCafeDetails();
  }, [cafeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      setError("Please fill in both fields");
      return;
    }

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/userDetails/postUserDetails/${cafeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            phone,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        navigate(`/order/${cafeId}/${tableId}/${name}`);
      } else {
        setError('Failed to save the user details');
      }
    } catch (err) {
      setError('Network Error. Try again!');
    }
  };

  return (
    <div className='h-[80vh] w-full flex justify-center items-center'>
      <div className='flex flex-col justify-start items-center gap-2'>
        <div className='h-[30%] w-[30%]'><img src={cafeLogo} alt="Cafe Logo" /></div>
        <div className='font-montserrat-600 text-xl'>WELCOME</div>
        <form onSubmit={handleSubmit} className='flex flex-col px-6 gap-4 items-center w-full'>
          <div className='flex items-center gap-2 p-1 border-2 border-gray rounded-xl w-[110%]'>
            <img src={UserLogo} alt="User Logo" className='h-7 w-7' />
            <input
              type="text"
              placeholder='name'
              value={name}
              required
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className='border-l-2 border-black pl-2 outline-none font-montserrat-400 w-full'
            />
          </div>
          <div className='flex items-center gap-2 p-1.5 border-2 border-gray rounded-xl w-[110%]'>
            <img src={PhoneLogo} alt="Phone Logo" className='h-6 w-6' />
            <input
              type="tel"
              placeholder='number'
              required
              pattern="\d{10}"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError('');
              }}
              className='border-l-2 border-black pl-2 outline-none font-montserrat-400 w-full'
            />
          </div>

          {error && <div className='text-red text-xs font-montserrat-400 -my-2'>{error}</div> }

          <button type="submit" className='w-[110%] flex justify-end'>
            <div className='bg-blue p-2.5 text-white rounded-lg cursor-pointer'>
              <FaArrowRight />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserPage;
