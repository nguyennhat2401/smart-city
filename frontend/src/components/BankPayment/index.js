import "./BankPayment.scss";

function BankPayment({ amount, content }) {

    const bankCode = "970422";
    const accountNumber = "9699693979";
    const accountName = "NGUYEN TIEN PHAT";

    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        alert("Đã copy nội dung chuyển khoản!");
    };

    return (
        <div className="bank">

            <h3 className="bank__title">Thanh toán chuyển khoản</h3>

            <div className="bank__qr">
                <img src={qrUrl} alt="QR chuyển khoản" />
            </div>

            <div className="bank__info">
                <p><b>Ngân hàng:</b> MB Bank</p>
                <p><b>Số TK:</b> {accountNumber}</p>
                <p><b>Chủ TK:</b> {accountName}</p>
                <p><b>Số tiền:</b> {amount.toLocaleString()} đ</p>
                <p>
                    <b>Nội dung:</b> {content} 
                    <button onClick={handleCopy}>Copy</button>
                </p>
            </div>

        </div>
    );
}

export default BankPayment;