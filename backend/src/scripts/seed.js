import pool from '../config/db.config.js';
import dotenv from 'dotenv';

dotenv.config();

async function upsertShipping(name, description, cost, estimated_days, is_active = 1) {
  const [rows] = await pool.execute('SELECT shipping_id FROM shipping_methods WHERE name = ?', [name]);
  if (rows.length === 0) {
    await pool.execute(
      'INSERT INTO shipping_methods (name, description, cost, estimated_days, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, description, cost, estimated_days, is_active]
    );
    console.log(`Inserted shipping method: ${name}`);
  } else {
    await pool.execute(
      'UPDATE shipping_methods SET description = ?, cost = ?, estimated_days = ?, is_active = ? WHERE name = ?',
      [description, cost, estimated_days, is_active, name]
    );
    console.log(`Updated shipping method: ${name}`);
  }
}

async function upsertPayment(name, description, is_active = 1) {
  const [rows] = await pool.execute('SELECT payment_id FROM payment_methods WHERE name = ?', [name]);
  if (rows.length === 0) {
    await pool.execute(
      'INSERT INTO payment_methods (name, description, is_active) VALUES (?, ?, ?)',
      [name, description, is_active]
    );
    console.log(`Inserted payment method: ${name}`);
  } else {
    await pool.execute(
      'UPDATE payment_methods SET description = ?, is_active = ? WHERE name = ?',
      [description, is_active, name]
    );
    console.log(`Updated payment method: ${name}`);
  }
}

async function main() {
  try {
    console.log('Seeding shipping_methods and payment_methods...');

    // Shipping methods
    await upsertShipping('Giao hàng tiêu chuẩn', 'Dự kiến 2-4 ngày làm việc', 30000, 3, 1);
    await upsertShipping('Giao hàng nhanh', 'Dự kiến 1-2 ngày làm việc', 60000, 2, 1);
    await upsertShipping('Giao hàng trong ngày', 'Áp dụng nội thành, đặt trước 11h', 100000, 1, 1);

    // Payment methods
    await upsertPayment('Thanh toán khi nhận hàng', 'COD - trả tiền mặt khi nhận hàng', 1);
    await upsertPayment('Chuyển khoản ngân hàng', 'Thanh toán qua chuyển khoản', 1);
    await upsertPayment('VNPay', 'Thanh toán qua cổng VNPay (sandbox)', 1);
    await upsertPayment('MoMo', 'Thanh toán ví MoMo (sandbox)', 1);

    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
