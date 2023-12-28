import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PurchaseForm from "./purchaserComponents/PurchaseForm";
import PurchaseHistory from "./purchaserComponents/PurchaseHistory";
import ReportingDashboard from "./purchaserComponents/ReportingDashboard";
import StockAlerts from "./purchaserComponents/StockAlerts";
import StockManagement from "./purchaserComponents/StockManagement";
import Sidebar from "./purchaserComponents/Sidebar";
import Navbar from "./commonComponents/Navbar";
import GeneralStockManagement from "./storeKeeperComponents/GeneralStockManagement";
import IngredientTransferComponent from "./storeKeeperComponents/IngredientTransferComponent";
import RequestFormComponent from "./producerComponents/RequestFormComponent";
import GrantedDeniedRequestsComponent from "./producerComponents/GrantedDeniedRequestsComponent";
import RegisterEndProductComponent from "./producerComponents/RegisterEndProduct";
import EditAndSubmitEndProductComponent from "./producerComponents/EditAndSubmitEndProduct";
import RecipeAndDish from "./adminComponents/RecipeAndDish";
import DishManagement from "./adminComponents/DishManagement";
import DailyMenuForm from "./adminComponents/DailyMenuForm";
import KitchenManagementComponent from "./adminComponents/KitchenManagementComponent";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  MultiBackend,
  TouchTransition,
  MouseTransition,
} from "react-dnd-multi-backend";
import jwt_decode from "jwt-decode";
import Cashier from "./adminComponents/Cashier";
import axios from "axios";
import WebSocketComponent from "./sockethms/WebSocketComponent";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, removeAllNotifications } from "./store";
import Login from "./Authentication/Login";
import SidebarStoreKeeper from "./storeKeeperComponents/SidebarStoreKeeper";
import NavbarPurchaser from "./purchaserComponents/NavbarPurchaser";
import NavbarStoreKeeper from "./storeKeeperComponents/NavbarStoreKeeper";
import NavbarProducer from "./producerComponents/NavbarProducer";
import SidebarProducer from "./producerComponents/SidebarProducer";
import RecipeList from "./producerComponents/RecipeList";

const App = () => {
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const reduxRole = useSelector((state) => state.role);
  const [role, setRole] = useState(reduxRole);
  const dispatch = useDispatch();
  const [user_id, setUserId] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    console.log("fromUseEffect");
    if (token) {
      const decodedToken = jwt_decode(token);
      setUserId(decodedToken.user_id);
      getRole(token);
    }
  }, [token, user_id]);

  const getAccessTokenFromRefreshToken = async (refreshToken) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/obtain-access-token/",
        {
          refresh: refreshToken,
        }
      );

      if (response.status === 200) {
        return response.data.access;
      } else {
        throw new Error("Unable to obtain access token");
      }
    } catch (error) {
      console.log(error);
      localStorage.removeItem("token");
      throw error;
    }
  };

  useEffect(() => {
    // Check token expiration and refresh if necessary
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refresh");

      if (token) {
        const decodedToken = jwt_decode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (decodedToken.exp < currentTime) {
          // Token has expired, refresh it
          refreshAccessToken(refreshToken);
        }
      }
    };

    const refreshAccessToken = async (refreshToken) => {
      try {
        const newToken = await getAccessTokenFromRefreshToken(refreshToken);
        localStorage.setItem("token", newToken);
      } catch (error) {
        console.log(error);
        // Handle error refreshing access token
      }
    };

    const tokenRefreshInterval = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => {
      // Cleanup interval on component unmount
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const getRole = async (token) => {
    dispatch(removeAllNotifications());
    try {
      const response = await axios.post(
        `http://localhost:8000/api/verify-token/`,
        {
          token,
        }
      );
      const fetchedRole = response.data.role;
      setRole(fetchedRole);
      dispatch(loginSuccess(fetchedRole));
    } catch (error) {
      localStorage.removeItem("token");

      console.log(error);
    }
  };

  const HTML5toTouch = {
    backends: [
      {
        backend: HTML5Backend,
        transition: MouseTransition,
      },
      {
        backend: TouchBackend,
        transition: TouchTransition,
        options: { delayTouchStart: 200, touchSensitivity: 10 },
      },
    ],
  };
  useEffect(() => {
    console.log("user_id", user_id);
  }, [user_id]);
  return (
    <BrowserRouter>
      <div className="hidden">
        <WebSocketComponent />
      </div>
      {!isLoggedIn && token == null && <Login />}

      {isLoggedIn && role === "purchaser" && (
        <div>
          <div className="flex flex-col h-screen w-screen overflow-y-hidden">
            <div className="sticky top-0">
              <NavbarPurchaser />
            </div>
            <div className="flex flex-row h-full overflow-y-hidden">
              <Sidebar />

              <Routes>
                <Route path="/" element={<ReportingDashboard />} />
                <Route path="/purchase-form" element={<PurchaseForm />} />
                <Route path="/purchase-history" element={<PurchaseHistory />} />
                <Route
                  path="/reporting-dashboard"
                  element={<ReportingDashboard />}
                />
                <Route path="/stock-alert" element={<StockAlerts />} />
                <Route path="/stock-management" element={<StockManagement />} />
              </Routes>
            </div>
          </div>
        </div>
      )}

      {isLoggedIn && role === "storeKeeper" && (
        <div>
          <div className="flex flex-col h-screen w-screen overflow-y-hidden">
            <div className="sticky top-0">
              <NavbarStoreKeeper />
            </div>
            <div className="flex flex-row h-full overflow-y-hidden">
              <SidebarStoreKeeper />

              <Routes>
                <Route path="/" element={<ReportingDashboard />} />

                <Route path="/purchase-history" element={<PurchaseHistory />} />
                <Route
                  path="/reporting-dashboard"
                  element={<ReportingDashboard />}
                />

                <Route
                  path="/general-stock-management"
                  element={<GeneralStockManagement />}
                />
                <Route
                  path="/ingredientTransfer"
                  element={<IngredientTransferComponent />}
                />
                <Route path="/stock-alert" element={<StockAlerts />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
      {isLoggedIn && role === "cheff" && (
        <div>
          <div className="flex flex-col h-screen w-screen overflow-y-hidden">
            <div className="sticky top-0">
              <NavbarProducer />
            </div>
            <div className="flex flex-row h-full overflow-y-hidden">
              <SidebarProducer />

              <Routes>
                <Route path="/" element={<ReportingDashboard />} />

                <Route
                  path="/reporting-dashboard"
                  element={<ReportingDashboard />}
                />

                <Route path="/stock-management" element={<StockManagement />} />

                <Route
                  path="/requestForm"
                  element={<RequestFormComponent sender={user_id} />}
                />
                <Route
                  path="/grantedDeniedRequests"
                  element={<GrantedDeniedRequestsComponent />}
                />
                <Route path="/recipeAndDish" element={<RecipeAndDish />} />
                <Route path="/recipe-list" element={<RecipeList />} />
                <Route path="/dishManagement" element={<DishManagement />} />
                <Route path="/dailymenu" element={<DailyMenuForm />} />
                <Route
                  path="/orderDelivery"
                  element={
                    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                      <KitchenManagementComponent />
                    </DndProvider>
                  }
                />
                <Route path="/cashier" element={<Cashier />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
      {isLoggedIn && role === "admin" && (
        <div>
          <div className="flex flex-col h-screen w-screen overflow-y-hidden">
            <div className="sticky top-0">
              <Navbar />
            </div>
            <div className="flex flex-row h-full overflow-y-hidden">
              <Sidebar />

              <Routes>
                <Route path="/" element={<ReportingDashboard />} />
                <Route path="/purchase-form" element={<PurchaseForm />} />
                <Route path="/purchase-history" element={<PurchaseHistory />} />
                <Route
                  path="/reporting-dashboard"
                  element={<ReportingDashboard />}
                />
                <Route path="/stock-alert" element={<StockAlerts />} />
                <Route path="/stock-management" element={<StockManagement />} />
                <Route
                  path="/general-stock-management"
                  element={<GeneralStockManagement />}
                />
                <Route
                  path="/ingredientTransfer"
                  element={<IngredientTransferComponent />}
                />
                <Route path="/requestForm" element={<RequestFormComponent />} />
                <Route
                  path="/grantedDeniedRequests"
                  element={<GrantedDeniedRequestsComponent />}
                />
                <Route
                  path="/registerEndProduct"
                  element={<RegisterEndProductComponent />}
                />
                <Route
                  path="/editAndSubmitEndProduct"
                  element={<EditAndSubmitEndProductComponent />}
                />
                <Route path="/recipeAndDish" element={<RecipeAndDish />} />
                <Route path="/dishManagement" element={<DishManagement />} />
                <Route path="/dailymenu" element={<DailyMenuForm />} />
                <Route
                  path="/orderDelivery"
                  element={
                    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                      <KitchenManagementComponent />
                    </DndProvider>
                  }
                />
                <Route path="/cashier" element={<Cashier />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
};

export default App;
