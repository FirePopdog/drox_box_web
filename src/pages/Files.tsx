import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FileCard } from '@/components/FileCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Search, FileX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileData {
  id: string;
  name: string;
  original_name: string;
  size: number;
  mime_type: string | null;
  storage_path: string;
  download_count: number;
  created_at: string;
  category_id: string | null;
  category: { name: string; color: string } | null;
}

export default function Files() {
  const { isAdmin } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*, category:categories(name, color)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      toast.error('無法載入檔案列表');
    } else {
      setFiles(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = async (file: FileData) => {
    const { data } = supabase.storage
      .from('files')
      .getPublicUrl(file.storage_path);

    if (data?.publicUrl) {
      // Update download count
      await supabase
        .from('files')
        .update({ download_count: file.download_count + 1 })
        .eq('id', file.id);

      // Trigger download
      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = file.original_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local state
      setFiles(prev =>
        prev.map(f =>
          f.id === file.id ? { ...f, download_count: f.download_count + 1 } : f
        )
      );
    }
  };

  const handleDelete = async (file: FileData) => {
    if (!confirm(`確定要刪除「${file.original_name}」嗎？`)) return;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([file.storage_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', file.id);

    if (dbError) {
      toast.error('刪除失敗');
    } else {
      toast.success('檔案已刪除');
      setFiles(prev => prev.filter(f => f.id !== file.id));
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || file.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">檔案列表</h1>
          <p className="mt-2 text-muted-foreground">
            瀏覽並下載可用的檔案
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜尋檔案..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {searchQuery || selectedCategory ? '找不到符合的檔案' : '目前沒有檔案'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || selectedCategory ? '請嘗試其他篩選條件' : '管理員可以上傳新檔案'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                id={file.id}
                name={file.name}
                originalName={file.original_name}
                size={file.size}
                mimeType={file.mime_type}
                downloadCount={file.download_count}
                createdAt={file.created_at}
                category={file.category}
                onDownload={() => handleDownload(file)}
                onDelete={isAdmin ? () => handleDelete(file) : undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
