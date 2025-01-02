import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  Code,
  Globe,
  Image as ImageIcon,
  FileCode,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { MonacoEditor } from "@/components/ui/monaco-editor";

interface ResponseBodyProps {
  data: any;
  contentType: string;
  size?: number;
  responseFormat: "formatted" | "raw" | "preview";
  onFormatChange: (format: "formatted" | "raw" | "preview") => void;
  onDownload: () => void;
  blobUrl?: string | null;
}

export function ResponseBody({
  data,
  contentType,
  size,
  responseFormat,
  onFormatChange,
  onDownload,
  blobUrl,
}: ResponseBodyProps) {
  const isJson = contentType.includes("application/json");
  const isHtml = contentType.includes("text/html");
  const isText = contentType.includes("text/");
  const isImage = contentType.includes("image/");
  const isPdf = contentType.includes("application/pdf");
  const isBinary = !isJson && !isHtml && !isText && !isImage && !isPdf;

  if (isImage) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium">Response Body</div>
          <div className="flex items-center gap-2">
            <Select
              value={responseFormat}
              onValueChange={(value: "preview" | "raw") =>
                onFormatChange(value as "preview" | "raw")
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preview">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Preview
                  </div>
                </SelectItem>
                <SelectItem value="raw">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Raw
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {responseFormat === "preview" && blobUrl ? (
          <div className="bg-muted/50 rounded-md p-4 flex items-center justify-center">
            <img
              src={blobUrl}
              alt="Response"
              className="max-w-full max-h-[500px] object-contain"
            />
          </div>
        ) : (
          <div className="bg-muted/50 rounded-md p-4">
            <div className="text-sm text-muted-foreground text-center">
              Binary image data • {formatBytes(size || 0)}
            </div>
          </div>
        )}
      </>
    );
  }

  if (isPdf) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium">Response Body</div>
          <div className="flex items-center gap-2">
            <Select
              value={responseFormat}
              onValueChange={(value: "preview" | "raw") =>
                onFormatChange(value as "preview" | "raw")
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preview">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Preview
                  </div>
                </SelectItem>
                <SelectItem value="raw">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Raw
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {responseFormat === "preview" && blobUrl ? (
          <div className="bg-white rounded-md border h-[600px]">
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full h-full rounded-md"
            >
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  PDF preview not supported in your browser
                </div>
                <Button onClick={onDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </object>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-md p-4">
            <div className="text-sm text-muted-foreground text-center">
              Binary PDF data • {formatBytes(size || 0)}
            </div>
          </div>
        )}
      </>
    );
  }

  if (isBinary) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          Binary file • {formatBytes(size || 0)}
        </div>
        <Button onClick={onDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download File
        </Button>
      </div>
    );
  }

  if (isHtml) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium">Response Body</div>
          <div className="flex items-center gap-2">
            <Select
              value={responseFormat}
              onValueChange={(value: "formatted" | "raw" | "preview") =>
                onFormatChange(value)
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preview">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Preview
                  </div>
                </SelectItem>
                <SelectItem value="formatted">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Source
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {responseFormat === "preview" ? (
          <div className="bg-white rounded-md border h-[500px]">
            <iframe
              srcDoc={data}
              className="w-full h-full rounded-md"
              sandbox="allow-same-origin"
              title="Response Preview"
            />
          </div>
        ) : (
          <div className="bg-muted/50 rounded-md">
            <pre className="whitespace-pre-wrap font-mono text-sm p-4 max-h-[500px] overflow-auto">
              {data}
            </pre>
          </div>
        )}
      </>
    );
  }

  if (isJson) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="text-sm font-medium">Response Body</div>
          <div className="flex items-center gap-2">
            <Select
              value={responseFormat}
              onValueChange={(value: "formatted" | "raw") =>
                onFormatChange(value as "formatted" | "raw")
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formatted">Formatted</SelectItem>
                <SelectItem value="raw">Raw</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <MonacoEditor
            value={
              responseFormat === "formatted"
                ? JSON.stringify(data, null, 2)
                : JSON.stringify(data)
            }
            onChange={() => {}} // Read-only
            readOnly={true}
          />
        </div>
      </div>
    );
  }

  // Plain text
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">Response Body</div>
        <Button onClick={onDownload} variant="outline" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <div className="bg-muted/50 rounded-md">
        <pre className="whitespace-pre-wrap font-mono text-sm p-4 max-h-[500px] overflow-auto">
          {data}
        </pre>
      </div>
    </>
  );
}
