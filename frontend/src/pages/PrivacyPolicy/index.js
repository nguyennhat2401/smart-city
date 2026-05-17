import BookTicketForm from "../../components/BookTicketForm/BookTicketForm";
import "./PrivacyPolicy.scss";

function PrivacyPolicy() {
  return (
    <div className="privacy">
      <div className="privacy__container">

        <div className="privacy__content">
          <h1 className="privacy__title">Chính Sách Bảo Mật</h1>

          <h2>1. Phạm vi thu thập thông tin</h2>
          <p>
            Việc cung cấp thông tin cá nhân của người dùng được thực hiện trực tiếp
            trên website trong quá trình đăng ký tài khoản hoặc khi sử dụng các
            dịch vụ đặt chỗ bãi đỗ xe. Hệ thống có thể sử dụng cookies hoặc các
            công nghệ tương tự để ghi nhận thông tin khi trình duyệt của người
            dùng truy cập vào website.
          </p>

          <p>
            Các thông tin thu thập có thể bao gồm: họ tên, ngày sinh, địa chỉ,
            số điện thoại, email, thông tin đăng nhập tài khoản và các thông tin
            liên quan đến việc đặt chỗ bãi đỗ xe.
          </p>

          <h2>2. Mục đích thu thập thông tin</h2>
          <p>Thông tin cá nhân được thu thập nhằm các mục đích:</p>

          <ul>
            <li>Tạo và quản lý tài khoản người dùng.</li>
            <li>Thực hiện dịch vụ đặt chỗ bãi đỗ xe.</li>
            <li>Hỗ trợ chăm sóc khách hàng và xử lý khiếu nại.</li>
            <li>Cải thiện trải nghiệm người dùng và cá nhân hóa dịch vụ.</li>
            <li>Đảm bảo an ninh hệ thống và ngăn chặn hành vi gian lận.</li>
            <li>Tuân thủ các yêu cầu của cơ quan nhà nước theo quy định pháp luật.</li>
          </ul>

          <h2>3. Nguyên tắc thu thập và quản lý thông tin</h2>
          <p>
            Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của người dùng
            theo các quy định của pháp luật về bảo vệ dữ liệu cá nhân. Việc thu
            thập và sử dụng thông tin chỉ được thực hiện khi có sự đồng ý của
            người dùng, trừ những trường hợp pháp luật có quy định khác.
          </p>

          <p>
            Thông tin cá nhân của người dùng được lưu trữ trên hệ thống và chỉ
            những nhân viên hoặc đối tác liên quan đến việc cung cấp dịch vụ
            mới được phép truy cập với mục đích phục vụ người dùng.
          </p>

          <h2>4. Trách nhiệm của người dùng</h2>
          <p>
            Người dùng có trách nhiệm đảm bảo thông tin cung cấp là chính xác,
            đầy đủ và luôn được cập nhật. Đồng thời phải bảo mật thông tin tài
            khoản, mật khẩu và thông báo ngay cho hệ thống nếu phát hiện có
            hành vi truy cập trái phép.
          </p>

          <h2>5. Phạm vi sử dụng thông tin</h2>
          <p>Thông tin cá nhân của người dùng được sử dụng để:</p>

          <ul>
            <li>Xác nhận và xử lý các yêu cầu đặt chỗ bãi đỗ xe.</li>
            <li>Liên hệ với người dùng khi cần thiết.</li>
            <li>Gửi thông báo về dịch vụ hoặc cập nhật hệ thống.</li>
            <li>Phân tích dữ liệu nhằm nâng cao chất lượng dịch vụ.</li>
          </ul>

          <h2>6. Thời gian lưu trữ thông tin</h2>
          <p>
            Thông tin cá nhân của người dùng sẽ được lưu trữ cho đến khi người
            dùng yêu cầu xóa hoặc hủy tài khoản. Trong mọi trường hợp, dữ liệu
            sẽ được bảo mật và lưu trữ theo quy định của pháp luật hiện hành.
          </p>

          <h2>7. Chia sẻ thông tin</h2>
          <p>
            Chúng tôi không bán hoặc trao đổi thông tin cá nhân của người dùng
            cho bên thứ ba. Thông tin chỉ được chia sẻ trong các trường hợp:
          </p>

          <ul>
            <li>Nhân viên hệ thống cần truy cập để cung cấp dịch vụ.</li>
            <li>Đối tác liên quan đến giao dịch đặt chỗ.</li>
            <li>Nhà cung cấp dịch vụ thanh toán hoặc hệ thống kỹ thuật.</li>
            <li>Yêu cầu từ cơ quan nhà nước có thẩm quyền.</li>
          </ul>

          <h2>8. Quyền truy cập và chỉnh sửa thông tin</h2>
          <p>
            Người dùng có quyền kiểm tra, cập nhật hoặc yêu cầu xóa thông tin
            cá nhân của mình thông qua tài khoản trên hệ thống hoặc bằng cách
            liên hệ với bộ phận hỗ trợ khách hàng.
          </p>

          <h2>9. Thông tin liên hệ</h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên
            hệ với chúng tôi qua:
          </p>

          <p>
            Email: support@parkingbooking.vn <br />
            Hotline: 1900 0000
          </p>

          <h2>10. Thông báo và thay đổi</h2>
          <p>
            Chính sách bảo mật có thể được cập nhật theo thời gian nhằm phù hợp
            với các quy định pháp luật và sự phát triển của hệ thống. Người dùng
            nên thường xuyên kiểm tra trang này để cập nhật các thay đổi mới
            nhất.
          </p>

        </div>

        <div className="privacy__form">
          <BookTicketForm />
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicy;