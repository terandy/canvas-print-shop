"use client"

import React, { useState, useCallback, startTransition } from 'react';
import { useProduct, useUpdateURL } from '@/contexts/product-context';
import clsx from 'clsx';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
    maxSizeMB?: number;
    acceptedTypes?: string[];
    className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    className
}) => {
    const { updateOption, state: { imgURL } } = useProduct();
    const updateURL = useUpdateURL();
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageSelect = useCallback(async (file: File) => {
        try {
            setIsUploading(true);

            // Get presigned URL
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileType: file.type }),
            });
            const { uploadUrl, publicUrl } = await response.json();

            // Upload to S3
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });
            startTransition(() => {
                const newState = updateOption("imgURL", publicUrl);
                updateURL(newState);
            })
        } catch (error) {
            console.error('Error uploading image:', error);
            // Handle error appropriately
        } finally {
            setIsUploading(false);
        }
    }, [updateOption, updateURL]);

    const validateFile = useCallback((file: File): boolean => {

        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            setError(`Accepted file types: ${acceptedTypes.join(', ')}`);
            return false;
        }

        return true;
    }, [setError, acceptedTypes]);

    const handleFile = useCallback((file: File) => {
        setError(null);

        if (!validateFile(file)) {
            return;
        }

        // Create preview
        const reader = new FileReader();

        reader.readAsDataURL(file);

        handleImageSelect(file);
    }, [handleImageSelect, validateFile,]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    return (
        <div className={clsx("w-full max-w-xl mx-auto", className)}>
            {!imgURL && <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
            >
                <input
                    type="file"
                    accept={acceptedTypes.join(',')}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                        <p className="text- font-medium text-gray-700">
                            Drop your image here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Supported formats: JPG, PNG, WebP
                        </p>
                    </div>
                </div>
            </div>}
            {isUploading && (
                <p className="mt-2 text-blue-600">Uploading your image...</p>
            )}
            {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}
        </div >
    );
};

export default ImageUploader;