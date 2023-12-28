import React, { useEffect, useState } from "react";
import pic from "../images/supermarketcart2.jpg"

const PurchaseHistory = () => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const host = "http://localhost:8000";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPurchaseHistory(selectedDate);
  }, [selectedDate]);

  const fetchPurchaseHistory = async (date) => {
    try {
      const response = await fetch(
        `${host}/api/purchase-history/?date=${date}`,
        { headers }
      );
      const data = await response.json();
      // const nonApprovedData = data.filter((d) => d.status === "pending");
      setPurchaseHistory(data);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleRemoveItem = async (purchaseId, itemId, quantity, item) => {
    try {
      await fetch(
        `${host}/api/purchase-history/${purchaseId}/remove-item/${itemId}/`,
        {
          method: "DELETE",
        },
        { headers }
      );

      // await fetch(`${host}/api/items/${itemId}/deduct-quantity/`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ quantity }),
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });
      const entityId = itemId; // Assuming the item response has an 'id' field
      const entityName = "Item";

      fetchPurchaseHistory(selectedDate);
      fetch("http://127.0.0.1:8000/api/notifications/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "purchaser",
          entity_type: entityName,
          entity_id: entityId,
          entity: JSON.stringify(item), // Assuming 'response.data' contains the updated item object
          action: "removed",
          amount: quantity,
          seen: false,
        }),
      })
        .then((response) => {
          // Handle the successful response for creating the notification
          console.log(response.data);
        })
        .catch((error) => {
          // Handle the error for creating the notification
          console.error(error);
        });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleApproveAll = async () => {
    try {
      const purchaseIds = purchaseHistory.map((purchase) => purchase.id);

      const payload = {
        purchase_ids: purchaseIds.join(","), // Convert the array to a comma-separated string
      };

      const response = await fetch(
        `${host}/api/purchase-history/approve-all/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        fetchPurchaseHistory(selectedDate);
      } else {
        console.error("Error approving purchases:", response.status);
      }
    } catch (error) {
      console.error("Error approving purchases:", error);
    }
  };

  const formatPurchaseTime = (purchaseTime) => {
    const date = new Date(purchaseTime);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col justify-items-center p-4 mb-20 ml-14 mr-2 overflow-x-hidden flex-grow" 
    style={{ backgroundImage: `url(${pic})`, backgroundSize: 'cover' }}>
      <h2 className="text-3xl font-bold mb-6">Purchase History</h2>
      <div className="mb-6">
        <label className="mr-2 font-medium text-gray-600">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {purchaseHistory !== null &&
        purchaseHistory !== undefined &&
        purchaseHistory.map((purchase) => (
          <div key={purchase.id} className="mb-6">
            <h3 className="text-xl font-semibold">
              Purchase ID: {purchase.id}
            </h3>
            <p className="text-gray-600">
              Purchase Time: {formatPurchaseTime(purchase.purchase_time)}
            </p>
            <ul>
              {purchase.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between mt-2">
                  <span className="text-base">
                    {item.name} - Quantity: {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleRemoveItem(
                        purchase.id,
                        item.id,
                        item.quantity,
                        item
                      )
                    }
                    className="px-4 py-2 bg-red-400 shadow-md text-white rounded-2xl hover:bg-red-600">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      {purchaseHistory.length > 0 && (
        <div>
          <button
            onClick={handleApproveAll}
            className="px-4 py-2 mt-4 bg-thirtiaryD text-white rounded hover:bg-blue-600">
            Approve All
          </button>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
