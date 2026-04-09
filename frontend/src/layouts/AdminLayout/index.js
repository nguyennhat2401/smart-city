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
  UserOutlined,
  DollarOutlined,
  BarChartOutlined,
  MenuOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "./AdminLayout.scss";
import Dashboard from "../../pages/Dashboard";
import Parking from "../../pages/Parking";
import ManageStaff from "../../pages/ManageStaff";
import Pricing from "../../pages/Pricing";
import StatsDashboard from "../../pages/StatsDashboard";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function AdminLayout() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  // ===== AUTH + ROLE CHECK =====
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/systemlogin");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // không phải admin
      if (decoded.user_id !== "1") {
        navigate("/systemlogin");
      }
    } catch (err) {
      navigate("/systemlogin");
    }
  }, [navigate]);

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/systemlogin");
  };

  // ===== MENU =====
  const menuItems = [
    { key: "dashboard", icon: <BarChartOutlined />, label: "Tổng quan" },
    { key: "parking", icon: <CarOutlined />, label: "Bãi xe" },
    { key: "staff", icon: <UserOutlined />, label: "Nhân viên" },
    { key: "pricing", icon: <DollarOutlined />, label: "Bảng giá" },
    { key: "stats", icon: <BarChartOutlined />, label: "Thống kê" },
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
      case "parking":
        return <div className="admin-layout__page"><Parking/></div>;
      case "staff":
        return <div className="admin-layout__page"><ManageStaff/></div>;
      case "pricing":
        return <div className="admin-layout__page"><Pricing/></div>;
      case "stats":
        return <div className="admin-layout__page"><StatsDashboard/></div>;
      default:
        return <div className="admin-layout__page"><Dashboard/></div>;
    }
  };

  return (
    <Layout className="admin-layout">
      {/* SIDEBAR */}
      <Sider
        className="admin-layout__sider"
        collapsed={collapsed}
        trigger={null}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        breakpoint="lg"
      >
        <div className="admin-layout__logo">
          {collapsed ? "A" : "ADMIN"}
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

      {/* MOBILE DRAWER */}
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
      <Layout className="admin-layout__main">
        <Header className="admin-layout__header">
          {/* LEFT */}
          <div className="admin-layout__header-left">
            <Button
              className="admin-layout__menu-btn"
              icon={<MenuOutlined />}
              onClick={() => setMobileOpen(true)}
            />
            <Title level={4} className="admin-layout__title">
              Admin Dashboard
            </Title>
          </div>

          {/* RIGHT */}
          <div className="admin-layout__header-right">
            <BellOutlined className="admin-layout__icon" />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="admin-layout__user">
                <Avatar icon={<UserOutlined />} />
                {!collapsed && <span>Admin</span>}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-layout__content">
          {renderContent()}
          <Outlet/>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;