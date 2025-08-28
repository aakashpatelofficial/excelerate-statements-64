import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, ChevronUp, ChevronDown, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface InspectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  pdfUrl?: string;
  totalPages: number;
  onExportPages: (pageRange: string) => void;
  onExportFull: () => void;
}

const InspectDialog = ({ 
  isOpen, 
  onClose, 
  fileName, 
  pdfUrl, 
  totalPages,
  onExportPages,
  onExportFull 
}: InspectDialogProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [pageRange, setPageRange] = useState("1");

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handlePageUp = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageDown = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleExportPages = () => {
    if (!pageRange.trim()) {
      toast.error("Please enter a page range");
      return;
    }
    onExportPages(pageRange);
    toast.success(`Exporting pages: ${pageRange}`);
  };

  const handleExportFull = () => {
    onExportFull();
    toast.success("Exporting full document");
  };

  const validatePageRange = (range: string) => {
    // Basic validation for page range format (e.g., "1-5", "1,3,5", "1-3,5-7")
    const pattern = /^(\d+(-\d+)?,?\s*)*$/;
    return pattern.test(range.replace(/\s/g, ''));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Inspect: {fileName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* PDF Viewer - Left Side (2/3 width on desktop) */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>PDF Preview</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Badge variant="outline">{Math.round(zoomLevel * 100)}%</Badge>
                      <Button variant="outline" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  <div className="border rounded-lg bg-muted/20 min-h-[500px] flex items-center justify-center">
                    {pdfUrl ? (
                      <div 
                        className="w-full h-full"
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                      >
                        <iframe
                          src={`${pdfUrl}#page=${currentPage}`}
                          className="w-full h-full border-0"
                          title={`${fileName} - Page ${currentPage}`}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>PDF preview not available</p>
                        <p className="text-sm">Use the controls to export specific pages</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls Panel - Right Side (1/3 width on desktop) */}
            <div className="space-y-6">
              {/* Page Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Page Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePageDown} disabled={currentPage <= 1}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline" className="px-3">
                      {currentPage} of {totalPages}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handlePageUp} disabled={currentPage >= totalPages}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pageRange">Page Range</Label>
                    <Input
                      id="pageRange"
                      placeholder="e.g., 1-5 or 1,3,5"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      className={!validatePageRange(pageRange) && pageRange ? "border-destructive" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Examples: "1-5", "1,3,5", "1-3,5-7"
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleExportPages} 
                    className="w-full"
                    disabled={!validatePageRange(pageRange)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected Pages
                  </Button>
                </CardContent>
              </Card>


              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleExportFull} 
                    variant="glow" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Full File
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InspectDialog;