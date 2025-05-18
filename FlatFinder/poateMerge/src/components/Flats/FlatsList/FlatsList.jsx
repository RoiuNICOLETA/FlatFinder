/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useFlats } from "../FlatContext";
import styles from "./FlatsList.module.css";
import FlatCard from "../FlatCard/FlatCard";

const FlatsList = () => {
  const { flats } = useFlats();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ States for filters and sorting
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
  });

  const [sortBy, setSortBy] = useState("");

  // ✅ We handle changes in filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //✅ We reset the filters
  const handleResetFilters = () => {
    setFilters({
      city: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
    });
    setSortBy("");
  };

  // ✅ We apply filters
  const filteredFlats = flats.filter((flat) => {
    return (
      (!filters.city ||
        flat.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.minPrice || flat.rentPrice >= Number(filters.minPrice)) &&
      (!filters.maxPrice || flat.rentPrice <= Number(filters.maxPrice)) &&
      (!filters.minArea || flat.areaSize >= Number(filters.minArea)) &&
      (!filters.maxArea || flat.areaSize <= Number(filters.maxArea))
    );
  });

  // ✅ We apply the sorting
  const sortedFlats = [...filteredFlats].sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === "city") return a.city.localeCompare(b.city);
    if (sortBy === "price") return a.rentPrice - b.rentPrice;
    if (sortBy === "area") return a.areaSize - b.areaSize;
  });

  // ✅ Sort update function
  const handleSortChange = (value) => {
    setSortBy(value);
    setDropdownOpen(false); //Close the dropdown after selection
  };

  return (
    <div className={styles.flatsListContainer}>
      <div className={styles.divText}>
        <h3 className={styles.textHome}>Welcome to FlatFinder</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={styles.toggleFiltersButton}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
        <h3 className={styles.textHome}>Available Flats</h3>
      </div>

     {showFilters && (
        <div className={styles.divFilterSort}>
           {/* ✅ Filtre */}
           <div className={styles.filters}>
             <div className={styles.column}>
             <input
                type="text"
                name="city"
                placeholder="Filter by City"
                value={filters.city}
                onChange={handleFilterChange}
              />
              <button
                onClick={handleResetFilters}
                className={styles.resetFilters}
              >
                Reset Filters
              </button>
            </div>

             <div className={styles.column}>
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>

             <div className={styles.column}>
               <input
                type="number"
                name="minArea"
                placeholder="Min Area"
                value={filters.minArea}
                onChange={handleFilterChange}
              />
              <input
                type="number"
                name="maxArea"
                placeholder="Max Area"
                value={filters.maxArea}
                onChange={handleFilterChange}
              />
            </div>

             {/* ✅ Sortare */}
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
                  <div onClick={() => handleSortChange("city")}>City</div>
                  <div onClick={() => handleSortChange("price")}>Price</div>
                  <div onClick={() => handleSortChange("area")}>Area Size</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

     {/* ✅ We list apartments using FlatCard*/}
     <div className={styles.flatsGrid}>         {sortedFlats.length > 0 ? (
          sortedFlats.map((flat) => (
            <FlatCard key={flat.id} flat={flat} compactView={true} />
          ))
        ) : (
          <p>No flats available.</p>
        )}
      </div>
    </div>
  );
};

export default FlatsList;