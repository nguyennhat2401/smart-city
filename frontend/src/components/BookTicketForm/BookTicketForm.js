import { useState } from "react";
import "./BookTicketForm.scss";

function BookTicketForm(){

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [vehicleType, setVehicleType] = useState("motorbike");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!name || !phone || !licensePlate || !checkIn || !checkOut){
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        console.log({
            name,
            phone,
            licensePlate,
            vehicleType,
            checkIn,
            checkOut
        });

        alert("Đặt chỗ giữ xe thành công!");
    };

    return(
        <div className="booking">
            <div className="booking__container">

                <form className="booking__form" onSubmit={handleSubmit}>
                    <h2 className="booking__title">Đặt chỗ giữ xe</h2>

                    <div className="booking__group">
                        <input
                            className="booking__input"
                            type="text"
                            placeholder="Họ và tên"
                            value={name}
                            onChange={(e)=>setName(e.target.value)}
                        />
                    </div>

                    <div className="booking__group">
                        <input
                            className="booking__input"
                            type="text"
                            placeholder="Số điện thoại"
                            value={phone}
                            onChange={(e)=>setPhone(e.target.value)}
                        />
                    </div>

                    <div className="booking__group">
                        <input
                            className="booking__input"
                            type="text"
                            placeholder="Biển số xe"
                            value={licensePlate}
                            onChange={(e)=>setLicensePlate(e.target.value)}
                        />
                    </div>

                    <div className="booking__group">
                        <select
                            className="booking__select"
                            value={vehicleType}
                            onChange={(e)=>setVehicleType(e.target.value)}
                        >
                            <option value="motorbike">Xe máy</option>
                            <option value="car">Ô tô</option>
                        </select>
                    </div>

                    <div className="booking__group">
                        <label className="booking__label">Thời gian vào</label>
                        <input
                            className="booking__input"
                            type="datetime-local"
                            value={checkIn}
                            onChange={(e)=>setCheckIn(e.target.value)}
                        />
                    </div>

                    <div className="booking__group">
                        <label className="booking__label">Thời gian ra</label>
                        <input
                            className="booking__input"
                            type="datetime-local"
                            value={checkOut}
                            onChange={(e)=>setCheckOut(e.target.value)}
                        />
                    </div>

                    <button className="booking__button" type="submit">
                        Đặt chỗ
                    </button>

                </form>

            </div>
        </div>
    );
}

export default BookTicketForm;