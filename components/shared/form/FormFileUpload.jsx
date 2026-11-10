"use client";

import { ImagePlus, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * FormFileUpload — drag-and-drop file upload zone with preview.
 *
 * @param {string} name - field name
 * @param {string} label - visible label text
 * @param {React.ComponentType} [icon] - lucide icon prepended to label
 * @param {string} [accept="image/*"] - MIME types (e.g. "image/*" or ".pdf,.docx")
 * @param {number} [maxSizeMB=5] - max file size in MB
 * @param {boolean} [multiple=false] - allow multiple file selection
 * @param {boolean} [preview=true] - show image/file previews
 * @param {function} [onChange] - (files: File[]) => void
 * @param {boolean} [required=false]
 * @param {string} [error]
 * @param {string} [hint]
 * @param {string} [className]
 */
export default function FormFileUpload({
  name,
  label,
  icon: Icon,
  accept = "image/*",
  maxSizeMB = 5,
  multiple = false,
  preview = true,
  onChange,
  required = false,
  error: externalError,
  hint,
  className,
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState("");

  const errorMsg = externalError || internalError;

  const validateAndSet = useCallback(
    (incoming) => {
      setInternalError("");
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid = [];
      const errors = [];

      for (const file of incoming) {
        if (file.size > maxBytes) {
          errors.push(`${file.name} exceeds ${maxSizeMB} MB`);
        } else {
          valid.push(file);
        }
      }

      if (errors.length) {
        setInternalError(errors.join(". "));
        return;
      }

      const next = multiple ? [...files, ...valid] : [valid[0]].filter(Boolean);
      setFiles(next);
      onChange?.(next);
    },
    [files, maxSizeMB, multiple, onChange],
  );

  const handleInputChange = (e) => {
    if (e.target.files) validateAndSet(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) validateAndSet(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onChange?.(next);
  };

  const isImage = (file) => file.type.startsWith("image/");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label
          htmlFor={name}
          className="text-xs font-bold text-brand-text uppercase flex items-center gap-1.5"
        >
          {Icon && <Icon className="w-3.5 h-3.5 text-brand-blue" />}
          {label}
          {required && <span className="text-brand-error ml-0.5">*</span>}
        </Label>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Upload file"
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all",
          isDragging
            ? "border-brand-blue bg-brand-blue/5"
            : errorMsg
              ? "border-brand-error bg-brand-error/5"
              : "border-brand-border bg-brand-surface hover:border-brand-blue/50 hover:bg-brand-blue/5",
        )}
      >
        <div className="p-2.5 rounded-full bg-brand-bg border border-brand-border">
          {files.length > 0 ? (
            <ImagePlus className="w-5 h-5 text-brand-blue" />
          ) : (
            <Upload className="w-5 h-5 text-brand-subtext" />
          )}
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-brand-text">
            {files.length > 0 ? "Add more files" : "Click or drag to upload"}
          </p>
          <p className="text-[10px] text-brand-subtext mt-0.5">
            {accept.replace(/\*/g, "any").replace(/,/g, ", ")} · Max {maxSizeMB}{" "}
            MB
          </p>
        </div>
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          required={required}
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {/* Preview grid */}
      {preview && files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-1">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative rounded-md border border-brand-border overflow-hidden group bg-brand-surface"
            >
              {isImage(file) ? (
                // biome-ignore lint/performance/noImgElement: blob URL preview cannot use next/image
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-20 object-cover"
                />
              ) : (
                <div className="w-full h-20 flex flex-col items-center justify-center gap-1 p-2">
                  <Upload className="w-5 h-5 text-brand-subtext" />
                  <span className="text-[10px] text-brand-subtext text-center line-clamp-2">
                    {file.name}
                  </span>
                </div>
              )}
              <Button
                type="button"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 border-0 shadow-none p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="w-3 h-3 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {errorMsg && (
        <p role="alert" className="text-[11px] text-brand-error font-medium">
          {errorMsg}
        </p>
      )}
      {!errorMsg && hint && (
        <p className="text-[11px] text-brand-subtext">{hint}</p>
      )}
    </div>
  );
}
