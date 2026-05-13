import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";

const ImageSwiper = ({ images = [], productName = "" }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const imgs = images.length > 0 ? images : ["https://via.placeholder.com/600x450?text=No+Image"];

  return (
    <div className="w-full space-y-3">
      {/* Main swiper */}
      <Swiper
        modules={[Navigation, Pagination, Thumbs]}
        navigation
        pagination={{ clickable: true }}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
        loop={imgs.length > 1}
      >
        {imgs.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center">
              <img
                src={img}
                alt={`${productName} - ảnh ${i + 1}`}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails — chỉ hiển thị nếu có nhiều hơn 1 ảnh */}
      {imgs.length > 1 && (
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={Math.min(imgs.length, 5)}
          freeMode
          watchSlidesProgress
          className="thumbnails-swiper"
        >
          {imgs.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-400 transition-all">
                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ImageSwiper;
