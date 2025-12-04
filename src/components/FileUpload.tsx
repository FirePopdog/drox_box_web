import { useState, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { CategorySelect } from '@/components/CategorySelect';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { formatFileSize } from '@/lib/file-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File, index: number) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `uploads/${fileName}`;

    setUploadingFiles(prev => 
      prev.map((f, i) => i === index ? { ...f, status: 'uploading' as const } : f)
    );

    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          name: fileName,
          original_name: file.name,
          size: file.size,
          mime_type: file.type || null,
          storage_path: storagePath,
          uploaded_by: user?.id,
          category_id: selectedCategory,
        });

      if (dbError) throw dbError;

      setUploadingFiles(prev => 
        prev.map((f, i) => i === index ? { ...f, status: 'complete' as const, progress: 100 } : f)
      );

      toast.success(`${file.name} 上傳成功`);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => 
        prev.map((f, i) => i === index ? { ...f, status: 'error' as const, error: error.message } : f)
      );
      toast.error(`${file.name} 上傳失敗`);
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    const startIndex = uploadingFiles.length;
    for (let i = 0; i < fileArray.length; i++) {
      await uploadFile(fileArray[i], startIndex + i);
    }

    onUploadComplete();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [selectedCategory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setUploadingFiles(prev => prev.filter(f => f.status !== 'complete'));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>檔案類別（選填）</Label>
        <CategorySelect value={selectedCategory} onChange={setSelectedCategory} />
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className={cn(
          'flex flex-col items-center gap-3 transition-transform duration-300',
          isDragging && 'scale-110'
        )}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              拖放檔案至此處上傳
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              或點擊選擇檔案
            </p>
          </div>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">上傳進度</h4>
            {uploadingFiles.some(f => f.status === 'complete') && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                清除已完成
              </Button>
            )}
          </div>
          
          {uploadingFiles.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(item.file.size)}</span>
                  {item.status === 'error' && (
                    <span className="text-destructive">{item.error}</span>
                  )}
                </div>
                {item.status === 'uploading' && (
                  <Progress value={50} className="mt-2 h-1" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {item.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {item.status === 'complete' && (
                  <CheckCircle className="h-4 w-4 text-file-image" />
                )}
                {(item.status === 'pending' || item.status === 'error') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
