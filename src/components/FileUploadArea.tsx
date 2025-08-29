import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadAreaProps {
  onFileUploaded: (file: File, fileId: string) => void;
  disabled?: boolean;
}

const FileUploadArea = ({ onFileUploaded, disabled }: FileUploadAreaProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Please select a PDF file only';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      toast.error(validation);
      return;
    }

    setUploading(true);
    try {
      console.log('📤 Uploading:', file.name);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload files');
      }

      // Step 1: Create conversion record first
      const { data: conversion, error: insertError } = await supabase
        .from('conversions')
        .insert({
          file_name: file.name,
          file_size: file.size,
          status: 'pending',
          user_id: user.id
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`);
      }

      console.log('✅ Created conversion record:', conversion.id);

      // Step 2: Upload file to storage
      const filePath = `${conversion.id}/${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bank-statements-uploaded')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      console.log('✅ File uploaded to:', uploadData.path);

      // Step 3: Update conversion record with file path
      const { error: updateError } = await supabase
        .from('conversions')
        .update({
          upload_url: uploadData.path,
          status: 'uploaded'
        })
        .eq('id', conversion.id);

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`);
      }

      onFileUploaded(file, conversion.id);
      toast.success('File uploaded successfully!');
      console.log('✅ Upload completed for:', file.name);

    } catch (error: any) {
      console.error('❌ Upload failed for', file.name, ':', error.message);
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-0">
        <div
          className={cn(
            "relative cursor-pointer transition-all duration-300",
            "border-2 border-dashed rounded-lg",
            "hover:border-primary/50 hover:bg-primary/5",
            dragActive && "border-primary bg-primary/10",
            disabled && "opacity-50 cursor-not-allowed",
            uploading && "pointer-events-none",
            "min-h-[300px] flex flex-col items-center justify-center p-12"
          )}
          onDrop={handleDrop}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className={cn(
                "h-10 w-10 text-primary",
                uploading && "animate-bounce"
              )} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                {uploading ? 'Uploading...' : 'Upload PDF Bank Statement'}
              </h3>
              <p className="text-lg text-muted-foreground">
                Drag and drop your PDF file here or click to browse
              </p>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• PDF files only (max 10MB)</p>
              <p>• Supports bank statements from 1000+ banks worldwide</p>
              <p>• Secure processing - files are not permanently stored</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadArea;