export default function WarrantyPolicy() {
  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>CHÍNH SÁCH BẢO HÀNH</h1>

      <section style={section}>
        <h2>Chính Sách Bảo Hành của Shop Hoa Tươi Góc Hoa Xinh</h2>
        <p>
          Chào mừng quý khách đến với shop hoa tươi của chúng tôi. Chúng tôi cam kết mang đến cho quý khách những sản phẩm và dịch vụ chất lượng cao nhất. 
          Dưới đây là chính sách bảo hành chi tiết của chúng tôi:
        </p>
      </section>

      <section style={section}>
        <h3>1. Đối Tượng Áp Dụng</h3>
        <p>
          Chính sách bảo hành này áp dụng cho tất cả các sản phẩm hoa tươi được mua tại shop hoa của chúng tôi, bao gồm cả các đơn hàng online và trực tiếp tại cửa hàng.
        </p>
      </section>

      <section style={section}>
        <h3>2. Thời Gian Bảo Hành</h3>
        <ul>
          <li><b>Hoa tươi:</b> Bảo hành trong vòng 12 giờ kể từ khi khách hàng nhận được sản phẩm.</li>
          <li><b>Hoa sáp:</b> Bảo hành trong vòng 24 giờ kể từ khi khách hàng nhận được sản phẩm.</li>
          <li><b>Phụ kiện kèm theo (nếu có):</b> Bảo hành trong vòng 48 giờ kể từ khi khách hàng nhận được sản phẩm.</li>
        </ul>
      </section>

      <section style={section}>
        <h3>3. Điều Kiện Bảo Hành</h3>
        <p>Chúng tôi sẽ chấp nhận bảo hành trong các trường hợp sau:</p>
        <ul>
          <li>Hoa bị héo, dập nát hoặc không đúng với yêu cầu đặt hàng ban đầu.</li>
          <li>Sản phẩm bị lỗi do quá trình vận chuyển hoặc bảo quản không đúng cách từ phía shop.</li>
          <li>Khách hàng cung cấp đầy đủ thông tin và bằng chứng về tình trạng sản phẩm cần bảo hành (hình ảnh, video, hóa đơn mua hàng).</li>
        </ul>
      </section>

      <section style={section}>
        <h3>4. Quy Trình Bảo Hành</h3>
        <ol>
          <li><b>Bước 1 - Liên hệ:</b> Vui lòng liên hệ với shop qua hotline <b>086 277 5939</b> hoặc email <b>gochoaxinh@gmail.com</b> trong thời gian quy định để thông báo về tình trạng sản phẩm.</li>
          <li><b>Bước 2 - Cung cấp thông tin:</b> Gửi hình ảnh, video mô tả tình trạng sản phẩm và hóa đơn mua hàng.</li>
          <li><b>Bước 3 - Xử lý yêu cầu:</b> Chúng tôi kiểm tra và xác nhận tình trạng sản phẩm trong vòng 24 giờ kể từ khi nhận đủ thông tin.</li>
          <li><b>Bước 4 - Giải quyết bảo hành:</b> Tùy tình trạng, chúng tôi sẽ thay thế sản phẩm mới hoặc hoàn tiền cho quý khách.</li>
        </ol>
      </section>

      <section style={section}>
        <h3>5. Chính Sách Đổi Trả</h3>
        <ul>
          <li><b>Đổi sản phẩm:</b> Đổi sản phẩm mới tương đương nếu sản phẩm bị hư hỏng, không đúng yêu cầu đặt hàng.</li>
          <li><b>Hoàn tiền:</b> Trong trường hợp không có sản phẩm thay thế, hoàn lại toàn bộ số tiền đã thanh toán.</li>
        </ul>
      </section>

      <section style={section}>
        <h3>6. Lưu Ý</h3>
        <ul>
          <li>Không áp dụng bảo hành cho trường hợp sản phẩm hư hỏng do lỗi của khách hàng (bảo quản sai cách, sử dụng sai hướng dẫn, v.v.).</li>
          <li>Không chịu trách nhiệm bảo hành cho các sản phẩm hoa tươi đã quá thời gian bảo hành quy định.</li>
        </ul>
      </section>

      <section style={section}>
        <h3>7. Liên Hệ Hỗ Trợ</h3>
        <p>
          Nếu quý khách có bất kỳ câu hỏi hoặc yêu cầu nào liên quan đến chính sách bảo hành, vui lòng liên hệ với chúng tôi qua số hotline <b>086 277 5939</b> hoặc email <b>gochoaxinh@gmail.com</b>. 
          Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ quý khách.
        </p>
      </section>

      <section style={section}>
        <p>
          ------------------------------
          <br/>
          Chúng tôi hy vọng rằng chính sách bảo hành này sẽ giúp quý khách yên tâm khi mua sắm và sử dụng dịch vụ tại shop hoa tươi của chúng tôi. 
          Cảm ơn quý khách đã tin tưởng và ủng hộ!
        </p>
      </section>
    </div>
  );
}

const section = { marginBottom: 20, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 };
