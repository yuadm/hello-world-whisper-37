import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientAddComplianceRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    clientId: string;
    periodIdentifier: string;
    completionDate: string;
    notes?: string;
  }) => void;
  clientId: string;
  clientName: string;
  periodIdentifier: string;
  complianceTypeName: string;
}

export function ClientAddComplianceRecordModal({
  open,
  onOpenChange,
  onSubmit,
  clientId,
  clientName,
  periodIdentifier,
  complianceTypeName
}: ClientAddComplianceRecordModalProps) {
  const [date, setDate] = useState<Date>();
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      return;
    }

    onSubmit({
      clientId,
      periodIdentifier,
      completionDate: format(date, 'yyyy-MM-dd'),
      notes: notes.trim() || undefined
    });

    // Reset form
    setDate(undefined);
    setNotes("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setDate(undefined);
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add {complianceTypeName} Record - {clientName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="completion-date">Completion Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="completion-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select completion date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this compliance record..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!date}>
              Add Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}