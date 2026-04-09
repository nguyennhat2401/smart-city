import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  message,
  Tag,
  Input,
  Select,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import "./ManageStaff.scss";

const { Option } = Select;

function ManageStaff() {
  const [staffs, setStaffs] = useState([]);
  const [lots, setLots] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const [editingStaff, setEditingStaff] = useState(null);

  const [formEdit] = Form.useForm();
  const [formAdd] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ================= FETCH LOTS =================
  const fetchLots = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/lots/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      const safeData = Array.isArray(data) ? data : [];
      setLots(safeData);
      return safeData;
    } catch {
      setLots([]);
      message.error("Lỗi load bãi xe");
      return [];
    }
  };

  // ================= FETCH ALL STAFF =================
  const fetchAllStaff = async () => {
    try {
      setLoading(true);

      const lotsData = await fetchLots();

      const requests = lotsData.map((lot) =>
        fetch(`http://127.0.0.1:8000/api/lots/${lot.id}/staff/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .catch(() => [])
      );

      const results = await Promise.all(requests);
      const merged = results.flat();

      const mapped = merged.map((item) => ({
        id: item.user,
        username: item.user_name,
        parking_lot_id: item.parking_lot,
        lot_name: item.lot_name,
        created_at: item.created_at,
      }));

      setStaffs(mapped);
    } catch {
      message.error("Lỗi load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStaff();
  }, []);

  // ================= MODAL =================
  const showAddModal = () => {
    formAdd.resetFields();
    setIsAddModalOpen(true);
  };

  const showEditModal = (record) => {
    setEditingStaff(record);
    setIsViewMode(false);
    formEdit.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  const showViewModal = (record) => {
    setEditingStaff(record);
    setIsViewMode(true);
    formEdit.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  // ================= ADD =================
  const handleAdd = async () => {
    try {
      const values = await formAdd.validateFields();

      setLoading(true);

      // tạo user
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          role: "staff",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      // assign bãi
      await fetch("http://127.0.0.1:8000/api/staff/assign/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: data.user.id,
          parking_lot_id: values.parking_lot_id,
          position: "Nhân viên",
        }),
      });

      message.success("Thêm thành công");
      setIsAddModalOpen(false);
      fetchAllStaff();
    } catch {
      message.error("Lỗi thêm");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const values = await formEdit.validateFields();

      setLoading(true);

      await fetch("http://127.0.0.1:8000/api/staff/update/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: editingStaff.id,
          parking_lot_id: values.parking_lot_id,
        }),
      });

      message.success("Đổi bãi thành công");
      setIsEditModalOpen(false);
      fetchAllStaff();
    } catch {
      message.error("Lỗi update");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xóa nhân viên khỏi bãi?",
      okType: "danger",
      onOk: async () => {
        try {
          await fetch("http://127.0.0.1:8000/api/staff/remove/", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: record.id,
              parking_lot_id: record.parking_lot_id,
            }),
          });

          message.success("Đã xóa khỏi bãi");
          fetchAllStaff();
        } catch {
          message.error("Lỗi xóa");
        }
      },
    });
  };

  // ================= TABLE =================
  const columns = [
    { title: "Username", dataIndex: "username" },
    { title: "Bãi xe", dataIndex: "lot_name" },
    {
      title: "Trạng thái",
      render: () => <Tag color="green">Hoạt động</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (d) => (d ? new Date(d).toLocaleString() : "-"),
    },
    {
      title: "Hành động",
      render: (_, r) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showViewModal(r)} />
          <Button icon={<EditOutlined />} onClick={() => showEditModal(r)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(r)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="ManageStaff">
      <div className="ManageStaff__toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Thêm nhân viên
        </Button>
      </div>

      <div className="ManageStaff__table">
        <Table
          columns={columns}
          dataSource={staffs}
          rowKey="id"
          loading={loading}
        />
      </div>

      {/* ADD */}
      <Modal
        open={isAddModalOpen}
        onOk={handleAdd}
        onCancel={() => setIsAddModalOpen(false)}
      >
        <Form form={formAdd} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="parking_lot_id"
            label="Bãi xe"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn bãi xe">
              {Array.isArray(lots) &&
                lots.map((lot) => (
                  <Option key={lot.id} value={lot.id}>
                    {lot.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* EDIT */}
      <Modal
        open={isEditModalOpen}
        onOk={isViewMode ? () => setIsEditModalOpen(false) : handleUpdate}
        onCancel={() => setIsEditModalOpen(false)}
      >
        <Form form={formEdit} layout="vertical">
          <Form.Item name="username" label="Username">
            <Input disabled />
          </Form.Item>

          <Form.Item name="parking_lot_id" label="Bãi xe">
            <Select disabled={isViewMode}>
              {Array.isArray(lots) &&
                lots.map((lot) => (
                  <Option key={lot.id} value={lot.id}>
                    {lot.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageStaff;