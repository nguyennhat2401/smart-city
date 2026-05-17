import { useState } from "react";
import "./FormRegister.css";
import { notification } from "antd";

function FormRegister(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const [api, contextHolder] = notification.useNotification();

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

        if(!username || !password || !confirm){
            alert("Không được để trống!");
            return;
        }

        if(password !== confirm){
            alert("Mật khẩu không khớp!");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    role: "customer"
                })
            });

            const data = await res.json();

            if(!res.ok){
                throw new Error(
                    data?.username?.[0] || 
                    data?.password?.[0] || 
                    "Đăng ký thất bại"
                );
            }

            openNotificationWithIcon("success", "Đăng ký thành công");

            window.location.href = "/login";

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
                    <h2>Đăng ký</h2>

                    <div className="input-group">
                        <input 
                            type="text"
                            placeholder="Tài khoản"
                            value={username}
                            onChange={(e)=>setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input 
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input 
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            value={confirm}
                            onChange={(e)=>setConfirm(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "⏳ Đang xử lý..." : "Đăng ký"}
                    </button>

                </form>
            </div>
        </div>
        </>
    );
}

export default FormRegister;