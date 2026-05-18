import React from "react";
import { Card, Header } from "../components/UI";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tư vấn Sinh viên HCMUTE
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Nền tảng tư vấn hướng nghiệp chuyên nghiệp cho sinh viên HCMUTE
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/login"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Đăng nhập
            </a>
            <a
              href="/register"
              className="bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 border-2 border-white"
            >
              Đăng ký
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <Header
          title="Các tính năng chính"
          subtitle="Những gì chúng tôi cung cấp cho bạn"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-2">
                Tư vấn Hướng Nghiệp
              </h3>
              <p className="text-gray-600">
                Nhận những lời khuyên từ các chuyên gia và người thành công
                trong ngành.
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">Kết Nối Việc Làm</h3>
              <p className="text-gray-600">
                Tìm kiếm cơ hội việc làm từ các công ty hàng đầu.
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Tài Liệu Học Tập</h3>
              <p className="text-gray-600">
                Truy cập hàng ngàn tài liệu và khóa học từ các chuyên gia.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">5000+</div>
              <p className="text-gray-600 mt-2">Sinh viên</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">500+</div>
              <p className="text-gray-600 mt-2">Công ty</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">1000+</div>
              <p className="text-gray-600 mt-2">Vị trí tuyển dụng</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">100%</div>
              <p className="text-gray-600 mt-2">Hài lòng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
