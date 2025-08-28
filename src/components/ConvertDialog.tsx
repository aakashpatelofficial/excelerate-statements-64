import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { X, Download, ChevronDown, FileSpreadsheet, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
}

interface ConvertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  transactions: Transaction[];
  onExport: (format: 'excel' | 'csv') => void;
  onSendFeedback: (feedback: string) => void;
}

const ConvertDialog = ({ 
  isOpen, 
  onClose, 
  fileName, 
  transactions, 
  onExport,
  onSendFeedback 
}: ConvertDialogProps) => {
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSendFeedback = () => {
    if (feedback.trim()) {
      onSendFeedback(feedback);
      setFeedback("");
      setShowFeedback(false);
      toast.success("Feedback sent! Thank you for helping us improve.");
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    onExport(format);
    toast.success(`${format.toUpperCase()} file download started!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Converted Data: {fileName}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Extracted Transactions</span>
                <Badge variant="secondary">
                  {transactions.length} transactions found
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left font-semibold">Date</th>
                      <th className="border border-border p-3 text-left font-semibold">Description</th>
                      <th className="border border-border p-3 text-right font-semibold">Debit</th>
                      <th className="border border-border p-3 text-right font-semibold">Credit</th>
                      <th className="border border-border p-3 text-right font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-muted/30">
                        <td className="border border-border p-3">{transaction.date}</td>
                        <td className="border border-border p-3">{transaction.description}</td>
                        <td className="border border-border p-3 text-right text-destructive">
                          {transaction.debit}
                        </td>
                        <td className="border border-border p-3 text-right text-success">
                          {transaction.credit}
                        </td>
                        <td className="border border-border p-3 text-right font-medium">
                          {transaction.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-shrink-0 space-y-4">
          {showFeedback && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Help us improve our extraction accuracy:
                  </label>
                  <Textarea
                    placeholder="Tell us about any missing or incorrect transactions..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSendFeedback} size="sm">
                      Send Feedback
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowFeedback(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Send Feedback
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glow" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV (.csv)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertDialog;