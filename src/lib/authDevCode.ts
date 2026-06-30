import type { SendCodeResponse } from './api'

export function applySendCodeResponse(
  email: string,
  response: SendCodeResponse,
): { info: string; devCode: string | null } {
  const base = `Verification code sent to ${email}. Expires in ${response.expiresInMinutes} minutes.`

  if (response.devCode) {
    return {
      info: `${base} Development mode: use the code shown below if email did not arrive.`,
      devCode: response.devCode,
    }
  }

  return {
    info: `${base} Check your inbox.`,
    devCode: null,
  }
}
