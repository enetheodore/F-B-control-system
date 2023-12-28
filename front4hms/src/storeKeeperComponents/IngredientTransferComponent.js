import React, { useState, useEffect } from "react";
import pic from "../images/ingredients.jpg";

const IngredientTransferComponent = () => {
  const [socket, setSocket] = useState(null);
  const [items, setItems] = useState([]);

  const handleApproveAll = () => {
    const requestIds = items.map((itemTransferData) => itemTransferData.id);
    console.log(requestIds, "ids");

    socket.send(
      JSON.stringify({ type: "approve_request", request_ids: requestIds })
    );

    items.map((itemTransferData) => {
      itemTransferData.items.map(async (item) => {
        if (item.status === "pending") {
          try {
            await fetch(
              `http://localhost:8000/api/items/name/${item.name}/quantity/${item.quantity}/`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              }
            );

            console.log("Item updated successfully");
          } catch (error) {
            console.error("Error updating item:", error);
            // Handle the error accordingly
          }
        }
      });
    });
  };

  const handleReject = (requestId, itemIndex) => {
    // Send a WebSocket message to the server to reject the specific request item
    socket.send(
      JSON.stringify({
        type: "reject_request",
        request_id: requestId,
        index: itemIndex,
      })
    );
  };

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket("ws://localhost:8000/ws/item_transfer/");

      socket.addEventListener("open", () => {
        console.log("Item Transfer WebSocket connection established");

        // Join the specified group when the connection is open
        const joinGroupMessage = {
          type: "join_group",
          group_name: "ItemTransferGroup",
        };
        socket.send(JSON.stringify(joinGroupMessage));

        setSocket(socket);
      });

      socket.addEventListener("message", (event) => {
        // Handle incoming WebSocket messages here
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        setItems((prevItems) => {
          // Check if there are any existing element objects with the same IDs and remove them
          const updatedItems = prevItems.filter((item) => {
            return item.id !== message.item_transfer_data.id;
          });

          // Add the new item_transfer_data to the updatedItems array
          return [...updatedItems, message.item_transfer_data];
        });
      });

      socket.addEventListener("close", () => {
        console.log("WebSocket connection closed");
      });
    };
    connectWebSocket();
  }, []);

  useEffect(() => {
    console.log(items);
  }, [items]);

  return (
    <div className="flex flex-col justify-items-center p-4 mb-20 ml-14 mr-2 overflow-x-hidden flex-grow"
    style={{ backgroundImage: `url(${pic})`,backdropFilter: "blur(200px)",
    WebkitBackdropFilter: "blur(200px)", }}>
      <h2 className="text-2xl font-bold mb-4 text-center">
        Ingredient Transfer
      </h2>

      <h3 className="text-lg font-bold mb-2">Transfer Requests:</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Request User</th>
              <th className="py-2 px-4 text-left">Grant User</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Quantity</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="border-l-2 shadow-md">
            {items.map((itemTransferData, index) => (
              <React.Fragment key={index}>
                {itemTransferData.items.map((item, itemIndex) => (
                  <tr
                    key={itemIndex}
                    className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-2 px-4">{itemTransferData.id}</td>
                    <td className="py-2 px-4">
                      {itemTransferData.request_user}
                    </td>
                    <td className="py-2 px-4">{itemTransferData.grant_user}</td>
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4">{item.quantity}</td>
                    <td className="py-2 px-4">{item.status}</td>
                    <td className="py-2 px-4">
                      {/* reject button here */}

                      <button
                        onClick={() =>
                          handleReject(itemTransferData.id, itemIndex)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center mt-4">
        <button
          onClick={handleApproveAll}
          className="bg-thirtiary hover:bg-thirtiaryD text-white py-1 px-2 rounded-md mb-2 w-32">
          Approve
        </button>
      </div>
    </div>
  );
};

export default IngredientTransferComponent;
