import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import { addNotification } from "../store";
import { removeAllNotifications } from "../store";
import { removeNotification } from "../store";
import { FaBars, FaTimes } from "react-icons/fa";

const NotificationPurchaser = () => {
  const notifications = useSelector((state) => state.notifications);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/notifications/"
        );
        const filteredresponse = response.data.filter(
          (res) => res.seen === false && res.action === "removed"
        );
        const formattedNotifications = filteredresponse.map(
          (notification) =>
            `${notification.entity_type_name} ${notification.chanegdEntityName} ${notification.action} ${notification.amount}`
        );

        dispatch(addNotification(formattedNotifications));
      } catch (error) {
        console.log("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (!notifications || notifications.length === 0) {
    return null; // Return null when there are no notifications
  }

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownItemClick = () => {
    setIsDropdownOpen(false);
  };

  const handleDropdownMenuClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed right-1 top-5 z-10  rounded-md w-36 md:mr-36 md:w-48">
      <div
        className={`dropdown ${isDropdownOpen ? "open" : ""}`}
        onClick={handleDropdownToggle}
        //ththth
        ref={dropdownRef}>
        <span className="dropdown-toggle cursor-pointer  bg-FCF6F5 text-gray border-none rounded-md px-2 py-1">
          <FiBell className="inline-block mr-1" />{" "}
          <div className=" hidden lg:inline-block">Notifications: </div>
          {notifications.length}
        </span>
        {isDropdownOpen && (
          <div className="overflow-y-auto h-40rem">
            <ul className="dropdown-menu " onClick={handleDropdownMenuClick}>
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className="bg-gray-200 px-2 py-1 my-7 rounded-md "
                  onClick={handleDropdownItemClick}>
                  <div className="flex  ">
                    {notification}
                    <div> {<FaTimes className="text-xs" />}</div>
                  </div>
                </li>
              ))}
              <h3>collapse all</h3>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPurchaser;
