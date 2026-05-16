import React, { useState, useEffect } from "react";
import "./HomeSearch.scss";
import { useNavigate } from "react-router-dom";
function HomeSearch() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  // Fetch danh sách tất cả bãi đỗ khi mount
  useEffect(() => {
    const fetchLots = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/lots/");
        if (!response.ok) throw new Error(`Lỗi: ${response.status}`);
        const data = await response.json();
        setLots(data);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };
    fetchLots();
  }, []);

  const navigate = useNavigate();
  const handleClick = ()=>{
    if(!token){
     navigate("/login");
    }
    else{
     navigate("/prebooking");
    }
  }
  return (
    <section className="search">
      <div className="search__container">
        <h1 className="search__title">
          Danh Sách Các Bãi Đỗ Xe Hiện Có
        </h1>
        <p className="search__desc">
          Chọn bãi đỗ xe và đặt chỗ trước để đảm bảo chỗ trống.
        </p>

        {loading && <p className="search__loading">Đang tải danh sách...</p>}
        {error && <p className="search__error">{error}</p>}

        {lots.length > 0 ? (
          <div className="search__results">
            {lots.map((lot) => (
              <div key={lot.id} className="search__card">
                <h3 className="search__cardTitle">{lot.name}</h3>
                <p className="search__cardAddress">{lot.address}</p>
                <p className="search__cardSlots">Chỗ trống: {lot.available_slots}</p>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p>Không có bãi đỗ nào</p>
        )}

        <button className="search__button" onClick={handleClick}>Đặt chỗ trước</button>
      </div>
    </section>
  );
}

export default HomeSearch;