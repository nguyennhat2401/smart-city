import "./Monthlypasscustomer.scss";
import { useEffect, useState } from "react";

function MonthlyPassCustomer() {
  const API = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("token");

  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState("");

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const [months, setMonths] = useState(1);
  const [price, setPrice] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  // ===== SAFE ARRAY =====
  const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  // ===== FETCH =====
  const fetchLots = async () => {
    const res = await fetch(`${API}/lots/`);
    const data = await res.json();
    const safe = toArray(data);

    setBranches(safe);
    if (safe.length > 0) setBranch(safe[0].id);
  };

  const fetchVehicles = async () => {
    const res = await fetch(`${API}/vehicles/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    const safe = toArray(data);

    setVehicles(safe);
    if (safe.length > 0) setSelectedVehicle(safe[0].id);
  };

  const fetchProfile = async () => {
    const res = await fetch(`${API}/auth/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    setForm({
      name: `${data.first_name || ""} ${data.last_name || ""}`,
      phone: data.phone || "",
    });
  };

  useEffect(() => {
    fetchLots();
    fetchVehicles();
    fetchProfile();
  }, []);

  // ===== PRICE =====
  useEffect(() => {
    const base = 200000; // giống backend
    setPrice(base * months);
  }, [months]);

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (!selectedVehicle || !branch) {
      alert("Thiếu thông tin");
      return;
    }

    try {
      const res = await fetch(`${API}/monthly-pass/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicle_id: selectedVehicle,
          parking_lot_id: branch,
          months: months,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Lỗi");
        return;
      }

      alert("Đăng ký vé tháng thành công!");
    } catch {
      alert("Lỗi hệ thống");
    }
  };

  return (
    <div className="monthly">
      <div className="monthly__container">

        {/* FILTER */}
        <div className="monthly__filter">
          <div className="monthly__group">
            <span>Chi nhánh:</span>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <div className="monthly__content">

          {/* LEFT */}
          <div className="monthly__left">
            <div className="monthly__card">
              <h3>Thông tin vé tháng</h3>

              <p><strong>Giá 1 tháng:</strong> 200,000 VNĐ</p>

              <div className="monthly__months">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    className={months === m ? "active" : ""}
                    onClick={() => setMonths(m)}
                  >
                    {m} tháng
                  </button>
                ))}
              </div>

              <div className="monthly__price">
                Tổng tiền: <strong>{price.toLocaleString()} VNĐ</strong>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="monthly__right">
            <div className="monthly__form">

              <input value={form.name} disabled />
              <input value={form.phone} disabled />

              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} ({v.vehicle_type})
                  </option>
                ))}
              </select>

              <button onClick={handleSubmit}>
                Đăng ký vé tháng
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default MonthlyPassCustomer;