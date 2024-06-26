import { createBrowserRouter } from "react-router-dom";
import Main from "../layouts/Main";
import Home from "../pages/Home/Home";
import ErrorPage from "../pages/ErrorPage";
import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";
import RoomDetails from "../pages/RoomDetails/RoomDetails";
import PrivateRoute from "../routes/PrivateRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import AddRoomForm from "../components/Form/AddRoomForm";
import Statistics from "../components/Dashboard/Common/Statistics";
import AddRoom from "../components/Dashboard/Host/AddRoom";
import MyListings from "../components/Dashboard/Host/MyListings";
import UpdateRoom from "../components/Dashboard/Host/UpdateRoom";
import ManageUsers from "../components/Dashboard/Admin/ManageUsers";
import Profile from "../components/Dashboard/Common/Profile";
import MyBookings from "../components/Dashboard/Guest/MyBookings";
import ManageBookings from "../components/Dashboard/Admin/ManageBookings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/room/:id",
        element: (
          <PrivateRoute>
            <RoomDetails />
          </PrivateRoute>
        ),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <Statistics />
          </PrivateRoute>
        ),
      },

      //guest route
      {
        path: "myBookings",
        element: (
          <PrivateRoute>
            <MyBookings />
          </PrivateRoute>
        ),
      },

      // host routes
      {
        path: "add-room",
        element: (
          <PrivateRoute>
            <AddRoom />
          </PrivateRoute>
        ),
      },
      {
        path: "my-listings",
        element: (
          <PrivateRoute>
            <MyListings />
          </PrivateRoute>
        ),
      },
      {
        path: "my-listings/updateRoom/:id",
        element: (
          <PrivateRoute>
            <UpdateRoom />
          </PrivateRoute>
        ),
      },
      // admin routes
      {
        path: "manage-users",
        element: (
          <PrivateRoute>
            <ManageUsers />
          </PrivateRoute>
        ),
      },
      {
        path: "manage-bookings",
        element: (
          <PrivateRoute>
            <ManageBookings />
          </PrivateRoute>
        ),
      },

      // profile route
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
