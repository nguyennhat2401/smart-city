import React, { useEffect, useState } from "react";
import {
  Select,
  Card,
  Row,
  Col,
  DatePicker,
  message,
  Spin,
} from "antd";
import { Column } from "@ant-design/charts";
import "./StatsDashboard.scss";

const { Option } = Select;
const { RangePicker } = DatePicker;

function StatsDashboard() {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    total_vehicles: 0,
    total_revenue: 0,
    average_fee: 0,
  });

  const token = localStorage.getItem("token");

  // ================= FETCH LOT =================
  const fetchLots = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/lots/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      const safeData = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];

      setLots(safeData);

      if (safeData.length > 0) {
        setSelectedLot(safeData[0].id);
      }
    } catch (err) {
      console.error(err);
      setLots([]);
      message.error("Lỗi load bãi xe");
    }
  };

  // ================= FETCH STATS =================
  const fetchStats = async () => {
    try {
      setLoading(true);

      let url = `http://127.0.0.1:8000/api/statistics/date-range/?`;

      if (selectedLot) url += `lot_id=${selectedLot}&`;

      if (dateRange.length === 2) {
        url += `from_date=${dateRange[0].format("YYYY-MM-DD")}&`;
        url += `to_date=${dateRange[1].format("YYYY-MM-DD")}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      // API trả object → KHÔNG phải array
      setStats({
        total_vehicles: data.total_vehicles || 0,
        total_revenue: data.total_revenue || 0,
        average_fee: data.average_fee || 0,
      });
    } catch (err) {
      console.error(err);
      message.error("Lỗi load thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  useEffect(() => {
    if (selectedLot !== null) {
      fetchStats();
    }
  }, [selectedLot, dateRange]);

  // ================= CHART =================
  const chartData = [
    {
      type: "Số xe",
      value: stats.total_vehicles,
    },
    {
      type: "Doanh thu",
      value: stats.total_revenue,
    },
  ];

  const config = {
    data: chartData,
    xField: "type",
    yField: "value",
    label: {
      position: "top",
      formatter: (v) =>
        v.type === "Doanh thu"
          ? `${v.value.toLocaleString()}đ`
          : v.value,
    },
    columnStyle: {
      radius: [16, 16, 0, 0],
    },
    color: ["#1677ff", "#52c41a"],
  };

  return (
    <div className="StatsDashboard">
      <h2 className="StatsDashboard__title">Thống kê bãi xe</h2>

      {/* FILTER */}
      <div className="StatsDashboard__filter">
        <Select
          value={selectedLot}
          onChange={setSelectedLot}
          style={{ width: 240 }}
          placeholder="Chọn bãi xe"
        >
          {(lots || []).map((lot) => (
            <Option key={lot.id} value={lot.id}>
              {lot.name}
            </Option>
          ))}
        </Select>

        <RangePicker
          onChange={(dates) => setDateRange(dates || [])}
        />
      </div>

      {/* KPI */}
      <Spin spinning={loading}>
        <Row gutter={16} className="StatsDashboard__cards">
          <Col xs={24} md={8}>
            <Card className="StatsDashboard__card">
              <h3>Tổng số xe</h3>
              <p>{stats.total_vehicles}</p>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="StatsDashboard__card">
              <h3>Doanh thu</h3>
              <p>{stats.total_revenue.toLocaleString()}đ</p>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="StatsDashboard__card">
              <h3>Trung bình</h3>
              <p>{stats.average_fee.toLocaleString()}đ</p>
            </Card>
          </Col>
        </Row>

        {/* CHART */}
        <Card className="StatsDashboard__chart">
          <Column {...config} />
        </Card>
      </Spin>
    </div>
  );
}

export default StatsDashboard;