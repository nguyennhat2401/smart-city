import "./emptyParking.scss";
import { useEffect, useState } from "react";

function EmptyParking() {
  const [branches, setBranches] = useState([]); // 🔥 dynamic
  const [branch, setBranch] = useState(""); // id bãi đang chọn

  const [vehicleType, setVehicleType] = useState("car");
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = "http://127.0.0.1:8000/api";

  const vehicleTypes = [
    { id: "motorbike", name: "Xe máy" },
    { id: "car", name: "Ô tô" },
    { id: "bike", name: "Xe đạp" },
  ];

  const topRows = ["A", "B", "C", "D"];
  const bottomRows = ["E", "F", "G", "H"];

  // ================= FETCH LOTS =================
  const fetchLots = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/lots/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const safe = Array.isArray(data) ? data : [];

      setBranches(safe);

      //  auto chọn bãi đầu
      if (safe.length > 0) {
        setBranch(safe[0].id.toString());
      }
    } catch (err) {
      console.error("Lỗi load bãi:", err);
    }
  };

  // ================= FETCH SLOTS =================
  const fetchSlots = async (lotId) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token || !lotId) return;

      const res = await fetch(
        `${API}/lots/${lotId}/available-slots/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", text);
        setSlots([]);
        return;
      }

      const data = await res.json();

      setSlots(data.slots || []);
      setSelectedSlots([]);
    } catch (err) {
      console.error("Lỗi fetch slots:", err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // load danh sách bãi
  useEffect(() => {
    fetchLots();
  }, []);

  // khi đổi bãi → fetch slot
  useEffect(() => {
    if (branch) {
      fetchSlots(branch);
    }
  }, [branch]);

  // ================= SELECT SLOT =================
  const handleSelect = (slot) => {
    const exists = selectedSlots.find((s) => s.id === slot.id);

    if (exists) {
      setSelectedSlots(selectedSlots.filter((s) => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const getSlotClass = (slot) => {
    const isSelected = selectedSlots.find((s) => s.id === slot.id);

    if (isSelected)
      return "parking__slot parking__slot--selected";

    return "parking__slot parking__slot--available";
  };

  // ================= RENDER BLOCK =================
  const renderBlock = (label) => {
    const filteredSlots = slots.filter(
      (s) =>
        s.slot_number &&
        s.slot_number.startsWith(label) &&
        s.slot_type === vehicleType
    );

    if (filteredSlots.length === 0) {
      return (
        <div className="parking__empty">
          <div className="parking__empty-icon">🚫</div>
          <div className="parking__empty-text">
            Không có chỗ phù hợp
          </div>
          <div className="parking__empty-sub">
            Vui lòng chọn loại xe hoặc bãi khác
          </div>
        </div>
      );
    }

    return (
      <div className="parking__block" key={label}>
        <div className="parking__label">Khu {label}</div>

        <div className="parking__slots">
          {filteredSlots.map((slot) => (
            <button
              key={slot.id}
              className={getSlotClass(slot)}
              onClick={() => handleSelect(slot)}
            >
              {slot.slot_number.replace(label, "")}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="parking">
      <div className="parking__container">

        {/* ===== FILTER ===== */}
        <div className="parking__filter">

          <div className="parking__filter-group">
            <span className="parking__filter-label">Chi nhánh:</span>
            <select
              className="parking__select"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.available_slots}/{b.total_slots})
                </option>
              ))}
            </select>
          </div>

          <div className="parking__type-box">
            {vehicleTypes.map((type) => (
              <button
                key={type.id}
                className={`parking__type-btn ${
                  vehicleType === type.id
                    ? "parking__type-btn--active"
                    : ""
                }`}
                onClick={() => setVehicleType(type.id)}
              >
                {type.name}
              </button>
            ))}
          </div>

        </div>

        {loading && <p style={{ textAlign: "center" }}>Đang tải...</p>}

        <div className="parking__row-group">
          {topRows.map(renderBlock)}
        </div>

        <div className="parking__divider">
          <span>Lối vào / Exit</span>
        </div>

        <div className="parking__row-group">
          {bottomRows.map(renderBlock)}
        </div>

        {/* ===== LEGEND ===== */}
        <div className="parking__legend">
          <div className="parking__legend-item">
            <span className="parking__slot parking__slot--selected"></span>
            <span>Đang chọn</span>
          </div>

          <div className="parking__legend-item">
            <span className="parking__slot parking__slot--available"></span>
            <span>Còn trống</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmptyParking;