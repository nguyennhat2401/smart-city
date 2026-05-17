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

  const parseLocal = (v) => (v ? new Date(v) : null);

  const formatLocal = (date) => {
    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(
      date.getMonth() + 1
    )}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const now = new Date();

  const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const fetchLots = async () => {
    const res = await fetch(`${API}/lots/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    const safe = toArray(data);

    setBranches(safe);

    if (safe.length > 0) {
      setBranch(safe[0].id.toString());
    }
  };

  const fetchProfile = async () => {
    const res = await fetch(`${API}/auth/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

      setVehicleType(first.vehicle_type);
    }
  };

  const fetchSlots = async () => {
    if (!branch) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${API}/lots/${branch}/available-slots/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setSlots(toArray(data?.slots));

      setSelectedSlots([]);

      setPricing({
        rate_per_hour: Number(data.rate_per_hour),
        minimum_fee: Number(data.minimum_fee),
        daily_max_fee: Number(data.daily_max_fee),
        peak_hours_start: data.peak_hours_start,
        peak_hours_end: data.peak_hours_end,
        peak_rate_multiplier: Number(
          data.peak_rate_multiplier
        ),
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

  // AUTO REFRESH SLOT
  useEffect(() => {
     fetchSlots();
  }, [branch]);

  useEffect(() => {
    if (!form.startTime) return;

    const start = parseLocal(form.startTime);

    const end = new Date(
      start.getTime() + 60 * 60 * 1000
    );

    setForm((prev) => ({
      ...prev,
      endTime: formatLocal(end),
    }));
  }, [form.startTime]);

  useEffect(() => {
    const selectedVehicle = vehicles.find(
      (v) => v.id == form.vehicle_id
    );

    if (!selectedVehicle) return;

    const type = selectedVehicle.vehicle_type;

    setVehicleType(type);

    setSelectedSlots((prev) =>
      prev.filter((s) => s.slot_type === type)
    );
  }, [form.vehicle_id, vehicles]);

  const toggleSlot = (slot) => {
    if (
      slot.status !== "empty" ||
      slot.slot_type !== vehicleType
    ) {
      return;
    }

    const exists = selectedSlots.find(
      (s) => s.id === slot.id
    );

    if (exists) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots([slot]);
    }
  };

  const getClass = (slot) => {
    // SLOT ĐÃ BỊ ĐẶT
    if (slot.status !== "empty") {
      return "parking__slot parking__slot--booked";
    }

    // KHÁC LOẠI XE
    if (slot.slot_type !== vehicleType) {
      return "parking__slot parking__slot--booked";
    }

    // SLOT ĐANG CHỌN
    if (
      selectedSlots.find((s) => s.id === slot.id)
    ) {
      return "parking__slot parking__slot--selected";
    }

    return "parking__slot parking__slot--available";
  };

  const renderBlock = (label) => {
    const filteredSlots = slots.filter((s) =>
      s.slot_number?.startsWith(label)
    );

    if (filteredSlots.length === 0) {
      return (
        <div
          className="parking__empty"
          key={label}
        >
          <div className="parking__empty-icon">
            🚫
          </div>

          <div>Không có chỗ</div>
        </div>
      );
    }

    return (
      <div
        className="parking__block"
        key={label}
      >
        <div className="parking__block-label">
          Khu {label}
        </div>

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
              {slot.slot_number.replace(
                label,
                ""
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const calculateHours = () => {
    if (!form.startTime || !form.endTime)
      return 0;

    const start = parseLocal(form.startTime);

    const end = parseLocal(form.endTime);

    if (!start || !end || end <= start)
      return 0;

    return Math.ceil(
      (end - start) / (1000 * 60 * 60)
    );
  };

  const totalPrice = (() => {
    if (!pricing) return 0;

    const hours = calculateHours();

    if (hours <= 0) return 0;

    let fee = hours * pricing.rate_per_hour;

    if (
      pricing.peak_hours_start &&
      pricing.peak_hours_end
    ) {
      const start = parseLocal(form.startTime);

      if (start) {
        const currentMinutes =
          start.getHours() * 60 +
          start.getMinutes();

        const [sh, sm] =
          pricing.peak_hours_start.split(":");

        const [eh, em] =
          pricing.peak_hours_end.split(":");

        const peakStart =
          Number(sh) * 60 + Number(sm);

        const peakEnd =
          Number(eh) * 60 + Number(em);

        if (
          currentMinutes >= peakStart &&
          currentMinutes < peakEnd
        ) {
          fee *= pricing.peak_rate_multiplier;
        }
      }
    }

    fee = Math.max(
      fee,
      pricing.minimum_fee
    );

    if (pricing.daily_max_fee) {
      fee = Math.min(
        fee,
        pricing.daily_max_fee
      );
    }

    return Math.round(fee);
  })();

  const handleSubmit = async () => {
    if (
      !form.vehicle_id ||
      selectedSlots.length === 0
    ) {
      alert("Thiếu thông tin");
      return;
    }

    if (
      !form.startTime ||
      !form.endTime
    ) {
      alert("Chọn thời gian");
      return;
    }

    const start = parseLocal(
      form.startTime
    );

    const end = parseLocal(
      form.endTime
    );

    if (start < new Date()) {
      alert("Không được chọn quá khứ");
      return;
    }

    if (end <= start) {
      alert("Giờ không hợp lệ");
      return;
    }

    try {
      const selectedSlot =
        selectedSlots[0];

      const res = await fetch(
        `${API}/reservations/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vehicle_id: form.vehicle_id,
            parking_lot_id: branch,
            parking_slot_id:
              selectedSlot.id,
            reserved_from:
              form.startTime,
            reserved_to:
              form.endTime,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Lỗi");

        // REFRESH NGAY ĐỂ DISABLE SLOT
        fetchSlots();

        return;
      }

      alert("Đặt chỗ thành công!");

      // REFRESH SAU KHI ĐẶT
      await fetchSlots();

      setSelectedSlots([]);
    } catch {
      alert("Lỗi hệ thống");
    }
  };

  return (
    <div className="parking">
      <div className="parking__container">
        <div className="parking__filter">
          <div className="parking__group">
            <span>Chi nhánh:</span>

            <select
              className="parking__select"
              value={branch}
              onChange={(e) =>
                setBranch(e.target.value)
              }
            >
              {branches.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                >
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="parking__type-box">
            {vehicleTypes.map((type) => {
              const isCurrent =
                vehicleType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  disabled={!isCurrent}
                  className={`parking__type-btn ${
                    isCurrent
                      ? "parking__type-btn--active"
                      : "parking__type-btn--disabled"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <p
            style={{
              textAlign: "center",
            }}
          >
            Đang tải...
          </p>
        )}

        <div className="parking__content">
          <div className="parking__left">
            <div className="parking__row-group">
              {["A", "B", "C", "D"].map(
                renderBlock
              )}
            </div>

            <div className="parking__divider">
              <span>Lối vào / Exit</span>
            </div>

            <div className="parking__row-group">
              {["E", "F", "G", "H"].map(
                renderBlock
              )}
            </div>
          </div>

          <div className="parking__right">
            <div className="parking__form">
              <input
                className="parking__input"
                value={form.name}
                disabled
              />

              <input
                className="parking__input"
                value={form.phone}
                disabled
              />

              <select
                className="parking__input"
                value={form.vehicle_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicle_id:
                      e.target.value,
                  })
                }
              >
                {vehicles.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}
                  >
                    {v.plate_number} (
                    {v.vehicle_type})
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                className="parking__input"
                value={form.startTime}
                min={formatLocal(now)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    startTime:
                      e.target.value,
                  })
                }
              />

              <input
                type="datetime-local"
                className="parking__input"
                value={form.endTime}
                min={
                  form.startTime ||
                  formatLocal(now)
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    endTime:
                      e.target.value,
                  })
                }
              />

              <div>
                Chỗ đã chọn:{" "}
                {selectedSlots.length > 0
                  ? selectedSlots[0]
                      .slot_number
                  : "Chưa chọn"}
              </div>

              <div>
                Tổng tiền:{" "}
                <strong>
                  {totalPrice.toLocaleString()}{" "}
                  VNĐ
                </strong>
              </div>

              <button
                className="parking__btn"
                onClick={handleSubmit}
                disabled={
                  !form.name.trim() ||
                  !form.phone.trim()
                }
                title={
                  !form.name.trim() ||
                  !form.phone.trim()
                    ? "Hãy vào profile nhập đủ thông tin"
                    : ""
                }
              >
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