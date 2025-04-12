import React, { useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

function DishPopup({ dish, onClose, onAddToOrder, addons, selectedVariant, selectedAddons }) {
    const [currentVariant, setCurrentVariant] = useState(selectedVariant || null);
    const [currentAddons, setCurrentAddons] = useState(selectedAddons || []);
    const [quantity, setQuantity] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [showAddButton, setShowAddButton] = useState(quantity === 0);
    const [filteredAddons, setFilteredAddons] = useState([]);

    useEffect(() => {
        setIsVisible(true);

        // Filter addons based on dish's required conditions
        const relevantAddons = dish.dishAddOns.filter(dishAddon =>
            addons.some(addon =>
                addon.addon_name === dishAddon.addOnName &&
                addon.addon_price === dishAddon.addOnPrice &&
                addon.addon_status === true
            )
        );

        setFilteredAddons(relevantAddons);
    }, [addons, dish.dishAddOns]);

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

    // Ensure addons are unique
    const handleAddonToggle = (addon) => {
        setCurrentAddons(prevAddons => {
            // Check if addon is already selected
            const exists = prevAddons.some(a => a.addOnName === addon.addOnName);
            if (exists) {
                // Remove the addon if it exists
                return prevAddons.filter(a => a.addOnName !== addon.addOnName);
            } else {
                // Add the addon if it does not exist
                return [...prevAddons, addon];
            }
        });
    };

    const handleAddToCart = () => {
        if (quantity > 0) {
            onAddToOrder(dish, currentVariant, currentAddons, quantity);
        }
        handleClose();
    };
    

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 flex justify-center items-end bg-black bg-opacity-50 z-50 pb-3 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white rounded-lg p-4 w-11/12 max-w-lg relative transition-transform transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <button onClick={handleClose} className="absolute top-2.5 right-3 rounded-full border-2 px-1 text-sm font-montserrat-700">✕</button>
                <h2 className="text-xl font-montserrat-700 mb-2 uppercase border-b border-black pb-2">{dish.dishName}</h2>

                {/* Variants Section */}
                <div>
                    <h3 className="font-montserrat-600">Size</h3>
                    <h3 className="font-montserrat-700 text-gray text-xs">(Select One)</h3>

                    <div className='flex flex-col gap-2 mt-2 w-full'>
                        {dish.dishVariants.length > 0 ? (
                            dish.dishVariants.map((variant, index) => (
                                <label key={index} className="flex justify-start w-full">
                                    <div className='flex justify-around w-[90%]'>
                                        <div className='w-1/2'>{variant.variantName}</div>
                                        <div className='w-1/2 text-right pr-3'>Rs {variant.variantPrice}</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        value={variant.variantName}
                                        checked={currentVariant?.variantName === variant.variantName}
                                        onChange={() => {
                                            // Toggle the current variant
                                            setCurrentVariant(prev => 
                                                prev?.variantName === variant.variantName ? null : variant
                                            );
                                        }}
                                        className="mr-2"
                                    />
                                </label>
                            ))
                        ) : (
                            <p className="text-gray font-montserrat-500 text-sm">No variants for this dish</p>
                        )}
                    </div>
                </div>

                <hr className='bg-gray my-4' />

                {/* Addons Section */}
                <div className='border-b border-black pb-2'>
                    <h3 className="font-montserrat-600 capitalize">Add on {dish.dishCategory.toLowerCase()}</h3>
                    <h3 className="font-montserrat-700 text-gray text-xs">(Optional | Select up to 1 option)</h3>

                    <div className='flex flex-col gap-2 mt-2 w-full'>
                        {filteredAddons.length > 0 ? (
                            filteredAddons.map((addon, index) => (
                                <label key={index} className="flex justify-start items-center w-full">
                                    <div className='flex justify-around w-[90%]'>
                                        <div className='w-1/2 capitalize'>{addon.addOnName.toLowerCase()}</div>
                                        <div className='w-1/2 text-right pr-3'>Rs {addon.addOnPrice}</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        value={addon.addOnName}
                                        checked={currentAddons.some(a => a.addOnName === addon.addOnName)}
                                        onChange={() => handleAddonToggle(addon)}
                                        className="p-1 h-3 w-3"
                                    />
                                </label>
                            ))
                        ) : (
                            <p className="text-gray font-montserrat-500 text-sm">No addons for this dish</p>
                        )}
                    </div>
                </div>

                {/* Quantity Selector */}
                <div className='flex justify-around items-center gap-3 mt-4'>
                    <div className='w-[30%] flex items-center'>
                        {showAddButton ? (
                            <button
                                onClick={handleAddClick}
                                className="bg-user_blue text-black px-3 py-2 rounded-lg"
                            >
                                Add
                            </button>
                        ) : (
                            <div className='flex items-center justify-between px-1.5 py-1 bg-user_blue text-black rounded-full'>
                                <button onClick={decrementQuantity}>
                                    <FaMinus className='scale-75' />
                                </button>
                                <span className='text-center px-2.5 py-1 mx-1 rounded'>{quantity}</span>
                                <button onClick={incrementQuantity}>
                                    <FaPlus className='scale-75' />
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="bg-user_blue text-black font-montserrat-400 px-4 py-2 rounded-lg w-[65%]"
                    >
                        Add Item | Rs {((currentVariant?.variantPrice || dish.dishPrice || 0) 
                        + currentAddons.reduce((total, addon) => total + (addon.addOnPrice || 0), 0)) 
                        * quantity}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DishPopup;
