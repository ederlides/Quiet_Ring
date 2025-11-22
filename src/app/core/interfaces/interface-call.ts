import { DeviceInfo } from "./otp-request";

export interface IDataCall {
  id: number;
  type: string;
  name: string;
  date: string;
  src: string;
}
export interface ICallRegister {
  idProcess: string
  deviceInfo: DeviceInfo
  call: ICall
}

export interface ICall {
  date: string
  status: string
  duration: string
  mac: string
  ip: string
  idRing: string
  nameOrigen: string
}
