import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FileCard } from '@/components/FileCard';
import { FileUpload } from '@/components/FileUpload';
import { CategoryManager } from '@/components/CategoryManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { CloudUpload, Files, Download, Loader2, Tags } from 'lucide-react';
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
  category: { name: string; color: string } | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalDownloads: 0,
    totalSize: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        toast.error('您沒有管理員權限');
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchFiles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*, category:categories(name, color)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
    } else {
      setFiles(data || []);
      
      // Calculate stats
      const totalFiles = data?.length || 0;
      const totalDownloads = data?.reduce((sum, file) => sum + file.download_count, 0) || 0;
      const totalSize = data?.reduce((sum, file) => sum + file.size, 0) || 0;
      setStats({ totalFiles, totalDownloads, totalSize });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFiles();
    }
  }, [isAdmin]);

  const handleDownload = async (file: FileData) => {
    const { data } = supabase.storage
      .from('files')
      .getPublicUrl(file.storage_path);

    if (data?.publicUrl) {
      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = file.original_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async (file: FileData) => {
    if (!confirm(`確定要刪除「${file.original_name}」嗎？`)) return;

    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([file.storage_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }

    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', file.id);

    if (dbError) {
      toast.error('刪除失敗');
    } else {
      toast.success('檔案已刪除');
      fetchFiles();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">管理後台</h1>
          <p className="mt-2 text-muted-foreground">
            上傳和管理您的檔案
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Files className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">總檔案數</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalFiles}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-file-image/10">
                <Download className="h-6 w-6 text-file-image" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">總下載次數</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalDownloads}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <CloudUpload className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">總儲存空間</p>
                <p className="text-2xl font-bold text-foreground">{formatBytes(stats.totalSize)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload" className="gap-2">
              <CloudUpload className="h-4 w-4" />
              上傳檔案
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Files className="h-4 w-4" />
              管理檔案
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tags className="h-4 w-4" />
              類別管理
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>上傳新檔案</CardTitle>
                <CardDescription>
                  拖放或選擇檔案上傳至雲端檔案庫
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onUploadComplete={fetchFiles} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>檔案管理</CardTitle>
                <CardDescription>
                  查看和管理已上傳的檔案
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    目前沒有上傳的檔案
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {files.map((file) => (
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
                        onDelete={() => handleDelete(file)}
                        isAdmin={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>類別管理</CardTitle>
                <CardDescription>
                  建立和管理檔案分類
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
