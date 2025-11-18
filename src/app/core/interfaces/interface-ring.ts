import { DeviceInfo } from "./otp-request";

export interface Ring {
    id?: string;
    code?: string;
    userId?: string;
    imgts?: string;
    name?: any;
    video?: any;
    status?: boolean;
}

export interface RingRequest {
    idProcess: string;
    ring: Ring;
    deviceInfo: DeviceInfo;
}