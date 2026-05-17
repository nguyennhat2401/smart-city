import "./HomeIntro.scss";

function HomeIntro() {
  return (
    <section className="intro">
      <div className="intro__container">

        <h2 className="intro__title">
          Hệ Thống Đặt Chỗ Bãi Đỗ Xe
        </h2>

        <div className="intro__line"></div>

        <p className="intro__text">
          Parking Booking là nền tảng giúp người dùng tìm kiếm và đặt
          chỗ bãi đỗ xe trực tuyến nhanh chóng và tiện lợi. Chỉ với
          vài thao tác đơn giản, bạn có thể tìm thấy bãi đỗ xe phù hợp
          gần vị trí của mình.
        </p>

        <p className="intro__text">
          Hệ thống cung cấp đầy đủ thông tin về giá gửi xe, thời gian
          hoạt động và số chỗ còn trống của từng bãi đỗ, giúp người
          dùng chủ động hơn khi di chuyển trong thành phố.
        </p>

        <div className="intro__highlight">
          Giải pháp giúp bạn tiết kiệm thời gian tìm chỗ đỗ xe và
          mang lại trải nghiệm gửi xe thuận tiện hơn mỗi ngày.
        </div>

      </div>
    </section>
  );
}

export default HomeIntro;