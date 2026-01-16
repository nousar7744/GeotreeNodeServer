import crypto from "crypto";
import axios from "axios";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const BASE_URL = process.env.PHONEPE_BASE_URL;

function createChecksum(payloadBase64, apiPath) {
  const stringToSign = payloadBase64 + apiPath + SALT_KEY;
  const hash = crypto.createHash("sha256").update(stringToSign).digest("hex");
  return `${hash}###${SALT_INDEX}`;
}

export const createPhonePePayment = async ({ amount, userId }) => {
  const merchantTransactionId = `TXN_${Date.now()}`;

  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId,
    merchantUserId: userId,
    amount: amount * 100,
    redirectUrl: "https://webhook.site/redirect-url",
    redirectMode: "POST",
    callbackUrl: "https://webhook.site/redirect-url",
    paymentInstrument: {
      type: "UPI_INTENT"
    }
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const apiPath = "/pg/v1/pay";
  const checksum = createChecksum(payloadBase64, apiPath);

  const response = await axios.post(
    BASE_URL + apiPath,
    { request: payloadBase64 },
    {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": MERCHANT_ID
      }
    }
  );

  return {
    body: payloadBase64,
    checksum,
    callbackUrl: "yourapp://phonepe",
    phonepeResponse: response.data
  };
};
