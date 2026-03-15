import "./HomeParking.scss";

function HomeParking() {
  return (
    <section className="parking">
      <div className="parking__container">

        <h2 className="parking__title">
          Bãi Đỗ Xe Nổi Bật
        </h2>

        <div className="parking__grid">

          <div className="parking__card">
            <h3>Bãi Xe Trung Tâm</h3>
            <p>200 chỗ</p>
            <p>10.000đ / giờ</p>
          </div>

          <div className="parking__card">
            <h3>Bãi Xe Vincom</h3>
            <p>150 chỗ</p>
            <p>12.000đ / giờ</p>
          </div>

          <div className="parking__card">
            <h3>Bãi Xe Sân Bay</h3>
            <p>300 chỗ</p>
            <p>15.000đ / giờ</p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default HomeParking;