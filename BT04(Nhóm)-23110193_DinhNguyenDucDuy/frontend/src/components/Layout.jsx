import React from "react";

export const Header = ({ title, subtitle, backUrl }) => {
  return (
    <div className="mb-8">
      {backUrl && (
        <a
          href={backUrl}
          className="text-primary hover:text-primary-dark mb-4 inline-flex items-center"
        >
          ← Quay lại
        </a>
      )}
      <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Về chúng tôi</h3>
            <p className="text-gray-400">
              Website tư vấn sinh viên HCMUTE hỗ trợ quản lý nội dung, FAQ,
              tìm kiếm và thảo luận cộng đồng.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
            <ul className="text-gray-400 space-y-2">
              <li>
                <a href="/search" className="hover:text-white">
                  Tìm kiếm
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/forum" className="hover:text-white">
                  Forum
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <p className="text-gray-400">Email: info@hcmute.edu.vn</p>
            <p className="text-gray-400">Điện thoại: (028) 3847 0100</p>
          </div>
        </div>
        <hr className="border-gray-700 my-8" />
        <div className="text-center text-gray-400">
          <p>&copy; 2026 HCMUTE. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export const Navbar = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const links = [
    { href: "/search", label: "Tìm kiếm" },
    { href: "/faq", label: "FAQ" },
    ...(user ? [{ href: "/forum", label: "Forum" }] : []),
  ];

  const navLinks = links.map((link) => (
    <a key={link.href} href={link.href} className="text-primary hover:text-primary-dark">
      {link.label}
    </a>
  ));

  const mobileLinks = links.map((link) => (
    <a
      key={link.href}
      href={link.href}
      className="block text-primary hover:text-primary-dark py-2"
    >
      {link.label}
    </a>
  ));

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              HCMUTE
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navLinks}
            {user ? (
              <>
                {user.role === "admin" && (
                  <a href="/admin/cms" className="text-primary hover:text-primary-dark">
                    Admin CMS
                  </a>
                )}
                <a href="/profile" className="text-primary hover:text-primary-dark">
                  Hồ sơ
                </a>
                <button
                  onClick={onLogout}
                  className="bg-danger hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-primary hover:text-primary-dark">
                  Đăng nhập
                </a>
                <a
                  href="/register"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded"
                >
                  Đăng ký
                </a>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 hover:text-primary"
              aria-label="Mở menu"
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {mobileLinks}
            {user ? (
              <>
                {user.role === "admin" && (
                  <a
                    href="/admin/cms"
                    className="block text-primary hover:text-primary-dark py-2"
                  >
                    Admin CMS
                  </a>
                )}
                <a
                  href="/profile"
                  className="block text-primary hover:text-primary-dark py-2"
                >
                  Hồ sơ
                </a>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full text-left text-danger hover:text-red-600 py-2"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="block text-primary hover:text-primary-dark py-2">
                  Đăng nhập
                </a>
                <a
                  href="/register"
                  className="block text-primary hover:text-primary-dark py-2"
                >
                  Đăng ký
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
