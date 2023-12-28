import React, { useState, useEffect } from "react";
import pic from "../images/supermarketcart.jpg"
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import { Button } from "@mui/material";
import "./table.css";

const columns = [
  { dataField: "id", text: "ID", headerStyle: { width: 100 } },
  {
    dataField: "name",
    text: "Product",
    headerStyle: { width: 200 },
    editable: true,
  },
  {
    dataField: "quantity",
    text: "Quantity",
    headerStyle: { width: 150 },
    editable: true,
  },
  {
    dataField: "price",
    text: "Price",
    headerStyle: { width: 150 },
    editable: true,
  },
  {
    dataField: "expiration_date",
    text: "Expiration Date",
    headerStyle: { width: 200 },

    editorRenderer: (
      editorProps,
      value,
      row,
      column,
      rowIndex,
      columnIndex
    ) => (
      <input
        type="date"
        required
        value={value || ""}
        onChange={(e) => {
          const updatedValue = e.target.value;
          editorProps.onUpdate(updatedValue);
        }}
      />
    ),
  },
];

const PurchaseForm = () => {
  const [rows, setRows] = useState([]);

  const handleAddRow = () => {
    const currentDate = new Date().toISOString().split("T")[0];

    const newRow = {
      id: rows.length + 1,
      name: "", // Change "product" to "name"
      quantity: 100,
      price: 10,
      expiration_date: currentDate, // Change "expirationDate" to "expiration_date"
      purchase_date: currentDate,
    };

    setRows((prevRows) => [...prevRows, newRow]);
  };

  const handleUpdateRow = (oldValue, newValue, row, column) => {
    const updatedRows = rows.map((r) => (r.id === newValue.id ? newValue : r));

    setRows(updatedRows);
  };
  const handleSubmit = () => {
    const isExpirationDateFilled = rows.every((row) => row.expiration_date);

    if (!isExpirationDateFilled) {
      alert("Please fill in the Expiration Date for all rows.");
      return;
    }

    rows.forEach((item) => {
      const { id, ...itemWithoutId } = item;
      const itemName = encodeURIComponent(itemWithoutId.name);

      // Check if an item with the same name already exists
      fetch(`http://127.0.0.1:8000/api/items/itemname/${itemName}/`)
        .then((response) => response.json())
        .then((data) => {
          console.log("data", data);
          if (data && data.id) {
            console.log("put");
            // Item with the same name already exists, perform a PUT request to update it
            const existingItemId = data.id;
            itemWithoutId.quantity = parseFloat(
              parseFloat(itemWithoutId.quantity) + parseFloat(data.quantity)
            );

            fetch(`http://127.0.0.1:8000/api/items/${existingItemId}/`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(itemWithoutId),
            })
              .then((response) => {
                // Handle the successful response for updating the item
                if (response.ok) {
                  return response.json(); // Parse the JSON response
                } else {
                  throw new Error("Error updating the item");
                }
              })
              .then((data) => {
                console.log("mydata", data); // Access the parsed JSON data

                const entityId = data.id; // Assuming the item response has an 'id' field
                const entityName = "Item";
                console.log("dq", item.quantity);

                // Add a request to the NotificationListCreateAPIView for the 'storekeeper' role
                fetch("http://127.0.0.1:8000/api/notifications/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    role: "storeKeeper",
                    entity_type: entityName,
                    entity_id: entityId,
                    entity: JSON.stringify(data), // Assuming 'response.data' contains the updated item object
                    action: "updated",
                    amount: item.quantity,
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
              })
              .catch((error) => {
                // Handle the error for updating the item
                console.error(error);
              });
          } else {
            // Item with the same name doesn't exist, perform a POST request to create a new item
            fetch("http://127.0.0.1:8000/api/items/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(itemWithoutId),
            })
              .then((response) => {
                // Handle the successful response for updating the item
                if (response.ok) {
                  return response.json(); // Parse the JSON response
                } else {
                  throw new Error("Error updating the item");
                }
              })
              .then((data) => {
                console.log("mydata", data); // Access the parsed JSON data

                const entityId = data.id; // Assuming the item response has an 'id' field
                const entityName = "Item";
                console.log("dq", data.quantity);

                // Add a request to the NotificationListCreateAPIView for the 'storekeeper' role
                fetch("http://127.0.0.1:8000/api/notifications/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    role: "storeKeeper",
                    entity_type: entityName,
                    entity_id: entityId,
                    entity: JSON.stringify(data), // Assuming 'response.data' contains the updated item object
                    action: "created",
                    amount: data.quantity,
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
              })
              .catch((error) => {
                // Handle the error for creating a new item
                console.error(error);
              });
          }
        })
        .catch((error) => {
          // Handle the error for fetching the existing item
          console.error(error);
        });
    });

    // Clear the variables after submitting
    // setRows([]);
  };

  return (
    <div className="flex flex-col justify-items-center p-4 mb-20 ml-14 mr-2 overflow-x-hidden flex-grow"
    style={{ backgroundImage: `url(${pic})`,backdropFilter: "blur(200px)",
    WebkitBackdropFilter: "blur(200px)", }}>
      <h2 className="text-2xl font-bold mb-4">Purchase Form</h2>
      <div className="mb-4">
        <button
          variant="contained"
          onClick={handleAddRow}
          className="mr-2 bg-thirtiary hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Add Row
        </button>
      </div>
      <div className="w-full h-96" >
        <BootstrapTable
          keyField="id"
          data={rows}
          columns={columns}
          cellEdit={cellEditFactory({
            mode: "click",
            blurToSave: true,
            afterSaveCell: handleUpdateRow,
            style: { class: "editable-cell" }, // Add the CSS class for highlighting editable cells
          })}
          bootstrap4
          bordered={true}
          headerClasses="bg-gray-100 border-b"
          rowClasses="border-b"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          onClick={handleSubmit}
          className=" bg-thirtiary hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Submit
        </button>
      </div>
    </div>
  );
};

export default PurchaseForm;
