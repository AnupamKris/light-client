import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestUrl } from "@/components/RequestUrl";
import { RequestHeaders } from "@/components/RequestHeaders";
import { QueryParams } from "@/components/QueryParams";
import { RequestBody } from "@/components/RequestBody";
import { ResponseBody } from "@/components/ResponseBody";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Header,
  FormDataItem,
  QueryParam,
  ResponseInfo as ResponseInfoType,
} from "@/types";
import { cn } from "@/lib/utils";

function App() {
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [bodyType, setBodyType] = useState<"json" | "formData">("json");
  const [jsonBody, setJsonBody] = useState("");
  const [formData, setFormData] = useState<FormDataItem[]>([
    { key: "", value: "", type: "text" },
  ]);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { key: "", value: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [response, setResponse] = useState<ResponseInfoType | null>(null);
  const [requestTab, setRequestTab] = useState<"headers" | "params">("headers");
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");
  const [responseFormat, setResponseFormat] = useState<
    "formatted" | "raw" | "preview"
  >("formatted");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  // Parse URL when it changes
  useEffect(() => {
    try {
      const urlObj = new URL(url);
      const params: QueryParam[] = [];
      urlObj.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });
      if (params.length > 0) {
        setQueryParams(params);
        setRequestTab("params");
        setUrl(url.split("?")[0]);
      }
    } catch (error) {
      // Invalid URL, ignore
    }
  }, [url]);

  // Update URL when query params change
  useEffect(() => {
    try {
      if (!url.includes("=")) return;

      const baseUrl = url.split("?")[0];
      const urlObj = new URL(baseUrl);
      queryParams.forEach((param) => {
        if (param.key && param.value) {
          urlObj.searchParams.append(param.key, param.value);
        }
      });
    } catch (error) {
      // Invalid URL, ignore
    }
  }, [queryParams]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Create blob URL for binary responses
  useEffect(() => {
    const createBlobUrl = async () => {
      if (
        response?.rawResponse &&
        (response.contentType.includes("image/") ||
          response.contentType.includes("application/pdf"))
      ) {
        const blob = await response.rawResponse.clone().blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      }
    };

    createBlobUrl();
  }, [response]);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - (startTimeRef.current || 0));
    }, 10);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    startTimer();
    setResponse(null);
    setRequestTab("params");

    try {
      const headerObj: { [key: string]: string } = {};
      headers.forEach((h) => {
        if (h.key && h.value) headerObj[h.key] = h.value;
      });

      let body: any;
      let finalUrl = url;

      if (method === "GET" && queryParams.some((p) => p.key && p.value)) {
        const urlObj = new URL(url);
        queryParams.forEach((param) => {
          if (param.key && param.value) {
            urlObj.searchParams.append(param.key, param.value);
          }
        });
        finalUrl = urlObj.toString();
      }

      if (method === "POST") {
        if (bodyType === "json") {
          body = jsonBody;
          headerObj["Content-Type"] = "application/json";
        } else {
          const formDataObj = new FormData();
          formData.forEach((item) => {
            if (item.key && item.value) {
              formDataObj.append(item.key, item.value);
            }
          });
          body = formDataObj;
        }
      }

      const startTime = Date.now();
      const response = await fetch(finalUrl, {
        method,
        headers: headerObj,
        body: method === "POST" ? body : undefined,
      });

      const contentType = response.headers.get("content-type") || "unknown";
      const timeElapsed = Date.now() - startTime;
      const clonedResponse = response.clone();

      let data: any;
      let size: number | undefined;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else if (contentType.includes("text/html")) {
        data = await response.text();
        size = new Blob([data]).size;
      } else if (contentType.includes("text")) {
        data = await response.text();
        size = new Blob([data]).size;
      } else {
        const blob = await response.blob();
        size = blob.size;
        data = null;
      }

      setResponse({
        data,
        status: response.status,
        statusText: response.statusText,
        time: timeElapsed,
        contentType,
        rawResponse: clonedResponse,
        size,
      });
    } catch (error: any) {
      setResponse({
        data: { error: error.message || "An error occurred" },
        status: 0,
        statusText: "Error",
        time: Date.now() - (startTimeRef.current || 0),
        contentType: "error",
      });
    } finally {
      setIsLoading(false);
      stopTimer();
    }
  };

  const handleDownload = async () => {
    if (!response?.rawResponse) return;

    try {
      const blob = await response.rawResponse.clone().blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `response${getFileExtension(response.contentType)}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const getFileExtension = (contentType: string): string => {
    const types: { [key: string]: string } = {
      "application/json": ".json",
      "text/html": ".html",
      "text/plain": ".txt",
      "text/css": ".css",
      "text/javascript": ".js",
      "application/xml": ".xml",
      "text/xml": ".xml",
      "application/pdf": ".pdf",
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };

    for (const [type, ext] of Object.entries(types)) {
      if (contentType.includes(type)) return ext;
    }
    return ".bin";
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">API Client</h1>
        <ThemeToggle />
      </div>

      {/* URL Bar */}
      <div className="p-4 border-b">
        <RequestUrl
          method={method}
          url={url}
          isLoading={isLoading}
          elapsedTime={elapsedTime}
          onMethodChange={setMethod}
          onUrlChange={setUrl}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Request Pane */}
        <div className="w-1/2 border-r flex flex-col overflow-hidden">
          <Tabs
            value={requestTab}
            onValueChange={(value) =>
              setRequestTab(value as "headers" | "params")
            }
            className="flex-1"
          >
            <TabsList className="border-b bg-background w-full flex justify-start rounded-none h-10">
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger
                value="params"
                className={
                  method === "GET" && queryParams.length > 1
                    ? "animate-pulse bg-accent"
                    : ""
                }
              >
                {method === "GET" ? "Query Params" : "Body"}
              </TabsTrigger>
            </TabsList>

            <div className="p-4 flex-1 overflow-auto">
              <TabsContent value="headers" className="m-0">
                <RequestHeaders
                  headers={headers}
                  onHeadersChange={setHeaders}
                />
              </TabsContent>

              <TabsContent value="params" className="m-0">
                {method === "GET" ? (
                  <QueryParams
                    params={queryParams}
                    onParamsChange={setQueryParams}
                  />
                ) : (
                  <RequestBody
                    bodyType={bodyType}
                    jsonBody={jsonBody}
                    formData={formData}
                    onBodyTypeChange={setBodyType}
                    onJsonBodyChange={setJsonBody}
                    onFormDataChange={setFormData}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Response Pane */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
                <div className="text-sm text-muted-foreground">
                  Request in progress... {elapsedTime}ms
                </div>
              </div>
            </div>
          ) : response ? (
            <Tabs
              value={responseTab}
              onValueChange={(value) =>
                setResponseTab(value as "body" | "headers")
              }
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between border-b px-4 h-10 overflow-hidden">
                <TabsList className="bg-background w-full flex justify-start rounded-none h-10">
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-4 py-1 min-w-fit">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      response.status >= 200 &&
                        response.status < 300 &&
                        "text-green-600",
                      response.status >= 300 &&
                        response.status < 400 &&
                        "text-amber-600",
                      response.status >= 400 && "text-red-600"
                    )}
                  >
                    {response.status} {response.statusText}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {response.time}ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {response.contentType.split(";")[0]}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <TabsContent value="body" className="m-0 h-full">
                  <div className="p-4">
                    <ResponseBody
                      data={response.data}
                      contentType={response.contentType}
                      size={response.size}
                      responseFormat={responseFormat}
                      onFormatChange={setResponseFormat}
                      onDownload={handleDownload}
                      blobUrl={blobUrl}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="headers" className="m-0 h-full">
                  <div className="p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Header</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {response.rawResponse?.headers &&
                          Array.from(
                            response.rawResponse.headers.entries()
                          ).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">
                                {key}
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground">
                                {value}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Response will appear here after sending a request
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
