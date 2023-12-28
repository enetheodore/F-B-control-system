import React, { useEffect, useState } from "react";
import pic from "../images/supermarketcart.jpg"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const StockAlerts = () => {
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    // Fetch stock items from the backend API
    // You can make an API call here to retrieve the stock inventory

    // Example data
    const exampleStockItems = [
      { id: 1, itemName: "Item 1", quantity: 10, threshold: 5 },
      { id: 2, itemName: "Item 2", quantity: 5, threshold: 3 },
      { id: 3, itemName: "Item 3", quantity: 8, threshold: 4 },
    ];

    setStockItems(exampleStockItems);
  }, []);

  const handleDismissAlert = (itemId) => {
    // Handle the dismissal of an alert
    // You can update the backend or local state to remove the dismissed alert
    // For example, you can filter the stockItems array and update it without the dismissed item
    const updatedStockItems = stockItems.filter((item) => item.id !== itemId);
    setStockItems(updatedStockItems);
  };

  return (
    <div className="flex flex-col justify-items-center p-4 mb-20 ml-14 mr-2 overflow-x-hidden flex-grow" 
    style={{ backgroundImage: `url(${pic})`, backgroundSize: 'cover' }}>
      <h2 className="text-2xl font-bold mb-4">Stock Alerts</h2>
      {stockItems.length === 0 ? (
        <p>No stock alerts</p>
      ) : (
        <div className="flex">
          <div className="w-2/3">
            <BarChart width={500} height={300} data={stockItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="itemName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="quantity"
                fill="rgba(75, 192, 192, 0.6)"
                name="Quantity"
              />
              <Bar
                dataKey="threshold"
                fill="rgba(255, 99, 132, 0.6)"
                name="Threshold"
              />
            </BarChart>
          </div>
          <div className="w-1/3 ml-4">
            <ul className="list-disc pl-4">
              {stockItems.map((item) => (
                <li key={item.id} className="mb-4">
                  <div className="flex items-center justify-between">
                    <strong className="text-xl">{item.itemName}</strong>
                    <span
                      className={`text-sm font-semibold ${
                        item.quantity <= item.threshold
                          ? "text-red-500"
                          : "text-green-500"
                      }`}>
                      Quantity: {item.quantity}
                      {item.quantity <= item.threshold && (
                        <button
                          className="ml-2 px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                          onClick={() => handleDismissAlert(item.id)}>
                          Dismiss Alert
                        </button>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAlerts;
