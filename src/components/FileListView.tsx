import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status?: 'uploaded' | 'processing' | 'completed' | 'error';
}

interface FileListViewProps {
  files: UploadedFile[];
  onConvert: (fileId: string) => void;
  onInspect: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}

const FileListView = ({ files, onConvert, onInspect, onDelete }: FileListViewProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Uploaded Files ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{file.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                    {file.status && (
                      <Badge variant={getStatusColor(file.status) as any}>
                        {file.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onConvert(file.id)}
                  className="bg-success hover:bg-success/90"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Convert
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInspect(file.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Inspect
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(file.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileListView;