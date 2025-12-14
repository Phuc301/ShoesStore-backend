export const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.API_GATEWAY_URL}${process.env.GOOGLE_CALLBACK_PATH}`,
};
