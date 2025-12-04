import { Download, File, FileArchive, FileAudio, FileImage, FileText, FileVideo, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryBadge } from '@/components/CategoryBadge';
import { formatFileSize, getFileTypeCategory, getFileExtension, formatDate } from '@/lib/file-utils';
import { cn } from '@/lib/utils';

interface FileCardProps {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string | null;
  downloadCount: number;
  createdAt: string;
  category?: { name: string; color: string } | null;
  onDownload: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

const fileIcons = {
  document: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  archive: FileArchive,
  other: File,
};

const fileColors = {
  document: 'text-file-document bg-file-document/10',
  image: 'text-file-image bg-file-image/10',
  video: 'text-file-video bg-file-video/10',
  audio: 'text-file-audio bg-file-audio/10',
  archive: 'text-file-archive bg-file-archive/10',
  other: 'text-file-other bg-file-other/10',
};

export function FileCard({
  id,
  name,
  originalName,
  size,
  mimeType,
  downloadCount,
  createdAt,
  category,
  onDownload,
  onDelete,
  isAdmin,
}: FileCardProps) {
  const fileCategory = getFileTypeCategory(mimeType);
  const Icon = fileIcons[fileCategory];
  const colorClass = fileColors[fileCategory];
  const extension = getFileExtension(originalName);

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-scale-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', colorClass)}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-foreground" title={originalName}>
              {originalName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {extension && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                  {extension}
                </span>
              )}
              {category && (
                <CategoryBadge name={category.name} color={category.color} />
              )}
              <span>{formatFileSize(size)}</span>
              <span>•</span>
              <span>{downloadCount} 次下載</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {isAdmin && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    刪除檔案
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
