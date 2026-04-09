import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { jwtDecode } from "jwt-decode";

import "./SystemLogin.scss";

function SystemLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  const openNotification = (type, mes) => {
    api[type]({
      message: type === "success" ? "Thành công" : "Lỗi",
      description: mes,
      placement: "topRight",
      duration: 2,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      openNotification("error", "Không được để trống!");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log(data.user.role)

      if (!res.ok) {
        openNotification("error", data.detail || "Sai tài khoản hoặc mật khẩu");
        return;
      }

      const token = data.access;
      const decoded = jwtDecode(token);
      console.log(decoded)

      // lưu token
      localStorage.setItem("token", token);

      // ===== PHÂN QUYỀN =====
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
          openNotification("success", "Đăng nhập thành công");
        } else if(data.user.role === "staff") {
          navigate("/staff");
          openNotification("success", "Đăng nhập thành công");
        }
        else{
        openNotification("error", data.detail || "Bạn không có quyền truy cập");
        }
      }, 800);


    } catch (err) {
      console.error(err);
      openNotification("error", "Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <div className="system-login">
        <div className="system-login__box">
          <form className="system-login__form" onSubmit={handleSubmit}>
            <h2 className="system-login__title">Hệ thống quản lý</h2>

            <div className="system-login__group">
              <input
                type="text"
                placeholder="Tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="system-login__group">
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="system-login__btn"
              disabled={loading}
            >
              {loading ? "⏳ Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SystemLogin;