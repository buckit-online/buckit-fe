import { useAuth } from '@/auth/AuthContext';
import React, { useState, useEffect } from 'react';
import { FaMinusCircle, FaPlus, FaArrowCircleDown } from "react-icons/fa";
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';

const monthYear = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

export default function Inventory() {
  const { cafeId } = useParams();
  const { token } = useAuth();
  const [inventoryData, setInventoryData] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    try {
        const res = await fetch(
          `${
            import.meta.env.VITE_APP_URL
          }/server/inventoryDetails/getInventory/${cafeId}?month=${monthYear}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) {
            setInventoryData(data); 
        } else {
            console.error(`Error: ${data.message}`);
        }
    } catch (err) {
        console.error("Failed to fetch inventory:", err);
    }
  };

  const handleDownloadExcel = async (monthYear) => {
    try {
        const res = await fetch(
          `${
            import.meta.env.VITE_APP_URL
          }/server/inventoryDetails/getInventory/${cafeId}?month=${monthYear}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok || !data || data.length === 0) {
            setError("No inventory data available for this month.");
            return;
        }

        // Convert data into table format
        const tableData = data.map((item, index) => ({
            "S.No": index + 1,
            "Item": item.item,
            "Quantity": item.qty,
            "Unit": item.unit,
            "Amount (Without Tax)": item.amount,
            "Tax %": item.tax,
            "Total": item.total,
            "Date": item.date,
            "By": item.by
        }));

        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(tableData); 
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

        // Download Excel file
        XLSX.writeFile(workbook, `Inventory_${monthYear}.xlsx`);
    } catch (err) {
        console.error("Failed to download inventory:", err);
    }
  };

  useEffect(() => {
      fetchInventory();
  }, [inventoryData]);

  const addNewRow = () => {
    setNewRows([...newRows, { id: Date.now(), item: '', qty: 1, unit: 'kg', amount: '', tax: '', total: '', date: new Date().toISOString().split('T')[0], by: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...newRows];
    updatedRows[index][field] = value;
    if (field === "amount" || field === "tax") {
      const amount = parseFloat(updatedRows[index].amount) || 0;
      const tax = parseFloat(updatedRows[index].tax) || 0;
      updatedRows[index].total = amount + (amount * tax / 100);
    }
    setNewRows(updatedRows);
  };

  const removeNewRow = (index) => {
    setNewRows(newRows.filter((_, i) => i !== index));
  };

  const handleDelete = async (itemId) => {
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/server/inventoryDetails/deleteInventory/${cafeId}?month=${monthYear}&itemId=${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (res.ok) {
        fetchInventory();
      } else {
        setError("Failed to delete item");
      }
    } catch (err) {
      setError("Error deleting item:", err);
    }
  };  

  const handleSubmit = async () => {
    if (newRows.length === 0) return;

    try {
        const res = await fetch(
          `${
            import.meta.env.VITE_APP_URL
          }/server/inventoryDetails/inventorySave/${cafeId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ month: monthYear, newRows }),
          }
        );

        const data = await res.json();
        if (res.ok) {
          setNewRows([]);
          fetchInventory();
        } else {
            setError(`Error: ${data.message}`);
        }
    } catch (err) {
        setError('Failed to save inventory');
    }
  };


  return (
    <div className='relative'>
      <div className="uppercase font-montserrat-600 text-xl mb-2 flex gap-2 items-center">
        <div>Inventory - {monthYear}</div>
        <button onClick={() => handleDownloadExcel(monthYear)}><FaArrowCircleDown className='text-blue' /></button>
      </div>

      {/* Scrollable Table Container */}
      <div className="w-full overflow-x-auto max-h-[78vh]">
        <table className="table-auto w-full border border-gray">
          {/* Table Head */}
          <thead className="bg-gray-100 border-b border-gray">
            <tr className="text-left text-sm">
              <th className="px-2 py-2 border-r border-gray text-red text-center font-montserrat-500 align-top">DELETE</th>
              <th className="px-2 py-2 border-r border-gray text-center font-montserrat-500 w-8 align-top">S.NO.</th>
              <th className="px-2 py-2 border-r border-gray text-center font-montserrat-500 w-48 align-top">ITEM</th>
              <th className="px-2 py-2 border-r border-gray text-center font-montserrat-500 w-8 align-top">QTY</th>
              <th className="px-2 py-2 border-r border-gray text-center font-montserrat-500 align-top">UNIT</th>
              <th className="px-2 py-2 border-r border-gray text-center w-24 font-montserrat-500 align-top">AMT <br/><span className="text-xs font-montserrat-400">(Without Tax)</span></th>
              <th className="px-2 py-2 border-r border-gray text-center font-montserrat-500 align-top">TAX %</th>
              <th className="px-2 py-2 border-r border-gray text-center font-montserrat-500 w-24 align-top">TOTAL</th>
              <th className="px-2 py-2 border-r border-gray text-center font-montserrat-500 align-top">DATE</th>
              <th className="px-2 py-2 text-center font-montserrat-500 align-top">BY</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {inventoryData.map((row, index) => (
              <tr key={index} className="border-b border-gray text-sm">
                <td className="px-2 border-r border-gray text-red cursor-pointer text-center" onClick={() => handleDelete(row._id)}>
                  <FaMinusCircle className="mx-auto"/>
                </td>
                <td className="px-2 border-r border-gray text-center">{index + 1}</td>
                <td className="px-2 border-r border-gray text-center">{row.item}</td>
                <td className="px-2 border-r border-gray text-center">{row.qty}</td>
                <td className="px-2 border-r border-gray text-center">{row.unit}</td>
                <td className="px-2 border-r border-gray text-center">{row.amount}</td>
                <td className="px-2 border-r border-gray text-center">{row.tax}%</td>
                <td className="px-2 border-r border-gray text-center">Rs. {row.total}</td>
                <td className="px-2 border-r border-gray text-center">{row.date}</td>
                <td className="px-2 text-center w-24">{row.by}</td>
              </tr>
            ))}

            {/* New Rows for Adding Data */}
            {newRows.map((row, index) => (
              <tr key={index} className="border-b border-gray text-sm">
                <td className="px-2 border-r border-gray text-red cursor-pointer text-center" onClick={() => removeNewRow(index)}>
                  <FaMinusCircle className='mx-auto' />
                </td>
                <td className="px-2 border-r border-gray text-center">{inventoryData.length + index + 1}</td>
                <td className="px-2 border-r border-gray text-center">
                  <input type="text" value={row.item} onChange={(e) => handleInputChange(index, "item", e.target.value)} className="text-center px-2 py-1 w-full" />
                </td>
                <td className="px-2 border-r border-gray text-center">
                  <input type="number" value={row.qty} onChange={(e) => handleInputChange(index, "qty", e.target.value)} className="px-2 py-1 w-16 text-center" />
                </td>
                <td className="px-2 border-r border-gray text-center">
                  <select value={row.unit} onChange={(e) => handleInputChange(index, "unit", e.target.value)} className="py-1 w-full">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                  </select>
                </td>
                <td className="px-2 border-r border-gray text-center">
                  <input type="number" value={row.amount} onChange={(e) => handleInputChange(index, "amount", e.target.value)} className="px-2 py-1 w-16 text-center" />
                </td>
                <td className="px-2 border-r border-gray text-center">
                  <input type="number" value={row.tax} onChange={(e) => handleInputChange(index, "tax", e.target.value)} className="px-2 py-1 w-12 text-center" />
                </td>
                <td className="px-2 border-r border-gray text-center">
                  Rs. {(parseFloat(row.amount) + (parseFloat(row.amount) * parseFloat(row.tax) / 100) || 0).toFixed(2)}
                </td>
                <td className="px-2 border-r border-gray text-center">
                  <input type="date" value={row.date || ""} 
                  onChange={(e) => handleInputChange(index, "date", e.target.value)} className="px-2 py-1 w-28 text-center" />
                </td>
                <td className="px-2 text-center">
                  <input type="text" value={row.by} onChange={(e) => handleInputChange(index, "by", e.target.value)} className="px-2 py-1 w-16 text-center" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
            
        {/* Buttons */}
        <button onClick={addNewRow} className="my-3.5 text-blue font-montserrat-400 flex gap-1 items-center justify-between">
          <div className='text-sm uppercase'>Add Row</div> 
          <span className=''><FaPlus className='h-3 w-3'/></span>
        </button>
      </div>

      {/* Fixed Submit Button */}
      {newRows.length > 0 && (
        <div className="fixed bottom-0 pb-5 right-5 w-full border-t-2 pt-2 bg-white shadow-lg flex justify-end ">
          <button onClick={handleSubmit} className="bg-blue text-white px-3 py-1 uppercase font-montserrat-500 rounded-full">Submit</button>
        </div>
      )}
    </div>
  );
}
