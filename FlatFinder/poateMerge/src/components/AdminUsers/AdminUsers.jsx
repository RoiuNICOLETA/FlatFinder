import { useState, useEffect } from "react";
import {collection, getDocs, doc, updateDoc, deleteDoc, query, where,} from "firebase/firestore";
import { db } from "../../../firebase";
import { useUser } from "../context/UserContext";
import { fetchUser } from "../context/UserContext";
import styles from "./AdminUsers.module.css";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const { currentUser, setCurrentUser, setIsAdmin } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [filters, setFilters] = useState({
    userType: "",
    minAge: "",
    maxAge: "",
    flatsRange: "",
    isAdmin: "",
  });
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);

      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const flatsSnapshot = await getDocs(collection(db, "flats"));

        //✅We get the list of all apartments
        const flatsData = flatsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // ✅We map the users and calculate the number of apartments for each
        const userList = usersSnapshot.docs.map((doc) => {
          const userData = doc.data();
          const age =
            new Date().getFullYear() -
            new Date(userData.birthDate).getFullYear();
          const flatsCounter = flatsData.filter(
            (flat) => flat.userId === doc.id
          ).length; // ✅We count the user's apartments

          return { id: doc.id, ...userData, age, flatsCounter };
        });

        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, navigate]);

  const grantAdmin = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: "admin" });

      // ✅ We also update the User context to reflect the change immediately
      if (userId === currentUser?.id) {
        await fetchUser(setCurrentUser, setIsAdmin);
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: "admin" } : user
        )
      );
    } catch (error) {
      console.error("Error granting admin:", error);
    }
  };

  const removeUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      // Get all apartments of the user
      const flatsQuery = query(
        collection(db, "flats"),
        where("userId", "==", userId)
      );
      const flatsSnapshot = await getDocs(flatsQuery);

      // ✅  Delete each apartment
      const deleteFlatPromises = flatsSnapshot.docs.map(async (flatDoc) => {
        await deleteDoc(doc(db, "flats", flatDoc.id));
      });
      await Promise.all(deleteFlatPromises);

      await deleteDoc(doc(db, "users", userId));

      // ✅  Update the list of users
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user and flats:", error);
      alert("Failed to delete user and flats.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const minAge = filters.minAge === "" ? 0 : parseInt(filters.minAge, 10);
    const maxAge =
      filters.maxAge === "" ? Infinity : parseInt(filters.maxAge, 10);

    return (
      (filters.userType
        ? user.role.toLowerCase() === filters.userType.toLowerCase()
        : true) &&
      (filters.isAdmin !== ""
        ? (user.role === "admin") === (filters.isAdmin === "true")
        : true) &&
      user.age >= minAge &&
      user.age <= maxAge
    );
  });

  if (sortBy) {
    filteredUsers.sort((a, b) => {
      if (sortBy === "firstName" || sortBy === "lastName") {
        return a[sortBy].localeCompare(b[sortBy]);
      } else if (sortBy === "flatsCounter") {
        return b[sortBy] - a[sortBy];
      }
      return 0;
    });
  }
  // ✅ Sort update function
  const handleSortChange = (value) => {
    setSortBy(value);
    setDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <div className={styles.adminContainer}>
      <h2>All Users</h2>
      {loading ? (
        <div className={styles.loader}></div>
      ) : (
        <>
          {/* ✅ Filtre */}
          <div className={styles.filters}>
            <select
              name="userType"
              onChange={(e) =>
                setFilters({ ...filters, userType: e.target.value })
              }
            >
              <option value="">All User Types</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <input
              className={styles.inputAdmin}
              type="number"
              name="minAge"
              placeholder="Min Age"
              onChange={(e) =>
                setFilters({ ...filters, minAge: e.target.value })
              }
            />
            <input
              className={styles.inputAdmin}
              type="number"
              name="maxAge"
              placeholder="Max Age"
              onChange={(e) =>
                setFilters({ ...filters, maxAge: e.target.value })
              }
            />

            <div className={styles.customDropdown}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={styles.dropdownButton}
              >
                {sortBy
                  ? sortBy.charAt(0).toUpperCase() + sortBy.slice(1)
                  : "Sort by"}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div onClick={() => handleSortChange("")}>None</div>
                  <div onClick={() => handleSortChange("firstName")}>
                    First Name
                  </div>
                  <div onClick={() => handleSortChange("lastName")}>
                    Last Name
                  </div>
                  <div onClick={() => handleSortChange("flatCounter")}>
                    Flat Counter
                  </div>
                </div>
              )}
            </div>
          </div>

          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Flats Counter</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>{user.flatsCounter || 0}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => navigate(`/profile/${user.id}`)}>
                      View
                    </button>
                    {user.role !== "admin" && (
                      <button onClick={() => grantAdmin(user.id)}>
                        Grant Admin
                      </button>
                    )}
                    <button onClick={() => removeUser(user.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
