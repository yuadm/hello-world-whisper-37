import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Canvas as FabricCanvas, Circle, FabricText, Rect } from "fabric";

// Body part regions with their names and approximate click areas
const BODY_PARTS = [
  { name: "Head", x: 200, y: 80, region: { minX: 180, maxX: 220, minY: 60, maxY: 100 } },
  { name: "Neck", x: 200, y: 110, region: { minX: 190, maxX: 210, minY: 100, maxY: 120 } },
  { name: "Left Shoulder", x: 160, y: 140, region: { minX: 150, maxX: 180, minY: 130, maxY: 160 } },
  { name: "Right Shoulder", x: 240, y: 140, region: { minX: 220, maxX: 250, minY: 130, maxY: 160 } },
  { name: "Left Arm", x: 130, y: 180, region: { minX: 110, maxX: 160, minY: 160, maxY: 220 } },
  { name: "Right Arm", x: 270, y: 180, region: { minX: 240, maxX: 290, minY: 160, maxY: 220 } },
  { name: "Chest", x: 200, y: 170, region: { minX: 180, maxX: 220, minY: 150, maxY: 200 } },
  { name: "Abdomen", x: 200, y: 220, region: { minX: 180, maxX: 220, minY: 200, maxY: 250 } },
  { name: "Left Hand", x: 100, y: 230, region: { minX: 90, maxX: 120, minY: 220, maxY: 250 } },
  { name: "Right Hand", x: 300, y: 230, region: { minX: 280, maxX: 310, minY: 220, maxY: 250 } },
  { name: "Left Hip", x: 180, y: 260, region: { minX: 170, maxX: 190, minY: 250, maxY: 280 } },
  { name: "Right Hip", x: 220, y: 260, region: { minX: 210, maxX: 230, minY: 250, maxY: 280 } },
  { name: "Left Thigh", x: 180, y: 320, region: { minX: 170, maxX: 200, minY: 280, maxY: 360 } },
  { name: "Right Thigh", x: 220, y: 320, region: { minX: 200, maxX: 230, minY: 280, maxY: 360 } },
  { name: "Left Knee", x: 180, y: 380, region: { minX: 170, maxX: 200, minY: 360, maxY: 400 } },
  { name: "Right Knee", x: 220, y: 380, region: { minX: 200, maxX: 230, minY: 360, maxY: 400 } },
  { name: "Left Shin", x: 180, y: 440, region: { minX: 170, maxX: 200, minY: 400, maxY: 480 } },
  { name: "Right Shin", x: 220, y: 440, region: { minX: 200, maxX: 230, minY: 400, maxY: 480 } },
  { name: "Left Foot", x: 180, y: 500, region: { minX: 170, maxX: 200, minY: 480, maxY: 520 } },
  { name: "Right Foot", x: 220, y: 500, region: { minX: 200, maxX: 230, minY: 480, maxY: 520 } },
];

interface BodyMarker {
  x: number;
  y: number;
  bodyPart: string;
}

interface BodyDiagramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (markers: BodyMarker[]) => void;
  title: string;
  initialMarkers?: BodyMarker[];
}

export default function BodyDiagramModal({ 
  open, 
  onOpenChange, 
  onSave, 
  title, 
  initialMarkers = [] 
}: BodyDiagramModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [markers, setMarkers] = useState<BodyMarker[]>(initialMarkers);

  useEffect(() => {
    if (!canvasRef.current || !open) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 550,
      backgroundColor: "#ffffff",
    });

    // Create a simple body outline (basic human figure)
    // Head (circle)
    canvas.add(new Circle({ left: 185, top: 65, radius: 25, fill: "transparent", stroke: "#333", strokeWidth: 2, selectable: false }));
    // Body (rectangle)
    canvas.add(new Rect({ left: 175, top: 120, width: 50, height: 100, fill: "transparent", stroke: "#333", strokeWidth: 2, selectable: false }));
    // Arms
    canvas.add(new Rect({ left: 130, top: 140, width: 40, height: 15, fill: "transparent", stroke: "#333", strokeWidth: 2, selectable: false }));
    canvas.add(new Rect({ left: 230, top: 140, width: 40, height: 15, fill: "transparent", stroke: "#333", strokeWidth: 2, selectable: false }));
    // Legs
    canvas.add(new Rect({ left: 180, top: 230, width: 15, height: 80, fill: "transparent", stroke: "#333", strokeWidth: 2, selectable: false }));
    canvas.add(new Rect({ left: 205, top: 230, width: 15, height: 80, fill: "transparent", stroke: "#333", strokeWidth: 2, selectable: false }));

    canvas.on('mouse:down', (e) => {
      const pointer = canvas.getPointer(e.e);
      const clickedBodyPart = getBodyPartAtPosition(pointer.x, pointer.y);
      
      if (clickedBodyPart) {
        addMarker(pointer.x, pointer.y, clickedBodyPart);
      }
    });

    // Add initial markers
    initialMarkers.forEach(marker => {
      addMarkerToCanvas(canvas, marker.x, marker.y, marker.bodyPart);
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [open]);

  const getBodyPartAtPosition = (x: number, y: number): string | null => {
    for (const part of BODY_PARTS) {
      const { region } = part;
      if (x >= region.minX && x <= region.maxX && y >= region.minY && y <= region.maxY) {
        return part.name;
      }
    }
    return null;
  };

  const addMarkerToCanvas = (canvas: FabricCanvas, x: number, y: number, bodyPart: string) => {
    // Red circle marker
    const marker = new Circle({
      left: x - 8,
      top: y - 8,
      radius: 8,
      fill: "#dc2626",
      stroke: "#ffffff",
      strokeWidth: 2,
      selectable: true,
      hasControls: false,
      hasBorders: false,
    });

    // Body part label
    const label = new FabricText(bodyPart, {
      left: x + 15,
      top: y - 10,
      fontSize: 12,
      fill: "#333",
      selectable: true,
      hasControls: false,
      hasBorders: false,
    });

    canvas.add(marker, label);
    canvas.renderAll();
  };

  const addMarker = (x: number, y: number, bodyPart: string) => {
    // Check if marker already exists for this body part
    const existingIndex = markers.findIndex(m => m.bodyPart === bodyPart);
    
    if (existingIndex >= 0) {
      // Remove existing marker
      setMarkers(prev => prev.filter((_, i) => i !== existingIndex));
      
      // Clear and redraw canvas
      if (fabricCanvas) {
        fabricCanvas.clear();
        fabricCanvas.backgroundColor = "#ffffff";
        
        // Redraw all markers except the one being replaced
        markers.filter((_, i) => i !== existingIndex).forEach(marker => {
          addMarkerToCanvas(fabricCanvas, marker.x, marker.y, marker.bodyPart);
        });
      }
    }

    // Add new marker
    const newMarker = { x, y, bodyPart };
    setMarkers(prev => [...prev.filter(m => m.bodyPart !== bodyPart), newMarker]);
    
    if (fabricCanvas) {
      addMarkerToCanvas(fabricCanvas, x, y, bodyPart);
    }
  };

  const handleSave = () => {
    onSave(markers);
    onOpenChange(false);
  };

  const handleClear = () => {
    setMarkers([]);
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "#ffffff";
      fabricCanvas.renderAll();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click on the body diagram to mark locations. Click again to remove a marker.
          </p>
          
          <div className="flex justify-center border rounded-lg p-4 bg-muted/5">
            <canvas 
              ref={canvasRef}
              className="border border-border rounded"
            />
          </div>
          
          {markers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Marked Locations:</h4>
              <div className="flex flex-wrap gap-2">
                {markers.map((marker, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-destructive/10 text-destructive"
                  >
                    {marker.bodyPart}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Locations
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}