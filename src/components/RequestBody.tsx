import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Text, File } from "lucide-react";

interface FormDataItem {
  key: string;
  value: string | File;
  type: "text" | "file";
}

interface RequestBodyProps {
  bodyType: "json" | "formData";
  jsonBody: string;
  formData: FormDataItem[];
  onBodyTypeChange: (type: "json" | "formData") => void;
  onJsonBodyChange: (json: string) => void;
  onFormDataChange: (formData: FormDataItem[]) => void;
}

export function RequestBody({
  bodyType,
  jsonBody,
  formData,
  onBodyTypeChange,
  onJsonBodyChange,
  onFormDataChange,
}: RequestBodyProps) {
  const handleFileChange = (index: number, file: File) => {
    const newFormData = [...formData];
    newFormData[index] = { ...newFormData[index], value: file };
    onFormDataChange(newFormData);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">Request Body</div>
        <Select value={bodyType} onValueChange={onBodyTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Body Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="formData">Form Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {bodyType === "json" ? (
        <textarea
          className="w-full h-64 p-2 border rounded-md font-mono"
          value={jsonBody}
          onChange={(e) => onJsonBodyChange(e.target.value)}
          placeholder="Enter JSON body"
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">Form Data</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFormDataChange([
                  ...formData,
                  { key: "", value: "", type: "text" },
                ])
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
          <div className="space-y-2">
            {formData.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  value={item.type}
                  onValueChange={(value: "text" | "file") => {
                    const newFormData = [...formData];
                    newFormData[index] = {
                      ...item,
                      type: value,
                      value: "", // Reset value when changing type
                    };
                    onFormDataChange(newFormData);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <Text className="h-4 w-4 mr-1" /> Text
                      </div>
                    </SelectItem>
                    <SelectItem value="file">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 mr-1" /> File
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => {
                    const newFormData = [...formData];
                    newFormData[index] = {
                      ...item,
                      key: e.target.value,
                    };
                    onFormDataChange(newFormData);
                  }}
                />

                {item.type === "text" ? (
                  <Input
                    type="text"
                    placeholder="Value"
                    value={item.value as string}
                    onChange={(e) => {
                      const newFormData = [...formData];
                      newFormData[index] = {
                        ...item,
                        value: e.target.value,
                      };
                      onFormDataChange(newFormData);
                    }}
                    className="w-full"
                  />
                ) : (
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileChange(index, e.target.files[0]);
                      }
                    }}
                    className="w-full"
                  />
                )}
                {formData.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onFormDataChange(formData.filter((_, i) => i !== index))
                    }
                    className="min-w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
