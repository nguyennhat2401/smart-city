import { useEffect, useState } from "react";
import "./checkin.scss";
import { QRCodeCanvas } from "qrcode.react";

function Checkin() {
  const API = "http://127.0.0.1:8000/api";

  const [vehicles, setVehicles] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState("");

  // ===== LOAD VEHICLES =====
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API}/vehicles/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error("Lỗi load vehicles:", err);
    }
  };

  // ===== LOAD PARKING LOTS =====
  const fetchLots = async () => {
    try {
      const res = await fetch(`${API}/lots/`);
      if (res.ok) {
        const data = await res.json();
        setLots(data);
      }
    } catch (err) {
      console.error("Lỗi load lots:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchLots();
  }, []);

  // ===== TẠO QR (KHÔNG GỌI API) =====
  const handleGenerateQR = () => {
    if (!selectedVehicle || !selectedLot) {
      setError("Vui lòng chọn xe và bãi");
      return;
    }

    setError("");

    // encode data cho QR
    const data = {
      vehicle_id: selectedVehicle.id,
      parking_lot_id: selectedLot.id,
      plate: selectedVehicle.plate_number,
      lot: selectedLot.name,
    };

    setQrData(JSON.stringify(data));
  };

  // ===== HỦY =====
  const handleCancel = () => {
    setQrData(null);
    setSelectedVehicle(null);
    setSelectedLot(null);
  };

  return (
    <div className="checkin">
      <div className="checkin__container">
        <h2 className="checkin__title">Gửi xe</h2>

        {error && <p className="checkin__error">{error}</p>}

        {!qrData ? (
          <>
            {/* ===== CHỌN XE ===== */}
            <div className="checkin__select">
              <label>Chọn xe:</label>
              <select
                value={selectedVehicle?.id || ""}
                onChange={(e) =>
                  setSelectedVehicle(
                    vehicles.find((v) => v.id === Number(e.target.value))
                  )
                }
              >
                <option value="">-- Chọn xe --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} ({v.vehicle_type})
                  </option>
                ))}
              </select>
            </div>

            {/* ===== CHỌN BÃI ===== */}
            <div className="checkin__select">
              <label>Chọn bãi:</label>
              <select
                value={selectedLot?.id || ""}
                onChange={(e) =>
                  setSelectedLot(
                    lots.find((l) => l.id === Number(e.target.value))
                  )
                }
              >
                <option value="">-- Chọn bãi --</option>
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.location})
                  </option>
                ))}
              </select>
            </div>

            {/* ===== BUTTON ===== */}
            <button className="checkin__btn" onClick={handleGenerateQR}>
              Tạo mã QR
            </button>
          </>
        ) : (
          <div className="checkin__qr">
            {/* ===== QR ===== */}
            <QRCodeCanvas value={qrData} size={200} />

            {/* ===== INFO ===== */}
            <p><b>Biển số:</b> {selectedVehicle.plate_number}</p>
            <p><b>Bãi:</b> {selectedLot.name}</p>
            <p><b>Địa điểm:</b> {selectedLot.location}</p>

            <button className="checkin__btn cancel" onClick={handleCancel}>
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkin;