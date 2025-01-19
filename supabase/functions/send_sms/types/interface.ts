export interface Sms {
    [index: string]: string | string[];
    From: string;
    To: string;
    Body: string;
    mediaUrl?: string[];
  }
