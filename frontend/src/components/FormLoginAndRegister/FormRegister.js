import { useState } from "react";
import "./FormRegister.css"

function FormRegister(){

    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");
    const [confirm,setConfirm] = useState("");

    const handleSubmit = (e) =>{
        e.preventDefault();

        if(!username || !password || !confirm){
            alert("Không được để trống!");
            return;
        }

        if(password !== confirm){
            alert("Mật khẩu không khớp!");
            return;
        }

        alert("Đăng ký thành công");
    }

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

                <button type="submit">Đăng ký</button>
            </form>
        </div>
        </div>
    )
}

export default FormRegister;