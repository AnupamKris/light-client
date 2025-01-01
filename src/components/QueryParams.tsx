import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface QueryParam {
  key: string;
  value: string;
}

interface QueryParamsProps {
  params: QueryParam[];
  onParamsChange: (params: QueryParam[]) => void;
}

export function QueryParams({ params, onParamsChange }: QueryParamsProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">Query Parameters</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onParamsChange([...params, { key: "", value: "" }])}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Parameter
        </Button>
      </div>
      <div className="space-y-2">
        {params.map((param, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Key"
              value={param.key}
              onChange={(e) => {
                const newParams = [...params];
                newParams[index].key = e.target.value;
                onParamsChange(newParams);
              }}
            />
            <Input
              placeholder="Value"
              value={param.value}
              onChange={(e) => {
                const newParams = [...params];
                newParams[index].value = e.target.value;
                onParamsChange(newParams);
              }}
            />
            {params.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  onParamsChange(params.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
