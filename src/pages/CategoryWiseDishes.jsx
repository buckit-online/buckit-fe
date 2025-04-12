import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import OrderItemCard from '../components/OrderItemCard.jsx';
import CodacityLogo from '../assets/CodacityLogo.png';
import DishPopup from '../components/DishPopup.jsx'; 

function CategoryWiseDishes() {
    const { cafeId, tableId, category, customer } = useParams();
    const [dishes, setDishes] = useState([]);
    const [addons, setAddons] = useState([]);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dishType, setDishType] = useState('BOTH');
    const [selectedDish, setSelectedDish] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState([]);

    const navigate = useNavigate();

    const [orderList, setOrderList] = useState(() => {
        const savedOrderList = localStorage.getItem(`orderList_${cafeId}_${tableId}`);
        return savedOrderList ? JSON.parse(savedOrderList) : [];
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
            const fetchCafeAddOns = async () => {
                try {
                    const res = await fetch(
                      `${
                        import.meta.env.VITE_APP_URL
                      }/server/cafeDetails/getCafeDetails/${cafeId}`
                    );
                    const data = await res.json();
                    if (res.ok) {
                        setAddons(data.addons);
                    } else {
                        setError(`Error: ${data.message}`);
                    }
                } catch (err) {
                    setError('Failed to fetch categories');
                }
            };
    
            fetchCafeAddOns();
        }, [cafeId]);

    // Fetch dishes when component mounts
    useEffect(() => {
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
                    console.log(`Error: ${data.message}`);
                }
            } catch (err) {
                console.log('Failed to fetch dishes');
            }
        };
        fetchCategoryDishes();
    }, [cafeId]);

    // Filter dishes based on category, status, and dish type
    useEffect(() => {
        let filtered = dishes.filter(dish =>
            dish.dishCategory === category &&
            dish.dishStatus === true &&
            (dishType === 'BOTH' || dish.dishType === dishType)
        );

        if (searchTerm) {
            filtered = filtered.filter(dish =>
                dish.dishName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDishes(filtered);
    }, [dishes, category, dishType, searchTerm]);

    // Save orderList to localStorage whenever it updates
    useEffect(() => {
        localStorage.setItem(`orderList_${cafeId}_${tableId}`, JSON.stringify(orderList));
    }, [orderList, cafeId, tableId]);

    // Function to handle adding or updating a dish in the orderList
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

    // Function to open the dish popup
    const handleDishClick = (dish) => {
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

    // Function to handle changes in the select dropdown
    const handleDishTypeChange = (e) => {
        setDishType(e.target.value);
    };

    return (
        <div className='flex flex-col min-h-[100vh] bg-user_bg'>
            {/* Header */}
            <div className='flex gap-4 items-center px-2 py-2'>
                <FaArrowLeft
                    onClick={() => navigate(`/order/${cafeId}/${tableId}/${customer}`)}
                    className='h-5 w-5 opacity-60 scale-[80%]'
                />
                <div className='uppercase font-montserrat-600'>{category}</div>
            </div>

            {/* Filters */}
            <div className='flex justify-between px-2 pb-4 gap-0.5 shadow-xl bg-user_bg'>
                <select
                    name='DishType'
                    id='dish-type'
                    className='outline-none font-montserrat-400 bg-user_comp text-sm border rounded-full p-1'
                    value={dishType}
                    onChange={handleDishTypeChange}
                >
                    <option value='VEG'>Pure-Veg</option>
                    <option value='NON-VEG'>Non-Veg</option>
                    <option value='BOTH'>Both</option>
                </select>
                <div className='flex items-center border rounded-full px-2 bg-user_comp'>
                    <input
                        type='search'
                        placeholder='Search in Menu'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='outline-none font-montserrat-400 text-sm bg-user_comp'
                    />
                    <FaSearch className='h-4 w-4 opacity-60' />
                </div>
            </div>

            {/* Dish List */}
            <div className='p-3'>
                {filteredDishes.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm font-semibold">{`Note: Currently ${category} are not available.`}</p>
                ) : (
                    filteredDishes.map((dish) => (
                        <OrderItemCard
                            key={dish._id}
                            dish={dish}
                            onAddToOrder={() => handleDishClick(dish)}
                        />
                    ))
                )}
            </div>


            {/* DishPopUp */}
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

            {/* STICKY CART BLOCK */}
            {orderList.length > 0 && (
                <div
                    className="fixed bottom-2 w-11/12 left-3 rounded-2xl bg-user_blue text-white z-20 transition-all duration-300"
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

            {/* Codacity Footer - Appears only at the bottom */}
            <div className='my-3 px-4 flex items-center justify-center gap-1'>
                <img src={CodacityLogo} alt="Codacity Logo" className='h-7 w-10' />
                <h2 className='text-xs font-montserrat-700 text-black pb-1'>Powered by Codacity Solutions</h2>
            </div>
        </div>
    );
}

export default CategoryWiseDishes;
