// Middleware giả lập độ trễ mạng (chỉ dùng trong development)
const delay = (ms = 500) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
      setTimeout(next, ms);
    } else {
      next();
    }
  };
};

export default delay;
