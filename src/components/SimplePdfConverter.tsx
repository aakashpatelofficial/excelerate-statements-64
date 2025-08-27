import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Download, FileText, CheckCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversionState {
  file: File | null;
  progress: number;
  stage: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  downloadUrl: string | null;
  error: string | null;
}

const SimplePdfConverter = () => {
  const [state, setState] = useState<ConversionState>({
    file: null,
    progress: 0,
    stage: 'idle',
    downloadUrl: null,
    error: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const resetState = useCallback(() => {
    setState({
      file: null,
      progress: 0,
      stage: 'idle',
      downloadUrl: null,
      error: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Please select a PDF file only';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const processFile = async (file: File) => {
    setState(prev => ({ ...prev, file, stage: 'uploading', progress: 0 }));

    try {
      // Simulate upload progress
      for (let i = 0; i <= 30; i += 5) {
        setState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setState(prev => ({ ...prev, stage: 'processing', progress: 30 }));

      // Simulate processing with realistic progress
      for (let i = 30; i <= 90; i += 10) {
        setState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Create a mock Excel file for download
      const mockExcelData = createMockExcelFile(file.name);
      const blob = new Blob([mockExcelData], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const downloadUrl = URL.createObjectURL(blob);

      setState(prev => ({ 
        ...prev, 
        stage: 'complete', 
        progress: 100,
        downloadUrl 
      }));

      toast.success('PDF converted to Excel successfully!');

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        stage: 'error', 
        error: 'Failed to convert PDF. Please try again.' 
      }));
      toast.error('Conversion failed. Please try again.');
    }
  };

  const createMockExcelFile = (fileName: string): ArrayBuffer => {
    // Create a simple CSV-like content that represents Excel
    const headers = ['Date', 'Description', 'Debit', 'Credit', 'Balance'];
    const sampleData = [
      ['2024-01-15', 'Opening Balance', '', '', '10,000.00'],
      ['2024-01-16', 'UPI/Transfer/SALARY', '', '5,000.00', '15,000.00'],
      ['2024-01-17', 'ATM WITHDRAWAL', '2,000.00', '', '13,000.00'],
      ['2024-01-18', 'ONLINE PURCHASE', '500.00', '', '12,500.00'],
      ['2024-01-19', 'INTEREST CREDIT', '', '100.00', '12,600.00']
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.join(','))
      .join('\n');

    // Convert to ArrayBuffer (simplified for demo)
    const encoder = new TextEncoder();
    return encoder.encode(csvContent).buffer;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    processFile(file);
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

  const handleDownload = () => {
    if (state.downloadUrl) {
      const a = document.createElement('a');
      a.href = state.downloadUrl;
      a.download = `${state.file?.name?.replace('.pdf', '')}_converted.xlsx` || 'bank_statement.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Excel file downloaded!');
    }
  };

  // Main upload area
  if (state.stage === 'idle') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-0">
          <div
            className={cn(
              "relative cursor-pointer transition-all duration-300",
              "border-2 border-dashed rounded-lg",
              "hover:border-primary/50 hover:bg-primary/5",
              dragActive && "border-primary bg-primary/10",
              "min-h-[400px] flex flex-col items-center justify-center p-12"
            )}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-foreground">
                  Click here to convert a PDF!
                </h3>
                <p className="text-lg text-muted-foreground">
                  Or drag and drop your PDF bank statement here
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• PDF files only (max 10MB)</p>
                <p>• Supports bank statements from 1000s of banks worldwide</p>
                <p>• Secure processing - files are not stored</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processing states
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* File Info */}
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{state.file?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {state.file ? (state.file.size / 1024 / 1024).toFixed(2) : 0} MB
              </p>
            </div>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetState}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {state.stage === 'uploading' && 'Uploading...'}
                {state.stage === 'processing' && 'Converting to Excel...'}
                {state.stage === 'complete' && 'Conversion Complete!'}
                {state.stage === 'error' && 'Error'}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(state.progress)}%
              </span>
            </div>
            <Progress value={state.progress} className="h-2" />
          </div>

          {/* Status */}
          <div className="flex items-center justify-center space-x-2 py-4">
            {(state.stage === 'uploading' || state.stage === 'processing') && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  {state.stage === 'uploading' ? 'Uploading PDF...' : 'Processing with AI...'}
                </span>
              </>
            )}
            {state.stage === 'complete' && (
              <>
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-success">
                  Ready for download!
                </span>
              </>
            )}
            {state.stage === 'error' && (
              <span className="text-sm font-medium text-destructive">
                {state.error}
              </span>
            )}
          </div>

          {/* Actions */}
          {state.stage === 'complete' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="glow" 
                size="lg" 
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Excel File
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={resetState}
                className="flex-1 sm:flex-none"
              >
                Convert Another
              </Button>
            </div>
          )}

          {state.stage === 'error' && (
            <Button 
              variant="outline" 
              size="lg" 
              onClick={resetState}
              className="w-full"
            >
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplePdfConverter;