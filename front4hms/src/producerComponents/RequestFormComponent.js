import React, { useState } from "react";
import pic from "../images/ingredients.jpg";
import { Button } from "@mui/material";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { FiBell } from "react-icons/fi";
import { renderToString } from "react-dom/server";

const RequestFormComponent = ({ sender }) => {
  const [rows, setRows] = useState([]);
  const [socket, setSocket] = useState(null);
  const [items, setItems] = useState([]);
  const [requestNames, setRequestNames] = useState();

  const handleAddRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: prevRows.length + 1,
        item: "",
        quantity: "",
      },
    ]);
  };

  const handleInputChange = (e, rowIndex, columnId) => {
    const newValue = e.target.value;
    setRows((prevRows) =>
      prevRows.map((row, index) =>
        index === rowIndex ? { ...row, [columnId]: newValue } : row
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform your form submission logic here
    console.log(rows);

    // Create the item transfer data from the form rows
    const items = rows.map((row) => ({
      name: row.item,
      quantity: row.quantity,
      status: "pending",
    }));

    // Create the message object with the item transfer data
    const message = {
      type: "create_item_transfer",
      item_transfer_data: {
        request_user: sender,
        items: items,
        status: "pending",
      },
    };

    // Send the message to the WebSocket server
    socket.send(JSON.stringify(message));
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
        console.log("Received mmessage:", message);

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
    const fetchItemNames = async () => {
      try {
        const itemsData = await fetch(`http://localhost:8000/api/items/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (itemsData.ok) {
          const items = await itemsData.json();
          const requestNames = items.map((itemData) => itemData.name);
          setRequestNames(requestNames);
          console.log("Items fetched successfully");
        } else {
          console.error("Failed to fetch items:", itemsData.status);
          // Handle the error accordingly
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        // Handle the error accordingly
      }
    };

    fetchItemNames();
  }, []);

  useEffect(() => {
    if (items.length !== 0) {
      Swal.fire({
        title: "Request Status",
        html: `
          <table className="p-10">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Request User</th>
                <th className="py-2 px-4 text-left">Grant User</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Quantity</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="border-l-2 shadow-md">
              ${items
                .map((itemTransferData) =>
                  itemTransferData.items
                    .map(
                      (item) => `
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-2 px-4">${itemTransferData.id}</td>
                            <td className="py-2 px-4">${itemTransferData.request_user}</td>
                            <td className="py-2 px-4">${itemTransferData.grant_user}</td>
                            <td className="py-2 px-4">${item.name}</td>
                            <td className="py-2 px-4">${item.quantity}</td>
                            <td className="py-2 px-4">${item.status}</td>
                          </tr>
                        `
                    )
                    .join("")
                )
                .join("")}
            </tbody>
          </table>
        `,
        showCancelButton: false,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "cc",
          htmlContainer: "custom-swal-container",
          title: "vv",
        },
        allowOutsideClick: false, // Prevent closing on click outside
        iconHtml: renderToString(<FiBell />),
        width: "38%",
      });
    }
  }, [items]);
  return (
    <div className="container mx-auto flex flex-col items-center  shadow-2xl p-4"
    style={{ backgroundImage: `url(${pic})`,backdropFilter: "blur(200px)",
    WebkitBackdropFilter: "blur(200px)", }}>
      <h2 className="text-xl font-bold mb-4">Request Form</h2>

      <form onSubmit={handleSubmit} className="w-full">
        <table className="w-full mb-4">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Item</th>
              <th className="p-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="p-2">{row.id}</td>
                <td className="p-2">
                  <select
                    value={row.item}
                    onChange={(e) => handleInputChange(e, index, "item")}
                    className="border p-2 rounded w-full">
                    <option value="">Select an item</option>
                    {requestNames !== undefined &&
                      requestNames !== null &&
                      requestNames.map((itemName) => (
                        <option value={itemName} key={itemName}>
                          {itemName}
                        </option>
                      ))}
                  </select>
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleInputChange(e, index, "quantity")}
                    className="border p-2 rounded w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button onClick={handleAddRow} style={{ color: "#0a7272" }}>
          Add Row
        </Button>
        <Button
          type="submit"
          style={{ color: "#085e5e" }}
          className="bg-thirtiaryD text-thirtiary px-4 py-2 rounded">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default RequestFormComponent;
