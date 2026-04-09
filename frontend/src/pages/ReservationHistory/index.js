import React, { useEffect, useState } from "react";
import { Table, Tag, Select, Typography, Spin, message, Button, Popconfirm } from "antd";
import "./ReservationHistory.scss";

const { Title } = Typography;
const { Option } = Select;

const statusColors = {
  pending: "orange",
  confirmed: "green",
  cancelled: "red",
  checked_in: "blue",
  completed: "purple",
  in_progress: "blue",
};

function ReservationHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const API = "http://127.0.0.1:8000/api";

  // ===== FETCH BOTH =====
  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // CALL 2 API SONG SONG
      const [resReservation, resRecord] = await Promise.all([
        fetch(`${API}/reservations/my/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/records/my-history/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resReservation.ok || !resRecord.ok) {
        throw new Error("Lỗi fetch dữ liệu");
      }

      const reservations = await resReservation.json();
      const records = await resRecord.json();

      // ===== MAP RESERVATIONS =====
      const mappedReservations = reservations.map((r) => ({
        id: `res-${r.id}`,
        type: "reservation",
        lot_name: r.lot_name,
        vehicle_plate: r.vehicle_plate,
        slot_number: r.slot_number,
        reserved_from: r.reserved_from,
        reserved_to: r.reserved_to,
        status: r.status,
        payment_status: r.payment_status,
        rawId: r.id,
      }));

      // ===== MAP RECORDS =====
      const mappedRecords = records.map((r) => ({
        id: `rec-${r.id}`,
        type: "record",
        lot_name: r.lot_name,
        vehicle_plate: r.plate_number,
        slot_number: r.slot_number,
        reserved_from: r.entry_time,
        reserved_to: r.exit_time,
        status: r.status,
        payment_status: "paid", // record coi như đã thanh toán
        fee: r.fee,
      }));

      // ===== MERGE + SORT =====
      const merged = [...mappedReservations, ...mappedRecords].sort(
        (a, b) => new Date(b.reserved_from) - new Date(a.reserved_from)
      );

      setData(merged);
    } catch (error) {
      console.error(error);
      message.error("Lấy dữ liệu thất bại!");
    }
    setLoading(false);
  };

  // ===== CANCEL =====
  const handleCancel = async (reservationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/reservations/${reservationId}/cancel/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      message.success("Hủy thành công!");
      fetchAll();
    } catch {
      message.error("Hủy thất bại!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ===== COLUMNS =====
  const columns = [
    {
      title: "Bãi xe",
      dataIndex: "lot_name",
      key: "lot_name",
      responsive: ["md"],
    },
    {
      title: "Xe",
      dataIndex: "vehicle_plate",
      key: "vehicle_plate",
    },
    {
      title: "Slot",
      dataIndex: "slot_number",
      key: "slot_number",
      render: (text) => text || "-",
    },
    {
      title: "Từ",
      dataIndex: "reserved_from",
      key: "reserved_from",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Đến",
      dataIndex: "reserved_to",
      key: "reserved_to",
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => (
        <Tag color={status === "paid" ? "green" : "volcano"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Phí",
      dataIndex: "fee",
      key: "fee",
      render: (fee) =>
        fee ? <b>{Number(fee).toLocaleString()}đ</b> : "-",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.type === "reservation" &&
        ["pending", "confirmed"].includes(record.status) ? (
          <Popconfirm
            title="Bạn có chắc muốn hủy?"
            onConfirm={() => handleCancel(record.rawId)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger size="small">
              Hủy
            </Button>
          </Popconfirm>
        ) : (
          <span>-</span>
        ),
    },
  ];

  const filteredData =
    filterStatus === "all"
      ? data
      : data.filter((r) => r.status === filterStatus);

  return (
    <div className="reservation-history">
      <Title level={2} className="reservation-history__title">
        Lịch sử đặt & gửi xe
      </Title>

      <div className="reservation-history__filter">
        <span>Trạng thái: </span>
        <Select
          value={filterStatus}
          onChange={(value) => setFilterStatus(value)}
          style={{ width: 180 }}
        >
          <Option value="all">Tất cả</Option>
          <Option value="pending">Pending</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="cancelled">Cancelled</Option>
          <Option value="checked_in">Checked-in</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="completed">Completed</Option>
        </Select>
      </div>

      {loading ? (
        <div className="reservation-history__loading">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          className="reservation-history__table"
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          bordered
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      )}
    </div>
  );
}

export default ReservationHistory;