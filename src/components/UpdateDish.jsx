import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PizzaLogo from '../assets/pizzaLogo.png'
import DescriptionLogo from '../assets/descriptionLogo.png'
import CurrencyLogo from '../assets/currencyLogo.png'
import CrossLogo from '../assets/crossLogo.png'
import { useAuth } from '@/auth/AuthContext'
import { FaAngleDown, FaCheck, FaPlus } from 'react-icons/fa'

function UpdateDish({ dishname, dishCategory, onClose, onUpdate }) {
  const { cafeId } = useParams()
  const { token } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedDishName, setUpdatedDishName] = useState('')
  const [updatedDishDescription, setUpdatedDishDescription] = useState('')
  const [updatedDishPrice, setUpdatedDishPrice] = useState('')
  const [updatedDishType, setUpdatedDishType] = useState('VEG')
  const [variantsEnabled, setVariantsEnabled] = useState(false)
  const [updatedVariants, setUpdatedVariants] = useState([])
  const [variantName, setVariantName] = useState('')
  const [variantPrice, setVariantPrice] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [availableAddons, setAvailableAddons] = useState([])
  const [selectedAddons, setSelectedAddons] = useState([])

  useEffect(() => {
    fetchDishDetails()
    fetchAddons()
  }, [dishname, dishCategory])

  const fetchDishDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const encodedDishName = encodeURIComponent(dishname)
      const encodedDishCategory = encodeURIComponent(dishCategory)

      const response = await fetch(
        `/server/menuDetails/getDishDetails/${cafeId}/${encodedDishName}/${encodedDishCategory}`
      )

      const data = await response.json()

      if (response.ok) {
        const { dish } = data

        // Update form state with dish details
        setUpdatedDishName(dish.dishName)
        setUpdatedDishDescription(dish.dishDescription)
        setUpdatedDishPrice(dish.dishPrice)
        setUpdatedDishType(dish.dishType)

        // Set variants
        const hasVariants = dish.dishVariants && dish.dishVariants.length > 0
        setVariantsEnabled(hasVariants)
        setUpdatedVariants(dish.dishVariants || [])

        // Set addons
        setSelectedAddons(dish.dishAddOns || [])
      } else {
        setError(`Error: ${data.message || 'Failed to fetch dish details'}`)
        console.error('Error fetching dish details:', data)
      }
    } catch (err) {
      setError('Failed to fetch dish details')
      console.error('Error fetching dish details:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all available addons
  const fetchAddons = async () => {
    try {
      const res = await fetch(`/server/cafeDetails/getCafeDetails/${cafeId}`)
      const data = await res.json()

      if (res.ok && data.addons) {
        // Normalize addon properties for consistency
        const normalizedAddons = data.addons.map((addon) => ({
          addOnName: addon.addOnName,
          addOnPrice: addon.addOnPrice,
        }))

        setAvailableAddons(normalizedAddons)
      } else {
        console.error('Failed to fetch addons:', data.message)
      }
    } catch (err) {
      console.error('Error fetching addons:', err)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const addVariant = () => {
    if (variantName && variantPrice) {
      setUpdatedVariants([
        ...updatedVariants,
        { variantName: variantName, variantPrice: variantPrice },
      ])
      setVariantName('')
      setVariantPrice('')
    }
  }

  const handleUpdateDish = async (e) => {
    e.preventDefault()

    if (!token) {
      console.error('No token found')
      return
    }

    try {
      const response = await fetch(`/server/menuDetails/updateDish/${cafeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
              variantName: variant.variantName,
              variantPrice: variant.variantPrice,
            })),
            addons: selectedAddons.map((addon) => ({
              addOnName: addon.addOnName,
              addOnPrice: addon.addOnPrice,
            })),
          },
        }),
      })

      if (response.ok) {
        console.log('Dish updated:', updatedDishName)
        onUpdate(dishCategory)
        onClose()
      } else {
        const data = await response.json()
        console.error('Failed to update dish:', data.message || response.status)
      }
    } catch (error) {
      console.error('Error updating dish:', error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <div className="bg-white rounded-3xl px-6 pt-12 pb-5 w-[40vw] scale-75 relative">
          <h2 className="text-2xl font-montsarret font-montserrat-700 mb-4 py-2 text-center uppercase">
            Loading dish details...
          </h2>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <div className="bg-white rounded-3xl px-6 pt-12 pb-5 w-[40vw] scale-75 relative">
          <h2 className="text-2xl font-montsarret font-montserrat-700 mb-4 py-2 text-center uppercase">
            Error
          </h2>
          <p className="text-center text-red-500 mb-4">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-blue text-white py-2 px-6 rounded-2xl"
            >
              Close
            </button>
          </div>
          <button className="absolute right-2 top-2 scale-75" onClick={onClose}>
            <img src={CrossLogo} alt="Close" className="h-[42px] w-[42px]" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl px-6 pt-12 pb-5 w-[40vw] scale-75 relative">
        <h2 className="text-2xl font-montsarret font-montserrat-700 mb-4 py-2 text-center uppercase">
          Update {dishname}
        </h2>
        <div className="flex flex-col gap-3">
          <div className="border-2 border-gray rounded-2xl flex items-center gap-1 py-1">
            <img
              src={PizzaLogo}
              alt="Pizza Logo"
              className="h-[42px] w-[42px] ml-1 scale-75"
            />
            <input
              type="text"
              value={updatedDishName}
              onChange={(e) => setUpdatedDishName(e.target.value)}
              placeholder="dish name"
              className="outline-none p-1 border-l-2 w-[89%]"
              required
            />
          </div>
          <div className="border-2 border-gray rounded-2xl flex items-center gap-1 py-1">
            <img
              src={DescriptionLogo}
              alt="Description Logo"
              className="h-[42px] w-[42px] ml-1 pl-2 py-2 scale-75"
            />
            <input
              type="text"
              value={updatedDishDescription}
              onChange={(e) => setUpdatedDishDescription(e.target.value)}
              placeholder="dish description"
              className="outline-none p-1 border-l-2 w-[89%]"
              maxLength={150}
              required
            />
          </div>
          <div className="border-2 border-gray rounded-2xl flex items-center gap-1 py-1">
            <img
              src={CurrencyLogo}
              alt="Currency Logo"
              className="h-[42px] w-[42px] ml-1 scale-75"
            />
            <input
              type="number"
              value={updatedDishPrice}
              onChange={(e) => setUpdatedDishPrice(e.target.value)}
              placeholder="dish price"
              className="outline-none p-1 border-l-2 w-[89%]"
              min={0}
              required
            />
          </div>

          <div
            className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 
            ${updatedDishType === 'VEG' ? 'bg-[#008D38]' : 'bg-[#D80303]'}`}
            onClick={() =>
              setUpdatedDishType(updatedDishType === 'VEG' ? 'NON-VEG' : 'VEG')
            }
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 
              ${updatedDishType === 'VEG' ? 'translate-x-0' : 'translate-x-7'}`}
            />
          </div>

          {/* Variants Enabled Toggle */}
          <div className="flex gap-2 items-center">
            <div
              onClick={() => setVariantsEnabled(!variantsEnabled)}
              className={`h-5 w-5 cursor-pointer transition-colors duration-300 ${
                variantsEnabled ? 'bg-blue' : 'bg-white'
              } border-2 border-gray rounded flex items-center justify-center`}
            >
              <input
                type="checkbox"
                checked={variantsEnabled}
                onChange={() => setVariantsEnabled(!variantsEnabled)}
                className="hidden"
              />
              {variantsEnabled && <FaCheck className="text-white text-xs" />}
            </div>
            <div className="uppercase font-montserrat-500">Add Variants</div>
          </div>

          {/* Displaying Added Variants */}
          {updatedVariants.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {updatedVariants.map((variant, index) => (
                <div
                  key={index}
                  className="flex gap-6 items-center justify-around w-[45%] border-2 border-blue rounded-xl py-1 my-0.5"
                >
                  <span className="font-montserrat-500 capitalize">
                    {variant.variantName}
                  </span>
                  <span className="text-gray-600 flex items-center gap-2">
                    <div>Rs.{variant.variantPrice}</div>
                    <button
                      onClick={() =>
                        setUpdatedVariants(
                          updatedVariants.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <img
                        src={CrossLogo}
                        alt=""
                        className="h-6 w-6 scale-90"
                      />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Variant Input Fields */}
          <div
            className={`overflow-hidden transition-transform duration-500 ${
              variantsEnabled ? 'scale-y-100' : 'scale-y-0'
            } transform origin-top -mt-2`}
          >
            {variantsEnabled && (
              <div className="flex justify-between items-center gap-2 mt-2">
                <div className="w-2/3 border-2 border-gray rounded-2xl flex items-center gap-1 py-1">
                  <img
                    src={PizzaLogo}
                    alt="pizza logo"
                    className="rotate-180 h-[42px] w-[42px] ml-1 scale-75"
                  />
                  <input
                    type="text"
                    placeholder="name"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    className="outline-none p-1 border-l-2 w-[75%]"
                  />
                </div>
                <div className="border-2 border-gray rounded-2xl flex items-center gap-1 py-1">
                  <img
                    src={CurrencyLogo}
                    alt="currency logo"
                    className="h-[42px] w-[42px] ml-1 scale-75"
                  />
                  <input
                    type="number"
                    placeholder="price"
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    className="outline-none p-1 mr-2 border-l-2 w-[75%]"
                  />
                </div>
                <button
                  onClick={addVariant}
                  type="button"
                  className="bg-blue p-3 rounded-xl text-white align-middle"
                >
                  <FaCheck className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="dropdown-addons flex flex-col gap-2">
            <div className="relative flex items-center w-full py-2 px-2 border-2 border-gray rounded-2xl">
              <FaPlus className="h-4 w-4 ml-2 mr-1.5" />
              <div className="relative w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown()
                  }}
                  className="flex justify-between text-md font-montserrat-400 items-center w-full px-2"
                >
                  <div className="border-l-2 border-gray pl-2 uppercase font-montserrat-500">
                    ADD-ONS
                  </div>
                  <FaAngleDown
                    className={`transform transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
              {isOpen && (
                <div className="absolute top-10 w-full -ml-1.5 z-10">
                  {availableAddons
                    .filter(
                      (addon) =>
                        !selectedAddons.some(
                          (selected) =>
                            (selected.addon_name || selected.addOnName) ===
                            (addon.addon_name || addon.addOnName)
                        )
                    )
                    .map((addon, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedAddons([...selectedAddons, addon])
                          setIsOpen(false)
                        }}
                        className="py-1 w-full rounded-3xl px-4 bg-white border-2 border-blue my-0.5 uppercase flex justify-between items-center"
                      >
                        <div>{addon.addon_name || addon.addOnName}</div>
                        <div>Rs {addon.addon_price || addon.addOnPrice}</div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Display selected add-ons */}
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedAddons.map((addon, index) => (
                <div
                  key={index}
                  className="rounded-full pl-2 pr-1 text-sm flex items-center justify-around py-1 border-2 border-blue gap-4"
                >
                  <div className="uppercase font-montserrat-500">
                    {addon.addon_name || addon.addOnName}
                  </div>
                  <img
                    src={CrossLogo}
                    alt="Remove addon"
                    className="h-5 w-5 cursor-pointer"
                    onClick={() =>
                      setSelectedAddons(
                        selectedAddons.filter((_, i) => i !== index)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleUpdateDish}
            className="bg-blue text-lg text-white py-2 px-6 mb-3 rounded-2xl uppercase hover:opacity-90"
          >
            Update Dish
          </button>
        </div>
        <button className="absolute right-2 top-2 scale-75" onClick={onClose}>
          <img src={CrossLogo} alt="Cross Logo" className="h-[42px] w-[42px]" />
        </button>
      </div>
    </div>
  )
}

export default UpdateDish
