import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface Header {
  key: string;
  value: string;
}

interface RequestHeadersProps {
  headers: Header[];
  onHeadersChange: (headers: Header[]) => void;
}

export function RequestHeaders({
  headers,
  onHeadersChange,
}: RequestHeadersProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">Request Headers</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onHeadersChange([...headers, { key: "", value: "" }])}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Header
        </Button>
      </div>
      {headers.map((header, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <Input
            placeholder="Key"
            value={header.key}
            onChange={(e) => {
              const newHeaders = [...headers];
              newHeaders[index].key = e.target.value;
              onHeadersChange(newHeaders);
            }}
          />
          <Input
            placeholder="Value"
            value={header.value}
            onChange={(e) => {
              const newHeaders = [...headers];
              newHeaders[index].value = e.target.value;
              onHeadersChange(newHeaders);
            }}
          />
          {headers.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                onHeadersChange(headers.filter((_, i) => i !== index))
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </>
  );
}
