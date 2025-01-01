export interface Header {
  key: string;
  value: string;
}

export interface FormDataItem {
  key: string;
  value: string | File;
  type: "text" | "file";
}

export interface QueryParam {
  key: string;
  value: string;
}

export interface ResponseInfo {
  data: any;
  status: number;
  statusText: string;
  time: number;
  contentType: string;
  rawResponse?: Response;
  size?: number;
}
