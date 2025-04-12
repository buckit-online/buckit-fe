import React, { useEffect, useState } from 'react';
import SearchLogo from '../assets/searchLogo.png';
import { useNavigate, useParams } from 'react-router-dom';
import OrderItemCard from '../components/OrderItemCard';
import CategoryCard from '../components/CategoryCard';
import ExpandRight from '../assets/Expand_right.png';
import InstaLogo from '../assets/insta.png';
import ThumbDown from '../assets/thumb_down.png';
import CodacityLogo from '../assets/CodacityLogo.png';
import SendLogo from '../assets/Send.png';
import CartLogo from '../assets/Bag.png';
import MenuLogo from '../assets/Book_open_light.png';
import DishPopup from '@/components/DishPopup';
import { useAuth } from '@/auth/AuthContext';

function OrderUser() {
    const { cafeId, tableId, customer } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [cafeName, setCafeName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dishes, setDishes] = useState([]);
    const [instagramHandle, setInstagramHandle] = useState('');
    const [addons, setAddons] = useState([]);
    const [banner, setBanner] = useState('');
    const [categoryImgs, setCategoryImgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isComplainOpen, setIsComplainOpen] = useState(false);
    const [complaint, setComplaint] = useState('');
    const [complaintMessage, setComplaintMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDish, setSelectedDish] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState([]);

    // Initialize orderList from localStorage if available
    const [orderList, setOrderList] = useState(() => {
        const savedOrderList = localStorage.getItem(`orderList_${cafeId}_${tableId}`);
        return savedOrderList ? JSON.parse(savedOrderList) : [];
    });

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
                    setCafeName(data.name);
                    setCategories(data.categories);
                    setBanner(data.banner);
                    setCategoryImgs(data.categoryImgs);
                    setInstagramHandle(data.instagram);
                    setAddons(data.addons);
                } else {
                    setError(`Error: ${data.message}`);
                }
            } catch (err) {
                setError('Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        };

        fetchCafeDetails();
    }, [cafeId]);

    const fetchCategoryDishes = async () => {
        try {
            const res = await fetch(
              `${
                import.meta.env.VITE_APP_URL
              }/server/menuDetails/getMenu/${cafeId}`
            );
            const data = await res.json();
            if (res.ok) {
                setDishes(data.dishes);
            } else {
                setError(`Error: ${data.message}`);
            }
        } catch (err) {
            setError('Failed to fetch dishes');
        }
    };

    useEffect(() => {
        fetchCategoryDishes();
    }, [cafeId]);

    useEffect(() => {
        let filtered = dishes.filter(dish => dish.dishStatus === true); 
        
        if (selectedCategory) {
            filtered = filtered.filter(dish => dish.dishCategory === selectedCategory);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(dish => dish.dishName.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        
        setFilteredDishes(filtered);
    }, [selectedCategory, dishes, searchTerm]);

    useEffect(() => {
        localStorage.setItem(`orderList_${cafeId}_${tableId}`, JSON.stringify(orderList));
    }, [orderList, cafeId, tableId]);

    const openPopup = (dish) => {
        setSelectedDish(dish);
        const existingDish = orderList.find(item => item._id === dish._id);
        if (existingDish) {
            setSelectedVariant(existingDish.variant);
            setSelectedAddons(existingDish.addons);
        } else {
            setSelectedVariant(null);
            setSelectedAddons([]);
        }
        setShowPopup(true);
    };

    const handleAddToOrder = (dish, variant = {}, addons = [], quantity = 1) => {
        const updatedOrderList = [...orderList];
    
        // Ensure variant is always an object
        const validVariant = variant || {};
    
        // Replace dish price with variant price if a variant exists, else use the dish price
        const basePrice = validVariant.variantPrice || dish.dishPrice || 0;
    
        // Calculate total price for addons
        const addonPrice = addons.reduce((total, addon) => total + (addon.addOnPrice || 0), 0);
    
        // Total price = base price (variant or dish) + addons
        const totalDishPrice = basePrice + addonPrice;
    
        // Find the existing item with the same dish, variant, and addons
        const existingIndex = updatedOrderList.findIndex(item => 
            item._id === dish._id &&
            item.dishName === dish.dishName &&
            JSON.stringify(item.variant) === JSON.stringify(validVariant) && // Compare variants as strings
            JSON.stringify(item.addons) === JSON.stringify(addons) // Compare addons as strings
        );
        
        if (existingIndex > -1) {
            // If dish exists, update its quantity and price
            const updatedItem = { ...updatedOrderList[existingIndex] };
            updatedItem.quantity += quantity;
            updatedItem.dishPrice = totalDishPrice * updatedItem.quantity; // Recalculate price
            updatedOrderList[existingIndex] = updatedItem; // Replace the old item
        } else {
            // Add a new item
            const updatedDish = {
                ...dish,
                dishPrice: totalDishPrice,
                variant: validVariant, 
                addons, 
                quantity: quantity
            };
            updatedOrderList.push(updatedDish);
        }
    
        // Update the state
        setOrderList(updatedOrderList);
        setShowPopup(false);
    };    
        

    // Handle Complain Section
    const handleComplaintSubmit = async () => {
        if (!complaint) return;

        try {
            const res = await fetch(
              `${
                import.meta.env.VITE_APP_URL
              }/server/cafeDetails/postComplain/${cafeId}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ complaint }),
              }
            );
            const data = await res.json();

            if (res.ok) {
                setComplaintMessage('Successfully filed complaint');
                setComplaint(''); // Clear input
            } else {
                setComplaintMessage(`Error: ${data.message}`);
            }
        } catch (err) {
            setComplaintMessage('Failed to file complaint');
        }
    };

    useEffect(() => {
        if (complaintMessage) {
            const timer = setTimeout(() => setComplaintMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [complaintMessage]);

    return (
        <div className='relative bg-user_bg flex flex-col w-full min-h-[100vh]'>

            {/* STICKY CART BLOCK */}
            {orderList.length > 0 && (
                <div
                    className="fixed bottom-2 w-11/12 left-3 rounded-2xl bg-user_blue text-white z-50 transition-all duration-300"
                    style={{ transform: `translateY(${orderList.length > 0 ? '0' : '100%'})` }}
                >
                    <div className="flex justify-between items-center px-4 py-2">
                        <div className="font-montserrat-500 text-black text-md">
                            {`${orderList.length} item(s) in cart`}
                        </div>
                        <button
                            className="bg-white text-black p-1 px-4 py-1 rounded-xl font-montserrat-500"
                            onClick={() => navigate(`/order/${cafeId}/${tableId}/${customer}/cart`)}
                        >
                            View Cart
                        </button>
                    </div>
                </div>
            )}


            {/* POP-UP MENU */}
            <div className={`fixed inset-0 z-50 ${isMenuOpen ? 'bg-black bg-opacity-50' : 'bg-transparent pointer-events-none'}`}>
                {/* Pop-up Container */}
                <div className={`fixed bottom-0 left-0 w-full max-h-[70vh] bg-user_bg rounded-t-3xl shadow-lg border-t-2 z-50 transition-transform duration-500 ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    {/* Close Button */}
                    <button
                        className="absolute top-2 right-4 text-lg font-montserrat-700"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        ✕
                    </button>

                    {/* Pop-up Content */}
                    <div className="p-5 mt-2">
                        <div className='text-xl font-montserrat-700 mt-1 mb-3 text-center'>MENU</div>
                        <div className='flex flex-col gap-2 max-h-[55vh] overflow-y-auto'>
                            {categories.map((category, index) => (
                                <div onClick={()=>navigate(`/order/${cafeId}/${tableId}/${customer}/${category}`)} key={index} 
                                    className='flex justify-between items-center px-3 py-2 rounded-lg'>
                                    <div className='font-montserrat-500 uppercase'>{category}</div>
                                    <div>
                                        <img src={ExpandRight} className='h-5 w-5' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* HEADER */}
            <div className='sticky top-0 bg-user_bg w-full flex flex-col gap-2 px-3 pt-3 pb-2 z-20'>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex flex-col'>
                        <div className='uppercase font-montserrat-900 text-2xl'>{`${cafeName}`}</div>
                    </div>
                    <div className='flex gap-2 justify-end'>
                        <button onClick={(e) => {navigate(`/order/${cafeId}/${tableId}/${customer}/cart`)}} className='rounded-full h-8 w-8 border-2 border-gray bg-user_comp shadow-xl'>
                            <img src={CartLogo} alt="Cart Logo" className='scale-75' />
                        </button>
                    </div>
                </div>

                <div className={`w-full border-2 border-gray bg-user_comp rounded-xl flex gap-3 items-center overflow-hidden transition-all duration-500 ease-in-out ${
                    isComplainOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <input 
                        type="text" 
                        placeholder='complain' 
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        className='w-[80%] text-sm px-1 ml-2 py-1 outline-none bg-user_comp' 
                    />
                    <img 
                        src={SendLogo} 
                        alt="Send" 
                        onClick={handleComplaintSubmit}
                        className='h-5 w-5 ml-1.5 cursor-pointer' 
                    />
                </div>

                {/* Success message */}
                {complaintMessage && (
                    <div className='text-center text-[#008000] font-montserrat-600 text-xs'>
                        {complaintMessage}
                    </div>
                )}
            </div>

            {/* MAIN SECTION */}
            <div className='flex-grow overflow-y-auto mb-3 relative'>
                <div className='flex justify-center items-center mb-3 rounded-2xl shadow-xl w-[90%] h-[140px] mx-auto'>
                    {banner?.url ? (
                        <img src={banner.url} alt="Cafe Banner" className='w-full h-full object-cover rounded-xl' />
                    ) : (
                        <div>No Banner Available</div>
                    )}
                </div>

                <div className='mx-auto rounded-2xl border-2 border-gray bg-user_comp shadow-xl w-[90%] flex justify-evenly my-3 p-1'>
                        <div className='flex flex-col items-center'>
                            <a href={instagramHandle} target='_blank' className='cursor-pointer h-6 w-6'>
                                <img src={InstaLogo} alt="Insta Logo" className='scale-75' />
                            </a>
                            <div className='-mt-1 font-montserrat-500 text-xs mb-1'>Instagram</div>
                        </div>
                        
                        <div className='flex flex-col items-center'>
                            <button onClick={() => setIsComplainOpen(!isComplainOpen)} className='h-6 w-6'>
                                <img src={ThumbDown} alt="Complain Logo" className='scale-75' />
                            </button>
                            <div className='-mt-1 font-montserrat-500 text-xs mb-1'>Feedback</div>
                        </div>
                </div>

                <div className='flex flex-col justify-evenly py-1 w-[90%] mx-auto'>
                    <div className='font-montserrat-700 uppercase'>Explore Now</div>
                    <div className='h-[25vh] flex justify-start items-center gap-2 overflow-x-scroll scrollbar-hide'>
                        {categories.length === 0 ? (
                            <div>No categories</div>
                        ) : (
                            categories.map((category, index) => {
                                const categoryImage = categoryImgs.find(img => img.categoryName === category)?.images.url || '';
                                return (
                                    <CategoryCard
                                        onClick={() => navigate(`/order/${cafeId}/${tableId}/${customer}/${category}`)} 
                                        key={index}
                                        dishCategory={category}
                                        categoryImage={categoryImage}
                                    />
                                );
                            })
                        )}
                    </div>    
                </div>

                <div className='flex flex-col justify-evenly pb-2 w-[90%] mx-auto'>
                    <div className='flex justify-between items-center font-montsarret font-montserrat-700 uppercase pb-1 mb-1'>
                        <div>For You</div>
                        {/* MENU BUTTON */}
                        <button onClick={(e) => setIsMenuOpen(!isMenuOpen)} className='z-30 fixed bottom-[8.6rem] right-[0.85rem] rounded-full h-7 w-7 shadow-xl bg-user_blue'>
                            <img src={MenuLogo} alt="Menu Logo" className='scale-[65%]' />
                        </button>
                    </div>
                    
                    <div className='border-2 border-gray bg-user_comp rounded-xl flex gap-3 items-center shadow-lg'>
                        <img src={SearchLogo} alt="" className='h-5 w-5 ml-1.5 -mr-1' />
                        <input type="search" className='w-[80%] pr-2 py-1 outline-none bg-user_comp' 
                            value={searchTerm}  onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    <div className='flex flex-col justify-start items-start gap-2 pt-3 w-[90%]'>
                        {filteredDishes?.length > 0 ? (
                            filteredDishes
                                .map(dish => (
                                    <div key={dish._id}>
                                        <OrderItemCard 
                                            key={dish._id} 
                                            dish={dish} 
                                            onAddToOrder={() => openPopup(dish)}
                                        />
                                    </div>
                                ))
                        ) : (
                            <div>No dishes available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* POPUP */}
            {showPopup && (
                <DishPopup 
                    dish={selectedDish}
                    onClose={() => setShowPopup(false)}
                    onAddToOrder={handleAddToOrder}
                    addons={addons}
                    selectedVariant={selectedVariant}
                    selectedAddons={selectedAddons} 
                />
            )}

            {/* Codacity Footer - Appears only at the bottom */}
            <div className='my-3 px-4 flex items-center justify-center gap-1'>
                <img src={CodacityLogo} alt="Codacity Logo" className='h-7 w-10' />
                <h2 className='text-xs font-montserrat-700 text-black pb-1'>Powered by Codacity Solutions</h2>
            </div>
        </div>
    );
}

export default OrderUser;