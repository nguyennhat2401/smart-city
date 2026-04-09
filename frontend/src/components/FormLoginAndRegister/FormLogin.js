import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormLogin.css";
import { notification } from "antd";

function FormLogin() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [api, contextHolder] = notification.useNotification();
    const navigate = useNavigate();

    const openNotificationWithIcon = (type, mes) => {
        api[type]({
            message: type === 'success' ? "Thành công" : "Lỗi",
            description: mes,
            placement: "topRight",
            duration: 2
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            openNotificationWithIcon("error", "Không được để trống!");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                openNotificationWithIcon("error", data.detail || "Sai tài khoản hoặc mật khẩu");
                return;
            }

            const token = data.access;

            localStorage.setItem("token", token);

            openNotificationWithIcon("success", "Đăng nhập thành công");

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);

        } catch (err) {
            console.error(err);
            openNotificationWithIcon("error", "Không kết nối được server");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {contextHolder}

            <div className="main-container">
                <div className="login-container">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Đăng nhập</h2>

                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Tài khoản"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "⏳ Đang đăng nhập..." : "Đăng nhập"}
                        </button>

                        <p className="register">
                            Bạn chưa có tài khoản? <a href="/register">Đăng ký</a>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}

export default FormLogin;