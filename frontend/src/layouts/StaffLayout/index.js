import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Typography,
  Drawer,
  Button,
  Avatar,
  Dropdown,
} from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "./StaffLayout.scss";
import UserCheck from "../../pages/UserCheck";
import BookingConfirm from "../../pages/BookingConfirm";
import MonthlyPass from "../../pages/MonthlyPass";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function StaffLayout() {
  const [active, setActive] = useState("vehicle");
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  // ===== AUTH CHECK =====
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/systemlogin" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // nếu là admin thì không vào staff
    if (decoded.user_id === "1") {
      return <Navigate to="/admin" replace />;
    }
  } catch {
    return <Navigate to="/systemlogin" replace />;
  }

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/systemlogin");
  };

  // ===== MENU =====
  const menuItems = [
    { key: "vehicle", icon: <CarOutlined />, label: "Lượt xe ra vào" },
    { key: "booking", icon: <CheckCircleOutlined />, label: "Xác nhận đặt chỗ" },
    { key: "monthly", icon: <IdcardOutlined />, label: "Vé tháng" },
  ];

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const renderContent = () => {
    switch (active) {
      case "booking":
        return <div className="staff-layout__page"><BookingConfirm/></div>;
      case "monthly":
        return <div className="staff-layout__page"><MonthlyPass/></div>;
      default:
        return <div className="staff-layout__page"><UserCheck/></div>;
    }
  };

  return (
    <Layout className="staff-layout">
      {/* SIDEBAR */}
      <Sider
        className="staff-layout__sider"
        collapsed={collapsed}
        trigger={null}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        breakpoint="lg"
      >
        <div className="staff-layout__logo">
          {collapsed ? "S" : "STAFF"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[active]}
          onClick={(e) => {
            setActive(e.key);
            setMobileOpen(false);
          }}
          items={menuItems}
        />
      </Sider>

      {/* MOBILE */}
      <Drawer
        title="Menu"
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Menu
          mode="inline"
          selectedKeys={[active]}
          onClick={(e) => {
            setActive(e.key);
            setMobileOpen(false);
          }}
          items={menuItems}
        />
      </Drawer>

      {/* MAIN */}
      <Layout className="staff-layout__main">
        <Header className="staff-layout__header">
          <div className="staff-layout__header-left">
            <Button
              className="staff-layout__menu-btn"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
            />
            <Title level={4} className="staff-layout__title">
              Staff Dashboard
            </Title>
          </div>

          {/* RIGHT */}
          <div className="staff-layout__header-right">
            <BellOutlined className="staff-layout__icon" />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="staff-layout__user">
                <Avatar icon={<UserOutlined />} />
                {!collapsed && <span>Staff</span>}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="staff-layout__content">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default StaffLayout;