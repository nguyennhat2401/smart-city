import BookTicketForm from "../../components/BookTicketForm/BookTicketForm";
import "./TermsOfUse.scss";

function TermsOfUse() {
  return (
    <div className="terms">
      <div className="terms__container">

        <div className="terms__content">
          <h1 className="terms__title">Thỏa Thuận Sử Dụng</h1>

          <p>
            Chào mừng bạn đến với hệ thống đặt chỗ bãi giữ xe trực tuyến của
            chúng tôi. Khi sử dụng website và các dịch vụ liên quan, bạn đồng ý
            tuân thủ các điều khoản sử dụng được quy định dưới đây. Vui lòng đọc
            kỹ các điều khoản trước khi tiếp tục sử dụng dịch vụ.
          </p>

          <h2>1. Bản quyền</h2>
          <p>
            Tất cả nội dung hiển thị trên website như văn bản, hình ảnh, logo,
            biểu tượng và phần mềm đều thuộc quyền sở hữu của hệ thống hoặc các
            đối tác cung cấp nội dung. Những nội dung này được bảo vệ bởi luật
            sở hữu trí tuệ và không được sao chép, phân phối hoặc sử dụng cho
            mục đích thương mại khi chưa có sự cho phép.
          </p>

          <h2>2. Quyền truy cập</h2>
          <p>
            Người dùng có quyền truy cập và sử dụng các dịch vụ đặt chỗ bãi giữ
            xe với điều kiện tuân thủ các điều khoản sử dụng. Việc sử dụng hệ
            thống cho mục đích thương mại, khai thác dữ liệu hoặc sao chép nội
            dung mà không được cho phép là không hợp lệ.
          </p>

          <h2>3. Tài khoản của bạn</h2>
          <p>
            Khi đăng ký tài khoản, bạn có trách nhiệm bảo mật thông tin đăng
            nhập của mình và chịu trách nhiệm cho mọi hoạt động phát sinh từ tài
            khoản đó. Hệ thống có quyền tạm khóa hoặc hủy tài khoản nếu phát
            hiện vi phạm các quy định sử dụng.
          </p>

          <h2>4. Nội dung và bình luận</h2>
          <p>
            Người dùng có thể gửi phản hồi, đánh giá hoặc góp ý về dịch vụ.
            Những nội dung đăng tải không được chứa thông tin vi phạm pháp
            luật, xúc phạm cá nhân hoặc tổ chức, hoặc gây ảnh hưởng tiêu cực
            đến cộng đồng người dùng.
          </p>

          <h2>5. Thông tin bãi giữ xe</h2>
          <p>
            Hệ thống luôn cố gắng cung cấp thông tin chính xác về vị trí, số
            chỗ trống và mức giá của các bãi giữ xe. Tuy nhiên, trong một số
            trường hợp thông tin có thể thay đổi do tình trạng thực tế tại bãi
            xe.
          </p>

          <h2>6. Giá dịch vụ</h2>
          <p>
            Mức giá hiển thị trên hệ thống là giá tham khảo tại thời điểm
            đặt chỗ. Giá dịch vụ có thể thay đổi tùy theo thời gian, loại
            phương tiện hoặc quy định của từng bãi giữ xe.
          </p>

          <h2>7. Tình trạng chỗ đỗ xe</h2>
          <p>
            Chỗ đỗ xe chỉ được xác nhận sau khi người dùng hoàn tất quá trình
            đặt chỗ. Trong trường hợp bãi xe đã hết chỗ do các yếu tố ngoài
            hệ thống kiểm soát, chúng tôi sẽ hỗ trợ người dùng tìm bãi xe
            thay thế nếu có thể.
          </p>

          <h2>8. Trách nhiệm pháp lý</h2>
          <p>
            Các dịch vụ và thông tin trên website được cung cấp nhằm hỗ trợ
            người dùng tìm và đặt chỗ giữ xe. Chúng tôi không chịu trách nhiệm
            đối với những thiệt hại phát sinh do sự cố kỹ thuật, lỗi hệ thống
            hoặc các yếu tố khách quan khác.
          </p>

          <h2>9. Bảo mật thông tin</h2>
          <p>
            Chúng tôi cam kết bảo vệ thông tin cá nhân của người dùng và chỉ sử
            dụng dữ liệu cho mục đích cải thiện dịch vụ, nâng cao trải nghiệm
            người dùng và phát triển các tính năng mới của hệ thống.
          </p>
        </div>

        <div className="terms__form">
          <BookTicketForm />
        </div>

      </div>
    </div>
  );
}

export default TermsOfUse;