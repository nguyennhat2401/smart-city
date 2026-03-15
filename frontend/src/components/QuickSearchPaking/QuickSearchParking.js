import { useState } from "react";
import "./QuickSearchParking.scss";

function QuickSearchParking() {

  const [parking, setParking] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSearch = () => {
    if(!parking || !area || !date || !time){
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    console.log({
      parking,
      area,
      date,
      time
    });

    alert("Đang tìm chỗ gửi xe...");
  };

  return (
    <div className="quick-search">

      <div className="quick-search__item">
        <span className="quick-search__number">1</span>
        <select 
          value={parking}
          onChange={(e)=>setParking(e.target.value)}
        >
          <option value="">Chọn bãi xe</option>
          <option value="vincom">Vincom</option>
          <option value="lotte">Lotte</option>
          <option value="airport">Sân bay</option>
        </select>
      </div>

      <div className="quick-search__item">
        <span className="quick-search__number">2</span>
        <select
          value={area}
          onChange={(e)=>setArea(e.target.value)}
        >
          <option value="">Chọn khu vực</option>
          <option value="q1">Quận 1</option>
          <option value="q3">Quận 3</option>
          <option value="q7">Quận 7</option>
        </select>
      </div>

      <div className="quick-search__item">
        <span className="quick-search__number">3</span>
        <input
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
        />
      </div>

      <div className="quick-search__item">
        <span className="quick-search__number">4</span>
        <input
          type="time"
          value={time}
          onChange={(e)=>setTime(e.target.value)}
        />
      </div>

      <button
        className="quick-search__button"
        onClick={handleSearch}
      >
        Tìm chỗ nhanh
      </button>

    </div>
  );
}

export default QuickSearchParking;