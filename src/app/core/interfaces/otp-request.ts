export interface OtpRequest {
    idProcess: string;
    cellPhoneNumber: string;
    indicative: string;
    otp?: string;
    deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
    ip: string;
    mobile: string;
    mac: string;
}