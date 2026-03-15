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
            delay: 3500,
            disableOnInteraction: false
     }}
      >
        <SwiperSlide>
          <img src="https://files01.danhgiaxe.com/4lPPFGtmzBYcXg_2n9D9ifq4Q-I=/fit-in/1280x0/20200630/1555686704-111926.jpg" alt="banner1" />
        </SwiperSlide>

        <SwiperSlide>
          <img src="https://files01.danhgiaxe.com/6fftyld2MvaJGbK_dStLtLiowC8=/fit-in/1280x0/20200630/smart-parking-system-poxo-110808.jpg" alt="banner2" />
        </SwiperSlide>

        <SwiperSlide>
          <img src="https://files01.danhgiaxe.com/eZC3LK69lthdb4tFYoiIx_q58oc=/fit-in/1280x0/20200630/a170828_full-111858.jpg" alt="banner3" />
        </SwiperSlide>

        <SwiperSlide>
          <img src="https://files01.danhgiaxe.com/7UdqcMrPp3U1sVTyM6ExJBumgCE=/fit-in/1280x0/20200630/maxresdefault-112421.jpg" alt="banner4" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default BannerCarousel;