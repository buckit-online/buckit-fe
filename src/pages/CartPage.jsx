import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
import { FaArrowLeft } from 'react-icons/fa';
import VegLogo from '../assets/vegLogo.png';
import NonVegLogo from '../assets/nonvegLogo.png';
import DownArrow from '../assets/DownArrow.png';

function CartPage() {
  const { cafeId, tableId, customer } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialOrderList = JSON.parse(localStorage.getItem(`orderList_${cafeId}_${tableId}`)) || location.state?.orderList || [];
  const [orderList, setOrderList] = useState(initialOrderList);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [cookingRequest, setCookingRequest] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [websocket, setWebsocket] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (cafeId) {
    const wsUrl = `ws://192.168.1.2:8080?cafeId=${cafeId}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected for customer');
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Handle any server messages if needed
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      setWebsocket(ws);
      
      // Clean up on unmount
      return () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [cafeId]);

  useEffect(() => {
    localStorage.setItem(`orderList_${cafeId}_${tableId}`, JSON.stringify(orderList));
  }, [orderList, cafeId, tableId]);

  const finalAmount = orderList.reduce((acc, item) => {
      return acc + (item.dishPrice * item.quantity);
  }, 0);

  const handleQuantityChange = (dishId, variant, addons, newQuantity) => {
    setOrderList(prevOrderList => {
      if (newQuantity === 0) {
        return prevOrderList.filter(item => 
          !(item._id === dishId && 
            JSON.stringify(item.variant) === JSON.stringify(variant) && 
            JSON.stringify(item.addons) === JSON.stringify(addons))
        );
      } else {
        return prevOrderList.map(item =>
          item._id === dishId &&
          JSON.stringify(item.variant) === JSON.stringify(variant) &&
          JSON.stringify(item.addons) === JSON.stringify(addons) 
            ? { ...item, quantity: newQuantity } 
            : item
        );
      }
    });
  };
  
  // Notify admin panel to fetch orders
  const notifyOrderPlaced = () => {
    if (websocket && websocket.readyState === WebSocket.OPEN && cafeId) {
      try {
        websocket.send(JSON.stringify({
          type: 'fetchOrders',
          cafeId: cafeId
        }));
        console.log('Sent order notification via WebSocket');
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not available for order notification');
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (orderList.length === 0) {
        setError("Your cart is empty.");
        return;
      }
      
      setIsSubmitting(true);
      setError('');
  
      const orderData = {
        cafeId,
        tableId,
        customer,
        cookingRequest,
        orderList: orderList.map(item => ({
          dishName: item.dishName,
          dishCategory: item.dishCategory,
          quantity: item.quantity,
          dishType: item.dishType,
          dishPrice: item.dishPrice || 0, 
          dishVariants: item.variant
            ? { variantName: item.variant.variantName, variantPrice: item.variant.variantPrice || 0 }
            : { variantName: "Default", variantPrice: 0 }, 
          dishAddOns: item.addons
            ? item.addons.map(addon => ({
                addOnName: addon.addOnName,
                addOnPrice: addon.addOnPrice || 0, 
              }))
            : [],
        })),
        timestamp: Date.now(),
      };
  
      localStorage.setItem(`orderHistory_${cafeId}_${tableId}`, JSON.stringify(orderData));

      const response = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/orderDetails/placeOrder/${cafeId}/${tableId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );
  
      const result = await response.json();
  
      if (result.success) {
        localStorage.removeItem(`orderList_${cafeId}_${tableId}`);
        setOrderList([]);
        notifyOrderPlaced();
        
        setOrderPlaced(true);
        setIsSubmitting(false);
      } else {
        setError(result.message || "Error placing order. Please try again later.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Network error. Please try again later.");
      setIsSubmitting(false);
    }
  };

  const getOrderHistory = () => {
    const orderHistory = JSON.parse(localStorage.getItem(`orderHistory_${cafeId}_${tableId}`));
    
    if (orderHistory && Date.now() - orderHistory.timestamp < 10800000) { 
      return orderHistory.orderList;
    } else {
      localStorage.removeItem(`orderHistory_${cafeId}_${tableId}`); 
      return [];
    }
  };  

  const orderHistory = getOrderHistory();
  const [openOrderHistory, setOpenOrderHistory] = useState(false);
  
  const handleGoToHomePage = () => {
    navigate(`/order/${cafeId}/${tableId}/${customer}`);
  };

  return (
    <div>
      <div className='relative bg-user_bg'>
        <div className='flex gap-5 shadow-xl items-center p-2 px-3 mb-5'>
          <div onClick={() => navigate(`/order/${cafeId}/${tableId}/${customer}`)} className='opacity-60 scale-90'><FaArrowLeft /></div>
          <div className="text-lg font-montserrat-600">Cart</div>
        </div>

        {!orderPlaced && <div className={`font-montserrat-600 px-3 mb-2.5 ${orderList.length === 0 ? 'opacity-0' : ''}`}>Your Order</div>}
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mx-3 mb-3">{error}</div>}
        
        {orderPlaced ? (
          <div className="text-center text-green-600 font-semibold py-4">
            <div className="text-5xl mb-3">✓</div>
            <p>Order placed successfully!</p>
            <button
              onClick={handleGoToHomePage}
              className="bg-user_blue text-black px-6 py-2 mt-3 rounded-2xl font-montserrat-600 hover:bg-opacity-90"
            >
              Order More
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col font-montserrat-500 gap-2 px-3 pb-28 h-[70vh] overflow-y-auto">
              {orderList.length === 0 ? (
                <div>
                <p className='w-full px-auto text-center'>Your cart is empty <br /> Please go back and add something to see here.</p>
                <div>
                    {orderHistory.length !== 0 && (
                      <div className='flex flex-col gap-1 mt-4'>
                        <div className='flex justify-between items-center w-full'>
                          <div className='text-sm font-montserrat-600'>Order History</div>
                          <div onClick={() => setOpenOrderHistory(prev => !prev)}>
                            <img src={DownArrow} alt="Down Arrow" className={`h-6 w-6 transition-transform duration-300 ${openOrderHistory ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        {openOrderHistory && (
                        <div className='px-3 py-2 rounded-2xl shadow-[0_0_18px_rgba(0,0,0,0.15)] bg-user_comp'>
                          {orderHistory.map((item, index) => (
                            <div key={index} className='flex flex-col gap-0.5 pb-0.5'>
                              <div className='flex justify-between w-full'>
                                <div className='capitalize flex justify-between items-center gap-1'>
                                  <div>{item.dishName}</div> 
                                  <div className='text-xs'>{item.dishVariants.variantName ? ` (${item.dishVariants.variantName})` : ''}</div>
                                  <div>{item.dishType === 'VEG' ? (
                                                <img src={VegLogo} alt="" className="h-2.5 w-2.5" />
                                              ) : (
                                                <img src={NonVegLogo} alt="" className="h-2.5 w-2.5" />
                                              )}
                                  </div>
                                </div>
                                <div>{item.quantity}</div>
                              </div>

                              {/* Addons Section */}
                              {item.dishAddOns && item.dishAddOns.length > 0 && (
                                <div className='flex gap-1 flex-wrap'>
                                  {item.dishAddOns.map((addon, idx) => (
                                    <div key={idx} className='rounded-2xl text-xs border-2 px-1 capitalize w-[45%]'>{addon.addOnName}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        )}
                      </div>
                    )}
                  </div>
                  </div>
              ) : (
                <div className='flex flex-col'>
                  <div className='flex flex-col gap-1.5 mb-1 pt-1.5'>
                    {orderList.map((item,index) => (
                      <div key={index}>
                        <CartItemCard item={item} variant={item.variant} 
                          addons={item.addons} onQuantityChange={handleQuantityChange} />
                      </div>
                    ))}
                  </div>
                  <div className='mt-2'>
                    <div className='font-montserrat-600 mb-1.5 text-sm'>Additional Details</div>
                    <div className='rounded-xl text-sm shadow-[0_0_18px_rgba(0,0,0,0.15)] bg-user_comp'>
                      <input type="text" 
                        placeholder='Add cooking requests...' 
                        className='py-2 px-1.5 outline-none w-full rounded-2xl bg-user_comp' 
                        value={cookingRequest} 
                        onChange={(e) => setCookingRequest(e.target.value)}/>
                    </div>
                  </div>
                  <div>
                    {orderHistory.length !== 0 && (
                      <div className='flex flex-col gap-1 mt-2'>
                        <div className='flex justify-between items-center w-full'>
                          <div className='text-sm font-montserrat-600'>Order History</div>
                          <div onClick={() => setOpenOrderHistory(prev => !prev)}>
                            <img src={DownArrow} alt="Down Arrow" className={`h-6 w-6 transition-transform duration-300 ${openOrderHistory ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        {openOrderHistory && (
                        <div className='px-3 py-2 rounded-2xl shadow-[0_0_18px_rgba(0,0,0,0.15)] bg-user_comp'>
                          {orderHistory.map((item, index) => (
                            <div key={index} className='flex flex-col gap-0.5 pb-0.5'>
                              <div className='flex justify-between w-full'>
                                <div className='capitalize flex justify-between items-center gap-1'>
                                  <div>{item.dishName}</div> 
                                  <div className='text-xs'>{item.dishVariants.variantName ? ` (${item.dishVariants.variantName})` : ''}</div>
                                  <div>{item.dishType === 'VEG' ? (
                                                <img src={VegLogo} alt="" className="h-2.5 w-2.5" />
                                              ) : (
                                                <img src={NonVegLogo} alt="" className="h-2.5 w-2.5" />
                                              )}
                                  </div>
                                </div>
                                <div>{item.quantity}</div>
                              </div>

                              {/* Addons Section */}
                              {item.dishAddOns && item.dishAddOns.length > 0 && (
                                <div className='flex gap-1 flex-wrap'>
                                  {item.dishAddOns.map((addon, idx) => (
                                    <div key={idx} className='rounded-2xl text-xs border-2 px-1 capitalize w-[45%]'>{addon.addOnName}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {orderList.length > 0 && (
              <div className="absolute flex justify-between items-center z-50 pt-3 pb-6 w-full px-3 font-montserrat-500 shadow-[0_0_18px_rgba(0,0,0,0.3)] bg-user_comp bottom-0">
                <p>Total : ₹{finalAmount}</p>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className={`uppercase ${isSubmitting ? 'bg-gray-400' : 'bg-user_blue'} text-black rounded-xl py-1 px-3 hover:bg-opacity-90 flex items-center`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Processing</span>
                      <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : 'Confirm Order'}
                </button>
              </div>
            )}
          </>
        )}
        
      </div>
    </div>
  );
}

export default CartPage;