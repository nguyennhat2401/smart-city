import "./Profile.scss";
import { useEffect, useState } from "react";

function Profile() {
    const API = "http://127.0.0.1:8000/api";

    const [user, setUser] = useState(null);
    const [vehicles, setVehicles] = useState([]);

    const [form, setForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        address: "",
    });

    const [vehicleForm, setVehicleForm] = useState({
        plate_number: "",
        vehicle_type: "motorbike",
        brand: "",
        color: "",
    });

    const token = localStorage.getItem("token");

    // ================= PROFILE =================
    const fetchProfile = async () => {
        const res = await fetch(`${API}/auth/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        setForm({
            email: data.email || "",
            phone: data.phone || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            address: data.address || "",
        });
    };

    const updateProfile = async () => {
        const res = await fetch(`${API}/auth/profile/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (res.ok) {
            alert("Cập nhật thành công");
            setUser(data.data);
        } else {
            alert(data.error || "Lỗi cập nhật");
        }
    };

    // ================= VEHICLE =================
    const fetchVehicles = async () => {
        const res = await fetch(`${API}/vehicles/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVehicles(data);
    };

    const createVehicle = async () => {
        if (!vehicleForm.plate_number) {
            alert("Nhập biển số xe");
            return;
        }

        const res = await fetch(`${API}/vehicles/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(vehicleForm),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Lỗi thêm xe");
            return;
        }

        alert("Thêm xe thành công");
        setVehicleForm({
            plate_number: "",
            vehicle_type: "motorbike",
            brand: "",
            color: "",
        });
        fetchVehicles();
    };

    const deleteVehicle = async (id) => {
        if (!window.confirm("Xóa xe này?")) return;

        await fetch(`${API}/vehicles/${id}/delete/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        fetchVehicles();
    };

    useEffect(() => {
        fetchProfile();
        fetchVehicles();
    }, []);

    return (
        <div className="profile">
            <div className="profile__container">

                <h2>👤 Thông tin cá nhân</h2>

                <div className="profile__form">
                    <input value={user?.username || ""} disabled />

                    <input
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    <input
                        placeholder="SĐT"
                        value={form.phone}
                        onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                        }
                    />

                    <input
                        placeholder="First name"
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    />

                    <input
                        placeholder="Last name"
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    />

                    <input
                        placeholder="Address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                    <button onClick={updateProfile}>Cập nhật</button>
                </div>

                {/* ================= VEHICLE ================= */}
                <h2>🚗 Quản lý xe</h2>

                <div className="profile__vehicle-form">
                    <input
                        placeholder="Biển số xe"
                        value={vehicleForm.plate_number}
                        onChange={(e) =>
                            setVehicleForm({
                                ...vehicleForm,
                                plate_number: e.target.value,
                            })
                        }
                    />

                    <select
                        value={vehicleForm.vehicle_type}
                        onChange={(e) =>
                            setVehicleForm({
                                ...vehicleForm,
                                vehicle_type: e.target.value,
                            })
                        }
                    >
                        <option value="motorbike">Xe máy</option>
                        <option value="car">Ô tô</option>
                        <option value="bike">Xe đạp</option>
                    </select>

                    <input
                        placeholder="Hãng xe"
                        value={vehicleForm.brand}
                        onChange={(e) =>
                            setVehicleForm({
                                ...vehicleForm,
                                brand: e.target.value,
                            })
                        }
                    />

                    <input
                        placeholder="Màu xe"
                        value={vehicleForm.color}
                        onChange={(e) =>
                            setVehicleForm({
                                ...vehicleForm,
                                color: e.target.value,
                            })
                        }
                    />

                    <button onClick={createVehicle}>+ Thêm xe</button>
                </div>

                {/* ================= LIST ================= */}
                <div className="profile__vehicle-list">
                    {vehicles.length === 0 && <p>Chưa có xe</p>}

                    {vehicles.map((v) => (
                        <div key={v.id} className="profile__vehicle-item">
                            <div>
                                <strong>{v.plate_number}</strong> - {v.vehicle_type}
                                <br />
                                {v.brand} - {v.color}
                            </div>

                            <button onClick={() => deleteVehicle(v.id)}>
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default Profile;