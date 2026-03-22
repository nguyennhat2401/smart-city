import "./preBooking.scss";
import { useState } from "react";

function PreBooking() {
  const vehicleTypes = [
    { id: "motorbike", label: "Xe máy" },
    { id: "car", label: "Ô tô" },
    { id: "bicycle", label: "Xe đạp" },
  ];

  const [vehicleType, setVehicleType] = useState("motorbike");
  const [selectedSlots, setSelectedSlots] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    plate: "",
    bookingDate: "",
    parkingDate: "",
  });

  const pricePerSlot = 5000;

  const toggleSlot = (slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((s) => s !== slotId)
        : [...prev, slotId]
    );
  };

  const getClass = (slotId) => {
    if (slotId.endsWith("-3"))
      return "parking__slot parking__slot--booked";

    if (selectedSlots.includes(slotId))
      return "parking__slot parking__slot--selected";

    return "parking__slot parking__slot--available";
  };

  const renderBlock = (label) => (
    <div className="parking__block" key={label}>
      <div className="parking__block-label">Khu {label}</div>

      <div className="parking__slots">
        {[...Array(12)].map((_, i) => {
          const slotId = `${label}-${i + 1}`;

          return (
            <button
              key={slotId}
              className={getClass(slotId)}
              onClick={() => toggleSlot(slotId)}
              disabled={slotId.endsWith("-3")}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  const totalPrice = selectedSlots.length * pricePerSlot;

  const handleSubmit = () => {
    if (
      !form.name ||
      !form.phone ||
      !form.plate ||
      !form.bookingDate ||
      !form.parkingDate
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (selectedSlots.length === 0) {
      alert("Vui lòng chọn chỗ");
      return;
    }

    console.log({
      vehicleType,
      ...form,
      selectedSlots,
      totalPrice,
    });
  };

  return (
    <div className="parking">
      <div className="parking__container">

        {/* FILTER */}
        <div className="parking__filter">
          <div className="parking__group">
            <span>Chi nhánh:</span>
            <select className="parking__select">
              <option>Quận 1</option>
              <option>Quận 7</option>
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
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="parking__content">

          {/* LEFT */}
          <div className="parking__left">

            <div className="parking__row-group">
              {["A", "B", "C", "D"].map(renderBlock)}
            </div>

            <div className="parking__divider">
              <span>Lối vào / Exit</span>
            </div>

            <div className="parking__row-group">
              {["E", "F", "G", "H"].map(renderBlock)}
            </div>

          </div>

          {/* RIGHT FORM */}
          <div className="parking__right">

            <div className="parking__form">

              <div className="parking__form-group">
                <label>Họ tên</label>
                <input
                  className="parking__input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="parking__form-group">
                <label>SĐT</label>
                <input
                  className="parking__input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              <div className="parking__form-group">
                <label>Biển số xe</label>
                <input
                  className="parking__input"
                  value={form.plate}
                  onChange={(e) =>
                    setForm({ ...form, plate: e.target.value })
                  }
                />
              </div>

              <div className="parking__form-group">
                <label>Ngày đặt</label>
                <input
                  type="date"
                  className="parking__input"
                  value={form.bookingDate}
                  onChange={(e) =>
                    setForm({ ...form, bookingDate: e.target.value })
                  }
                />
              </div>

              <div className="parking__form-group">
                <label>Ngày gửi xe</label>
                <input
                  type="datetime-local"
                  className="parking__input"
                  value={form.parkingDate}
                  onChange={(e) =>
                    setForm({ ...form, parkingDate: e.target.value })
                  }
                />
              </div>

              <div className="parking__form-group">
                <label>Chỗ đã chọn</label>
                <div>
                  {selectedSlots.length > 0
                    ? selectedSlots.join(", ")
                    : "Chưa chọn"}
                </div>
              </div>

              <div className="parking__form-group">
                <label>Tổng tiền</label>
                <strong>{totalPrice.toLocaleString()} VNĐ</strong>
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