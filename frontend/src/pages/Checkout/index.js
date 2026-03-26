import "./Checkout.scss";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import BankPayment from "../../components/BankPayment";

function Checkout() {

    const [payment, setPayment] = useState("");

    // 👉 fake data
    const checkinTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const checkoutTime = new Date();

    const hours = Math.ceil((checkoutTime - checkinTime) / (1000 * 60 * 60));
    const pricePerHour = 5000;
    const total = hours * pricePerHour;

    const dataQR = {
        code: "1233311111",
        status: "checkout",
        time: checkoutTime.toLocaleString()
    };

    const handlePayment = (type) => {
        setPayment(type);
    };

    return (
        <div className="checkout">

            <div className="checkout__container">

                <h2 className="checkout__title">Lấy xe</h2>

                <p className="checkout__desc">
                    Quét mã QR để hoàn tất checkout
                </p>

                <div className="checkout__card">

                    {/* QR */}
                    <div className="checkout__qr">
                        <QRCodeCanvas 
                            value={JSON.stringify(dataQR)} 
                            size={160}
                        />
                    </div>

                    {/* Info */}
                    <div className="checkout__info">
                        <p><b>Mã xe:</b> {dataQR.code}</p>
                        <p><b>Vào lúc:</b> {checkinTime.toLocaleString()}</p>
                        <p><b>Ra lúc:</b> {checkoutTime.toLocaleString()}</p>
                        <p><b>Số giờ:</b> {hours} giờ</p>
                        <p><b>Đơn giá:</b> {pricePerHour.toLocaleString()}đ</p>
                        <p className="total"><b>Tổng tiền:</b> {total.toLocaleString()}đ</p>
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

                    {/* 👉 CASH */}
                    {payment === "cash" && (
                        <div className="checkout__cash">
                            <p>Vui lòng thanh toán tại quầy</p>
                        </div>
                    )}

                    {/* 👉 BANK */}
                    {payment === "bank" && (
                        <BankPayment 
                            amount={total}
                            content={`PAY_${dataQR.code}`}
                        />
                    )}

                </div>

            </div>

        </div>
    );
}

export default Checkout;