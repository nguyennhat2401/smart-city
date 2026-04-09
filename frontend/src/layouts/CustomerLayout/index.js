import "./CustomerLayout.scss";
import { NavLink, Outlet } from "react-router-dom";
import { 
  FacebookOutlined, 
  InstagramOutlined, 
  YoutubeOutlined, 
  MenuOutlined, 
  CloseOutlined, 
  LoginOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";

function CustomerLayout() {

  const [openMenu, setOpenMenu] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  //check token khi load
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("TOKEN:", token);
    setIsLogin(!!token);
  }, []);

  console.log(isLogin);
  //logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLogin(false);
    window.location.href = "/login";
  };

  return (
    <div className="CustomerLayout">

      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="menu">

          <div className="menu__logo">
            <NavLink to="/">
              <img src="https://ttz.com.vn/wp-content/uploads/2025/09/bien-bao-bai-do-xe-003.jpg" alt="logo"/>
            </NavLink>
          </div>

          {/* HAMBURGER */}
          <div
            className="menu__toggle"
            onClick={()=>setOpenMenu(!openMenu)}
          >
            {openMenu ? <CloseOutlined/> : <MenuOutlined/>}
          </div>

          <div className={`menu__item ${openMenu ? "active" : ""}`}>
            <ul>

              <li className="menu__default">
                <NavLink to="/" onClick={()=>setOpenMenu(false)}>Trang chủ</NavLink>
              </li>

              {/*hiện khi login */}
              {isLogin && (
                <>
                <li className="menu__default">
                <NavLink to="/emptypaking" onClick={()=>setOpenMenu(false)}>Xem chỗ trống</NavLink>
              </li>

              <li className="menu__default">
                <NavLink to="/prebooking" onClick={()=>setOpenMenu(false)}>Đặt chỗ trước</NavLink>
              </li>
                <li className="menu__default">
                    <NavLink to="/monthlypasscustomer" onClick={()=>setOpenMenu(false)}>Đặt vé tháng</NavLink>
                  </li>
                  <li className="menu__default">
                    <NavLink to="/checkin" onClick={()=>setOpenMenu(false)}>Checkin</NavLink>
                  </li>

                  <li className="menu__default">
                    <NavLink to="/checkout" onClick={()=>setOpenMenu(false)}>Checkout</NavLink>
                  </li>

                  <li className="menu__default">
                    <NavLink to="/profile" onClick={()=>setOpenMenu(false)}>Profile</NavLink>
                  </li>
                  <li className="menu__default">
                    <NavLink to="/reservation" onClick={()=>setOpenMenu(false)}>Lịch sử đặt chỗ</NavLink>
                  </li>
                </>
              )}

              {/*login / logout */}
              <li className="menu__personal">
                {isLogin ? (
                  <span onClick={handleLogout} style={{cursor: "pointer"}}>
                    <LogoutOutlined/> Đăng xuất
                  </span>
                ) : (
                  <NavLink to="/login" onClick={()=>setOpenMenu(false)}>
                    <LoginOutlined/> Đăng nhập
                  </NavLink>
                )}
              </li>

            </ul>
          </div>

        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="main">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="footer">

        <div className="footer__detail">

          <div className="footer__detail__introduce">
            <div className="footer__detail__introduce__title">GIỚI THIỆU</div>

            <div className="footer__detail__introduce__content">
              <div className="footer__detail__introduce__content__inner">
                <NavLink to="/aboutus">Về chúng tôi</NavLink>
              </div>
              <div className="footer__detail__introduce__content__inner">
                <NavLink to="/operatingregulations">Quy chế hoạt động</NavLink>
              </div>
            </div>
          </div>

          <div className="footer__detail__clause">
            <div className="footer__detail__clause__title">ĐIỀU KHOẢN</div>

            <div className="footer__detail__clause__content">
              <div className="footer__detail__clause__content__inner">
                <NavLink to="/privacypolicy">Chính sách bảo mật</NavLink>
              </div>
              <div className="footer__detail__clause__content__inner">
                <NavLink to="/termsofuse">Thỏa thuận sử dụng</NavLink>
              </div>
            </div>
          </div>

          <div className="footer__detail__link">

            <div className="footer__detail__link__logo1">
              <img src="https://www.galaxycine.vn/_next/static/media/glx_trade.61f6c35c.png" alt="logo"/>
            </div>

            <div className="footer__detail__link__social">

              <div className="footer__detail__link__social__icon">
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <FacebookOutlined/>
                </a>
              </div>

              <div className="footer__detail__link__social__icon">
                <a href="https://youtube.com" target="_blank" rel="noreferrer">
                  <YoutubeOutlined/>
                </a>
              </div>

              <div className="footer__detail__link__social__icon">
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  <InstagramOutlined/>
                </a>
              </div>

            </div>
          </div>

        </div>

        <div className="footer__inforBusiness">

          <div className="footer__inforBusiness__logo">
            <img src="https://ttz.com.vn/wp-content/uploads/2025/09/bien-bao-bai-do-xe-003.jpg" alt="logo"/>
          </div>

          <div className="footer__inforBusiness__main">

            <div className="footer__inforBusiness__main__title">
              CÔNG TY QUẢN LÝ PHẦN MỀM GỬI XE
            </div>

            <div className="footer__inforBusiness__main__content">
              <div className="footer__inforBusiness__main__content__vatCode">
                MST: 999999999
              </div>
              <div className="footer__inforBusiness__main__content__address">
                Khu dân cư Nhơn Đức, xã Hiệp Phước, TP. Hồ Chí Minh
              </div>
              <div className="footer__inforBusiness__main__content__phone">
                028-39207639
              </div>
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default CustomerLayout;