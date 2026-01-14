"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";

interface FileUploaderProps {
    onUpload: (files: string[]) => void;
    existingFiles?: string[];
    multiple?: boolean;
    accept?: string;
    maxFiles?: number;
    label?: string;
}

export function FileUploader({
    onUpload,
    existingFiles = [],
    multiple = false,
    accept = "image/*",
    maxFiles = 5,
    label = "Upload Files"
}: FileUploaderProps) {
    const [files, setFiles] = useState<string[]>(existingFiles);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        await processFiles(Array.from(selectedFiles));
    };

    const processFiles = async (fileList: File[]) => {
        const remaining = maxFiles - files.length;
        const filesToProcess = multiple ? fileList.slice(0, remaining) : [fileList[0]];

        const newFiles: string[] = [];

        for (const file of filesToProcess) {
            const base64 = await fileToBase64(file);
            newFiles.push(base64);
        }

        const updated = multiple ? [...files, ...newFiles] : newFiles;
        setFiles(updated);
        onUpload(updated);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        onUpload(updated);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        await processFiles(droppedFiles);
    };

    const isImage = (base64: string) => base64.startsWith('data:image');

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragging
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }
          ${files.length >= maxFiles && multiple ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="w-10 h-10 mx-auto mb-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-400">{label}</p>
                <p className="text-xs text-gray-600 mt-1">
                    {multiple
                        ? `Drag & drop or click (max ${maxFiles} files)`
                        : 'Drag & drop or click to upload'
                    }
                </p>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
                <div className={`grid gap-3 ${multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="relative group bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                        >
                            {isImage(file) ? (
                                <img
                                    src={file}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                />
                            ) : (
                                <div className="w-full h-32 flex items-center justify-center">
                                    <FileText className="w-12 h-12 text-gray-500" />
                                </div>
                            )}

                            {/* Remove Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
