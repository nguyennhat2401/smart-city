import React, { useState, useRef } from "react";
import { Card, Button, Input, Form, message, Row, Col, Modal, Tabs } from "antd";
import "./UserCheck.scss";

const API = "http://127.0.0.1:8000/api";

function UserCheck() {
  const [activeTab, setActiveTab] = useState("checkout");

  const [qrCode, setQrCode] = useState("");
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fee, setFee] = useState(null);
  const [isMonthly, setIsMonthly] = useState(false);

  const inputRef = useRef(null);

  // ===== SCAN QR =====
  const handleScan = async () => {
    try {
      const token = localStorage.getItem("token");

      // ===== CHECK-IN =====
      if (activeTab === "checkin") {
        const parsed = JSON.parse(qrCode);

        setCurrentVehicle({
          plate_number: parsed.plate,
          lot_name: parsed.lot,
          vehicle_id: parsed.vehicle_id,
          parking_lot_id: parsed.parking_lot_id,
        });

        message.success("QR hợp lệ (Check-in)");
        return;
      }

      // ===== CHECK-OUT =====
      const recordId = qrCode.replace("record:", "").trim();

      const res = await fetch(`${API}/records/active/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const found = data.find((r) => r.id === Number(recordId));

      if (found) {
        setCurrentVehicle(found);
        message.success("Đã nhận diện xe: " + found.plate_number);
      } else {
        setCurrentVehicle(null);
        message.error("Không tìm thấy xe!");
      }
    } catch (err) {
      console.error(err);
      message.error("QR không hợp lệ");
    }
  };

  // ===== CHECK-IN =====
  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/parking/check-in/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicle_id: currentVehicle.vehicle_id,
          parking_lot_id: currentVehicle.parking_lot_id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        message.error(err.error || "Check-in thất bại");
        return;
      }

      message.success("Check-in thành công!");
      handleReset();
    } catch (err) {
      console.error(err);
      message.error("Lỗi check-in");
    }
  };

  // ===== CHECK-OUT (FIX CHUẨN) =====
  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/parking/check-out/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          record_id: currentVehicle.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "Checkout thất bại");
        return;
      }

      setFee(data.fee);
      setIsMonthly(data.is_monthly_pass);

      setCurrentVehicle({
        ...currentVehicle,
        status: "completed",
      });

      if (data.is_monthly_pass) {
        message.success("Xe vé tháng - miễn phí");
      }

      setIsModalVisible(true);
    } catch (err) {
      console.error(err);
      message.error("Lỗi checkout");
    }
  };

  // ===== RESET =====
  const handleReset = () => {
    setQrCode("");
    setCurrentVehicle(null);
    setFee(null);
    setIsMonthly(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    handleReset();
  };

  return (
    <div className="user-check">
      <h2 className="user-check__title">Quét QR xe</h2>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          handleReset();
        }}
        items={[
          { key: "checkin", label: "Check-in" },
          { key: "checkout", label: "Check-out" },
        ]}
      />

      <Card className="user-check__card scan-card">
        <Form layout="inline">
          <Form.Item label="QR">
            <Input
              ref={inputRef}
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onPressEnter={handleScan}
              placeholder={
                activeTab === "checkin"
                  ? "Dán QR JSON"
                  : "Nhập record:6"
              }
            />
          </Form.Item>

          <Button type="primary" onClick={handleScan}>
            Quét
          </Button>
        </Form>
      </Card>

      {currentVehicle && (
        <Card className="user-check__card info-card" title="Thông tin xe">
          <Row>
            <Col span={12}>
              <p><b>Biển số:</b> {currentVehicle.plate_number}</p>
            </Col>
            <Col span={12}>
              <p><b>Bãi:</b> {currentVehicle.lot_name}</p>
            </Col>
          </Row>

          <div className="user-check__actions">
            {activeTab === "checkin" ? (
              <Button type="primary" onClick={handleCheckIn}>
                Check-in
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleCheckOut}
                disabled={currentVehicle.status !== "in_progress"}
              >
                Check-out
              </Button>
            )}
          </div>
        </Card>
      )}

      <Modal
        title="Thanh toán"
        open={isModalVisible}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
        okText="Đóng"
        cancelButtonProps={{ style: { display: "none" } }}
      >
        {currentVehicle && (
          <div className="payment-info">
            <p><b>Biển số:</b> {currentVehicle.plate_number}</p>
            <p><b>Bãi:</b> {currentVehicle.lot_name}</p>

            <p className="price">
              Tổng tiền: {Number(fee || 0).toLocaleString()}đ
            </p>

            {isMonthly && (
              <p style={{ color: "#22c55e", fontWeight: "bold" }}>
                Vé tháng - Miễn phí
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default UserCheck;