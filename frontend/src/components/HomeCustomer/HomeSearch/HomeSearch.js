import "./HomeSearch.scss";

function HomeSearch() {
  return (
    <section className="search">
      <div className="search__container">

        <h1 className="search__title">
          Tìm Và Đặt Chỗ Bãi Đỗ Xe Nhanh Chóng
        </h1>

        <p className="search__desc">
          Hệ thống giúp bạn tìm kiếm bãi đỗ xe gần nhất và đặt chỗ trước
          chỉ trong vài giây.
        </p>

        <div className="search__searchArea">
          <input
            className="search__input"
            type="text"
            placeholder="Nhập khu vực cần tìm bãi đỗ..."
          />

          <button className="search__button">
            Tìm Bãi Đỗ
          </button>
        </div>

      </div>
    </section>
  );
}

export default HomeSearch;