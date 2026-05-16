import { useState, useEffect } from "react";
import "./QuickSearchParking.scss";

function QuickSearchParking() {
  const [parkingLots, setParkingLots] = useState([]);
  const [parking, setParking] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API = "http://127.0.0.1:8000/api";

  // Fetch danh sách bãi xe từ API khi component mount
  useEffect(() => {
    fetch(`${API}/lots/`) // endpoint Django API của bạn
      .then(res => {
        if (!res.ok) throw new Error("Không tải được danh sách bãi xe");
        return res.json();
      })
      .then(data => setParkingLots(data))
      .catch(err => setError(err.message));
  }, []);

  const handleSearch = () => {
    if (!parking || !area || !date || !time) {
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    setAvailableSlots([]);
    setError("");

    const token = localStorage.getItem("token");
    // Fetch chỗ trống theo bãi xe đã chọn
    fetch(`${API}/lots/${parking}/available-slots/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        if (!res.ok) throw new Error("Không lấy được chỗ trống");
        return res.json();
      })
      .then(data => setAvailableSlots(data.slots))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="quick-search">

      <div className="quick-search__item">
        <span className="quick-search__number">1</span>
        <select 
          value={parking}
          onChange={e => setParking(e.target.value)}
        >
          <option value="">Chọn bãi xe</option>
          {parkingLots.map(lot => (
            <option key={lot.id} value={lot.id}>
              {lot.name} - {lot.location}
            </option>
          ))}
        </select>
      </div>

      <div className="quick-search__item">
        <span className="quick-search__number">2</span>
        <select
          value={area}
          onChange={e => setArea(e.target.value)}
        >
          <option value="">Chọn khu vực</option>
          <option value="q1">Quận 1</option>
          <option value="q3">Quận 3</option>
          <option value="q7">Quận 7</option>
        </select>
      </div>

      <div className="quick-search__item">
        <span className="quick-search__number">3</span>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="quick-search__item">
        <span className="quick-search__number">4</span>
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
      </div>

      <button
        className="quick-search__button"
        onClick={handleSearch}
      >
        Tìm chỗ nhanh
      </button>

      {loading && <p>Đang tải chỗ trống...</p>}
      {error && <p className="error">{error}</p>}

      {availableSlots.length > 0 && (
        <div className="quick-search__results">
          <h4>Chỗ trống khả dụng:</h4>
          <ul>
            {availableSlots.map(slot => (
              <li key={slot.id}>
                Slot {slot.slot_number} ({slot.slot_type})
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

export default QuickSearchParking;