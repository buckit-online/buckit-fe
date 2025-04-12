import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import VegLogo from '../assets/vegLogo.png'
import NonVegLogo from '../assets/nonvegLogo.png'
import RemoveLogo from '../assets/removeLogo.png'
import DropDown from './DropDown'
import { useAuth } from '@/auth/AuthContext'
import UpdateDish from './UpdateDish'

function ItemCard({
  dishname,
  dishdescription,
  dishprice,
  dishType,
  dishCategory,
  dishVariants,
  dishAddOns,
  onDelete,
}) {
  const { cafeId } = useParams()
  const { token } = useAuth()

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // State for update form
  const [updatedDishName, setUpdatedDishName] = useState(dishname);
  const [updatedDishDescription, setUpdatedDishDescription] =
    useState(dishdescription);
  const [updatedDishPrice, setUpdatedDishPrice] = useState(dishprice);
  const [updatedDishType, setUpdatedDishType] = useState(dishType);
  const [variantsEnabled, setVariantsEnabled] = useState(
    dishVariants && dishVariants.length > 0
  );
  const [updatedVariants, setUpdatedVariants] = useState(dishVariants || []);
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState(dishAddOns || []);

  // Fetch all available addons when update form is opened
  const fetchAddons = async () => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/cafeDetails/getCafeDetails/${cafeId}`
      );
      const data = await res.json();
      if (res.ok && data.addons) {
        setAvailableAddons(data.addons);
      }
    } catch (err) {
      console.error('Error fetching addons:', err);
    }
  };

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  const handleDeleteDish = async () => {
    if (!token) {
      console.error('No token found')
      return
    }

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/menuDetails/deleteDish/${cafeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dishname, dishCategory }),
        }
      );

      if (response.ok) {
        console.log('Dish deleted:', dishname)
        onDelete(dishCategory)
      } else {
        console.error(
          'Failed to delete dish, server responded with:',
          response.status
        )
      }
    } catch (error) {
      console.error('Error deleting dish:', error)
    }
  };

  const handleUpdateDish = async (e) => {
    e.preventDefault();

    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/menuDetails/updateDish/${cafeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            originalDishName: dishname,
            dishCategory,
            updatedDish: {
              dishName: updatedDishName,
              dishDescription: updatedDishDescription,
              dishPrice: updatedDishPrice,
              dishType: updatedDishType,
              variants: updatedVariants.map((variant) => ({
                variantName: variant.name || variant.variantName,
                variantPrice: variant.price || variant.variantPrice,
              })),
              addons: selectedAddons.map((addon) => ({
                addOnName: addon.addon_name || addon.addOnName,
                addOnPrice: addon.addon_price || addon.addOnPrice,
              })),
            },
          }),
        }
      );

      if (response.ok) {
        console.log('Dish updated:', updatedDishName);
        setShowUpdateForm(false);
        onDelete(dishCategory); // Refresh the dish list
      } else {
        console.error(
          'Failed to update dish, server responded with:',
          response.status
        );
      }
    } catch (error) {
      console.error('Error updating dish:', error);
    }
  };

  const addVariant = () => {
    if (variantName && variantPrice) {
      setUpdatedVariants([
        ...updatedVariants,
        { name: variantName, price: variantPrice },
      ]);
      setVariantName('');
      setVariantPrice('');
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const openUpdateForm = () => {
    setShowUpdateForm(true)
  }

  const closeUpdateForm = () => {
    setShowUpdateForm(false)
  }

  return (
    <div className="relative flex flex-col justify-start items-center w-full md:w-[27%] min-h-[55%] py-3 pt-7 bg-[#0158A12A] rounded-3xl">
      {/* Dish type icon */}
      <div className="absolute top-1 left-1 scale-110">
        {dishType === 'VEG' ? (
          <img
            src={VegLogo}
            alt="Veg Logo"
            className="h-[42px] w-[42px] scale-50"
          />
        ) : (
          <img
            src={NonVegLogo}
            alt="NonVeg Logo"
            className="h-[42px] w-[42px] scale-50"
          />
        )}
      </div>

      {/* Delete icon */}
      <div className="absolute top-1 right-1 scale-110">
        <button onClick={handleDeleteDish} className="text-base4 scale-75">
          <img
            src={RemoveLogo}
            alt="Remove Logo"
            className="h-[42px] w-[42px] scale-75"
          />
        </button>
      </div>

      {/* Dish name */}
      <div className="flex justify-between items-center w-full px-3 mt-4 mb-2">
        <div className="capitalize text-sm font-montserrat-700 w-full rounded-md">
          {dishname}
        </div>
        <div className="text-xs capitalize font-montserrat-500 font-montsarret whitespace-nowrap">{`Price - Rs ${dishprice}`}</div>
      </div>

      <div className="w-full h-1 bg-white"></div>

      {/* Dish description and dropdowns */}
      <div className="flex flex-col justify-between h-full items-start gap-1 px-3 font-semibold bg-base4 rounded-md w-full">
        <div
          className="text-xs font-montsarret font-montserrat-500 capitalize break-words max-h-20 text-ellipsis w-full my-2"
          style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
        >
          {dishdescription}
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="relative bg-[#3295E866] rounded-3xl w-full">
            <button
              className="flex justify-between text-sm font-montserrat-400 items-center w-full px-4 py-1"
              onClick={openUpdateForm}
            >
              Update dish
            </button>
          </div>
          <DropDown
            title="Variants"
            listItems={dishVariants}
            isOpen={activeDropdown === 'variants'}
            onToggle={() => handleDropdownToggle('variants')}
          />
          <DropDown
            title="Add-ons"
            listItems={dishAddOns}
            isOpen={activeDropdown === 'addons'}
            onToggle={() => handleDropdownToggle('addons')}
          />
        </div>
      </div>

      {/* Update Dish Form Popup */}
      {showUpdateForm && (
        <UpdateDish
          dishname={dishname}
          dishCategory={dishCategory}
          onClose={closeUpdateForm}
          onUpdate={onDelete}
        />
      )}
    </div>
  )
}

export default ItemCard
