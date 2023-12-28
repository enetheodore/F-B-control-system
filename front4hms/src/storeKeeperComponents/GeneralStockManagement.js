import React, { useState, useEffect } from "react";
import pic from "../images/dashboard.jpg";
import { useForm } from "react-hook-form";

const StockManagementComponent = () => {
  const [stockItems, setStockItems] = useState([]);
  const [editItemId, setEditItemId] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    // Fetch stock items from the server or use dummy data
    // Replace this with your own logic to fetch stock items
    fetchStockItems();
  }, []);

  const fetchStockItems = () => {
    // Dummy data for stock items
    const dummyStockItems = [
      { id: 1, name: "Item 1", quantity: 10 },
      { id: 2, name: "Item 2", quantity: 5 },
      { id: 3, name: "Item 3", quantity: 8 },
    ];

    // Update the stock items state
    setStockItems(dummyStockItems);
  };

  const handleAddItem = (data) => {
    // Create a new item object
    const newItem = {
      id: stockItems.length + 1,
      name: data.name,
      quantity: parseInt(data.quantity),
    };

    // Update the stock items state with the new item or the updated item
    if (editItemId !== null) {
      const updatedItems = stockItems.map((item) =>
        item.id === editItemId
          ? { ...item, name: data.name, quantity: parseInt(data.quantity) }
          : item
      );
      setStockItems(updatedItems);
      setEditItemId(null);
    } else {
      setStockItems([...stockItems, newItem]);
    }

    // Clear the input fields
    reset();
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    // Update the quantity of the item
    const updatedItems = stockItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    // Update the stock items state with the updated item
    setStockItems(updatedItems);
  };

  const handleEditItem = (itemId) => {
    // Find the item to edit
    const itemToEdit = stockItems.find((item) => item.id === itemId);

    // Fill the input fields with the item's name and quantity
    reset(itemToEdit);

    // Set the editItemId state to the item's id
    setEditItemId(itemId);
  };

  const handleDeleteItem = (itemId) => {
    // Remove the item from the stock items state
    const updatedItems = stockItems.filter((item) => item.id !== itemId);
    setStockItems(updatedItems);
  };

  return (
    <div className="flex flex-col justify-items-center p-4 mb-20 ml-14 mr-2 overflow-x-hidden flex-grow"
    style={{ backgroundImage: `url(${pic})`,backdropFilter: "blur(200px)",
    WebkitBackdropFilter: "blur(200px)", }}>
      <h2 className="text-2xl font-bold mb-4">Stock Management</h2>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Existing Stock Items:</h3>
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-4 py-2">
                    {item.id === editItemId ? (
                      <input {...register("name")} />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {item.id === editItemId ? (
                      <input
                        {...register("quantity", { min: 0 })}
                        type="number"
                      />
                    ) : (
                      <>
                        {item.quantity}
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-blue-500 text-white rounded-md ml-2">
                          +
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-blue-500 text-white rounded-md ml-2">
                          -
                        </button>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {item.id === editItemId ? (
                      <>
                        <button
                          onClick={handleSubmit(handleAddItem)}
                          className="px-4 py-2 bg-thirtiary text-red-500 rounded-md">
                          Update Item
                        </button>
                        <button
                          onClick={() => setEditItemId(null)}
                          className="px-4 py-2 bg-thirtiary text-red-500 rounded-md ml-2">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditItem(item.id)}
                          className="px-4 py-2 bg-thirtiary text-yellow-500 rounded-md">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-4 py-2 bg-thirtiary text-red-500 rounded-md ml-2">
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {editItemId !== null ? "Edit Item:" : "Add New Item:"}
        </h3>
        <form onSubmit={handleSubmit(handleAddItem)}>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Item Name"
              {...register("name")}
              className="border border-gray-300 rounded-md px-4 py-2 mr-2 w-1/2"
            />
            <input
              type="number"
              placeholder="Item Quantity"
              {...register("quantity", { min: 0 })}
              className="border border-gray-300 rounded-md px-4 py-2 mr-2 w-1/4"
            />
            <button
              type="submit"
              className={`px-4 py-2 ${
                editItemId !== null ? "bg-green-500" : "bg-thirtiary"
              } text-white rounded-md hover:bg-blue-600`}>
              {editItemId !== null ? "Update Item" : "Add Item"}
            </button>
            {editItemId !== null && (
              <button
                onClick={() => setEditItemId(null)}
                className="px-4 py-2 bg-red-500 text-white rounded-md ml-2">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockManagementComponent;
