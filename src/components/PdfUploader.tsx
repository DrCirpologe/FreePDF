import { useState, useCallback, useRef } from 'react';
import { UploadCloud, File } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PdfUploaderProps {
    onFilesSelected: (files: File[]) => void;
    multiple?: boolean;
    maxFiles?: number;
    accept?: string;
    title?: string;
    subtitle?: string;
    colorTheme?: 'blue' | 'red' | 'purple' | 'orange' | 'green';
}

export default function PdfUploader({
    onFilesSelected,
    multiple = false,
    maxFiles = 50,
    accept = "application/pdf",
    title = "PDF-Dateien hier ablegen",
    subtitle = "oder klicken, um eine Datei auszuwählen",
    colorTheme = 'blue'
}: PdfUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const colors = {
        blue: 'border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400',
        red: 'border-red-300 text-red-600 bg-red-50/50 hover:bg-red-50 hover:border-red-400',
        purple: 'border-purple-300 text-purple-600 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-400',
        orange: 'border-orange-300 text-orange-600 bg-orange-50/50 hover:bg-orange-50 hover:border-orange-400',
        green: 'border-green-300 text-green-600 bg-green-50/50 hover:bg-green-50 hover:border-green-400',
    };

    const activeColors = {
        blue: 'border-blue-500 bg-blue-100',
        red: 'border-red-500 bg-red-100',
        purple: 'border-purple-500 bg-purple-100',
        orange: 'border-orange-500 bg-orange-100',
        green: 'border-green-500 bg-green-100',
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFiles = useCallback((filesList: FileList | File[]) => {
        const validFiles = Array.from(filesList).filter(file => {
            if (accept === "application/pdf") return file.type === "application/pdf";
            return true;
        });

        if (validFiles.length > 0) {
            onFilesSelected(multiple ? validFiles.slice(0, maxFiles) : [validFiles[0]]);
        }
    }, [accept, maxFiles, multiple, onFilesSelected]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={twMerge(
                    clsx(
                        "relative w-full rounded-2xl border-3 border-dashed flex flex-col items-center justify-center p-12 lg:p-24 cursor-pointer transition-all duration-300 group",
                        colors[colorTheme],
                        isDragging && activeColors[colorTheme]
                    )
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleFileInput}
                />

                <div className="bg-white p-6 rounded-full shadow-md mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <UploadCloud className="w-12 h-12" />
                </div>

                <h2 className="text-3xl font-extrabold mb-3 text-center text-gray-900">{title}</h2>
                <p className="text-lg font-medium opacity-80 text-center">{subtitle}</p>

                <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-white/40 to-white/10 rounded-2xl pointer-events-none"></div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500 font-medium opacity-80">
                <div className="flex items-center gap-1.5"><File className="w-4 h-4" /> 100% sicher</div>
                <div className="flex items-center gap-1.5"><File className="w-4 h-4" /> Keine Installation</div>
                <div className="flex items-center gap-1.5"><File className="w-4 h-4" /> Offline-Verarbeitung (im Browser)</div>
            </div>
        </div>
    );
}
