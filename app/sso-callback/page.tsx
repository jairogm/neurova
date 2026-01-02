import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <>
      <div id="clerk-captcha" />
      <AuthenticateWithRedirectCallback redirectUrl={"/dashboard"}/>
    </>
  );
}
