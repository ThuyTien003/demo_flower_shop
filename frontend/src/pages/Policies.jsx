import { Link } from 'react-router-dom';

export default function Policies() {
  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>Chính sách</h1>
      <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <a href="#payment" style={linkBtn}>Hình Thức Thanh Toán</a>
        <a href="#shipping" style={linkBtn}>Chính sách giao hàng</a>
        <a href="#privacy" style={linkBtn}>Chính sách bảo mật thông tin</a>
        <a href="#warranty" style={linkBtn}>Chính sách bảo hành</a>
        <a href="#terms" style={linkBtn}>Điều khoản sử dụng</a>
      </nav>

      <section id="payment" style={sectionStyle}>
        <h2>Hình Thức Thanh Toán</h2>
        <ul>
          <li>Thanh toán khi nhận hàng (COD).</li>
          <li>Chuyển khoản ngân hàng.</li>
          <li>Ví điện tử (MoMo, VNPay) — nếu được hỗ trợ.</li>
        </ul>
      </section>

      <section id="shipping" style={sectionStyle}>
        <h2>Chính sách giao hàng</h2>
        <ul>
          <li>Giao trong ngày tại nội thành (tuỳ khu vực).</li>
          <li>Phí giao hàng hiển thị tại bước thanh toán.</li>
          <li>Trường hợp thời tiết/kẹt xe có thể ảnh hưởng thời gian giao.</li>
        </ul>
      </section>

      <section id="privacy" style={sectionStyle}>
        <h2>Chính sách bảo mật thông tin</h2>
        <p>Chúng tôi cam kết bảo mật thông tin khách hàng theo quy định pháp luật. Dữ liệu chỉ dùng cho mục đích xử lý đơn hàng và chăm sóc khách hàng.</p>
      </section>

      <section id="warranty" style={sectionStyle}>
        <h2>Chính sách bảo hành</h2>
        <ul>
          <li>Hoa tươi là sản phẩm theo mùa, màu sắc/cành lá có thể thay đổi tương đương.</li>
          <li>Nếu sản phẩm không đúng mô tả trên 80% hoặc bị hư hỏng khi nhận, vui lòng liên hệ trong 24h để được hỗ trợ.</li>
        </ul>
      </section>

      <section id="terms" style={sectionStyle}>
        <h2>Điều khoản sử dụng</h2>
        <ul>
          <li>Không sao chép nội dung/hình ảnh khi chưa được cho phép.</li>
          <li>Giá cả có thể thay đổi theo thị trường mà không cần báo trước.</li>
          <li>Đặt hàng là chấp nhận các điều khoản sử dụng hiện hành.</li>
        </ul>
      </section>
    </div>
  );
}

const sectionStyle = { marginBottom: 24, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 };
const linkBtn = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 999, background: '#fff', textDecoration: 'none', color: '#111' };
