import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag } from "antd";
import "./Dashboard.scss";

const API = "http://127.0.0.1:8000/api";

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [data, setData] = useState([]);

  const token = localStorage.getItem("token");

  // ===== FETCH LOT + STATS =====
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/lots/`);
      const lots = await res.json();

      if (!Array.isArray(lots)) return;

      const statsPromises = lots.map(async (lot) => {
        try {
          const res = await fetch(
            `${API}/lots/${lot.id}/statistics/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) return null;

          const d = await res.json();

          return {
            id: lot.id,
            name: d.parking_lot,
            items: [
              { title: "Tổng chỗ", value: d.capacity },
              { title: "Chỗ trống", value: d.available_now },
              { title: "Xe đang gửi", value: d.occupied_now },
              { title: "Doanh thu", value: d.today_revenue + "đ" },
            ],
          };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(statsPromises);
      setStats(results.filter(Boolean));
    } catch (err) {
      console.error(err);
    }
  };

  // ===== FETCH RECORDS =====
  const fetchRecords = async () => {
    try {
      const res = await fetch(`${API}/records/active/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      const mapped = Array.isArray(result)
        ? result.map((item, index) => ({
            key: index,
            plate: item.plate_number || "N/A",
            slot_number: item.slot_number || "N/A",
            parking: item.lot_name || "N/A",
            status: item.status === "in_progress" ? "Đang gửi" : "Khác",
          }))
        : [];

      setData(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecords();
  }, []);

  const columns = [
    { title: "Biển số", dataIndex: "plate" },
    { title: "Vị trí", dataIndex: "slot_number" },
    { title: "Bãi xe", dataIndex: "parking" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "Đang gửi" ? "green" : "blue"}>
          {s}
        </Tag>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">🚗 Dashboard hệ thống</h2>

      {stats.map((lot) => (
        <div key={lot.id} className="dashboard__lot">
          <h3 className="dashboard__lot-title">{lot.name}</h3>

          <Row gutter={16} className="dashboard__stats">
            {lot.items.map((item, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="dashboard__card">
                  <div className="dashboard__card-title">
                    {item.title}
                  </div>
                  <div className="dashboard__card-value">
                    {item.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <div className="dashboard__table">
        <h3 className="dashboard__subtitle">
          🚙 Danh sách xe đang gửi
        </h3>
        <Table columns={columns} dataSource={data} pagination={false} />
      </div>
    </div>
  );
}

export default Dashboard;