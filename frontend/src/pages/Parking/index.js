import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import "./Parking.scss";

function ParkingAdmin() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingParking, setEditingParking] = useState(null);

  const [form] = Form.useForm();
  const token = localStorage.getItem("token");

  // ================= FETCH =================
  const fetchLots = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/api/lots/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setParkings(Array.isArray(data) ? data : []);
    } catch {
      message.error("Lỗi load bãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  // ================= MODAL =================
  const showAddModal = () => {
    setEditingParking(null);
    setIsViewMode(false);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (record) => {
    setEditingParking(record);
    setIsViewMode(false);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const showViewModal = (record) => {
    setEditingParking(record);
    setIsViewMode(true);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingParking) {
        await fetch(
          `http://127.0.0.1:8000/api/lots/${editingParking.id}/update/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(values),
          }
        );
        message.success("Cập nhật thành công");
      } else {
        await fetch("http://127.0.0.1:8000/api/lots/create/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
        message.success("Tạo bãi + slot thành công");
      }

      setIsModalOpen(false);
      fetchLots();
    } catch {
      message.error("Lỗi xử lý");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xóa bãi xe?",
      okType: "danger",
      onOk: async () => {
        await fetch(
          `http://127.0.0.1:8000/api/lots/${record.id}/delete/`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        message.success("Đã xóa");
        fetchLots();
      },
    });
  };

  // ================= TABLE =================
  const columns = [
    { title: "Tên bãi", dataIndex: "name" },
    { title: "Vị trí", dataIndex: "location" },
    { title: "Slots", dataIndex: "total_slots" },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      render: (a) => (
        <Tag color={a ? "green" : "red"}>
          {a ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_, r) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showViewModal(r)} />
          <Button icon={<EditOutlined />} onClick={() => showEditModal(r)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="parkingAdmin">
      <div className="parkingAdmin__toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Thêm bãi xe
        </Button>
      </div>

      <div className="parkingAdmin__table">
        <Table columns={columns} dataSource={parkings} rowKey="id" />
      </div>

      <Modal
        className="parkingAdmin-modal"
        open={isModalOpen}
        onOk={isViewMode ? () => setIsModalOpen(false) : handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên bãi" rules={[{ required: true }]}>
            <Input disabled={isViewMode} />
          </Form.Item>

          <Form.Item name="location" label="Vị trí" rules={[{ required: true }]}>
            <Input disabled={isViewMode} />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input disabled={isViewMode} />
          </Form.Item>

          {!editingParking && (
            <>
              <Form.Item name="car_slots" label="Số chỗ ô tô">
                <Input type="number" />
              </Form.Item>

              <Form.Item name="motorbike_slots" label="Số chỗ xe máy">
                <Input type="number" />
              </Form.Item>

              <Form.Item name="bike_slots" label="Số chỗ xe đạp">
                <Input type="number" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default ParkingAdmin;