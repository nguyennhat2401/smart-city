import "./HomeSteps.scss";

function HomeSteps() {
  return (
    <section className="steps">
      <div className="steps__container">

        <h2 className="steps__title">
          Đặt Chỗ Chỉ Với 3 Bước
        </h2>

        <div className="steps__list">

          <div className="steps__item">
            <h3>1. Tìm Bãi Đỗ</h3>
            <p>Nhập khu vực để tìm các bãi đỗ xe gần bạn.</p>
          </div>

          <div className="steps__item">
            <h3>2. Chọn Thời Gian</h3>
            <p>Chọn thời gian gửi xe phù hợp.</p>
          </div>

          <div className="steps__item">
            <h3>3. Xác Nhận Đặt Chỗ</h3>
            <p>Hoàn tất đặt chỗ và nhận thông báo xác nhận.</p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default HomeSteps;