export default function ShippingPolicy() {
  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>CHÍNH SÁCH GIAO HÀNG</h1>

      <section style={section}>
        <h2>Chính Sách Giao Hàng của Shop Hoa Tươi tại HCM</h2>
        <p>
          Chào mừng quý khách đến với shop hoa tươi của chúng tôi tại TP. Hồ Chí Minh. Chúng tôi luôn nỗ lực mang đến cho khách hàng những trải nghiệm mua sắm và dịch vụ giao hàng tốt nhất. 
          Dưới đây là chính sách giao hàng chi tiết của chúng tôi:
        </p>
      </section>

      <section style={section}>
        <h3>1. Khu Vực Giao Hàng</h3>
        <p>
          Chúng tôi cung cấp dịch vụ giao hoa tươi tại các quận huyện trên địa bàn TP. Hồ Chí Minh. Đối với các khu vực xa trung tâm, chúng tôi sẽ tính thêm phụ phí vận chuyển dựa trên khoảng cách và thời gian giao hàng.
        </p>
      </section>

      <section style={section}>
        <h3>2. Thời Gian Giao Hàng</h3>
        <ul>
          <li><b>Giao hàng trong ngày:</b> Đối với các đơn hàng được đặt trước, chúng tôi sẽ giao trong vòng 4–6 giờ từ khi nhận đơn.</li>
          <li><b>Giao hàng nhanh:</b> Dịch vụ giao hàng trong vòng 2 giờ sẽ áp dụng cho các khu vực trung tâm.</li>
        </ul>
      </section>

      <section style={section}>
        <h3>3. Phí Vận Chuyển</h3>
        <ul>
          <li><b>Nội thành:</b> 30.000 – 50.000 VNĐ tuỳ theo khu vực giao hàng.</li>
          <li><b>Ngoại thành:</b> 50.000 – 100.000 VNĐ (áp dụng cho dịch vụ giao hàng trong 2 giờ).</li>
        </ul>
      </section>

      <section style={section}>
        <h3>4. Quy Trình Giao Hàng</h3>
        <ol>
          <li><b>Xác nhận đơn hàng:</b> Sau khi đặt hàng, quý khách sẽ nhận được email hoặc tin nhắn xác nhận đơn hàng từ chúng tôi.</li>
          <li><b>Chuẩn bị và giao hàng:</b> Đơn hàng của quý khách sẽ được xử lý, chuẩn bị và giao đến địa chỉ yêu cầu trong thời gian sớm nhất.</li>
          <li><b>Xác nhận giao hàng:</b> Sau khi giao hàng thành công, chúng tôi sẽ gửi thông báo xác nhận qua email hoặc tin nhắn.</li>
        </ol>
      </section>

      <section style={section}>
        <h3>5. Điều Kiện Giao Hàng</h3>
        <ul>
          <li><b>Địa chỉ chính xác:</b> Quý khách vui lòng cung cấp địa chỉ giao hàng chi tiết và chính xác để tránh việc giao hàng trễ hoặc nhầm lẫn.</li>
          <li><b>Số điện thoại liên hệ:</b> Đảm bảo rằng số điện thoại liên lạc của người nhận luôn hoạt động để chúng tôi có thể liên hệ khi cần thiết.</li>
          <li><b>Thời gian nhận hàng:</b> Quý khách nên có mặt tại địa chỉ giao hàng trong khung giờ đã chọn để nhận hoa.</li>
        </ul>
      </section>

      <section style={section}>
        <h3>6. Chính Sách Đổi Trả</h3>
        <ul>
          <li><b>Đổi trả trong vòng 2 giờ:</b> Nếu có bất kỳ vấn đề gì về chất lượng hoa hoặc dịch vụ, quý khách có thể yêu cầu đổi trả trong vòng 2 giờ kể từ khi nhận hàng.</li>
          <li><b>Hoàn tiền:</b> Trong trường hợp không thể đổi sản phẩm, chúng tôi sẽ hoàn lại tiền cho quý khách.</li>
        </ul>
      </section>

      <section style={section}>
        <h3>7. Liên Hệ Hỗ Trợ</h3>
        <p>
          Nếu có bất kỳ câu hỏi hay yêu cầu đặc biệt nào, quý khách vui lòng liên hệ với chúng tôi qua số hotline <b>086 277 5939</b> hoặc email <b>gochoaxinh@gmail.com</b>. 
          Chúng tôi luôn sẵn sàng hỗ trợ quý khách.
        </p>
      </section>

      <section style={section}>
        <p>
          Chúng tôi hy vọng rằng chính sách giao hàng này sẽ giúp quý khách có thêm thông tin và yên tâm khi mua sắm tại shop hoa tươi của chúng tôi. 
          Cảm ơn quý khách đã tin tưởng và ủng hộ!
        </p>
      </section>
    </div>
  );
}

const section = { marginBottom: 20, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 };
