import { DeviceInfo } from "./otp-request";

export interface MemberRequest {
    idProcess: string;
    idRing:string;
    deviceInfo: DeviceInfo;
}