import React, { useState } from 'react';
import UploadLogo from '../assets/Arhive_export.png';
import PizzaLogo from '../assets/pizzaLogo.png';
import CrossLogo from '../assets/crossLogo.png';
import { FaAngleDown, FaCheck } from 'react-icons/fa';

function AddImages({ categories, handleAddImagesPopup, cafeId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownCategories, setDropdownCategories] = useState([...categories]);
  const [selectedCategory, setSelectedCategory] = useState('category');
  const [imageFile, setImageFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // State for messages
  const [imageMessage, setImageMessage] = useState(null);
  const [bannerMessage, setBannerMessage] = useState(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageMessage(null); // Clear previous messages
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerMessage(null); 
    }
  };

  const uploadImage = async () => {
    if (selectedCategory=='category' || !imageFile) {
      setImageMessage({ type: 'error', text: "Please select a category and upload an image before submitting." });
      return;
    }

    const formData = new FormData();
    formData.append('category', selectedCategory);
    formData.append('imageFile', imageFile);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/cafeDetails/uploadImages/${cafeId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setImageMessage({ type: 'success', text: "Image uploaded successfully." });
        setSelectedCategory('category');
        setImageFile(null);
      } else {
        const errorData = await response.json();
        setImageMessage({ type: 'error', text: `Error: ${errorData.message}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setImageMessage({ type: 'error', text: "An error occurred while uploading the image." });
    }
  };

  const uploadBanner = async () => {
    if (!bannerFile) {
      setBannerMessage({ type: 'error', text: "Please upload a banner image before submitting." });
      return;
    }

    const formData = new FormData();
    formData.append('bannerFile', bannerFile);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/cafeDetails/uploadBanner/${cafeId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setBannerMessage({ type: 'success', text: "Banner uploaded successfully." });
        setBannerFile(null);
      } else {
        const errorData = await response.json();
        setBannerMessage({ type: 'error', text: `Error: ${errorData.message}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setBannerMessage({ type: 'error', text: "An error occurred while uploading the banner." });
    }
  };

  const closePopup = () => handleAddImagesPopup();

  return (
    <div>
      <div className='relative flex flex-col justify-center gap-5 h-[55vh] w-[30vw] bg-white rounded-2xl p-5'>
        
        <div className='absolute right-5 top-5 cursor-pointer' onClick={closePopup}>
          <img src={CrossLogo} alt="Close" className='h-6 w-6' />
        </div>

        <div className='flex flex-col justify-start items-center gap-2 w-full'>
          <div className='font-montserrat-700 text-xl -mb-2'>ADD IMAGES</div>
          <div className='font-montserrat-500 text-gray text-xs'>Preferable ratio: 512 × 512 px</div>

          {/* Dropdown */}
          <div className='relative flex items-center w-[80%] py-1 px-2 border-2 border-gray rounded-xl'>
            <img src={PizzaLogo} alt="Logo" className='h-6 w-6' />
            <div className="relative w-full">
              <button
                onClick={toggleDropdown}
                className="flex justify-between text-sm font-montserrat-400 items-center w-full px-2 py-1"
              >
                <div className='border-l-2 border-gray pl-2 uppercase'>
                  {selectedCategory}
                </div>
                <FaAngleDown
                  className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            {isOpen && (
              <div className='absolute top-10 w-full'>
                {dropdownCategories.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleCategorySelect(item)}
                    className="py-1 cursor-pointer w-full rounded-3xl px-4 bg-white border-2 border-blue my-0.5 uppercase"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Image */}
          <div className='w-[80%] flex flex-col items-center gap-2'>
            <div className='flex justify-center items-center py-1.5 gap-3 w-full'>
              <div className='bg-blue rounded-xl flex items-center justify-center py-1.5 w-full'>
                <img src={UploadLogo} alt="Upload" className='h-6 w-6' />
                <input 
                  type="file" 
                  name='imageFile' 
                  id='imageFile' 
                  className='hidden' 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange} 
                />
                <label htmlFor='imageFile' className='font-montserrat-500 text-md text-white cursor-pointer'>Upload Image</label>
              </div>
              {imageFile && (
                <button onClick={uploadImage} className='bg-blue p-2.5 rounded-xl text-white'>
                  <FaCheck />
                </button>
              )}
            </div>
            {imageMessage && (
              <div className={`text-sm ${imageMessage.type === 'success' ? 'text-green' : 'text-red'}`}>
                {imageMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Upload Banner */}
        <div className='flex flex-col justify-start items-center gap-2 w-full'>
          <div className='font-montserrat-400 text-sm -mb-2'>DISCOUNT BANNER</div>
          <div className='font-montserrat-500 text-gray text-xs -mb-1'>Preferable ratio: 2560 × 1008 px</div>

          <div className='w-[80%] flex flex-col items-center gap-2'>
            <div className='flex justify-center items-center py-1.5 gap-3 w-full'>
              <div className='bg-blue rounded-xl flex items-center justify-center py-1.5 w-full'>
                <img src={UploadLogo} alt="Upload" className='h-6 w-6' />
                <input 
                  type="file" 
                  name='bannerFile' 
                  id='bannerFile' 
                  className='hidden' 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleBannerChange} 
                />
                <label htmlFor='bannerFile' className='font-montserrat-500 text-md text-white cursor-pointer'>Upload Banner</label>
              </div>
              {bannerFile && (
                <button onClick={uploadBanner} className='bg-blue p-2.5 rounded-xl text-white'>
                  <FaCheck />
                </button>
              )}
            </div>
            {bannerMessage && (
              <div className={`text-sm ${bannerMessage.type === 'success' ? 'text-green' : 'text-red'}`}>
                {bannerMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddImages;
