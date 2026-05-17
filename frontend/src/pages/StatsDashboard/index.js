import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Select,
  Card,
  Row,
  Col,
  DatePicker,
  message,
  Spin,
  Statistic,
  Empty,
  Tag,
} from "antd";

import {
  CarOutlined,
  DollarOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

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

  // ================= FORMAT MONEY =================
  const formatCurrency = (value) => {
    return `${Number(value || 0).toLocaleString()}đ`;
  };

  // ================= FETCH LOTS =================
  const fetchLots = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/lots/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Load lots failed");
      }

      const safeData = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : [];

      setLots(safeData);

      // auto chọn bãi đầu tiên
      if (safeData.length > 0 && !selectedLot) {
        setSelectedLot(safeData[0].id);
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách bãi xe");
      setLots([]);
    }
  }, [token, selectedLot]);

  // ================= FETCH STATS =================
  const fetchStats = useCallback(async () => {
    if (!selectedLot) return;

    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("lot_id", selectedLot);

      if (dateRange?.length === 2) {
        params.append(
          "from_date",
          dateRange[0].format("YYYY-MM-DD")
        );

        params.append(
          "to_date",
          dateRange[1].format("YYYY-MM-DD")
        );
      }

      const url = `http://127.0.0.1:8000/api/statistics/date-range/?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Load statistics failed");
      }

      setStats({
        total_vehicles: Number(data?.total_vehicles || 0),
        total_revenue: Number(data?.total_revenue || 0),
        average_fee: Number(data?.average_fee || 0),
      });
    } catch (err) {
      console.error(err);

      setStats({
        total_vehicles: 0,
        total_revenue: 0,
        average_fee: 0,
      });

      message.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  }, [selectedLot, dateRange, token]);

  // ================= EFFECT =================
  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ================= SELECTED LOT =================
  const selectedLotInfo = useMemo(() => {
    return lots.find((lot) => lot.id === selectedLot);
  }, [lots, selectedLot]);

  // ================= CHART DATA =================
  const chartData = useMemo(() => {
    return [
      {
        type: "Tổng số xe",
        value: Number(stats.total_vehicles || 0),
      },
      {
        type: "Doanh thu",
        value: Number(stats.total_revenue || 0),
      },
      {
        type: "Phí trung bình",
        value: Number(stats.average_fee || 0),
      },
    ];
  }, [stats]);

  // ================= CHART CONFIG =================
  const config = {
    data: chartData,

    xField: "type",
    yField: "value",

    color: ({ type }) => {
      if (type === "Tổng số xe") return "#1677ff";

      if (type === "Doanh thu") return "#52c41a";

      return "#fa8c16";
    },

    columnWidthRatio: 0.45,

    autoFit: true,

    padding: [30, 30, 60, 50],

    meta: {
      value: {
        min: 0,
      },
    },

    label: {
      position: "top",

      style: {
        fill: "#111",
        fontWeight: 700,
        fontSize: 13,
      },

      content: (item) => {
        const value = Number(item.value || 0);

        if (item.type === "Tổng số xe") {
          return `${value}`;
        }

        return `${value.toLocaleString()}đ`;
      },
    },
    tooltip: {
      formatter: (datum) => {
        const value = Number(datum?.value ?? 0);

        return {
          name: datum?.type,
          value:
            datum?.type === "Tổng số xe"
              ? `${value}`
              : `${value.toLocaleString()}đ`,
        };
      },
    },

    xAxis: {
      label: {
        style: {
          fontSize: 14,
          fontWeight: 600,
          fill: "#555",
        },
      },
    },

    yAxis: {
      label: {
        formatter: (v) => {
          const value = Number(v || 0);

          if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}k`;
          }

          return value;
        },
      },

      grid: {
        line: {
          style: {
            stroke: "#f0f0f0",
            lineDash: [4, 4],
          },
        },
      },
    },

    columnStyle: {
      radius: [16, 16, 0, 0],

      shadowColor: "rgba(0,0,0,0.12)",

      shadowBlur: 12,

      shadowOffsetY: 4,
    },

    interactions: [
      {
        type: "active-region",
      },
    ],

    animation: {
      appear: {
        animation: "wave-in",
        duration: 1200,
      },
    },
  };

  return (
    <div className="StatsDashboard">
      {/* ================= HEADER ================= */}
      <div className="StatsDashboard__header">
        <div>
          <h1 className="StatsDashboard__title">
            <BarChartOutlined />
            Dashboard thống kê
          </h1>

          <p className="StatsDashboard__subtitle">
            Theo dõi doanh thu và hiệu suất hoạt động bãi xe
          </p>
        </div>

        <Tag color="blue" className="StatsDashboard__tag">
          Smart Parking
        </Tag>
      </div>

      {/* ================= FILTER ================= */}
      <Card className="StatsDashboard__filterCard">
        <div className="StatsDashboard__filters">
          <div className="StatsDashboard__filterItem">
            <label>Bãi xe</label>

            <Select
              value={selectedLot}
              onChange={setSelectedLot}
              style={{ width: 260 }}
              size="large"
              placeholder="Chọn bãi xe"
            >
              {lots.map((lot) => (
                <Option key={lot.id} value={lot.id}>
                  {lot.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="StatsDashboard__filterItem">
            <label>Khoảng thời gian</label>

            <RangePicker
              size="large"
              onChange={(dates) => setDateRange(dates || [])}
            />
          </div>
        </div>

        {selectedLotInfo && (
          <div className="StatsDashboard__lotInfo">
            <EnvironmentOutlined />
            <span>{selectedLotInfo.name}</span>
          </div>
        )}
      </Card>

      {/* ================= CONTENT ================= */}
      <Spin spinning={loading}>
        {/* KPI */}
        <Row gutter={[20, 20]} className="StatsDashboard__cards">
          <Col xs={24} md={8}>
            <Card className="StatsDashboard__kpiCard vehicles">
              <div className="StatsDashboard__icon">
                <CarOutlined />
              </div>

              <Statistic
                title="Tổng số xe"
                value={stats.total_vehicles}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="StatsDashboard__kpiCard revenue">
              <div className="StatsDashboard__icon">
                <DollarOutlined />
              </div>

              <Statistic
                title="Tổng doanh thu"
                value={stats.total_revenue}
                formatter={(value) =>
                  formatCurrency(value)
                }
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="StatsDashboard__kpiCard avg">
              <div className="StatsDashboard__icon">
                <BarChartOutlined />
              </div>

              <Statistic
                title="Phí trung bình"
                value={stats.average_fee}
                formatter={(value) =>
                  formatCurrency(value)
                }
              />
            </Card>
          </Col>
        </Row>

        {/* ================= CHART ================= */}
        <Card
          className="StatsDashboard__chartCard"
          title="Biểu đồ thống kê"
        >
          {chartData.some((item) => item.value > 0) ? (
            <Column {...config} />
          ) : (
            <Empty description="Không có dữ liệu thống kê" />
          )}
        </Card>
      </Spin>
    </div>
  );
}

export default StatsDashboard;