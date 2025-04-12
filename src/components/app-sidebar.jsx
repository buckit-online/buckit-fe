import CategoriesLogo from '../assets/Widget_alt.png';
import DashBoardLogo from '../assets/darhboard_alt.png';
import AddOnLogo from '../assets/drink.png';
import PizzaLogo from '../assets/pizzaLogo.png';
import CurrencyLogo from '../assets/currencyLogo.png';
import CodacityLogo from '../assets/CodacityLogo.png';
import CustomerSupport from '../assets/CustomerSupport.png';
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { FaCheck } from "react-icons/fa";
import RemoveLogo from "../assets/removeLogo.png";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export function AppSidebar({ Categories, Addons, onCategoryChange, selectedCategory, setSelectedCategory, handleContentView, handleShowAddImages, fetchCategoriesAndAddons, fetchCategoryDishes }) {
  const { cafeId } = useParams();
  const { token } = useAuth();
  const [showCategories, setShowCategories] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([...Categories]);
  // const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddons, setShowAddons] = useState(false);
  const [showInputAddon, setShowInputAddon] = useState(false);
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState(0);
  const [addons, setAddons] = useState([...Addons]);
  const [error, setError] = useState("");

  useEffect(() => {
    setCategories([...Categories]);
  }, [Categories]);

  useEffect(() => {
    setAddons([...Addons]);
  }, [Addons]);

  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const handleViewChange = (section) => {
    handleContentView(section); 
    setShowCategories(section === "categories");
    setShowAddons(section === "addons");
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_APP_URL
          }/server/cafeDetails/postCategory/${cafeId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ category: newCategory }),
          }
        );
  
        const data = await res.json();
        if (res.ok) {
          setNewCategory('');       
          setShowInput(false);      
          fetchCategoriesAndAddons(); 
        } else {
          setError('Error creating new category.');
        }
      } catch (error) {
        setError('Network Error');
      }
    }
  };
  

  const handleDeleteCategory = async (category) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/cafeDetails/deleteCategory/${cafeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ category }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setCategories((prevCategories) => prevCategories.filter((cat) => cat !== category));
        
        setTimeout(() => {
          setSelectedCategory((prev) => (prev === category ? null : prev));
          fetchCategoriesAndAddons();
        }, 0);

      } else {
        setError('Error deleting the category');
      }
    } catch (err) {
      setError('Network Error');
    }
};


  const handleAddAddon = async () => {
    if (addonName.trim()) {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_APP_URL
          }/server/cafeDetails/postAddon/${cafeId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              addon_name: addonName,
              addon_price: addonPrice,
            }),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setAddons((prevAddons) => [...prevAddons, { addon_name: addonName, addon_price: addonPrice }]);
          fetchCategoriesAndAddons();
          setAddonName('');
          setAddonPrice(0);
          setShowInputAddon(false);
        } else {
          setError('Error adding new Add-On');
        }
      } catch (error) {
        setError('Network Error');
      }
    }
  };

  const handleDeleteAddon = async (addon_name) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/cafeDetails/deleteAddon/${cafeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ addon_name }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setAddons((prevAddons) => prevAddons.filter((add) => add.addon_name !== addon_name));
        fetchCategoryDishes(selectedCategory);
        fetchCategoriesAndAddons();
      } else {
        setError('Error deleting the Add-On');
      }
    } catch (err) {
      setError('Network Error');
    }
  };

  return (
    <Sidebar  style={{ backgroundColor: "#f0f0f0" }}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='mt-8'>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="DashBoard">
                  <div className='w-full flex gap-2 text-lg items-center uppercase rounded-lg font-montserrat-600 border-2 border-blue'
                  onClick={() => handleViewChange('dashboard')}>
                    <img src={DashBoardLogo} alt="" className='h-5 w-5 ml-2' />
                    <h2>DashBoard</h2>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Categories Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={showCategories} onOpenChange={setShowCategories} className='-mt-2.5'>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Categories" onClick={() => setShowCategories(!showCategories)}>
                      <div className="w-full flex gap-2 text-lg items-center uppercase rounded-lg font-montserrat-600 border-2 border-blue"
                      onClick={() => handleViewChange('categories')}>
                        <img src={CategoriesLogo} alt="" className='h-5 w-5 ml-2' />
                        <h2>Categories</h2>
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SidebarMenuSubItem key={category} onClick={() => handleCategorySelection(category)}>
                            <SidebarMenuSubButton asChild>
                              <div
                                key={category}
                                className={`flex relative gap-3 rounded-3xl py-4 -my-1 items-center border-2 border-blue ${
                                  selectedCategory === category ? "shadow-[0_0_6.4px_0_#3295E8]" : ""
                                } mt-2`}
                              >
                                <input
                                  type="radio"
                                  name="categories"
                                  id={category}
                                  checked={selectedCategory === category}
                                  hidden
                                />
                                <label htmlFor={category} className="font-montserrat-500 uppercase text-xs">
                                  {category}
                                </label>
                                <button
                                  className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 hover:bg-base3 text-white scale-90"
                                  onClick={() => handleDeleteCategory(category)}
                                >
                                  <img src={RemoveLogo} alt="Remove Logo" className="w-[20px] h-[20px]" />
                                </button>
                              </div>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))
                      ) : (
                        <div className="text-center mt-2">Please add your first category</div>
                      )}

                      <SidebarMenuSubItem>
                        {error && <div className='text-red text-sm text-center'>{error}</div>}

                        {showInput ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="Add new category"
                              className="border p-1 mt-1.5 rounded-md"
                            />
                            <button
                              onClick={handleAddCategory}
                              className="bg-blue text-white text-xs py-1.5 px-4 rounded-md"
                            >
                              Add Category
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowInput(true)}
                            className="mt-2 bg-blue text-white text-xs py-1.5 px-4 rounded-md w-full"
                          >
                            Add Category
                          </button>
                        )}
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Add-ons Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={showAddons} onOpenChange={setShowAddons} className="-mt-2.5">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Add-Ons" onClick={() => setShowAddons(!showAddons)}>
                      <div className="w-full flex gap-2 text-lg items-center uppercase rounded-lg font-montserrat-600 border-2 border-blue">
                        <img src={AddOnLogo} alt="" className="h-5 w-5 ml-2" />
                        <h2>Add-Ons</h2>
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {addons.length > 0 && addons.some(addon => addon.addon_name && addon.addon_price) ? (
                        addons
                          .filter((addon) => addon.addon_name && addon.addon_price)
                          .map((addon, index) => (
                            <SidebarMenuSubItem key={index}>
                              <SidebarMenuSubButton asChild>
                                <div
                                  key={addon.addon_name}
                                  className="flex relative gap-3 rounded-3xl py-4 -my-1 items-center border-2 border-blue mt-2"
                                >
                                  <div className="flex justify-between w-[85%] font-montserrat-500 uppercase text-xs">
                                    <div>{addon.addon_name}</div>
                                    <div>Rs.{addon.addon_price}</div>
                                  </div>
                                  <button
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 hover:bg-base3 text-white scale-90"
                                    onClick={() => handleDeleteAddon(addon.addon_name)}
                                  >
                                    <img src={RemoveLogo} alt="Remove Logo" className="w-[20px] h-[20px]" />
                                  </button>
                                </div>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))
                      ) : (
                        <div className="text-center mt-2">Please add your first add-on</div>
                      )}
                      <SidebarMenuSubItem>
                        {error && <div className='text-red text-sm text-center'>{error}</div>}

                        {showInputAddon ? (
                            <div className="flex flex-col items-center text-sm justify-between h-16 w-48 mt-2">
                              <div className='flex items-center justify-between'>
                                <div className='flex items-center rounded-lg border-2 border-blue w-[50%]'>
                                  <img src={PizzaLogo} alt="" className='h-5 w-5 mx-0.5'/>
                                  <input
                                    type="text"
                                    value={addonName}
                                    onChange={(e) => setAddonName(e.target.value)}
                                    placeholder="name"
                                    className="w-[60%] outline-none text-xs border-l-2 border-black border-opacity-50 pl-1 py-1"
                                  />
                                </div>
                                <div className='flex items-center rounded-lg border-2 border-blue w-[40%]'>
                                  <img src={CurrencyLogo} alt="" className='h-5 w-5 mx-0.5'/>
                                  <input
                                    type="number"
                                    value={addonPrice}
                                    onChange={(e) => setAddonPrice(e.target.value)}
                                    placeholder="price"
                                    className="w-[50%] outline-none text-xs border-l-2 border-black border-opacity-50 pl-1 py-1"
                                  />
                                </div>
                              </div>
                              <button
                                className="self-end py-1 px-2 flex justify-center items-center bg-blue rounded-md text-white hover:opacity-90"
                                onClick={handleAddAddon}
                              >
                                <FaCheck />
                              </button>
                            </div>
                        ) : (
                          <button
                            onClick={() => setShowInputAddon(true)}
                            className="mt-2 bg-blue text-xs text-white py-1.5 px-4 rounded-md w-full"
                          >
                            Add Add-On
                          </button>
                        )}
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Add Images Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='-mt-2'>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Images">
                  <div className='w-full flex gap-2 text-lg items-center uppercase rounded-lg font-montserrat-600 border-2 border-blue'
                  onClick={() => handleShowAddImages(true)}>
                    <img src={DashBoardLogo} alt="" className='h-5 w-5 ml-2' />
                    <h2>Add Images</h2>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      
      <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className='-mt-2.5 h-10 w-10 rounded-lg border-2 border-blue'>
                  <SidebarMenuButton>
                    <a href="https://wa.me/919375571036?text=Hello! I need some assistance. Can you help?" target="_blank" rel="noopener noreferrer" className='flex justify-center items-center h-10 w-10 scale-150'>
                        <img src={CustomerSupport} alt="" className='mt-1.5'/>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className='-mt-2.5 h-10 w-10 rounded-lg border-2 border-blue'>
                  <SidebarMenuButton>
                    <a href="https://codacitysolutions.com/" target='_blank' className='flex justify-center items-center h-10 w-10 scale-150'>
                        <img src={CodacityLogo} alt="" className='mt-1.5'/>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
