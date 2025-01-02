import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestUrl } from "@/components/RequestUrl";
import { RequestHeaders } from "@/components/RequestHeaders";
import { QueryParams } from "@/components/QueryParams";
import { RequestBody } from "@/components/RequestBody";
import { ResponseBody } from "@/components/ResponseBody";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AppWindow,
  Globe,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
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
  const [corsDisabled, setCorsDisabled] = useState(true);

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
    setResponseTab("body");

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
          try {
            // Parse JSON to ensure it's valid and convert to string
            body = JSON.stringify(JSON.parse(jsonBody));
            headerObj["Content-Type"] = "application/json";
          } catch (e) {
            throw new Error("Invalid JSON body");
          }
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
      let responseData: Response;

      if (corsDisabled) {
        // Use Tauri's HTTP plugin
        const tauriResponse = await tauriFetch(finalUrl, {
          method,
          headers: headerObj,
          body: method === "POST" ? body : undefined,
        });

        const responseBody = await tauriResponse.text();
        const contentTypeHeader = tauriResponse.headers.get("content-type");

        // Convert Tauri response to web Response
        responseData = new Response(responseBody, {
          status: tauriResponse.status,
          statusText: tauriResponse.status.toString(),
          headers: new Headers({
            "content-type": contentTypeHeader || "text/plain",
          }),
        });
      } else {
        // Use browser's fetch API
        responseData = await fetch(finalUrl, {
          method,
          headers: headerObj,
          body: method === "POST" ? body : undefined,
        });
      }

      const contentType = responseData.headers.get("content-type") || "unknown";
      const timeElapsed = Date.now() - startTime;

      let data: any;
      let size: number | undefined;

      try {
        if (contentType.includes("application/json")) {
          const text = await responseData.clone().text();
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            data = text; // If JSON parsing fails, show the raw text
          }
        } else if (
          contentType.includes("text/html") ||
          contentType.includes("text")
        ) {
          data = await responseData.clone().text();
          size = new Blob([data]).size;
        } else {
          const blob = await responseData.clone().blob();
          size = blob.size;
          data = null;
        }

        setResponse({
          data,
          status: responseData.status,
          statusText: responseData.statusText || responseData.status.toString(),
          time: timeElapsed,
          contentType,
          rawResponse: responseData,
          size,
        });
      } catch (processError: unknown) {
        console.error(processError);
        const errorMessage =
          processError instanceof Error
            ? processError.message
            : "Failed to process response";
        throw new Error(`Failed to process response: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error(error);
      // Check if it's a CORS error
      const isCorsError =
        error instanceof TypeError &&
        (error.message.includes("CORS") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("Network request failed"));

      const errorResponse = {
        data: {
          error: isCorsError
            ? "CORS Error: The server doesn't allow requests from this origin. Try enabling CORS on the server or using the CORS bypass button."
            : error.message || "An error occurred",
          details: error.message,
        },
        status: isCorsError ? 0 : 500,
        statusText: isCorsError ? "CORS Error" : "Error",
        time: Date.now() - (startTimeRef.current || 0),
        contentType: "application/json",
      };

      setResponse(errorResponse);
      setResponseTab("body");
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCorsDisabled(!corsDisabled)}
            className={cn(
              "gap-2",
              corsDisabled &&
                "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500"
            )}
          >
            {corsDisabled ? (
              <>
                <AppWindow className="h-4 w-4" />
                Rust
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Browser
              </>
            )}
          </Button>
          <ThemeToggle />
        </div>
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
            className="flex-1 flex flex-col"
          >
            <TabsList className="border-b bg-background w-full flex justify-start rounded-none h-10 flex-shrink-0">
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

            <div className="flex-1 overflow-auto">
              <TabsContent value="headers" className="m-0 h-full">
                <div className="p-4 h-full">
                  <RequestHeaders
                    headers={headers}
                    onHeadersChange={setHeaders}
                  />
                </div>
              </TabsContent>

              <TabsContent value="params" className="m-0 h-full">
                <div className="p-4 h-full">
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
                </div>
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
              <div className="flex items-center justify-between border-b px-4 h-10 overflow-hidden flex-shrink-0">
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
                  <div className="p-4 h-full">
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
                  <div className="p-4 h-full">
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
