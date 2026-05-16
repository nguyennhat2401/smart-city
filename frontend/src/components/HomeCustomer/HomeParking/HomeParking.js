import React, { useEffect, useState } from "react";
import "./HomeParking.scss";

function HomeParking() {
  const API = "http://127.0.0.1:8000/api";

  const [lots, setLots] = useState([]);

  // ===== FIX ARRAY =====
  const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    return [];
  };

  // ===== FETCH LOTS =====
  const fetchLots = async () => {
    try {
      const res = await fetch(`${API}/lots/`);
      const data = await res.json();

      const arr = toArray(data);

      // sort theo total_slots giảm dần + lấy top 3
      const topLots = arr
        .sort((a, b) => b.total_slots - a.total_slots)
        .slice(0, 3);

      setLots(topLots);
    } catch (err) {
      console.error("Lỗi fetch lots:", err);
      setLots([]);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  return (
    <section className="home-parking">
      <div className="home-parking__container">

        <h2 className="home-parking__title">
          Bãi Đỗ Xe Nổi Bật
        </h2>

        <div className="home-parking__grid">

          {lots.map((lot) => (
            <div key={lot.id} className="home-parking__card">

              <h3>{lot.name}</h3>

              {/* tổng chỗ */}
              <p className="slots">
                {lot.total_slots} chỗ
              </p>

              {/* địa chỉ */}
              <p className="address">
                {lot.address}
              </p>

              {/* badge trạng thái */}
              <span className={`status ${lot.is_active ? "active" : "inactive"}`}>
                {lot.is_active ? "Đang hoạt động" : "Ngưng"}
              </span>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default HomeParking;