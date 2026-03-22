import "./HomeParking.scss";

function HomeParking() {
  return (
    <section className="home-parking">
      <div className="home-parking__container">

        <h2 className="home-parking__title">
          Bãi Đỗ Xe Nổi Bật
        </h2>

        <div className="home-parking__grid">

          <div className="home-parking__card">
            <h3>Bãi Xe Trung Tâm</h3>
            <p>200 chỗ</p>
            <p>10.000đ / giờ</p>
          </div>

          <div className="home-parking__card">
            <h3>Bãi Xe Vincom</h3>
            <p>150 chỗ</p>
            <p>12.000đ / giờ</p>
          </div>

          <div className="home-parking__card">
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