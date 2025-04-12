import React from 'react';
import PaidLogo from '../assets/vegLogo.png';
import CancelledLogo from '../assets/nonvegLogo.png';
import UPILogo from '../assets/UPI.png';
import WalletLogo from '../assets/wallet.png';
import CreditCardLogo from '../assets/credit-card.png';

function MonthlyEarnings({ earnings, handleContentView }) {
  // Sorting earnings based on monthYear in descending order
  const sortedEarnings = [...earnings].sort((a, b) => {
    const dateA = new Date(a.monthYear); 
    const dateB = new Date(b.monthYear);
    return dateB - dateA; 
  });

  return (
    <div className='flex flex-col pr-14 py-1 w-full'>
      <div className='flex justify-between w-full mb-2 items-center'>
        <button
          onClick={() => handleContentView('dashboard')}
          className='rounded-full border-2 px-4 py-0.5'
        >
          <div>Back</div>
        </button>
        <div className='flex gap-3 font-montserrat-600 text-sm'>
          <div className='flex gap-1 items-center'>
            <img src={PaidLogo} alt="" className='h-6 w-6' />
            <div>PAID</div>
          </div>
          <div className='flex gap-1 items-center'>
            <img src={CancelledLogo} alt="" className='h-6 w-6' />
            <div>CANCELLED</div>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2 h-[60vh] overflow-y-auto'>
        {sortedEarnings.length > 0 ? (
          sortedEarnings.map((earning, index) => {
            return (
              <div
                key={index}
                className='flex justify-around items-center rounded-2xl py-2.5 px-1 bg-[#0158A11A] border-2 border-blue'
              >
                <div className='w-1/4 text-left ml-3 font-montserrat-500 text-md'>
                  {earning.monthYear} | Rs. {earning.totalAmount}
                </div>
                <div className='w-1/2 flex justify-evenly text-sm font-montserrat-400'>
                  <div className='flex gap-2 items-center'>
                    <img src={WalletLogo} alt="CashLogo" className='h-4 w-4'/>
                    <div>Rs.{earning.cash}</div>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <img src={UPILogo} alt="UPILogo" className='h-4 w-4'/>
                    <div>Rs.{earning.upi}</div>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <img src={CreditCardLogo} alt="CardLogo" className='h-4 w-4'/>
                    <div>Rs.{earning.card}</div>
                  </div>
                </div>
                <div className='flex gap-5 items-center justify-end mr-3 w-1/4 font-montserrat-500'>
                  <div className='flex gap-1 items-center'>
                    <img src={PaidLogo} alt="" className='h-4 w-4' />
                    <div>{earning.paid}</div>
                  </div>
                  <div className='flex gap-1 items-center'>
                    <img src={CancelledLogo} alt="" className='h-4 w-4' />
                    <div>{earning.cancelled}</div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div>There are no records.</div>
        )}
      </div>
    </div>
  );
}

export default MonthlyEarnings;
