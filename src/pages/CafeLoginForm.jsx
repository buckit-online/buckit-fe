import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import emailLogo from '../assets/emailLogo.png';
import passwordLogo from '../assets/passwordLogo.png';
import CodacityLogo from '../assets/CodacityLogo.png';
import Bg from '../assets/loginFormBg.png';
import { useAuth } from '@/auth/AuthContext.jsx';

function CafeLoginForm() {
    const { login } = useAuth(); // Access login function from AuthContext
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please fill all the fields.');
            return;
        }
    
        try {
            const res = await fetch(
              `${import.meta.env.VITE_APP_URL}/server/cafeDetails/cafeLogin`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: formData.email,
                  password: formData.password,
                }),
              }
            );
    
            const data = await res.json();
    
            if (res.ok) {
                // Correct order of arguments: token first, then email
                login(data.token, formData.email); 
                navigate(`/menu/${data.cafeId}`);
            } else {
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            setError('Network Error. Please try again later.');
        }
    };
    

    return (
        <div className='relative w-full h-screen flex justify-around items-center py-10 overflow-y-hidden'>
            <a href='https://codacitysolutions.com/' target='_blank' className='absolute bottom-4 left-3 flex items-center cursor-pointer'>
                <img src={CodacityLogo} alt="Codacity Logo" className='h-7 w-10' />
                <h2 className='text-xs font-montserrat-700 text-gray pb-1'>Powered by Codacity Solutions</h2>
            </a>
            <div className='flex w-1/2 h-full flex-col justify-center items-center scale-90'>
                <h1 className='text-6xl font-montsarret font-montserrat-700 uppercase font-bold pb-4'>Welcome</h1>
                <form onSubmit={handleSubmit} className='flex flex-col w-[70%] justify-between items-center gap-7 px-10 pt-10'>
                    
                    <div className='flex gap-1 items-center w-[85%] border-2 border-[#C6C6C6] rounded-xl pr-4 py-1'>
                        <img src={emailLogo} alt="Email Logo" className='h-[42px] w-[42px] ml-1'  />
                        <input onChange={handleChange} type="email" id="email" placeholder='email' className='outline-none text-sm px-1 py-2 w-full border-l-2' autoComplete='off' />
                    </div>
                    <div className='flex gap-1 items-center w-[85%] border-2 border-[#C6C6C6] rounded-xl pr-4 py-1'>
                        <img src={passwordLogo} alt="Password Logo" className='h-[42px] w-[42px] ml-1'  />
                        <input onChange={handleChange} type="password" id='password' placeholder='password' className='outline-none text-sm px-1 py-2 w-full border-l-2' autoComplete='off' />
                    </div>
                    
                    {error && <p className="text-red text-sm font-montserrat-400 -my-3">{error}</p>}
                    
                    <button className='text-black text-xl rounded-xl w-full font-montsarret font-semibold px-1 py-3 border-blue border-2 shadow-[0_0_7.6px_0_#0158A133]'>LogIn</button>
                </form>
                <div className='text-sm px-10 py-2 mt-2 flex gap-1 font-montsarret font-montserrat-300 italic'>
                    <div>Don't have an account?</div>
                    <Link to="/register" className="text-blue font-montserrat-500">Sign-up</Link>
                </div>
                <div className='text-sm px-10 py-2 font-montsarret font-montserrat-300 italic'>
                    <Link to="/manager" className="text-blue font-montserrat-500">Are you a manager?</Link>
                </div>
            </div>
            <div className='w-1/2'>
                <img src={Bg} alt="" className=''/>
            </div>
        </div>
    )
}

export default CafeLoginForm;
