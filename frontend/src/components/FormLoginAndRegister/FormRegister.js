import { useState } from "react";
import "./FormRegister.css";

function FormRegister(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

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

            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.message || "Đăng ký thất bại");
            }

            const data = await res.json();

            alert("Đăng ký thành công!");

            // nếu backend trả token → auto login
            if(data.token){
                localStorage.setItem("token", data.token);
                window.location.href = "/";
            } else {
                window.location.href = "/login";
            }

        } catch (err) {
            console.error(err);
            alert(err.message || "Không kết nối được server!");
        } finally {
            setLoading(false);
        }
    };

    return (
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
    );
}

export default FormRegister;