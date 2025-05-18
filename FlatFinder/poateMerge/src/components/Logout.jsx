import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";

const Logout = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();

  useEffect(() => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  }, [navigate, setCurrentUser]);

  return null;
};

export default Logout;
