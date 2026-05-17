import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./BannerCarousel.scss";
function BannerCarousel() {
  return (
    <div className="banner">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1.2}
        centeredSlides={true}
        spaceBetween={30}
        loop={true}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{
            delay: 3000,
            disableOnInteraction: false
     }}
      >
        <SwiperSlide>
          <img src="https://media.istockphoto.com/id/1311391994/vi/anh/xe-%C4%91%E1%BA%ADu-t%E1%BA%A1i-b%C3%A3i-%C4%91%E1%BA%ADu-xe-c%E1%BB%A7a-s%C3%A2n-bay-cho-thu%C3%AA-nh%C3%ACn-t%E1%BB%AB-tr%C3%AAn-kh%C3%B4ng-b%C3%A3i-%C4%91%E1%BA%ADu-xe-c%E1%BB%A7a-s%C3%A2n-bay-s%E1%BB%AD-d%E1%BB%A5ng-xe.jpg?s=612x612&w=0&k=20&c=JrTc_M8OOk6uANfa13q-YxLClpDezsT3QKBzOi8Id3o=" alt="banner1" />
        </SwiperSlide>

        <SwiperSlide>
          <img src="https://media.istockphoto.com/id/488094386/vi/anh/b%C3%A3i-%C4%91%E1%BA%ADu-xe-ngo%C3%A0i-tr%E1%BB%9Di.jpg?s=612x612&w=0&k=20&c=pRnCmG_4HI4X53egT-t-KJoaI-BTl0nQqnN2QRt7rqw=" alt="banner2" />
        </SwiperSlide>

        <SwiperSlide>
          <img src="https://media.istockphoto.com/id/2224569357/vi/anh/b%C3%A3i-%C4%91%E1%BA%ADu-xe-tr%E1%BB%91ng.jpg?s=612x612&w=0&k=20&c=N8K0hpAHC3Ny3wTmGUvvgeQU6NoO7j943NE2rAzV0H8=" alt="banner3" />
        </SwiperSlide>

        <SwiperSlide>
          <img src="https://media.istockphoto.com/id/1203982839/vi/anh/b%C3%A3i-%C4%91%E1%BA%ADu-xe-%C3%B4-t%C3%B4-tr%C3%AAn-t%E1%BA%A7m-nh%C3%ACn-tr%C3%AAn-kh%C3%B4ng-nh%E1%BB%B1a-%C4%91%C6%B0%E1%BB%9Dng.jpg?s=612x612&w=0&k=20&c=PohbnLAPyINrMkXuaWYrrencL_Ch1ap4flwn2zTeUMA=" alt="banner4" />
        </SwiperSlide>

        <SwiperSlide>
          <img src="https://media.istockphoto.com/id/2242532962/vi/anh/nh%C3%ACn-t%E1%BB%AB-tr%C3%AAn-xu%E1%BB%91ng-xe-%C3%B4-t%C3%B4-%C4%91%E1%BB%97-t%E1%BA%A1i-b%C3%A3i-%C4%91%E1%BA%ADu-xe-b%C3%AA-t%C3%B4ng.jpg?s=612x612&w=0&k=20&c=gXzvocFgsMa0H8DEi1pBAGCRJb20jwzZ3A40Pl4K1aY=" alt="banner4" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default BannerCarousel;