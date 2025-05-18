import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout/AppLayout";
import Home from "./components/Home/Home";
import Register from "./components/Register/Register";
import LoginUser from "./components/Login/LoginUser";
import Logout from "./components/Logout";
import Profile from "./components/Profile/Profile";
import AdminUsers from "./components/AdminUsers/AdminUsers";
import NewFlat from "./components/Flats/NewFlat/NewFlat";
import FlatView from "./components/Flats/FlatView/FlatView";
import MyFlats from "./components/Flats/MyFlats/MyFlats";
import EditFlat from "./components/Flats/EditFlat/EditFlat";
import FavoritesList from "./components/Flats/FavoritesList/FavoritesList";
import NotFound from "./components/NotFound/NotFound";

import { UserProvider } from "./components/context/UserContext";
import { FlatProvider } from "./components/Flats/FlatContext";
import { MessageProvider } from "./components/Flats/MessageContext";
import { FavoritesProvider } from "./components/Flats/FavoritesContext";
import { FlatDetailsProvider } from "./components/Flats/FlatDetailsContext";
import { ImgBBProvider } from "./components/Flats/ImgBBContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  const router = createBrowserRouter([
    {
      element: <AppLayout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/register", element: <Register /> },
        { path: "/login", element: <LoginUser /> },
        { path: "/logout", element: <Logout /> },

        {
          element: <AdminRoute />, // Only admins can access
          children: [{ path: "/users", element: <AdminUsers /> }],
        },

        {
          element: <PrivateRoute />, // We protect these routes
          children: [
            { path: "/profile/:userId?", element: <Profile /> },

            { path: "/new-flat", element: <NewFlat /> },
            { path: "/my-flats", element: <MyFlats /> },
            {
              path: "/edit-flat/:flatId",
              element: (
                <FlatDetailsProvider>
                  <EditFlat />
                </FlatDetailsProvider>
              ),
            },
            { path: "/favorites", element: <FavoritesList /> },
          ],
        },

        {
          path: "/flat/:flatId",
          element: (
            <FlatDetailsProvider>
              <FlatView />
            </FlatDetailsProvider>
          ),
        },

        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return (
    <UserProvider>
      <FlatProvider>
        <MessageProvider>
          <FavoritesProvider>
            <ImgBBProvider>
              <RouterProvider router={router} />
            </ImgBBProvider>
          </FavoritesProvider>
        </MessageProvider>
      </FlatProvider>
    </UserProvider>
  );
}

export default App;
