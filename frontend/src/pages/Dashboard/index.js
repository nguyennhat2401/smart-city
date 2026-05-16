import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Statistic,
  Spin,
  Empty,
  Avatar,
} from "antd";

import {
  CarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import { Column } from "@ant-design/charts";

import "./Dashboard.scss";

const API = "http://127.0.0.1:8000/api";

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ================= FETCH LOT STATS =================
  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/lots/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const lots = await res.json();

      if (!Array.isArray(lots)) {
        setStats([]);
        return;
      }

      const statsPromises = lots.map(async (lot) => {
        try {
          const response = await fetch(
            `${API}/lots/${lot.id}/statistics/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) return null;

          const d = await response.json();

          return {
            id: lot.id,
            name: d.parking_lot,
            capacity: d.capacity || 0,
            available_now: d.available_now || 0,
            occupied_now: d.occupied_now || 0,
            revenue: d.today_revenue || 0,
          };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(statsPromises);

      setStats(results.filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH RECORDS =================
  const fetchRecords = async () => {
    try {
      const res = await fetch(`${API}/records/active/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      const mapped = Array.isArray(result)
        ? result.map((item, index) => ({
            key: index,
            plate: item.plate_number || "N/A",
            slot_number: item.slot_number || "N/A",
            parking: item.lot_name || "N/A",
            status:
              item.status === "in_progress"
                ? "Đang gửi"
                : "Khác",
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

  // ================= TOTAL =================
  const overview = useMemo(() => {
    return stats.reduce(
      (acc, item) => {
        acc.capacity += item.capacity;
        acc.available += item.available_now;
        acc.occupied += item.occupied_now;
        acc.revenue += item.revenue;

        return acc;
      },
      {
        capacity: 0,
        available: 0,
        occupied: 0,
        revenue: 0,
      }
    );
  }, [stats]);

  // ================= CHART =================
  const chartData = [
    {
      type: "Chỗ trống",
      value: overview.available,
    },
    {
      type: "Xe đang gửi",
      value: overview.occupied,
    },
  ];

  const config = {
    data: chartData,

    xField: "type",
    yField: "value",

    seriesField: "type",

    legend: false,

    color: ({ type }) => {
      if (type === "Chỗ trống") return "#1677ff";
      return "#52c41a";
    },

    columnWidthRatio: 0.45,

    label: {
      position: "top",

      style: {
        fill: "#111827",
        fontWeight: 700,
        fontSize: 14,
      },
    },

    xAxis: {
      label: {
        style: {
          fontWeight: 600,
          fontSize: 14,
        },
      },
    },

    yAxis: {
      grid: {
        line: {
          style: {
            stroke: "#e5e7eb",
            lineDash: [4, 4],
          },
        },
      },
    },

    tooltip: {
      formatter: (datum) => ({
        name: datum.type,
        value: datum.value,
      }),
    },

    columnStyle: {
      radius: [14, 14, 0, 0],
      shadowColor: "rgba(0,0,0,0.12)",
      shadowBlur: 10,
      shadowOffsetY: 4,
      cursor: "pointer",
    },

    animation: {
      appear: {
        animation: "wave-in",
        duration: 1200,
      },
    },
  };

  const columns = [
    {
      title: "Biển số",
      dataIndex: "plate",
      render: (text) => (
        <div className="dashboard__plate">
          <Avatar
            size={34}
            icon={<CarOutlined />}
            className="dashboard__avatar"
          />
          <span>{text}</span>
        </div>
      ),
    },

    {
      title: "Vị trí",
      dataIndex: "slot_number",
    },

    {
      title: "Bãi xe",
      dataIndex: "parking",
      render: (text) => (
        <div className="dashboard__parking">
          <EnvironmentOutlined />
          {text}
        </div>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",

      render: (status) => (
        <Tag
          color={
            status === "Đang gửi" ? "success" : "processing"
          }
          className="dashboard__tag"
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard__hero">
        <div>
          <h1 className="dashboard__title">
            Smart Parking Dashboard
          </h1>

          <p className="dashboard__subtitle">
            Theo dõi tình trạng bãi xe và doanh thu realtime
          </p>
        </div>

        <div className="dashboard__badge">
          Welcome back, <strong>Admin</strong>!
        </div>
      </div>

      {/* OVERVIEW */}
      <Spin spinning={loading}>
        <Row gutter={[20, 20]} className="dashboard__overview">
          <Col xs={24} sm={12} xl={6}>
            <Card className="dashboard__overviewCard blue">
              <div className="dashboard__overviewIcon">
                <AppstoreOutlined />
              </div>

              <Statistic
                title="Tổng chỗ"
                value={overview.capacity}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className="dashboard__overviewCard green">
              <div className="dashboard__overviewIcon">
                <CheckCircleOutlined />
              </div>

              <Statistic
                title="Chỗ trống"
                value={overview.available}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className="dashboard__overviewCard purple">
              <div className="dashboard__overviewIcon">
                <CarOutlined />
              </div>

              <Statistic
                title="Xe đang gửi"
                value={overview.occupied}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <Card className="dashboard__overviewCard orange">
              <div className="dashboard__overviewIcon">
                <DollarOutlined />
              </div>

              <Statistic
                title="Doanh thu"
                value={overview.revenue}
                formatter={(value) =>
                  `${Number(value).toLocaleString()}đ`
                }
              />
            </Card>
          </Col>
        </Row>

        {/* LOTS */}
        <div className="dashboard__lots">
          {stats.map((lot) => (
            <Card
              key={lot.id}
              className="dashboard__lotCard"
            >
              <div className="dashboard__lotHeader">
                <div>
                  <h3>{lot.name}</h3>
                  <p>Thông tin hoạt động bãi xe</p>
                </div>

                <Tag color="blue">Parking Lot</Tag>
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                  <div className="dashboard__miniCard">
                    <span>Tổng chỗ</span>
                    <strong>{lot.capacity}</strong>
                  </div>
                </Col>

                <Col xs={12} md={6}>
                  <div className="dashboard__miniCard">
                    <span>Chỗ trống</span>
                    <strong>{lot.available_now}</strong>
                  </div>
                </Col>

                <Col xs={12} md={6}>
                  <div className="dashboard__miniCard">
                    <span>Đang gửi</span>
                    <strong>{lot.occupied_now}</strong>
                  </div>
                </Col>

                <Col xs={12} md={6}>
                  <div className="dashboard__miniCard revenue">
                    <span>Doanh thu</span>

                    <strong>
                      {Number(lot.revenue).toLocaleString()}đ
                    </strong>
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
        </div>

        {/* CHART */}
        <Card
          className="dashboard__chartCard"
          title="Biểu đồ trạng thái bãi xe"
        >
          {chartData.length > 0 ? (
            <Column {...config} />
          ) : (
            <Empty description="Không có dữ liệu" />
          )}
        </Card>

        {/* TABLE */}
        <Card className="dashboard__tableCard">
          <div className="dashboard__tableHeader">
            <h3>Xe đang gửi trong hệ thống</h3>

            <Tag color="green">
              {data.length} xe hoạt động
            </Tag>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 6 }}
          />
        </Card>
      </Spin>
    </div>
  );
}

export default Dashboard;