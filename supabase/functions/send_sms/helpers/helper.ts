import * as base64 from "https://denopkg.com/chiefbiiko/base64/mod.ts";
import { Sms } from "../types/interface.ts";

export class TwilioSms {
  private authorizationHeader: string;

  constructor(private accountSID: string, authToken: string) {
    this.authorizationHeader =
      "Basic " +
      base64.fromUint8Array(
        new TextEncoder().encode(accountSID + ":" + authToken)
      );
  }
  async sendSms(payload: Sms): Promise<any> {
    const formData = new URLSearchParams();
    
    // Add basic SMS parameters
    formData.append('To', payload.To);
    formData.append('From', payload.From);
    formData.append('Body', payload.Body);
    
    // Add MediaUrl parameters if present
    if (payload.mediaUrl) {
      payload.mediaUrl.forEach((url) => {
        formData.append('MediaUrl', url);
      });
    }

    const res = await fetch(
      "https://api.twilio.com/2010-04-01/Accounts/" +
        this.accountSID +
        "/Messages.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Authorization: this.authorizationHeader,
        },
        body: formData.toString(),
      }
    );
    const data = await res.json();
    return data;
  }
}
