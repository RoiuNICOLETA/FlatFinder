import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "./context/UserContext";

const AdminRoute = () => {
  const { currentUser, isAdmin } = useUser();

  if (currentUser === null) {
    return <div>Loading...</div>; // ✅We are waiting for the user to load
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
