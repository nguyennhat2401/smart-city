import "./preBooking.scss";
import { useEffect, useState } from "react";

function PreBooking() {
  const API = "http://127.0.0.1:8000/api";

  const vehicleTypes = [
    { id: "motorbike", label: "Xe máy" },
    { id: "car", label: "Ô tô" },
    { id: "bike", label: "Xe đạp" },
  ];

  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState("");

  const [vehicleType, setVehicleType] = useState("motorbike");
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [pricing, setPricing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicle_id: "",
    startTime: "",
    endTime: "",
  });

  const token = localStorage.getItem("token");

  // ================= TIME =================
  const parseLocal = (v) => (v ? new Date(v) : null);

  const formatLocal = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const now = new Date();

  // ================= SAFE ARRAY =================
  const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  // ================= FETCH =================
  const fetchLots = async () => {
    const res = await fetch(`${API}/lots/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const safe = toArray(data);

    setBranches(safe);
    if (safe.length > 0) setBranch(safe[0].id.toString());
  };

  const fetchProfile = async () => {
    const res = await fetch(`${API}/auth/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    setForm((prev) => ({
      ...prev,
      name: `${data.first_name || ""} ${data.last_name || ""}`,
      phone: data.phone || "",
    }));
  };

  const fetchVehicles = async () => {
    const res = await fetch(`${API}/vehicles/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const safe = toArray(data);

    setVehicles(safe);

    if (safe.length > 0) {
      const first = safe[0];

      setForm((prev) => ({
        ...prev,
        vehicle_id: first.id,
      }));

      // sync loại xe với UI
      setVehicleType(first.vehicle_type);
    }
  };

  const fetchSlots = async () => {
    if (!branch) return;

    try {
      setLoading(true);

      const res = await fetch(`${API}/lots/${branch}/available-slots/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setSlots(toArray(data?.slots));
      setSelectedSlots([]);

      setPricing({
        rate_per_hour: data.price_per_hour,
        minimum_fee: data.minimum_fee,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
    fetchProfile();
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [branch]);

  // ================= AUTO +1H =================
  useEffect(() => {
    if (!form.startTime) return;

    const start = parseLocal(form.startTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    setForm((prev) => ({
      ...prev,
      endTime: formatLocal(end),
    }));
  }, [form.startTime]);

  // ================= VEHICLE CHANGE =================
  useEffect(() => {
    const selectedVehicle = vehicles.find(
      (v) => v.id == form.vehicle_id
    );

    if (!selectedVehicle) return;

    const type = selectedVehicle.vehicle_type;

    setVehicleType(type);

    // 🔥 clear slot sai loại
    setSelectedSlots((prev) =>
      prev.filter((s) => s.slot_type === type)
    );
  }, [form.vehicle_id]);

  // ================= SLOT =================
  const toggleSlot = (slot) => {
    //  chặn sai loại xe
    if (slot.status !== "empty" || slot.slot_type !== vehicleType) return;

    const exists = selectedSlots.find((s) => s.id === slot.id);

    if (exists) {
      setSelectedSlots(selectedSlots.filter((s) => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const getClass = (slot) => {
    if (slot.status !== "empty")
      return "parking__slot parking__slot--booked";

    //  sai loại xe
    if (slot.slot_type !== vehicleType)
      return "parking__slot parking__slot--booked";

    if (selectedSlots.find((s) => s.id === slot.id))
      return "parking__slot parking__slot--selected";

    return "parking__slot parking__slot--available";
  };

  const renderBlock = (label) => {
    const filteredSlots = slots.filter((s) =>
      s.slot_number?.startsWith(label)
    );

    if (filteredSlots.length === 0) {
      return (
        <div className="parking__empty" key={label}>
          <div className="parking__empty-icon">🚫</div>
          <div>Không có chỗ</div>
        </div>
      );
    }

    return (
      <div className="parking__block" key={label}>
        <div className="parking__block-label">Khu {label}</div>

        <div className="parking__slots">
          {filteredSlots.map((slot) => (
            <button
              key={slot.id}
              className={getClass(slot)}
              disabled={
                slot.status !== "empty" ||
                slot.slot_type !== vehicleType
              }
              onClick={() => toggleSlot(slot)}
            >
              {slot.slot_number.replace(label, "")}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ================= CALCULATE =================
  const calculateHours = () => {
    if (!form.startTime || !form.endTime) return 0;

    const start = parseLocal(form.startTime);
    const end = parseLocal(form.endTime);

    if (!start || !end || end <= start) return 0;

    return Math.ceil((end - start) / (1000 * 60 * 60));
  };

  const totalPrice = (() => {
    if (!pricing) return 0;

    const hours = calculateHours();
    if (hours === 0) return 0;

    let fee = hours * pricing.rate_per_hour;
    fee = Math.max(fee, pricing.minimum_fee);
    fee *= selectedSlots.length;

    return Math.round(fee);
  })();

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!form.vehicle_id || selectedSlots.length === 0) {
      alert("Thiếu thông tin");
      return;
    }

    if (!form.startTime || !form.endTime) {
      alert("Chọn thời gian");
      return;
    }

    const start = parseLocal(form.startTime);
    const end = parseLocal(form.endTime);

    if (start < new Date()) {
      alert("Không được chọn quá khứ");
      return;
    }

    if (end <= start) {
      alert("Giờ không hợp lệ");
      return;
    }

    try {
      for (let slot of selectedSlots) {
        const res = await fetch(`${API}/reservations/create/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vehicle_id: form.vehicle_id,
            parking_lot_id: branch,
            reserved_from: form.startTime,
            reserved_to: form.endTime,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Lỗi");
          return;
        }
      }

      alert("Đặt chỗ thành công!");
      fetchSlots();
      setSelectedSlots([]);
    } catch {
      alert("Lỗi hệ thống");
    }
  };

  return (
    <div className="parking">
      <div className="parking__container">

        {/* FILTER */}
        <div className="parking__filter">
          <div className="parking__group">
            <span>Chi nhánh:</span>
            <select
              className="parking__select"
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

          <div className="parking__type-box">
            {vehicleTypes.map((type) => (
              <button
                key={type.id}
                className={`parking__type-btn ${
                  vehicleType === type.id ? "parking__type-btn--active" : ""
                }`}
                onClick={() => setVehicleType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p style={{ textAlign: "center" }}>Đang tải...</p>}

        {/* CONTENT */}
        <div className="parking__content">
          <div className="parking__left">
            <div className="parking__row-group">
              {["A","B","C","D"].map(renderBlock)}
            </div>

            <div className="parking__divider">
              <span>Lối vào / Exit</span>
            </div>

            <div className="parking__row-group">
              {["E","F","G","H"].map(renderBlock)}
            </div>
          </div>

          <div className="parking__right">
            <div className="parking__form">

              <input className="parking__input" value={form.name} disabled />
              <input className="parking__input" value={form.phone} disabled />

              <select
                className="parking__input"
                value={form.vehicle_id}
                onChange={(e) =>
                  setForm({ ...form, vehicle_id: e.target.value })
                }
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} ({v.vehicle_type})
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                className="parking__input"
                value={form.startTime}
                min={formatLocal(now)}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />

              <input
                type="datetime-local"
                className="parking__input"
                value={form.endTime}
                min={form.startTime || formatLocal(now)}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
              />

              <div>
                Chỗ đã chọn:{" "}
                {selectedSlots.length > 0
                  ? selectedSlots.map((s) => s.slot_number).join(", ")
                  : "Chưa chọn"}
              </div>

              <div>
                Tổng tiền: <strong>{totalPrice.toLocaleString()} VNĐ</strong>
              </div>

              <button className="parking__btn" onClick={handleSubmit}>
                Đặt chỗ
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PreBooking;