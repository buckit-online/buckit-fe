import React, { useState, useEffect, useRef } from 'react';
import SignOutLogo from '../assets/signOutLogo.png';
import AddRingLogo from '../assets/addRingLogo.png';
import PizzaLogo from '../assets/pizzaLogo.png';
import CurrencyLogo from '../assets/currencyLogo.png';
import DescriptionLogo from '../assets/descriptionLogo.png';
import CrossLogo from '../assets/crossLogo.png';
import { FaAngleDown, FaCheck, FaCross, FaPlus } from 'react-icons/fa'
import { useParams, useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useAuth } from '@/auth/AuthContext.jsx';
import Dashboard from './Dashboard';
import MonthlyEarnings from '@/components/MonthlyEarnings';
import AddImages from '@/components/AddImages';

function MenuUpload() {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const { token, load } = useAuth();
  const [cafeName, setCafeName] = useState('');
  const [cafePhone, setCafePhone] = useState(0);
  const [cafeEmail, setCafeEmail] = useState('');
  const [cafeTables, setCafeTables] = useState(0);
  const [cafeInstagram, setCafeInstagram] = useState('');
  const [cafeAddress, setCafeAddress] = useState('');
  const [cafeLogo, setCafeLogo] = useState('');
  const [cafePin, setCafePin] = useState(false);
  const [complains, setComplains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDishForm, setShowDishForm] = useState(false);
  const [showAddImages, setShowAddImages] = useState(false);
  const [showOrderPanelCard, setShowOrderPanelCard] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishType, setDishType] = useState('VEG');
  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [variants, setVariants] = useState([]);
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [showDashboard, setShowDashboard] = useState('dashboard');
  const [earnings, setEarnings] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingUpPin, setIsSettingUpPin] = useState(false);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState('');
  const pinRefs = useRef(Array(6).fill(null).map(() => React.createRef()));
  const orderPanelUrl = `/admin/${cafeId}`;

  useEffect(() => {
      if (!load && !token) {
          navigate('/', { replace: true });
      }
  }, [token, load, navigate]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const fetchCategoriesAndAddons = async () => {
    setLoading(true);
    setError(null);
  
    if (!token) {
      setError('Authorization token is missing');
      setLoading(false);
      return;
    }
  
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/cafeDetails/getCafeDetails/${cafeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      const data = await res.json();
  
      if (res.ok) {
        // Update states with fetched data
        setCafeName(data.name);
        setCafePhone(data.phone);
        setCafeEmail(data.email);
        setCafeTables(data.tables);
        setCafeInstagram(data.instagram);
        setCafeAddress(data.address);
        setCafeLogo(data.logoImg.url);
        setComplains(data.complains);
        setEarnings(data.earnings);
        setCategories(data.categories);
        setAddons(data.addons);
        if(data.pin) setCafePin(true);
      } else {
        setError(`Error: ${data.message || 'Unknown error occurred'}`);
        console.error('Error fetching data:', data);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Network error:', err);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
      if (!load && token) { 
          fetchCategoriesAndAddons();
      } else if (!load && !token) {
          console.error('No token available, redirecting to login.');
          setError('Authorization required');
      }
  }, [token, load, cafeId]); 
 

  const fetchCategoryDishes = async (category) => {
      try {
          const res = await fetch(
            `${
              import.meta.env.VITE_APP_URL
            }/server/menuDetails/getMenu/${cafeId}`
          );
          const data = await res.json();

          if (res.ok) {
              if (!data.dishes || data.dishes.length === 0) {
                  // No dishes found, clear the lists and show a message
                  setFilteredDishes([]);
                  setDishes([]); 
                  setError(`No dishes found in this category`);
              } else {
                  // Filter dishes based on category
                  const filtered = data.dishes.filter((dish) => dish.dishCategory === category);
                  setDishes(data.dishes);
                  setFilteredDishes(filtered);
                  setError(null);
              }
          } else {
              setError(`Error: ${data.message}`);
          }
      } catch (err) {
          console.error(err);
          setError('Failed to fetch dishes');
      }
  };

  // Handle category selection and trigger fetch for dishes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchCategoryDishes(category); 
  };

  useEffect(() => {
    if (!selectedCategory) {
      setShowDishForm(false); 
    }
  }, [selectedCategory]);

  // Close Add Images pop up
  const closeImagePopup = () => setShowAddImages(false);

  // Handle Dashboard and category content toggling
  const handleShowDashboard = (content) => {
    if (content === 'dashboard') {
      setShowDashboard('dashboard');
    } else if (content === 'categories') {
      setShowDashboard('category');
    } else if (content === 'monthlyEarnings') {
      setShowDashboard('monthlyEarnings');
    }
  };

  // Handle addition of the dish
  const handleAddDish = async (e) => {
    e.preventDefault();
    if (selectedCategory) {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_APP_URL
          }/server/menuDetails/addDish/${cafeId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              dishName,
              dishDescription,
              dishPrice,
              dishCategory: selectedCategory,
              dishType,
              variants: variants.map((variant) => ({
                variantName: variant.name,
                variantPrice: variant.price,
              })),
              addons: selectedAddons.map((addon) => ({
                addOnName: addon.addon_name,
                addOnPrice: addon.addon_price,
              })),
            }),
          }
        );

        const data = await res.json();
        if (res.ok) {
          setFilteredDishes((prevDishes) => [
            ...prevDishes,
            {
              dishName,
              dishDescription,
              dishPrice,
              dishCategory: selectedCategory,
              dishType,
              variants,
              addons
            }
          ]);
          fetchCategoriesAndAddons();
          fetchCategoryDishes(selectedCategory);
          setShowDishForm(false);
          setDishName('');
          setDishDescription('');
          setDishPrice('');
          setDishType('VEG');
          setVariants([]);  
          setAddons([]);
          setSelectedAddons([]);    
        } else {
          setError(`Error: ${data.message}`);
        }
      } catch (err) {
        setError('Failed to add dish');
      }
    }
  };

  const addVariant = () => {
    if (variantName && variantPrice) {
      setVariants([...variants, { name: variantName, price: variantPrice }]);
      setVariantName('');  
      setVariantPrice('');
    }
  };

  const handlePinChange = (index, e) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return; 
  
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
  
    if (value && index < 5) {
      pinRefs.current[index + 1].current.focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1].current.focus();
    }
  };

  const handleSavePin = async () => {
    const pinValue = pin.join(""); 
    if (pinValue.length !== 6) {
        setPinError("PIN must be 6 digits long.");
        return;
    }

    try {
        const response = await fetch(
          "${import.meta.env.VITE_APP_URL}/server/cafeDetails/setStaffPin",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cafeId, pin: pinValue }),
          }
        );

        const data = await response.json();
        if (response.ok) {
            setPinError("PIN saved successfully");
            setTimeout(() => {
                setIsSettingUpPin(false);
                setPin(["", "", "", "", "", ""]);
                setPinError('');
            }, 5000);

        } else {
          setPinError(data.message || "Failed to save PIN");
          setPin(["", "", "", "", "", ""]);
          setPinError('');
        }
    } catch (error) {
        setPinError("Error saving PIN, Try again");
        setPin(["", "", "", "", "", ""]);
        setPinError('');
    }

  };

  const handleLogOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/'); 
    window.location.reload(); 
  };

  return (
    <div className="w-full flex">

        {/* SIDEBAR */}    
            <SidebarProvider>
              <AppSidebar Categories={[...categories]} Addons={[...addons]} onCategoryChange={handleCategoryChange} 
                selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} CafeName={cafeName}
                handleContentView={handleShowDashboard} fetchCategoriesAndAddons={fetchCategoriesAndAddons}
                fetchCategoryDishes={fetchCategoryDishes} handleShowAddImages={setShowAddImages} />
              <SidebarTrigger />
            </SidebarProvider>

        {/* Pop-up overlay and content */}
        {showAddImages && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
              <AddImages categories={categories} handleAddImagesPopup={closeImagePopup} cafeId={cafeId} />
            </div>
        )}

        {/* CONTENT SECTION */}
        <div className="flex flex-col justify-start items-start flex-wrap w-[2000vw] p-4 gap-3 overflow-hidden">

          <div className="self-end flex justify-between items-center bg-base1 pt-6 pb-3 px-4">
            <div className='flex items-center gap-4'>
              <button onClick={() => setShowOrderPanelCard(true)} className='border-blue border-2 shadow-[0_0_8.7px_5px_#0158A124] rounded-full py-1 px-6 font-montsarret font-montserrat-700'>Order Panel</button>
              <button onClick={() => navigate(`/menu/${cafeId}/getQR`)} className='bg-blue rounded-full py-1 px-12 font-montsarret font-montserrat-700 text-white shadow-[0_0_8.7px_5px_#0158A124]'>Get QR</button>
              <button onClick={handleLogOut} className='text-2xl rounded-full border-2 border-[#C6C6C6] scale-90'>
                <img src={SignOutLogo} alt="Sign Out Logo" className='h-[42px] w-[42px] scale-75' />
              </button>
            </div>
          </div>


          {/* Order Panel URL Card */}
          {showOrderPanelCard && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
              <div className="bg-white rounded-3xl px-6 py-8 w-[25vw] flex flex-col gap-3 items-center relative">
                <button onClick={() => setShowOrderPanelCard(false)} className='absolute top-4 right-4'>
                  <img src={CrossLogo} alt="" className='h-5 w-5' />
                </button>

                <div className='font-montserrat-700 text-lg mb-2'>ORDER PANEL</div>

                {/* PIN Setup Logic */}
                {isSettingUpPin ? (
                  <>
                    <div className="flex justify-center gap-2">
                      {pin.map((digit, index) => (
                        <input
                          key={index}
                          ref={pinRefs.current[index]}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handlePinChange(index, e)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-7 h-7 text-center text-sm border-2 border-gray-300 rounded-lg focus:border-blue outline-none"
                        />
                      ))}
                    </div>
                    <div className='flex gap-2'>
                      <button onClick={handleSavePin} className='py-1.5 px-4 bg-blue rounded-xl text-white font-montserrat-400 text-xs'>
                        Save
                      </button>
                      <button onClick={() => { setIsSettingUpPin(false); 
                                               setPinError('');
                                               setPin(["", "", "", "", "", ""])
                                            }} 
                        className='py-1.5 px-2.5 bg-white rounded-xl text-blue border-blue border-2 font-montserrat-400 text-xs'>
                        Cancel
                      </button>
                    </div>
                    {pinError && 
                      <div className='text-xs mb-2 text-blue font-montserrat-500'>
                        {pinError}
                      </div>}
                  </>
                ) : (
                  <button onClick={() => setIsSettingUpPin(true)} className='py-1.5 bg-blue rounded-xl text-white font-montserrat-300 text-sm px-8 w-[85%]'>
                    SET UP STAFF PIN
                  </button>
                )}

                <button onClick={() => window.open(orderPanelUrl, "_blank")} className='py-1.5 bg-blue rounded-xl text-white font-montserrat-300 text-sm px-8 w-[85%]'>
                  GO TO ORDER PANEL
                </button>

              </div>
            </div>
          )}


          <div className='change-content w-full'>
            {showDashboard === 'dashboard' ? (
              <div>
                <div className='absolute left-[43%] top-[40%] text-6xl uppercase font-montsarret scale-[350%] font-montserrat-700 text-[#DFDFDF] opacity-20 -z-50'>
                    {cafeName.split(' ').map((word, index) => (
                        <div key={index}>{word}</div>
                    ))}
                </div>
                <div className='dashboard flex flex-col w-full'>
                  <Dashboard cafeName={cafeName} cafeEmail={cafeEmail} cafeAddress={cafeAddress} cafeComplains={complains} cafePhone={cafePhone} 
                  cafeInstagram={cafeInstagram} cafeTables={cafeTables} cafeLogo={cafeLogo} cafeEarnings={earnings} handleContentView={handleShowDashboard} />
                </div>
              </div>
            ) : showDashboard === 'monthlyEarnings' ? (
              <div>
                <div className='absolute left-[43%] top-[40%] text-6xl uppercase font-montsarret scale-[350%] font-montserrat-700 text-[#DFDFDF] opacity-20 -z-50'>
                    {cafeName.split(' ').map((word, index) => (
                        <div key={index}>{word}</div>
                    ))}
                </div>
                <MonthlyEarnings earnings={earnings} handleContentView={handleShowDashboard} />
              </div>
            ) : (
            <div className="categories flex flex-col sm:flex-row justify-start items-start w-full">
              <div className='absolute left-[43%] top-[40%] text-6xl uppercase font-montsarret scale-[350%] font-montserrat-700 text-[#DFDFDF] opacity-20 -z-50'>
                    {cafeName.split(' ').map((word, index) => (
                        <div key={index}>{word}</div>
                    ))}
              </div>

              <div className="flex flex-wrap w-full gap-4 justify-center sm:justify-start max-h-[78vh] overflow-y-auto pb-5">
                {/* If no category is selected, show the message */}
                {!selectedCategory ? (
                  <div className="text-lg text-center mx-auto mt-5">
                    Please select a category to view dishes
                  </div>
                ) : (
                  <>
                    {/* Add Dish Button (Only when category is selected) */}
                    <button 
                      className="absolute right-8 bottom-8 flex items-center justify-center gap-4 text-xl border-2 py-2 px-5 bg-blue z-50 text-white rounded-full hover:opacity-90"
                      onClick={() => setShowDishForm((prev) => !prev)}
                    >
                      <img src={AddRingLogo} alt="Add Ring Logo" className='h-[42px] w-[42px]' />
                      <div>Add Dish</div>
                    </button>

                    {/* Dish List */}
                    {filteredDishes.length > 0 ? (
                      filteredDishes.map((dish, index) => (
                        <ItemCard
                          key={index}
                          dishname={dish.dishName}
                          dishdescription={dish.dishDescription}
                          dishprice={dish.dishPrice}
                          dishCategory={selectedCategory}
                          dishType={dish.dishType}
                          dishStatus={dish.dishStatus}
                          dishVariants={dish.dishVariants}
                          dishAddOns={dish.dishAddOns}
                          onDelete={(category) => fetchCategoryDishes(category)}
                        />
                      ))
                    ) : (
                      <div>No dishes available in this category.</div>
                    )}
                  </>
                )}
              </div>


              {/* Dish Form Popup */}
              {showDishForm && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
                  <div className="bg-white rounded-3xl px-6 pt-12 pb-5 w-[40vw] scale-75 relative">
                    <h2 className="text-2xl font-montsarret font-montserrat-700 mb-4 py-2 text-center uppercase">Add Dish to {selectedCategory}</h2>
                    <div className="flex flex-col gap-3">
                      <div className='border-2 border-gray rounded-2xl flex items-center gap-1 py-1'>
                        <img src={PizzaLogo} alt="Pizza Logo" className='h-[42px] w-[42px] ml-1 scale-75' />
                        <input
                          type="text"
                          value={dishName}
                          onChange={(e) => setDishName(e.target.value)}
                          placeholder="dish name"
                          className="outline-none p-1 border-l-2 w-[89%]"
                          required
                        />
                      </div>
                      <div className='border-2 border-gray rounded-2xl flex items-center gap-1 py-1'>
                        <img src={DescriptionLogo} alt="Description Logo" className='h-[42px] w-[42px] ml-1 pl-2 py-2 scale-75' />
                        <input
                          type="text"
                          value={dishDescription}
                          onChange={(e) => setDishDescription(e.target.value)}
                          placeholder="dish description"
                          className="outline-none p-1 border-l-2 w-[89%]"
                          maxLength={150}
                          required
                        />
                      </div>
                      <div className='border-2 border-gray rounded-2xl flex items-center gap-1 py-1'>
                        <img src={CurrencyLogo} alt="Currency Logo" className='h-[42px] w-[42px] ml-1 scale-75' />
                        <input
                        type="number"
                        value={dishPrice}
                        onChange={(e) => setDishPrice(e.target.value)}
                        placeholder="dish price"
                        className="outline-none p-1 border-l-2 w-[89%]"
                        min={0}
                        required
                      />
                      </div>

                      
                      <div className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 
                        ${dishType === 'VEG' ? 'bg-[#008D38]' : 'bg-[#D80303]'}`} onClick={() => setDishType(dishType === 'VEG' ? 'NON-VEG' : 'VEG')}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 
                          ${dishType === 'VEG' ? 'translate-x-0' : 'translate-x-7'}`}
                        />
                      </div>

                      {/* Variants Enabled Toggle */}
                      <div className='flex gap-2 items-center'>
                        <div onClick={() => setVariantsEnabled(!variantsEnabled)} className={`h-5 w-5 cursor-pointer transition-colors duration-300 ${variantsEnabled ? 'bg-blue' : 'bg-white'} border-2 border-gray rounded flex items-center justify-center`}>
                          <input type="checkbox" checked={variantsEnabled} onChange={() => setVariantsEnabled(!variantsEnabled)} className="hidden"/>
                        </div>
                        <div className='uppercase font-montserrat-500'>Add Variants</div>
                      </div>

                      {/* Displaying Added Variants */}
                      {variants.length > 0 && (
                        <div className='flex gap-1 flex-wrap'>
                          {variants.map((variant, index) => (
                            <div key={index} className="flex gap-6 items-center justify-around w-[45%] border-2 border-blue rounded-xl py-1 my-0.5">
                              <span className="font-montserrat-500 capitalize">{variant.name}</span>
                              <span className="text-gray-600 flex items-center gap-2">
                                <div>Rs.{variant.price}</div>
                                <button onClick={() => setVariants(variants.filter(v => v.name !== variant.name))}>
                                  <img src={CrossLogo} alt="" className='h-6 w-6 scale-90' />
                                </button>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Variant Input Fields */}
                      <div className={`overflow-hidden transition-transform duration-500 ${variantsEnabled ? 'scale-y-100' : 'scale-y-0'} transform origin-top -mt-2`}>
                        {variantsEnabled && (
                          <div className='flex justify-between items-center gap-2 mt-2'>
                            <div className='w-2/3 border-2 border-gray rounded-2xl flex items-center gap-1 py-1'>
                              <img src={PizzaLogo} alt="pizza logo" className='rotate-180 h-[42px] w-[42px] ml-1 scale-75' />
                              <input
                                type="text"
                                placeholder='name'
                                value={variantName}
                                onChange={(e) => setVariantName(e.target.value)}
                                className='outline-none p-1 border-l-2 w-[75%]'
                              />
                            </div>
                            <div className='border-2 border-gray rounded-2xl flex items-center gap-1 py-1'>
                              <img src={CurrencyLogo} alt="currency logo" className='h-[42px] w-[42px] ml-1 scale-75' />
                              <input
                                type="number"
                                placeholder='price'
                                value={variantPrice}
                                onChange={(e) => setVariantPrice(e.target.value)}
                                className='outline-none p-1 mr-2 border-l-2 w-[75%]'
                              />
                            </div>
                            <button onClick={addVariant} type="button" className='bg-blue p-3 rounded-xl text-white align-middle'>
                              <FaCheck className='h-5 w-5'/>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className='dropdown-addons flex flex-col gap-2'>
                        <div className='relative flex items-center w-full py-2 px-2 border-2 border-gray rounded-2xl'>
                          <FaPlus className='h-4 w-4 ml-2 mr-1.5' />
                          <div className="relative w-full">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();  
                                toggleDropdown();
                              }}
                              className="flex justify-between text-md font-montserrat-400 items-center w-full px-2"
                            >
                              <div className='border-l-2 border-gray pl-2 uppercase font-montserrat-500'>
                                ADD-ONS
                              </div>
                              <FaAngleDown
                                className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </div>
                          {isOpen && (
                            <div className='absolute top-10 w-full -ml-1.5'>
                              {addons
                                .filter(addon => !selectedAddons.some(selected => selected.addon_name === addon.addon_name))
                                .map((addon, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();  
                                      e.stopPropagation();
                                      setSelectedAddons([...selectedAddons, addon]);
                                      setIsOpen(false);  // Close dropdown after selection
                                    }}
                                    className="py-1 w-full rounded-3xl px-4 bg-white border-2 border-blue my-0.5 uppercase flex justify-between items-center"
                                  >
                                    <div>{addon.addon_name}</div>
                                    <div>Rs {addon.addon_price}</div> 
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Display selected add-ons */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedAddons.map((addon, index) => (
                            <div key={index} className="rounded-full pl-2 pr-1 text-sm flex items-center justify-around py-1 border-2 border-blue gap-4">
                              <div className='uppercase font-montserrat-500'>{addon.addon_name}</div>
                              <img
                                src={CrossLogo}
                                alt="Remove addon"
                                className='h-5 w-5 cursor-pointer'
                                onClick={() => setSelectedAddons(selectedAddons.filter(a => a.addon_name !== addon.addon_name))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>


                      <button 
                        onClick={handleAddDish}
                        className="bg-blue text-lg text-white py-2 px-6 mb-3 rounded-2xl uppercase hover:opacity-90"
                      >
                        Add Dish
                      </button>
                    </div>
                    <button 
                      className="absolute right-2 top-2 scale-75"
                      onClick={() => {
                        setShowDishForm(false);
                        setDishName('');
                        setDishDescription('');
                        setDishPrice(0);
                        setDishType('VEG');
                        setVariantsEnabled(false);
                        setVariants([]);
                        setVariantName('');
                        setVariantPrice('');
                        setSelectedAddons([]);
                      }}
                    >
                      <img src={CrossLogo} alt="Cross Logo" className='h-[42px] w-[42px]' />
                    </button>
                  </div>
                </div>
              )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default MenuUpload;
