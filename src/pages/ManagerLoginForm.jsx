import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import emailLogo from '../assets/emailLogo.png';
import CodacityLogo from '../assets/CodacityLogo.png';
import Bg from '../assets/loginFormBg.png';
import { useAuth } from '@/auth/AuthContext.jsx';

function CafeLoginForm() {
    const { login } = useAuth(); // Access login function from AuthContext
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        pin: ['', '', '', '', '', ''], 
    });

    const pinRefs = useRef(Array(6).fill(null).map(() => React.createRef()));
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
        setError('');
    };

    const handlePinChange = (index, e) => {
        const value = e.target.value;
        if (!/^\d?$/.test(value)) return; 

        const newPin = [...formData.pin];
        newPin[index] = value;
        setFormData((prev) => ({ ...prev, pin: newPin }));

        if (value && index < 5) {
            pinRefs.current[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formData.pin[index] && index > 0) {
            pinRefs.current[index - 1].current.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || formData.pin.includes('')) {
            setError('Please fill all fields correctly.');
            return;
        }

        try {
            const res = await fetch(
              `${import.meta.env.VITE_APP_URL}/server/cafeDetails/managerLogin`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: formData.email,
                  pin: formData.pin.join(""),
                }),
              }
            );

            const data = await res.json();

            if (res.ok) {
                login(data.token, formData.email);
                navigate(`/admin/${data.cafeId}`);
            } else {
                setError(data.message || 'Login failed. Try again.');
            }
        } catch {
            setError('Network Error. Try again later.');
        }
    };

    return (
        <div className='relative w-full h-screen flex justify-around items-center py-10 overflow-y-hidden'>
            <a href='https://codacitysolutions.com/' target='_blank' className='absolute bottom-4 left-3 flex items-center cursor-pointer'>
                <img src={CodacityLogo} alt="Codacity Logo" className='h-7 w-10' />
                <h2 className='text-xs font-montserrat-700 text-gray pb-1'>Powered by Codacity Solutions</h2>
            </a>
            <div className='flex w-1/2 h-full flex-col justify-center items-center scale-90'>
                <h1 className='text-4xl font-montsarret font-montserrat-700 uppercase font-bold pb-4'>Welcome Managers</h1>
                <form onSubmit={handleSubmit} className='flex flex-col w-[70%] justify-between items-center gap-7 px-10 pt-10'>
                    {/* Email Input */}
                    <div className='flex gap-1 items-center w-[85%] border-2 border-[#C6C6C6] rounded-xl pr-4 py-1'>
                        <img src={emailLogo} alt="Email Logo" className='h-[42px] w-[42px] ml-1' />
                        <input
                            onChange={handleChange}
                            type="email"
                            id="email"
                            placeholder='Email'
                            className='outline-none text-sm px-1 py-2 w-full border-l-2'
                            autoComplete='off'
                        />
                    </div>

                    {/* PIN Input */}
                    <div className='flex justify-center gap-2'>
                        {formData.pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={pinRefs.current[index]}
                                type='text'
                                maxLength='1'
                                value={digit}
                                onChange={(e) => handlePinChange(index, e)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className='w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-blue outline-none'
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red text-sm font-montserrat-400 -my-3">{error}</p>}

                    {/* Submit Button */}
                    <button className='text-black text-xl rounded-xl w-full font-montsarret font-semibold px-1 py-3 border-blue border-2 shadow-[0_0_7.6px_0_#0158A133]'>
                        Log In
                    </button>
                </form>
                <div className='text-sm px-10 py-2 mt-2 font-montsarret font-montserrat-300 italic'>
                    <Link to="/" className="text-blue font-montserrat-500">Are you an owner?</Link>
                </div>
            </div>
            <div className='w-1/2'>
                <img src={Bg} alt="" />
            </div>
        </div>
    );
}

export default CafeLoginForm;
