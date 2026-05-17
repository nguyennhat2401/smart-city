import BookTicketForm from "../../components/BookTicketForm/BookTicketForm";
import "./AboutUs.scss";

function AboutUs() {
return ( 

    <>
        <div className="about-container">
            <div className="about"> <h1>Về Chúng Tôi</h1>
                <p>
                    Hệ thống đặt chỗ giữ xe trực tuyến của chúng tôi được xây dựng nhằm giúp
                    người dùng tìm kiếm và đặt chỗ đỗ xe nhanh chóng, thuận tiện và tiết
                    kiệm thời gian. Với mục tiêu mang lại trải nghiệm tốt nhất cho người
                    dùng, nền tảng cho phép bạn dễ dàng tìm các bãi giữ xe gần vị trí của
                    mình, kiểm tra số chỗ còn trống và đặt chỗ chỉ trong vài bước đơn giản.
                </p>

                <p>
                    Hệ thống hiện đang kết nối với nhiều bãi giữ xe tại các khu vực trung
                    tâm, trung tâm thương mại, khu văn phòng và các địa điểm đông đúc.
                    Người dùng có thể xem thông tin chi tiết về bãi xe như vị trí, giá giữ
                    xe, số chỗ còn trống và thời gian hoạt động trước khi đặt chỗ.
                </p>

                <p>
                    Ngoài việc đặt chỗ trước, nền tảng còn cung cấp nhiều tiện ích như quản
                    lý lịch sử đặt chỗ, nhận thông báo khi bãi xe sắp đầy và hỗ trợ tìm
                    đường đến bãi xe nhanh chóng. Điều này giúp người dùng chủ động hơn
                    trong việc di chuyển và hạn chế tình trạng mất thời gian tìm chỗ đỗ xe.
                </p>

                <p>
                    Chúng tôi luôn nỗ lực cải thiện hệ thống để mang lại dịch vụ tiện lợi,
                    an toàn và đáng tin cậy cho người dùng. Trong tương lai, hệ thống sẽ
                    tiếp tục mở rộng thêm nhiều bãi giữ xe và tích hợp thêm các tính năng
                    thông minh để nâng cao trải nghiệm của khách hàng.
                </p>
            </div> 

            <div className="FormBookticket"><BookTicketForm/></div>
        </div>
    </>

);
}

export default AboutUs;
