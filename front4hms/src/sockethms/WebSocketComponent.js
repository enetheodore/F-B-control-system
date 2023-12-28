//src/sockethms/WebSocketComponent.js
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addNotification, removeAllNotifications } from "../store";
import axios from "axios";
const WebSocketComponent = () => {
  let socket = null;
  const dispatch = useDispatch();

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/notifications/"
      );
      const filteredresponse = response.data.filter(
        (res) => res.seen === false
      );
      const formattedNotifications = filteredresponse.map(
        (notification) =>
          `${notification.entity_type_name} ${notification.action} ${notification.amount}`
      );

      dispatch(addNotification(formattedNotifications));
      console.log("ff");
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  const checkSocketConnection = () => {
    if (socket === null || socket.readyState === WebSocket.CLOSED) {
      socket = new WebSocket("ws://localhost:8000/ws/notifications/");

      socket.addEventListener("open", () => {
        console.log("WebSocket connection established");
      });

      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        console.log("Received item change:", message);
        dispatch(addNotification(message));
      });

      socket.addEventListener("close", () => {
        console.log("WebSocket connection closed");
        // Check the socket connection on closure
        checkSocketConnection();
      });
    }
  };

  useEffect(() => {
    checkSocketConnection();
    // fetchNotifications();
    return () => {
      socket.close();
    };
  }, []);

  return <div></div>;
};

export default WebSocketComponent;
