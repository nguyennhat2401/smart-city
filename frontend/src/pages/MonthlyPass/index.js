import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  InputNumber,
  Divider,
  Tag,
  Space,
} from "antd";
import { QRCodeCanvas } from "qrcode.react";
import dayjs from "dayjs";
import "./MonthlyPass.scss";

const { Option } = Select;
const { Search } = Input;

function MonthlyPass() {
  const API = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("token");

  const [passList, setPassList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [lots, setLots] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isQRModal, setIsQRModal] = useState(false);

  const [qrData, setQrData] = useState("");
  const [qrInfo, setQrInfo] = useState(null);

  const [form] = Form.useForm();

  // ===== SAFE ARRAY =====
  const toArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    return [];
  };

  // ================= FETCH =================
  const fetchLots = async () => {
    try {
      const res = await fetch(`${API}/lots/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLots(toArray(data));
    } catch {
      setLots([]);
    }
  };

  const fetchPasses = async () => {
    try {
      const res = await fetch(`${API}/monthly-pass/all/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const arr = toArray(data);

      const formatted = arr.map((p) => {
        // ===== AUTO EXPIRED FE =====
        const isExpired = dayjs(p.end_date).isBefore(dayjs());

        return {
          key: p.id,
          vehicle_id: p.vehicle_id,
          parking_lot_id: p.parking_lot_id,
          user: p.user_name,
          plate: p.vehicle_plate,
          type: p.vehicle_type,
          parking: p.parking_name,
          start: p.start_date,
          end: p.end_date,
          status: isExpired ? "expired" : p.status,
        };
      });

      setPassList(formatted);
      setFilteredList(formatted);
    } catch {
      setPassList([]);
      setFilteredList([]);
    }
  };

  useEffect(() => {
    fetchLots();
    fetchPasses();
  }, []);

  // ================= SEARCH =================
  const handleSearch = (value) => {
    if (!value) {
      setFilteredList(passList);
      return;
    }

    const filtered = passList.filter((p) =>
      p.plate.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredList(filtered);
  };

  // ================= CREATE =================
  const openCreate = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCreateFull = async () => {
    try {
      const values = await form.validateFields();

      // ===== 1 USER =====
      const userRes = await fetch(`${API}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          role: "customer",
        }),
      });

      const userData = await userRes.json();
      if (!userRes.ok) {
        message.error(userData?.username?.[0] || "Lỗi user");
        return;
      }

      // ===== 2 LOGIN =====
      const loginRes = await fetch(`${API}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const loginData = await loginRes.json();
      const userToken = loginData.access;

      if (!userToken) {
        message.error("Không login được");
        return;
      }

      // ===== 3 VEHICLE =====
      const vehicleRes = await fetch(`${API}/vehicles/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          plate_number: values.plate,
          vehicle_type: values.vehicle_type,
        }),
      });

      const vehicleData = await vehicleRes.json();

      // ===== 4 PASS =====
      const passRes = await fetch(`${API}/monthly-pass/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          vehicle_id: vehicleData.id,
          parking_lot_id: values.lot,
          months: values.months,
        }),
      });

      if (!passRes.ok) {
        message.error("Lỗi tạo vé");
        return;
      }

      // ===== QR =====
      const lot = lots.find((l) => l.id === values.lot);

      const qr = {
        vehicle_id: vehicleData.id,
        parking_lot_id: values.lot,
        plate: values.plate,
        lot: lot?.name,
      };

      setQrData(JSON.stringify(qr));
      setQrInfo(qr);
      setIsQRModal(true);

      message.success("Tạo vé thành công");
      setIsModalVisible(false);
      fetchPasses();
    } catch {
      message.error("Lỗi hệ thống");
    }
  };

  // ================= EXTEND =================
  const handleExtend = async (record) => {
    const months = prompt("Nhập số tháng:");
    if (!months) return;

    await fetch(`${API}/monthly-pass/${record.key}/extend/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ months: Number(months) }),
    });

    message.success("Gia hạn thành công");
    fetchPasses();
  };

  // ================= CANCEL =================
  const handleCancel = async (record) => {
    await fetch(`${API}/monthly-pass/${record.key}/cancel/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    message.success("Đã hủy vé");
    fetchPasses();
  };

  // ================= QR REPRINT =================
  const handlePrintQR = (record) => {
    const qr = {
      vehicle_id: record.vehicle_id,
      parking_lot_id: record.parking_lot_id,
      plate: record.plate,
      lot: record.parking,
    };

    setQrData(JSON.stringify(qr));
    setQrInfo(qr);
    setIsQRModal(true);
  };

  // ================= TABLE =================
  const statusColor = (s) => {
    if (s === "active") return "green";
    if (s === "expired") return "orange";
    return "red";
  };

  const columns = [
    { title: "User", dataIndex: "user" },
    { title: "Biển số", dataIndex: "plate" },
    { title: "Loại", dataIndex: "type" },
    { title: "Bãi", dataIndex: "parking" },
    { title: "Bắt đầu", dataIndex: "start" },
    { title: "Kết thúc", dataIndex: "end" },
    {
      title: "Trạng thái",
      render: (_, r) => <Tag color={statusColor(r.status)}>{r.status}</Tag>,
    },
    {
      title: "Action",
      render: (_, r) => (
        <Space wrap>
          <Button onClick={() => handleExtend(r)}>Gia hạn</Button>
          <Button danger onClick={() => handleCancel(r)}>
            Hủy
          </Button>
          <Button onClick={() => handlePrintQR(r)}>QR</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="monthly-pass">
      <h2 className="monthly-pass__title">Quản lý vé tháng</h2>

      <Card className="monthly-pass__card">
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button type="primary" onClick={openCreate}>
            Tạo vé + QR
          </Button>

          <Search
            placeholder="Tìm biển số..."
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
        </Space>
      </Card>

      <Card className="monthly-pass__card">
        <Table columns={columns} dataSource={filteredList} />
      </Card>

      {/* CREATE */}
      <Modal
        title="Tạo vé"
        open={isModalVisible}
        onOk={handleCreateFull}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Divider>Account</Divider>

          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Divider>Xe</Divider>

          <Form.Item name="plate" label="Biển số" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="vehicle_type" initialValue="motorbike">
            <Select>
              <Option value="motorbike">Xe máy</Option>
              <Option value="car">Ô tô</Option>
            </Select>
          </Form.Item>

          <Divider>Vé</Divider>

          <Form.Item name="lot" label="Bãi" rules={[{ required: true }]}>
            <Select>
              {lots.map((l) => (
                <Option key={l.id} value={l.id}>
                  {l.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="months" label="Số tháng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* QR */}
      <Modal
        title="QR Check-in"
        open={isQRModal}
        footer={null}
        onCancel={() => setIsQRModal(false)}
      >
        <div className="qr-box">
          <QRCodeCanvas value={qrData} size={200} />
          <p><b>Biển số:</b> {qrInfo?.plate}</p>
          <p><b>Bãi:</b> {qrInfo?.lot}</p>
        </div>
      </Modal>
    </div>
  );
}

export default MonthlyPass;