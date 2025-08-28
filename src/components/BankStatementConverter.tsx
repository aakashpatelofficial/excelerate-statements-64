import { useState } from "react";
import FileUploadArea from "./FileUploadArea";
import FileListView from "./FileListView";
import ConvertDialog from "./ConvertDialog";
import InspectDialog from "./InspectDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status?: 'uploaded' | 'processing' | 'completed' | 'error';
  conversionId?: string;
}

interface Transaction {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
}

const BankStatementConverter = () => {
  const { user, session } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFileForConvert, setSelectedFileForConvert] = useState<UploadedFile | null>(null);
  const [selectedFileForInspect, setSelectedFileForInspect] = useState<UploadedFile | null>(null);
  const [convertedData, setConvertedData] = useState<Transaction[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [pageRange, setPageRange] = useState("1");

  const handleFileUploaded = async (file: File, fileId: string) => {
    // Add to uploaded files list
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploaded'
    };
    
    setUploadedFiles(prev => [...prev, newFile]);

    try {
      // Upload to backend
      const formData = new FormData();
      formData.append('pdf', file);

      const { data: uploadResult, error: uploadError } = await supabase.functions
        .invoke('upload-pdf', {
          body: formData,
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`
          } : {}
        });

      if (uploadError) throw uploadError;
      if (!uploadResult.success) throw new Error(uploadResult.error);

      // Update file with conversion ID
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, conversionId: uploadResult.conversionId }
          : f
      ));

    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      // Update file status to error
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error' }
          : f
      ));
    }
  };

  const handleConvert = async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file || !file.conversionId) {
      toast.error('File not ready for conversion');
      return;
    }

    // Update status to processing
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'processing' }
        : f
    ));

    try {
      const { data: result, error } = await supabase.functions
        .invoke('process-pdf', {
          body: { conversionId: file.conversionId },
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`
          } : {}
        });

      if (error) throw error;
      if (!result.success) throw new Error(result.error);

      // Update file status to completed
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'completed' }
          : f
      ));

      // Open convert dialog with data
      setSelectedFileForConvert(file);
      setConvertedData(result.transactions);

    } catch (error: any) {
      toast.error(error.message || 'Conversion failed');
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error' }
          : f
      ));
    }
  };

  const handleInspect = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    setSelectedFileForInspect(file);
    setCurrentPage(1);
    setZoomLevel(1.0);
    setPageRange("1");
  };

  const handleDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File deleted');
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    if (!convertedData || !selectedFileForConvert) return;

    try {
      // In a real implementation, this would call a backend endpoint to generate the file
      const csvContent = [
        ['Date', 'Description', 'Debit', 'Credit', 'Balance'].join(','),
        ...convertedData.map(t => [
          t.date,
          `"${t.description}"`,
          t.debit,
          t.credit,
          t.balance
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFileForConvert.name.replace('.pdf', '')}_converted.${format === 'excel' ? 'csv' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error: any) {
      toast.error('Export failed: ' + error.message);
    }
  };

  const handleSendFeedback = async (feedback: string) => {
    // In a real implementation, this would send feedback to the backend
    console.log('Feedback:', feedback);
    // Could call a feedback endpoint here
  };

  const handleExportPages = (pageRange: string) => {
    console.log('Exporting pages:', pageRange);
    // Implementation for exporting specific pages
  };

  const handleExportFull = () => {
    console.log('Exporting full document');
    // Implementation for exporting full document
  };

  return (
    <div className="space-y-8">
      <FileUploadArea onFileUploaded={handleFileUploaded} />
      
      <FileListView
        files={uploadedFiles}
        onConvert={handleConvert}
        onInspect={handleInspect}
        onDelete={handleDelete}
      />

      {selectedFileForConvert && convertedData && (
        <ConvertDialog
          isOpen={true}
          onClose={() => {
            setSelectedFileForConvert(null);
            setConvertedData(null);
          }}
          fileName={selectedFileForConvert.name}
          transactions={convertedData}
          onExport={handleExport}
          onSendFeedback={handleSendFeedback}
        />
      )}

      {selectedFileForInspect && (
        <InspectDialog
          isOpen={true}
          onClose={() => setSelectedFileForInspect(null)}
          fileName={selectedFileForInspect.name}
          totalPages={10} // Mock total pages
          onExportPages={handleExportPages}
          onExportFull={handleExportFull}
        />
      )}
    </div>
  );
};

export default BankStatementConverter;