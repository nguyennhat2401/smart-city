import BookTicketForm from "../../components/BookTicketForm/BookTicketForm";
import "./OperatingRegulations.scss";

function OperatingRegulations() {
  return (
    <div className="regulation">
      <div className="regulation__container">

        <div className="regulation__content">
          <h1 className="regulation__title">Quy Chế Hoạt Động</h1>

          <p>
            Xin vui lòng đọc kỹ quy chế hoạt động trước khi sử dụng hệ thống
            đặt chỗ bãi giữ xe trực tuyến của chúng tôi. Khi bạn tiếp tục sử
            dụng website, điều đó có nghĩa là bạn đã đồng ý với các điều khoản
            và quy định dưới đây.
          </p>

          <h2>1. Chấp nhận điều khoản</h2>
          <p>
            Khi sử dụng hệ thống đặt chỗ giữ xe, bạn đồng ý tuân thủ các quy
            định do hệ thống đưa ra. Chúng tôi có quyền thay đổi hoặc cập nhật
            các điều khoản nhằm nâng cao chất lượng dịch vụ.
          </p>

          <h2>2. Tài khoản và bảo mật</h2>
          <p>
            Người dùng cần cung cấp thông tin chính xác khi đăng ký tài khoản.
            Bạn có trách nhiệm bảo mật thông tin đăng nhập và không chia sẻ
            cho người khác.
          </p>

          <h2>3. Sự cố hệ thống</h2>
          <p>
            Trong một số trường hợp có thể xảy ra lỗi kỹ thuật, gián đoạn kết
            nối hoặc sự cố ngoài ý muốn. Chúng tôi sẽ cố gắng khắc phục nhanh
            nhất nhưng không chịu trách nhiệm cho các thiệt hại gián tiếp.
          </p>

          <h2>4. Hành vi người dùng</h2>
          <p>
            Người dùng không được đăng tải nội dung vi phạm pháp luật, xúc
            phạm cá nhân hoặc tổ chức. Hệ thống có quyền khóa tài khoản nếu
            phát hiện hành vi vi phạm.
          </p>

          <h2>5. Ngừng cung cấp dịch vụ</h2>
          <p>
            Hệ thống có quyền ngừng cung cấp dịch vụ nếu phát hiện người dùng
            vi phạm quy định, cung cấp thông tin sai lệch hoặc sử dụng dịch vụ
            với mục đích không hợp lệ.
          </p>
        </div>

        <div className="regulation__form">
          <BookTicketForm />
        </div>

      </div>
    </div>
  );
}

export default OperatingRegulations;