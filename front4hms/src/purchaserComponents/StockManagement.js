import React, { useEffect, useState } from "react";
import pic from "../images/management.jpg"

const StockManagement = () => {
  const [stockItems, setStockItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch stock items from the backend API
    // You can make an API call here to retrieve the stock inventory

    // Example data
    const exampleStockItems = [
      {
        id: 1,
        itemName: "Item 1",
        quantity: 10,
        supplier: "Supplier A",
        price: 10,
      },
      {
        id: 2,
        itemName: "Item 2",
        quantity: 5,
        supplier: "Supplier B",
        price: 15,
      },
      {
        id: 3,
        itemName: "Item 3",
        quantity: 8,
        supplier: "Supplier C",
        price: 20,
      },
    ];

    setStockItems(exampleStockItems);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStockItems = stockItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col justify-items-center p-4 mb-20 ml-14 mr-2 overflow-x-hidden flex-grow" 
    style={{ backgroundImage: `url(${pic})`, backgroundSize: 'cover' }}>
      <h2 className="text-2xl font-bold mb-4">Stock Management</h2>
      <input
        type="text"
        placeholder="Search by item name"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full px-4 py-2 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-100 border-b">ID</th>
            <th className="py-2 px-4 bg-gray-100 border-b">Item Name</th>
            <th className="py-2 px-4 bg-gray-100 border-b">Quantity</th>
            <th className="py-2 px-4 bg-gray-100 border-b">Supplier</th>
            <th className="py-2 px-4 bg-gray-100 border-b">Price</th>
          </tr>
        </thead>
        <tbody>
          {filteredStockItems.map((item) => (
            <tr key={item.id}>
              <td className="py-2 px-4 border-b">{item.id}</td>
              <td className="py-2 px-4 border-b">{item.itemName}</td>
              <td className="py-2 px-4 border-b">{item.quantity}</td>
              <td className="py-2 px-4 border-b">{item.supplier}</td>
              <td className="py-2 px-4 border-b">{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockManagement;
