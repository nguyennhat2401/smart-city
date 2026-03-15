import { useState } from "react";
import "./FormLogin.css";

function FormLogin(){

    const [role, setRole] = useState("customer");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!username || !password){
            alert("Không được để trống!");
            return;
        }

        console.log({
            role: role,
            username: username,
            password: password
        });

        alert("Đăng nhập thành công!");
    };

    return (
        <div className="main-container">
            <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Đăng nhập</h2>
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

                <button type="submit">Đăng nhập</button>

                <p className="register">
                    Bạn chưa có tài khoản? <a href="/register">Đăng ký</a>
                </p>
            </form>
        </div>
        </div>
    );
}

export default FormLogin;