import "./Checkout.scss";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import BankPayment from "../../components/BankPayment";

function Checkout() {
  const API = "http://127.0.0.1:8000/api";

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState("");
  const [result, setResult] = useState(null);

  const fetchActive = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API}/records/my-active/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setRecord(data[0]);
        } else {
          setRecord(null);
        }
      }
    } catch (err) {
      console.error("Lỗi load active:", err);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);
  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/parking/check-out/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          record_id: record.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout thất bại");
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi server khi checkout");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (type) => {
    setPayment(type);
  };

  return (
    <div className="checkout">
      <div className="checkout__container">
        <h2 className="checkout__title">Lấy xe</h2>

        {error && <p className="checkout__error">{error}</p>}

        {!record ? (
          <p>Không có xe nào đang gửi</p>
        ) : !result ? (
          <>
            <p className="checkout__desc">
              Quét mã QR để nhân viên thực hiện checkout
            </p>

            <div className="checkout__card">
              {/* QR */}
              <div className="checkout__qr">
                <QRCodeCanvas value={`record:${record.id}`} size={160} />
              </div>

              {/* INFO */}
              <div className="checkout__info">
                <p><b>Biển số:</b> {record.plate_number}</p>
                <p><b>Bãi:</b> {record.lot_name}</p>
                <p><b>Slot:</b> {record.slot_number || "Chưa có"}</p>
                <p>
                  <b>Giờ vào:</b>{" "}
                  {new Date(record.entry_time).toLocaleString()}
                </p>
              </div>

              {/* ❌ ĐÃ BỎ NÚT CHECKOUT */}
            </div>
          </>
        ) : (
          <div className="checkout__card">
            <h3>Thanh toán</h3>

            <div className="checkout__info">
              <p><b>Số giờ:</b> {result.duration_hours} giờ</p>
              <p className="total">
                <b>Tổng tiền:</b> {Number(result.fee).toLocaleString()}đ
              </p>
            </div>

            {/* PAYMENT */}
            <div className="checkout__payment">
              <p><b>Chọn thanh toán:</b></p>

              <button
                className={`btn ${payment === "cash" ? "active" : ""}`}
                onClick={() => handlePayment("cash")}
              >
                💵 Tiền mặt
              </button>

              <button
                className={`btn ${payment === "bank" ? "active" : ""}`}
                onClick={() => handlePayment("bank")}
              >
                🏦 Chuyển khoản
              </button>
            </div>

            {/* CASH */}
            {payment === "cash" && (
              <div className="checkout__cash">
                <p>Vui lòng thanh toán tại quầy</p>
              </div>
            )}

            {/* BANK */}
            {payment === "bank" && (
              <BankPayment
                amount={Number(result.fee)}
                content={`PAY_${record.id}`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;