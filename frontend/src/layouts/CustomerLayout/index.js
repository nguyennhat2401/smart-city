import "./CustomerLayout.scss";
import { NavLink, Outlet } from "react-router-dom";
import { FacebookOutlined, InstagramOutlined, YoutubeOutlined, MenuOutlined, CloseOutlined, LoginOutlined} from "@ant-design/icons";
import { useState } from "react";

function CustomerLayout() {
     const [openMenu,setOpenMenu] = useState(false);
  return (
    <div className="CustomerLayout">

      <header className="header">
        <div className="menu">

          <div className="menu__logo">
            <NavLink to="/">
              <img src="https://ttz.com.vn/wp-content/uploads/2025/09/bien-bao-bai-do-xe-003.jpg" alt="logo"/>
            </NavLink>
          </div>

        {/* HAMBURGER ICON */}
          <div
            className="menu__toggle"
            onClick={()=>setOpenMenu(!openMenu)}
          >
            {openMenu ? <CloseOutlined/> : <MenuOutlined/>}
          </div>

          <div className={`menu__item ${openMenu ? "active" : ""}`}>
            <ul>

              <li className="menu__default">
                <NavLink to="/">Trang chủ</NavLink>
              </li>

              <li className="menu__default">
                <NavLink to="/emptypaking">Xem chỗ trống</NavLink>
              </li>

              <li className="menu__default">
                <NavLink to="/prebooking">Đặt chỗ trước</NavLink>
              </li>

              <li className="menu__personal" onClick={()=>setOpenMenu(!openMenu)}>
                <NavLink to="/login">
                  <LoginOutlined/> Đăng nhập
                </NavLink>
              </li>

            </ul>
          </div>

        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">

        <div className="footer__detail">

          <div className="footer__detail__introduce">
            <div className="footer__detail__introduce__title">GIỚI THIỆU</div>

            <div className="footer__detail__introduce__content">
              <div className="footer__detail__introduce__content__inner"><NavLink to="/aboutus">Về chúng tôi</NavLink></div>
              <div className="footer__detail__introduce__content__inner"><NavLink to="/operatingregulations">Quy chế hoạt động</NavLink></div>
            </div>
          </div>

          <div className="footer__detail__clause">
            <div className="footer__detail__clause__title">ĐIỀU KHOẢN</div>

            <div className="footer__detail__clause__content">
              <div className="footer__detail__clause__content__inner"><NavLink to="/privacypolicy">Chính sách bảo mật</NavLink></div>
              <div className="footer__detail__clause__content__inner"><NavLink to="/termsofuse">Thỏa thuận sử dụng</NavLink></div>
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
              <div className="footer__inforBusiness__main__content__vatCode">MST: 999999999</div>
              <div className="footer__inforBusiness__main__content__address">Khu dân cư Nhơn Đức, xã Hiệp Phước, TP. Hồ Chí Minh</div>
              <div className="footer__inforBusiness__main__content__phone">028-39207639</div>
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default CustomerLayout;