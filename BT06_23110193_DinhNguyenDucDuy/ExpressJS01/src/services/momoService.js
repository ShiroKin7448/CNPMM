import crypto from "crypto";

const MOMO_CREATE_PATH = "/v2/gateway/api/create";
const MOMO_QUERY_PATH = "/v2/gateway/api/query";
const MOMO_REFUND_PATH = "/v2/gateway/api/refund";

const getConfig = () => ({
  endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn",
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
  secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  requestType: "captureWallet",
  redirectUrl: process.env.MOMO_REDIRECT_URL || `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/momo-return`,
  ipnUrl: process.env.MOMO_IPN_URL || `${process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 8080}`}/v1/api/momo/ipn`,
});

const sign = (rawSignature, secretKey = getConfig().secretKey) =>
  crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

const postJson = async (path, payload) => {
  const config = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${config.endpoint}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timeout);
  }
};

export const createMomoPayment = async ({ orderCode, amount, orderInfo, items, shippingAddress }) => {
  const config = getConfig();
  const requestId = `${orderCode}RQ`;
  const orderId = orderCode;
  const extraData = Buffer.from(JSON.stringify({ orderCode })).toString("base64");

  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${config.ipnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${config.partnerCode}`,
    `redirectUrl=${config.redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${config.requestType}`,
  ].join("&");

  const payload = {
    partnerCode: config.partnerCode,
    partnerName: "LaptopStore BT06",
    storeId: "LaptopStoreBT06",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: config.redirectUrl,
    ipnUrl: config.ipnUrl,
    requestType: config.requestType,
    extraData,
    items,
    deliveryInfo: {
      deliveryAddress: shippingAddress.address,
      deliveryFee: shippingAddress.shippingFee?.toString() || "0",
      quantity: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0).toString(),
    },
    userInfo: {
      name: shippingAddress.fullName,
      phoneNumber: shippingAddress.phone,
    },
    lang: "vi",
    autoCapture: true,
    signature: sign(rawSignature, config.secretKey),
  };

  return postJson(MOMO_CREATE_PATH, payload);
};

export const verifyMomoResultSignature = (payload = {}) => {
  const config = getConfig();
  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${payload.amount ?? ""}`,
    `extraData=${payload.extraData ?? ""}`,
    `message=${payload.message ?? ""}`,
    `orderId=${payload.orderId ?? ""}`,
    `orderInfo=${payload.orderInfo ?? ""}`,
    `orderType=${payload.orderType ?? ""}`,
    `partnerCode=${payload.partnerCode ?? ""}`,
    `payType=${payload.payType ?? ""}`,
    `requestId=${payload.requestId ?? ""}`,
    `responseTime=${payload.responseTime ?? ""}`,
    `resultCode=${payload.resultCode ?? ""}`,
    `transId=${payload.transId ?? ""}`,
  ].join("&");

  return sign(rawSignature, config.secretKey) === payload.signature;
};

export const queryMomoPayment = async ({ momoOrderId, requestId }) => {
  const config = getConfig();
  const queryRequestId = `${requestId || momoOrderId}Q${Date.now()}`;
  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `orderId=${momoOrderId}`,
    `partnerCode=${config.partnerCode}`,
    `requestId=${queryRequestId}`,
  ].join("&");

  return postJson(MOMO_QUERY_PATH, {
    partnerCode: config.partnerCode,
    requestId: queryRequestId,
    orderId: momoOrderId,
    lang: "vi",
    signature: sign(rawSignature, config.secretKey),
  });
};

export const refundMomoPayment = async ({ orderCode, amount, transId, description }) => {
  const config = getConfig();
  const orderId = `${orderCode}RF${Date.now()}`;
  const requestId = `${orderCode}RR${Date.now()}`;
  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${amount}`,
    `description=${description}`,
    `orderId=${orderId}`,
    `partnerCode=${config.partnerCode}`,
    `requestId=${requestId}`,
    `transId=${transId}`,
  ].join("&");

  const result = await postJson(MOMO_REFUND_PATH, {
    partnerCode: config.partnerCode,
    orderId,
    requestId,
    amount,
    transId,
    lang: "vi",
    description,
    signature: sign(rawSignature, config.secretKey),
  });

  return { ...result, orderId, requestId };
};

export const momoConfigForClient = () => {
  const config = getConfig();
  return {
    partnerCode: config.partnerCode,
    endpoint: config.endpoint,
    redirectUrl: config.redirectUrl,
    ipnUrl: config.ipnUrl,
  };
};
