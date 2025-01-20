export interface Sms {
    [index: string]: string | string[] | undefined;
    From: string;
    To: string;
    Body: string;
    mediaUrl?: string[];
  }
