import "./emptyParking.scss";
import { useState } from "react";

function EmptyParking() {
  const [branch, setBranch] = useState("cn1");
  const [vehicleType, setVehicleType] = useState("motorbike");

  const branches = [
    { id: "cn1", name: "Chi nhánh Quận 1" },
    { id: "cn2", name: "Chi nhánh Quận 7" },
    { id: "cn3", name: "Chi nhánh Thủ Đức" },
  ];

  const vehicleTypes = [
    { id: "motorbike", name: "Xe máy" },
    { id: "car", name: "Ô tô" },
    { id: "bike", name: "Xe đạp" },
  ];

  const topRows = ["A", "B", "C", "D"];
  const bottomRows = ["E", "F", "G", "H"];

  const getSlotClass = (i) => {
    if (i === 2) return "parking__slot parking__slot--booked";
    if (i === 1 || i === 5) return "parking__slot parking__slot--selected";
    return "parking__slot parking__slot--available";
  };

  const renderBlock = (label) => (
    <div className="parking__block" key={label}>
      <div className="parking__label">Khu {label}</div>

      <div className="parking__slots">
        {[...Array(12)].map((_, i) => (
          <button
            key={i}
            className={getSlotClass(i)}
            disabled={i === 2}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="parking">
      <div className="parking__container">

        {/* FILTER */}
        <div className="parking__filter">

          {/* CHI NHÁNH */}
          <div className="parking__filter-group">
            <span className="parking__filter-label">Chi nhánh:</span>
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

          {/* TYPE BOX NHỎ */}
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

        {/* TOP */}
        <div className="parking__row-group">
          {topRows.map(renderBlock)}
        </div>

        {/* DIVIDER */}
        <div className="parking__divider">
          <span>Lối vào / Exit</span>
        </div>

        {/* BOTTOM */}
        <div className="parking__row-group">
          {bottomRows.map(renderBlock)}
        </div>

        {/* LEGEND */}
        <div className="parking__legend">
          <div className="parking__legend-item">
            <span className="parking__slot parking__slot--booked"></span>
            <span>Đã đặt</span>
          </div>

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