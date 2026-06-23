import pkg from "agora-access-token";

const { RtcTokenBuilder, RtcRole } = pkg;

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

export function generateAgoraToken(channelName) {
  
  console.log("CHANNEL:", channelName);
  console.log("APP_ID:", process.env.AGORA_APP_ID);
  console.log("CERT:", process.env.AGORA_APP_CERTIFICATE);

  const uid = 0;
  const role = RtcRole.PUBLISHER;

  const expirationTime = Math.floor(Date.now() / 1000) + 3600;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    expirationTime
  
  );

  return token;
}