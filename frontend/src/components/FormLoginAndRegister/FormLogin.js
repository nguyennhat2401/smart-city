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

            // 🧪 fake API
            await new Promise(resolve => setTimeout(resolve, 1000));

            const data = {
                token: "fake-jwt-token-123456",
                user: {
                    id: 1,
                    username: username,
                    role: "customer"
                }
            };

            localStorage.setItem("token", data.token);

            openNotificationWithIcon('success', "Đăng nhập thành công");

            // 👉 delay nhẹ để user thấy notification
            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (err) {
            console.error(err);
            openNotificationWithIcon('error', "Lỗi kết nối");
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