import { cn } from "@/lib/utils";
import {
  Activity,
  Code,
  FileCode,
  FileText,
  FileType,
  Globe,
  Image as ImageIcon,
  Timer,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ResponseInfoProps {
  status: number;
  statusText: string;
  contentType: string;
  time: number;
  size?: number;
}

export function ResponseInfo({
  status,
  statusText,
  contentType,
  time,
  size,
}: ResponseInfoProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4 min-w-fit">
      {/* Status Card */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Status - {statusText}
        </div>
        <div
          className={cn(
            "text-xl font-semibold",
            status >= 200 && status < 300 && "text-green-600",
            status >= 300 && status < 400 && "text-amber-600",
            status >= 400 && "text-red-600"
          )}
        >
          {status}
        </div>
      </div>

      {/* Content Type Card */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <FileType className="w-4 h-4" />
          Content Type
        </div>
        <div className="text-xl font-semibold truncate flex items-end gap-1">
          {contentType.split(";")[0].split("/")[1].toUpperCase()}
          {size && (
            <div className="text-sm text-muted-foreground">
              {formatBytes(size)}
            </div>
          )}
        </div>
      </div>

      {/* Response Type Card */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {contentType.includes("application/json") ? (
            <Code className="w-4 h-4" />
          ) : contentType.includes("text/html") ? (
            <Globe className="w-4 h-4" />
          ) : contentType.includes("image/") ? (
            <ImageIcon className="w-4 h-4" />
          ) : contentType.includes("application/pdf") ? (
            <FileText className="w-4 h-4" />
          ) : (
            <FileCode className="w-4 h-4" />
          )}
          Response Type
        </div>
        <div className="text-xl font-semibold">
          {contentType.includes("application/json")
            ? "JSON"
            : contentType.includes("text/html")
            ? "HTML"
            : contentType.includes("image/")
            ? "Image"
            : contentType.includes("application/pdf")
            ? "PDF"
            : contentType.includes("text/")
            ? "Text"
            : "Binary"}
        </div>
      </div>

      {/* Time Card */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Timer className="w-4 h-4" />
          Response Time
        </div>
        <div className="text-xl font-semibold font-mono flex items-end gap-1">
          {time}
          <div className="text-sm text-muted-foreground">ms</div>
        </div>
      </div>
    </div>
  );
}
