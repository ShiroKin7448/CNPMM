import { AppstoreOutlined } from "@ant-design/icons";

const AUTH_BACKGROUND =
  "https://images.unsplash.com/photo-1771015310937-6754da25e49a?auto=format&fit=crop&w=1800&q=85";

const AuthLayout = ({ badge = "LaptopStore", title, subtitle, icon, children, footer }) => {
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 flex items-center justify-center bg-black">
      <img
        src={AUTH_BACKGROUND}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(101,101,101,0.68) 50%, rgba(192,255,107,0.36) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(213,213,213,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(213,213,213,0.12) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-5 flex items-center justify-center gap-3 text-white">
          <div className="h-10 w-10 rounded-xl bg-[#C0FF6B] text-black flex items-center justify-center shadow-lg shadow-black/20">
            <AppstoreOutlined />
          </div>
          <div>
            <div className="text-base font-extrabold leading-none">{badge}</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D5D5D5]">
              BT04 23110193
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#D5D5D5]/70 bg-white/95 p-7 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-[#C0FF6B] shadow-lg shadow-black/20">
              {icon}
            </div>
            <h1 className="mb-2 text-2xl font-extrabold leading-tight text-black">{title}</h1>
            {subtitle && <p className="text-sm leading-relaxed text-[#656565]">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="mt-5 text-center">{footer}</div>}
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
