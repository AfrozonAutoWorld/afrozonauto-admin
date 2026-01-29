"use client";
import React, { useState } from "react";
import { FileIcon, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface MediaUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  required?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  accept = ".jpg,.jpeg,.png",
  disabled = false,
  required = false,
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    // Check if adding these files would exceed the max
    const totalFiles = files.length + selectedFiles.length;
    if (totalFiles > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const validUrls: string[] = [];

    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB size limit.`);
        continue;
      }

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error(`${file.name} is not a valid image format.`);
        continue;
      }

      validFiles.push(file);
      validUrls.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      const newFiles = [...files, ...validFiles];
      const newUrls = [...previewUrls, ...validUrls];

      setFiles(newFiles);
      setPreviewUrls(newUrls);
      onFileSelect(newFiles);

      toast.success(`${validFiles.length} image(s) added successfully.`);
    }

    // Reset input
    event.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);

    // Revoke the URL to free up memory
    URL.revokeObjectURL(previewUrls[index]);

    setFiles(newFiles);
    setPreviewUrls(newUrls);
    onFileSelect(newFiles);

    toast.success("Image removed.");
  };

  const handleReorderImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newFiles = [...files];
    const newUrls = [...previewUrls];

    // Swap files
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);

    // Swap URLs
    const [movedUrl] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, movedUrl);

    setFiles(newFiles);
    setPreviewUrls(newUrls);
    onFileSelect(newFiles);
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className="space-y-4">
      {/* Main Cover Image */}
      <div
        className={`border-2 border-dashed border-[#174D4F] rounded-xl text-center transition-colors overflow-hidden
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-300" : "hover:border-gray-400"}
          ${previewUrls.length > 0 ? "h-64" : "p-10"}
        `}
      >
        {previewUrls.length > 0 ? (
          <div className="relative w-full h-full group">
            <Image
              src={previewUrls[0]}
              alt="Cover image"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRemoveImage(0)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                Remove
              </button>
            </div>
            <div className="absolute top-2 left-2 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
              Cover Image
            </div>
            <button
              type="button"
              onClick={() => handleRemoveImage(0)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="media-upload-main"
              accept={accept}
              required={required}
              disabled={disabled}
              multiple={false}
            />
            <label
              htmlFor="media-upload-main"
              className={`flex flex-col items-center justify-center gap-3 ${disabled ? "cursor-not-allowed" : "cursor-pointer"
                }`}
            >
              <FileIcon className="w-12 h-12 text-[#174D4F]" />
              <span
                className={`text-sm sm:text-base font-medium ${disabled ? "text-gray-400" : "text-teal-600"
                  }`}
              >
                Upload Cover Image
              </span>
              <p className="text-xs text-gray-500">PNG or JPEG (5MB max)</p>
            </label>
          </>
        )}
      </div>

      {/* Additional Images Thumbnails */}
      {previewUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Additional Images ({files.length - 1}/{maxFiles - 1})
            </label>
            {canAddMore && (
              <span className="text-xs text-gray-500">
                {maxFiles - files.length} more allowed
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Show additional images (index 1 onwards) */}
            {previewUrls.slice(1).map((url, index) => (
              <div
                key={index + 1}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group cursor-move"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(index + 1));
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                  handleReorderImage(fromIndex, index + 1);
                }}
              >
                <Image
                  src={url}
                  alt={`Additional image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index + 1)}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                  {index + 2}
                </div>
              </div>
            ))}

            {/* Add More Button */}
            {canAddMore && (
              <div className="relative aspect-square">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="media-upload-additional"
                  accept={accept}
                  disabled={disabled}
                  multiple
                />
                <label
                  htmlFor="media-upload-additional"
                  className={`flex flex-col items-center justify-center gap-2 w-full h-full border-2 border-dashed border-gray-300 rounded-lg transition-colors ${disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-[#174D4F] hover:bg-gray-50"
                    }`}
                >
                  <ImagePlus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500">Add More</span>
                </label>
              </div>
            )}
          </div>

          {files.length > 1 && (
            <p className="text-xs text-gray-500 italic">
              💡 Tip: Drag thumbnails to reorder images
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;