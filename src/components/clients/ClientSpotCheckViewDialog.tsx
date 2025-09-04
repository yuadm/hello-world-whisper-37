import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, User, Eye } from "lucide-react";

interface ClientSpotCheckRecord {
  id: string;
  service_user_name: string;
  date: string;
  performed_by: string;
  observations: Array<{
    label: string;
    value: string;
    comments?: string;
  }>;
}

interface Client {
  id: string;
  name: string;
  branches?: {
    name: string;
  };
}

interface ClientSpotCheckViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  spotCheckRecord: ClientSpotCheckRecord | null;
}

export function ClientSpotCheckViewDialog({
  open,
  onOpenChange,
  client,
  spotCheckRecord
}: ClientSpotCheckViewDialogProps) {
  if (!client || !spotCheckRecord) return null;

  const getRatingBadge = (value: string) => {
    const normalizedValue = value?.toLowerCase();
    switch (normalizedValue) {
      case 'excellent':
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case 'very_good':
      case 'very good':
        return "bg-green-100 text-green-800 border-green-200";
      case 'good':
        return "bg-lime-100 text-lime-800 border-lime-200";
      case 'fair':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'poor':
        return "bg-red-100 text-red-800 border-red-200";
      case 'not_applicable':
      case 'n/a':
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRatingText = (value: string) => {
    switch (value?.toLowerCase()) {
      case 'very_good':
        return 'Very Good';
      case 'not_applicable':
        return 'N/A';
      default:
        return value?.charAt(0).toUpperCase() + value?.slice(1) || 'Not Rated';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="w-5 h-5 text-primary" />
            Client Spot Check Record
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Client Information */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg text-primary">Client Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Client:</span>
                  <span>{client.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Branch:</span>
                  <span>{client.branches?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Spot Check Information */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-lg text-primary">Spot Check Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service User Name</label>
                  <p className="text-foreground">{spotCheckRecord.service_user_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="text-foreground">{spotCheckRecord.date}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completed By</label>
                  <p className="text-foreground">{spotCheckRecord.performed_by}</p>
                </div>
              </div>
            </div>

            {/* Assessment Questions */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold text-lg text-primary mb-4">Assessment Questions</h3>
              <div className="space-y-4">
                {spotCheckRecord.observations?.map((observation, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {index + 1}. {observation.label}
                        </h4>
                      </div>
                      <Badge className={getRatingBadge(observation.value)}>
                        {getRatingText(observation.value)}
                      </Badge>
                    </div>
                    
                    {observation.comments && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <label className="text-sm font-medium text-muted-foreground">Comments:</label>
                        <p className="mt-1 text-foreground whitespace-pre-wrap">
                          {observation.comments}
                        </p>
                      </div>
                    )}
                    
                    {index < spotCheckRecord.observations.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
                
                {(!spotCheckRecord.observations || spotCheckRecord.observations.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No assessment questions found
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}