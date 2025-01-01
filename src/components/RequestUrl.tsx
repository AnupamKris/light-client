import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";

interface RequestUrlProps {
  method: "GET" | "POST";
  url: string;
  isLoading: boolean;
  elapsedTime: number;
  onMethodChange: (method: "GET" | "POST") => void;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
}

export function RequestUrl({
  method,
  url,
  isLoading,
  elapsedTime,
  onMethodChange,
  onUrlChange,
  onSubmit,
}: RequestUrlProps) {
  return (
    <div className="flex gap-4 items-center mb-6">
      <Select
        value={method}
        onValueChange={onMethodChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GET">GET</SelectItem>
          <SelectItem value="POST">POST</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Enter URL"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        className="flex-1"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
      />
      <Button onClick={onSubmit} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            {(elapsedTime / 1000).toFixed(2)}s
          </>
        ) : (
          <>
            <Send />
            Send
          </>
        )}
      </Button>
    </div>
  );
}
