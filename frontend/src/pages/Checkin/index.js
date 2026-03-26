import "./checkin.scss";
import { QRCodeCanvas } from "qrcode.react";

function Checkin() {

    // 👉 fake data (sau nối BE)
    const parkingData = {
        code: "1233311111",
        slot: "A12",
        time: new Date().toLocaleString()
    };

    return (
        <div className="checkin">

            <div className="checkin__container">

                <h2 className="checkin__title">Gửi xe</h2>

                <p className="checkin__desc">
                    Vui lòng quét mã QR tại cổng để vào bãi
                </p>

                <div className="checkin__card">

                    {/* QR */}
                    <div className="checkin__qr">
                        <QRCodeCanvas 
                            value={JSON.stringify(parkingData)} 
                            size={170}
                        />
                    </div>

                    {/* Info */}
                    <div className="checkin__info">
                        <p><b>Mã xe:</b> {parkingData.code}</p>
                        <p><b>Vị trí:</b> {parkingData.slot}</p>
                        <p><b>Thời gian vào:</b> {parkingData.time}</p>
                    </div>

                    {/* NOTE */}
                    <div className="checkin__note">
                        <p>📌 Vui lòng giữ mã QR để checkout khi lấy xe</p>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Checkin;