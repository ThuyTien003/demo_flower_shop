export default function PaymentPolicy() {
  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>HÌNH THỨC THANH TOÁN</h1>

      <section style={section}>
        <h2>Chính Sách Thanh Toán của Shop Hoa Tươi</h2>
        <p>
          Chào mừng quý khách đến với shop hoa tươi của chúng tôi. Chúng tôi cam kết mang đến cho quý khách trải nghiệm mua sắm tiện lợi và an toàn nhất. 
          Dưới đây là các hình thức thanh toán chi tiết mà chúng tôi hiện đang áp dụng:
        </p>
      </section>

      <section style={section}>
        <h3>1. Thanh Toán Khi Nhận Hàng (COD)</h3>
        <p><b>Mô tả:</b> Quý khách có thể chọn hình thức thanh toán khi nhận hàng (COD) để thanh toán trực tiếp cho nhân viên giao hàng khi sản phẩm được giao đến địa chỉ của quý khách.</p>
        <p><b>Phí dịch vụ:</b> Hình thức thanh toán COD có thể phát sinh phí dịch vụ thêm từ 10.000 VNĐ đến 20.000 VNĐ tùy theo khu vực giao hàng.</p>
        <p><b>Lưu ý:</b> Quý khách vui lòng chuẩn bị số tiền chính xác để thanh toán nhằm giúp quá trình giao hàng diễn ra nhanh chóng và thuận lợi.</p>
      </section>

      <section style={section}>
        <h3>2. Chuyển Khoản Ngân Hàng</h3>
        <p><b>Mô tả:</b> Quý khách có thể thanh toán bằng cách chuyển khoản vào tài khoản ngân hàng của chúng tôi trước khi nhận hàng.</p>
        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Thông tin tài khoản ngân hàng</div>
          <ul>
            <li>Ngân hàng: <b>NAM A BANK</b></li>
            <li>Chủ tài khoản: <b>TRẦN THỦY TIÊN</b></li>
            <li>Số tài khoản: <b>720 1225583 00001</b></li>
            <li>Chi nhánh: <b>TÂN BIÊN, TÂY NINH</b></li>
          </ul>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Quy trình thanh toán</div>
          <ol>
            <li>Sau khi đặt hàng, quý khách sẽ nhận được thông tin chi tiết về đơn hàng và tài khoản ngân hàng để chuyển khoản.</li>
            <li>Quý khách tiến hành chuyển khoản theo thông tin đã cung cấp, ghi rõ nội dung chuyển khoản là <i>[Mã đơn hàng hoặc Số điện thoại đặt hàng]</i>.</li>
            <li>Sau khi chuyển khoản thành công, quý khách vui lòng thông báo cho chúng tôi qua hotline <b>0327458490</b> hoặc email <b>gochoaxinh@gmail.com</b> để xác nhận.</li>
            <li>Chúng tôi sẽ kiểm tra và xác nhận thanh toán, sau đó tiến hành giao hàng theo thời gian quy định.</li>
          </ol>
        </div>
      </section>

      <section style={section}>
        <h3>3. Thanh Toán Trực Tuyến Qua Cổng Thanh Toán (Nếu có)</h3>
        <p><b>Mô tả:</b> Chúng tôi đang triển khai tích hợp các cổng thanh toán trực tuyến (như MoMo, ZaloPay, VNPay, v.v.) để tạo điều kiện thuận lợi hơn cho quý khách.</p>
        <p><b>Phí dịch vụ:</b> Không phát sinh phí dịch vụ cho hình thức thanh toán trực tuyến.</p>
        <p><b>Lưu ý:</b> Hình thức này sẽ được cập nhật và thông báo chi tiết khi chính thức áp dụng.</p>
      </section>

      <section style={section}>
        <h3>4. Lưu Ý Chung</h3>
        <ul>
          <li><b>Xác nhận thanh toán:</b> Đơn hàng của quý khách chỉ được xử lý sau khi chúng tôi nhận được xác nhận thanh toán (đối với hình thức chuyển khoản ngân hàng).</li>
          <li><b>Thông tin chính xác:</b> Quý khách vui lòng cung cấp đầy đủ và chính xác các thông tin cần thiết để tránh nhầm lẫn và chậm trễ trong quá trình xử lý đơn hàng.</li>
          <li><b>Bảo mật thông tin:</b> Chúng tôi cam kết bảo mật tuyệt đối các thông tin thanh toán của quý khách và chỉ sử dụng cho mục đích xử lý đơn hàng.</li>
        </ul>
      </section>

      <section style={section}>
        <h3>5. Liên Hệ Hỗ Trợ</h3>
        <p>
          Nếu quý khách có bất kỳ câu hỏi hoặc gặp vấn đề liên quan đến thanh toán, vui lòng liên hệ với chúng tôi qua số hotline <b>0327458490</b> hoặc email <b>gochoaxinh@gmail.com</b>. 
          Chúng tôi luôn sẵn sàng hỗ trợ quý khách.
        </p>
      </section>

      <section style={section}>
        <p>
          -------------------------------------
          <br/>
          Chúng tôi hy vọng rằng các hình thức thanh toán này sẽ giúp quý khách có thêm nhiều sự lựa chọn và yên tâm hơn khi mua sắm tại shop hoa tươi của chúng tôi. 
          Cảm ơn quý khách đã tin tưởng và ủng hộ!
        </p>
      </section>
    </div>
  );
}

const section = { marginBottom: 20, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 };
const card = { background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 12 };
