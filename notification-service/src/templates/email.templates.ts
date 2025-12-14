import { mapPaymentMethod } from '../utils/buildOrderEmail.util';

export const buildAccountVerificationEmail = (url: string): string => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
          color: #1f2a44;
        }
        .container {
          max-width: 600px;
          margin: 24px auto;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
        }
        .header {
          font-size: 28px;
          font-weight: 600;
          color: #1f2a44;
          margin-bottom: 16px;
        }
        .text {
          font-size: 16px;
          line-height: 1.5;
          color: #4b5563;
          margin-bottom: 24px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff !important;
          background-color: #3b82f6;
          text-decoration: none;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .footer {
          margin-top: 24px;
          font-size: 12px;
          color: #9ca3af;
        }
        @media (max-width: 600px) {
          .container {
            padding: 20px;
            margin: 16px;
          }
          .header {
            font-size: 24px;
          }
          .button {
            padding: 10px 20px;
            font-size: 14px;
            color: #ffffff !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Verify Your Account</div>
        <p class="text">Thank you for signing up! Click the button below to verify your account and get started.</p>
        <a href="${url}" class="button">Verify Account</a>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Ecommerce NodeJS. All rights reserved.
        </div>
      </div>
    </body>
  </html>
`;
export const buildCodeEmail = (purposeTitle: string, code: string): string => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
          color: #1f2a44;
        }
        .container {
          max-width: 600px;
          margin: 24px auto;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
        }
        .header {
          font-size: 28px;
          font-weight: 600;
          color: #1f2a44;
          margin-bottom: 16px;
        }
        .text {
          font-size: 16px;
          line-height: 1.5;
          color: #4b5563;
          margin-bottom: 24px;
        }
        .code {
          font-size: 28px;
          font-weight: 700;
          color: #1f2a44;
          background-color: #f3f4f6;
          display: inline-block;
          padding: 12px 24px;
          border-radius: 8px;
          letter-spacing: 2px;
          margin: 16px 0;
        }
        .footer {
          margin-top: 24px;
          font-size: 12px;
          color: #9ca3af;
        }
        @media (max-width: 600px) {
          .container {
            padding: 20px;
            margin: 16px;
          }
          .header {
            font-size: 24px;
          }
          .code {
            font-size: 24px;
            padding: 10px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">${purposeTitle}</div>
        <p class="text">Use the code below to ${purposeTitle.toLowerCase()}:</p>
        <div class="code">${code}</div>
        <p class="text">This code will expire soon. If you didn’t request this, please ignore this email.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Ecommerce NodeJS. All rights reserved.
        </div>
      </div>
    </body>
  </html>
`;
export const buildOrderEmail = (
  orderId: string,
  customerName: string,
  customerPhone: string,
  customerEmail: string,
  items: {
    productName: string;
    sku: string;
    quantity: number;
    price: number;
  }[],
  subtotal: number,
  voucherDiscount: number,
  pointsDiscount: number,
  tax: number,
  shippingFee: number,
  total: number,
  shippingAddress: string,
  orderDate: string,
  status: string, // Process in future
  paymentMethod: string
): string => `
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Xác Nhận Đơn Hàng</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      body {
        font-family: 'Inter', sans-serif;
        background-color: #f8f9fa;
        margin: 0;
        padding: 0;
        color: #1a202c;
        line-height: 1.6;
      }
      
      .container {
        max-width: 700px;
        margin: 24px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }
      
      .header {
        background-color: #FF6B35;
        color: white;
        padding: 28px 32px;
        text-align: center;
      }
      
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      
      .header p {
        margin: 8px 0 0;
        font-weight: 400;
        opacity: 0.9;
      }
      
      .content {
        padding: 32px;
      }
      
      .section {
        margin: 24px 0;
        padding-bottom: 24px;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .section:last-child {
        border-bottom: none;
      }
      
      .section-title {
        color: #FF6B35;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
      }
      
      .section-title svg {
        margin-right: 10px;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      
      .info-item {
        margin-bottom: 12px;
      }
      
      .info-label {
        font-size: 14px;
        color: #718096;
        margin-bottom: 4px;
      }
      
      .info-value {
        font-size: 15px;
        font-weight: 500;
        color: #2d3748;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 14px;
      }
      
      th {
        background-color: #f8f9fa;
        text-align: left;
        padding: 12px 16px;
        font-weight: 600;
        color: #4a5568;
        border-bottom: 2px solid #e2e8f0;
      }
      
      td {
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
        color: #4a5568;
      }
      
      .product-name {
        font-weight: 500;
        color: #2d3748;
      }
      
      .product-sku {
        font-size: 13px;
        color: #718096;
      }
      
      .text-right {
        text-align: right;
      }
      
      .text-center {
        text-align: center;
      }
      
      .summary-table {
        width: 100%;
      }
      
      .summary-table td {
        border-bottom: none;
        padding: 8px 0;
      }
      
      .summary-label {
        color: #718096;
      }
      
      .summary-value {
        font-weight: 500;
        color: #2d3748;
      }
      
      .total-row {
        border-top: 1px solid #e2e8f0;
        margin-top: 8px;
        padding-top: 8px;
        font-weight: 700;
        color: #FF6B35;
      }
      
      .discount {
        color: #38a169;
      }
      
      .footer {
        background-color: #f8f9fa;
        padding: 24px 32px;
        text-align: center;
        color: #718096;
        font-size: 14px;
      }
      
      .footer a {
        color: #FF6B35;
        text-decoration: none;
      }
      
      .status-badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 50px;
        font-size: 13px;
        font-weight: 600;
        background-color: #FF6B35;
        color: white;
      }
      
      .thank-you {
        background-color: #fffaf0;
        border-left: 4px solid #FF6B35;
        padding: 16px;
        border-radius: 0 8px 8px 0;
        margin: 24px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Xác Nhận Đơn Hàng</h1>
        <p>Cảm ơn bạn đã mua hàng tại cửa hàng chúng tôi</p>
      </div>
      
      <div class="content">
        <div class="thank-you">
          <p>Xin chào <strong>${customerName}</strong>, cảm ơn bạn đã đặt hàng!</p>
          <p>Đơn hàng <strong>#${orderId}</strong> đã được tạo vào lúc ${new Date(orderDate).toLocaleString('vi-VN')}.</p>
          <p>Trạng thái: <span class="status-badge">Chờ thanh toán</span></p>
        </div>
        
        <div class="section">
          <div class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21C20 19.1435 19.2625 17.363 17.9497 16.0503C16.637 14.7375 14.8565 14 13 14H11C9.14348 14 7.36301 14.7375 6.05025 16.0503C4.7375 17.363 4 19.1435 4 21" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Thông tin khách hàng
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Họ tên</div>
              <div class="info-value">${customerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Số điện thoại</div>
              <div class="info-value">${customerPhone}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${customerEmail}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phương thức thanh toán</div>
              <div class="info-value">${mapPaymentMethod(paymentMethod)}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11H8C6.89543 11 6 10.1046 6 9V7C6 5.89543 6.89543 5 8 5H16C17.1046 5 18 5.89543 18 7V9C18 10.1046 17.1046 11 16 11Z" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 19H8C6.89543 19 6 18.1046 6 17V15C6 13.8954 6.89543 13 8 13H16C17.1046 13 18 13.8954 18 15V17C18 18.1046 17.1046 19 16 19Z" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 10H4M3 14H4M3 18H4M3 6H4" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Sản phẩm đã đặt
          </div>
            <div>
              ${items
                .map((item) => {
                  const total = item.price * item.quantity;
                  return `
                    <div style="border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; margin-bottom:12px; font-size:14px; color:#4a5568;">
                      <div style="font-weight:600; font-size:15px; color:#2d3748; margin-bottom:6px;">
                        ${item.productName}
                      </div>
                      <div style="margin-bottom:4px;">
                        <span style="color:#718096;">Màu sắc:</span> ${item.sku.split('-')[1]}
                      </div>
                      <div style="margin-bottom:4px;">
                        <span style="color:#718096;">Kích thước:</span> ${item.sku.split('-')[2]}
                      </div>
                      <div style="margin-bottom:4px;">
                        <span style="color:#718096;">Số lượng:</span> ${item.quantity}
                      </div>
                      <div style="margin-bottom:4px;">
                        <span style="color:#718096;">Đơn giá:</span> ${item.price.toLocaleString('vi-VN')}₫
                      </div>
                      <div style="font-weight:600; color:#FF6B35;">
                        Thành tiền: ${total.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
        </div>
        
        <div class="section">
          <div class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19.6224 10.3954C19.9231 10.6773 20.2112 10.9713 20.4861 11.2769C20.5862 11.3888 20.5862 11.6112 20.4861 11.7231C19.9266 12.3565 19.3102 12.9421 18.6426 13.4726C18.5498 13.5458 18.415 13.5363 18.3333 13.45L16.5 11.5C16.5 11.5 15.5 12.5 14 11.5C12.5 10.5 11.5 9.5 11.5 9.5L9.55 7.66667C9.46368 7.58504 9.45417 7.45021 9.52741 7.35745C10.0579 6.68979 10.6435 6.07338 11.2769 5.51386C11.3888 5.41376 11.6112 5.41376 11.7231 5.51386C12.0287 5.78881 12.3227 6.07691 12.6046 6.37765" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.4726 18.6426C12.9421 19.3102 12.3565 19.9266 11.7231 20.4861C11.6112 20.5862 11.3888 20.5862 11.2769 20.4861C10.9713 20.2112 10.6773 19.9231 10.3954 19.6224" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.37765 13.6046C6.07691 13.3227 5.78881 13.0287 5.51386 12.7231C5.41376 12.6112 5.41376 12.3888 5.51386 12.2769C6.07338 11.6435 6.68979 11.0579 7.35745 10.5274C7.45021 10.4542 7.58504 10.4637 7.66667 10.55L9.5 12.5C9.5 12.5 10.5 11.5 12 12.5C13.5 13.5 14.5 14.5 14.5 14.5L16.3333 16.3333C16.4197 16.415 16.4292 16.5498 16.356 16.6426C15.8255 17.3102 15.2399 17.9266 14.6065 18.4861C14.4946 18.5862 14.2722 18.5862 14.1603 18.4861C13.8547 18.2112 13.5607 17.9231 13.2788 17.6224" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22H15C19 22 21 20 21 16V8C21 4 19 2 15 2H9C5 2 3 4 3 8V16C3 20 5 22 9 22Z" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Chi tiết thanh toán
          </div>
          <table class="summary-table">
            <tr>
              <td class="summary-label">Tạm tính:</td>
              <td class="text-right summary-value">${subtotal.toLocaleString('vi-VN')}₫</td>
            </tr>
            <tr>
              <td class="summary-label">Giảm giá voucher:</td>
              <td class="text-right summary-value discount">- ${voucherDiscount.toLocaleString('vi-VN')}₫</td>
            </tr>
            <tr>
              <td class="summary-label">Giảm giá điểm tích lũy:</td>
              <td class="text-right summary-value discount">- ${pointsDiscount.toLocaleString('vi-VN')}₫</td>
            </tr>
            <tr>
              <td class="summary-label">Thuế:</td>
              <td class="text-right summary-value">${tax.toLocaleString('vi-VN')}₫</td>
            </tr>
            <tr>
              <td class="summary-label">Phí vận chuyển:</td>
              <td class="text-right summary-value">${shippingFee.toLocaleString('vi-VN')}₫</td>
            </tr>
            <tr class="total-row">
              <td class="summary-label">Tổng cộng:</td>
              <td class="text-right summary-value">${total.toLocaleString('vi-VN')}₫</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10.8889C21 15.7981 15.375 22 12 22C8.625 22 3 15.7981 3 10.8889C3 5.97969 7.02944 2 12 2C16.9706 2 21 5.97969 21 10.8889Z" stroke="#FF6B35" stroke-width="2"/>
              <path d="M15 11C15 12.6569 13.6569 14 12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11Z" stroke="#FF6B35" stroke-width="2"/>
            </svg>
            Địa chỉ giao hàng
          </div>
          <p>${shippingAddress}</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua <a href="mailto:support@example.com">support@example.com</a></p>
        <p>&copy; ${new Date().getFullYear()} Ecommerce NodeJS. Mọi quyền được bảo lưu.</p>
      </div>
    </div>
  </body>
</html>
`;
