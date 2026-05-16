import React, { useState } from "react";
import { Card, Table, Button, Modal, DatePicker, message, Row, Col } from "antd";
import dayjs from "dayjs";
import "./ExtendPass.scss";

const initialPassList = [
  { key: 1, plate: "59A-12345", type: "Ô tô", parking: "Bãi A", end: "2026-03-31", status: "Đang hoạt động" },
  { key: 2, plate: "68B-67890", type: "Xe máy", parking: "Bãi B", end: "2026-04-04", status: "Đang hoạt động" },
  { key: 3, plate: "75D-33333", type: "Xe đạp", parking: "Bãi A", end: "2026-02-28", status: "Hết hạn" },
];

function ExtendPass() {
  const [passList, setPassList] = useState(initialPassList);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPass, setCurrentPass] = useState(null);
  const [newEndDate, setNewEndDate] = useState(null);

  const handleExtend = (pass) => {
    setCurrentPass(pass);
    setNewEndDate(dayjs(pass.end));
    setIsModalVisible(true);
  };

  const handleModalConfirm = () => {
    if (!newEndDate) {
      message.error("Vui lòng chọn ngày mới");
      return;
    }
    setPassList((prev) =>
      prev.map((p) =>
        p.key === currentPass.key
          ? { ...p, end: newEndDate.format("YYYY-MM-DD"), status: "Đang hoạt động" }
          : p
      )
    );
    message.success(`Vé tháng ${currentPass.plate} đã được gia hạn!`);
    setIsModalVisible(false);
    setCurrentPass(null);
    setNewEndDate(null);
  };

  const handleDelete = (pass) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa vé tháng của xe ${pass.plate}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setPassList((prev) => prev.filter((p) => p.key !== pass.key));
        message.success("Vé tháng đã được xóa!");
      },
    });
  };

  const columns = [
    { title: "Biển số", dataIndex: "plate" },
    { title: "Loại xe", dataIndex: "type" },
    { title: "Bãi gửi", dataIndex: "parking" },
    { title: "Ngày hết hạn", dataIndex: "end" },
    { title: "Trạng thái", dataIndex: "status" },
    {
      title: "Hành động",
      render: (_, record) => (
        <Row gutter={8} wrap={false}>
          <Col>
            <Button type="primary" onClick={() => handleExtend(record)}>Gia hạn</Button>
          </Col>
          <Col>
            <Button type="default" danger onClick={() => handleDelete(record)}>Xóa</Button>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div className="extend-pass">
      <h2 className="extend-pass__title">Gia hạn vé tháng</h2>

      <Card className="extend-pass__card">
        <Table columns={columns} dataSource={passList} pagination={false} scroll={{ x: 800 }} />
      </Card>

      <Modal
        className="parking-modal"
        title="Gia hạn vé tháng"
        open={isModalVisible}
        onOk={handleModalConfirm}
        onCancel={() => setIsModalVisible(false)}
        okText="Gia hạn"
        cancelText="Hủy"
      >
        {currentPass && (
          <>
            <p><b>Biển số:</b> {currentPass.plate}</p>
            <p><b>Loại xe:</b> {currentPass.type}</p>
            <p><b>Bãi gửi:</b> {currentPass.parking}</p>
            <p><b>Ngày hết hạn hiện tại:</b> {currentPass.end}</p>
            <DatePicker
              style={{ width: "100%" }}
              value={newEndDate}
              onChange={(date) => setNewEndDate(date)}
            />
          </>
        )}
      </Modal>
    </div>
  );
}

export default ExtendPass;