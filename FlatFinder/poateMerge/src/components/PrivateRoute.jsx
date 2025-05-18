import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "./context/UserContext"; // Importă contextul User
const PrivateRoute = () => {
  const { currentUser } = useUser();

  // If the user is not logged in, we redirect him to login
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
