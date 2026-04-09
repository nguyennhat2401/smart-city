import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, message, Row, Col } from "antd";
import "./BookingConfirm.scss";

function BookingConfirm() {
  const [parkingLot, setParkingLot] = useState(null);
  const [bookingList, setBookingList] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ===================== GET STAFF =====================
  const fetchParkingStaff = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/api/staff/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Lỗi staff");

      const data = await res.json();

      const lot = {
        id: data.parking_lot,
        name: data.lot_name,
      };

      setParkingLot(lot);

      // load reservation luôn
      fetchReservations();

    } catch (err) {
      console.error(err);
      message.error("Không lấy được thông tin nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  // ===================== GET RESERVATIONS (NEW API) =====================
  const fetchReservations = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://127.0.0.1:8000/api/staff/reservations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Lỗi reservation");

      const data = await res.json();

      const mapped = data.map((item) => ({
        key: item.id,
        customer: item.user_name || "N/A",
        plate: item.vehicle_plate || "N/A",
        type: item.vehicle_type || "N/A",
        parking: item.lot_name || "N/A",
        price: Number(item.estimated_fee) || 0,
        status: mapStatus(item.status),
        rawStatus: item.status,
      }));

      setBookingList(mapped);

    } catch (err) {
      console.error(err);
      message.error("Không tải được danh sách đặt chỗ!");
    } finally {
      setLoading(false);
    }
  };

  // ===================== STATUS =====================
  const mapStatus = (status) => {
    switch (status) {
      case "pending":
        return "Chưa xác nhận";
      case "confirm":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã hủy";
      case "checked_in":
        return "Đã vào";
      default:
        return status || "Không rõ";
    }
  };

  // ===================== CONFIRM =====================
  const handleConfirm = (booking) => {
    setCurrentBooking(booking);
    setIsModalVisible(true);
  };

  const handleModalConfirm = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/staff/reservations/${currentBooking.key}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "confirmed" }),
        }
      );

      if (!res.ok) throw new Error();

      message.success("Xác nhận thành công!");
      setIsModalVisible(false);
      setCurrentBooking(null);
      fetchReservations();

    } catch {
      message.error("Xác nhận thất bại!");
    }
  };

  // ===================== CANCEL =====================
  const handleCancelBooking = (booking) => {
    Modal.confirm({
      title: "Xác nhận hủy",
      content: `Bạn có chắc muốn hủy xe ${booking.plate}?`,
      okText: "Hủy",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/api/staff/reservations/${booking.key}/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: "cancelled" }),
            }
          );

          if (!res.ok) throw new Error();

          message.success("Đã hủy!");
          fetchReservations();

        } catch {
          message.error("Hủy thất bại!");
        }
      },
    });
  };

  // ===================== TABLE =====================
  const columns = [
    { title: "Khách hàng", dataIndex: "customer" },
    { title: "Biển số", dataIndex: "plate" },
    { title: "Loại xe", dataIndex: "type" },
    { title: "Bãi gửi", dataIndex: "parking" },
    {
      title: "Giá",
      dataIndex: "price",
      render: (price) => price.toLocaleString() + "đ",
    },
    { title: "Trạng thái", dataIndex: "status" },
    {
      title: "Hành động",
      render: (_, record) => (
        <Row gutter={8} wrap={false}>
          <Col>
            <Button
              type="primary"
              onClick={() => handleConfirm(record)}
              disabled={record.rawStatus !== "pending"}
            >
              Xác nhận
            </Button>
          </Col>
          <Col>
            <Button
              danger
              onClick={() => handleCancelBooking(record)}
              disabled={record.rawStatus !== "pending"}
            >
              Hủy
            </Button>
          </Col>
        </Row>
      ),
    },
  ];

  // ===================== INIT =====================
  useEffect(() => {
    fetchParkingStaff();
  }, []);

  return (
    <div className="booking-confirm">
      <h2 className="booking-confirm__title">
        Xác nhận đặt chỗ{" "}
        {parkingLot ? `- ${parkingLot.name}` : ""}
      </h2>

      <Card className="booking-confirm__card">
        <Table
          columns={columns}
          dataSource={bookingList}
          loading={loading}
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        className="parking-modal"
        title="Xác nhận đặt chỗ"
        open={isModalVisible}
        onOk={handleModalConfirm}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentBooking(null);
        }}
      >
        {currentBooking && (
          <>
            <p><b>Khách hàng:</b> {currentBooking.customer}</p>
            <p><b>Biển số:</b> {currentBooking.plate}</p>
            <p><b>Loại xe:</b> {currentBooking.type}</p>
            <p><b>Bãi gửi:</b> {currentBooking.parking}</p>
            <p><b>Giá:</b> {currentBooking.price.toLocaleString()}đ</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default BookingConfirm;