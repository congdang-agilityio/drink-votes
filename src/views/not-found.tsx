import { Layout } from './layout.js';

export function NotFound() {
  return (
    <Layout title="Không tìm thấy trang">
      <h1>Không tìm thấy trang</h1>
      <p>
        <a href="/">Về trang chủ</a>
      </p>
    </Layout>
  );
}
