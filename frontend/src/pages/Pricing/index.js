import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  InputNumber,
  TimePicker,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import "./Pricing.scss";

const { Option } = Select;

function Pricing() {
  const [lots, setLots] = useState([]);
  const [pricingData, setPricingData] = useState([]);

  const [selectedLot, setSelectedLot] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);

  const [form] = Form.useForm();
  const token = localStorage.getItem("token");

  // ================= FETCH LOTS =================
  const fetchLots = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/lots/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      setLots(data);

      if (data.length > 0) {
        setSelectedLot(data[0].id);
      }
    } catch {
      message.error("Lỗi load bãi xe");
    }
  };

  // ================= FETCH PRICING =================
  const fetchPricing = async (lotId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/lots/${lotId}/pricing/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error();

      setPricingData([
        {
          ...data,
          lot_id: lotId,
        },
      ]);
    } catch {
      message.error("Lỗi load giá");
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  useEffect(() => {
    if (selectedLot) {
      fetchPricing(selectedLot);
    }
  }, [selectedLot]);

  // ================= OPEN MODAL =================
  const openEditModal = (record) => {
    setEditingPricing(record);

    form.setFieldsValue({
      rate_per_hour: record.rate_per_hour,
      minimum_fee: record.minimum_fee,
      daily_max_fee: record.daily_max_fee,
      peak_hours_start: dayjs(record.peak_hours_start, "HH:mm:ss"),
      peak_hours_end: dayjs(record.peak_hours_end, "HH:mm:ss"),
      peak_rate_multiplier: record.peak_rate_multiplier,
    });

    setIsModalOpen(true);
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      await fetch(
        `http://127.0.0.1:8000/api/lots/${editingPricing.lot_id}/pricing/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...values,
            peak_hours_start: values.peak_hours_start.format("HH:mm:ss"),
            peak_hours_end: values.peak_hours_end.format("HH:mm:ss"),
          }),
        }
      );

      message.success("Cập nhật giá thành công");
      setIsModalOpen(false);
      fetchPricing(selectedLot);
    } catch {
      message.error("Lỗi cập nhật");
    }
  };

  // ================= TABLE =================
  const columns = [
    {
      title: "Giá / giờ",
      dataIndex: "rate_per_hour",
      render: (v) => <Tag color="blue">{Number(v).toLocaleString()}đ</Tag>,
    },
    {
      title: "Giá tối thiểu",
      dataIndex: "minimum_fee",
      render: (v) => <Tag>{Number(v).toLocaleString()}đ</Tag>,
    },
    {
      title: "Giá tối đa/ngày",
      dataIndex: "daily_max_fee",
      render: (v) => <Tag color="purple">{Number(v).toLocaleString()}đ</Tag>,
    },
    {
      title: "Giờ cao điểm",
      render: (_, r) =>
        `${r.peak_hours_start} - ${r.peak_hours_end}`,
    },
    {
      title: "Hệ số",
      dataIndex: "peak_rate_multiplier",
      render: (v) => <Tag color="orange">x{v}</Tag>,
    },
    {
      title: "Hành động",
      render: (_, r) => (
        <Button type="primary" onClick={() => openEditModal(r)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div className="Pricing">
      {/* TOOLBAR */}
      <div className="Pricing__toolbar">
        <Select
          value={selectedLot}
          onChange={setSelectedLot}
          style={{ width: 250 }}
        >
          {lots.map((lot) => (
            <Option key={lot.id} value={lot.id}>
              {lot.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* TABLE */}
      <div className="Pricing__table">
        <Table
          columns={columns}
          dataSource={pricingData}
          rowKey="lot_id"
          pagination={false}
        />
      </div>

      {/* MODAL */}
      <Modal
        className="Pricing-modal"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        title="Chỉnh sửa bảng giá"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="rate_per_hour" label="Giá / giờ">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="minimum_fee" label="Giá tối thiểu">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="daily_max_fee" label="Giá tối đa/ngày">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="peak_hours_start" label="Giờ bắt đầu cao điểm">
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="peak_hours_end" label="Giờ kết thúc cao điểm">
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="peak_rate_multiplier" label="Hệ số cao điểm">
            <InputNumber step={0.1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Pricing;