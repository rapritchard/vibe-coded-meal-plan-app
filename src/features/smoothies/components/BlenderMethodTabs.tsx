import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StepList } from "@/components/shared/StepList";

interface BlenderMethodTabsProps {
  bc151Steps: string[];
  duoSteps: string[];
}

export function BlenderMethodTabs({
  bc151Steps,
  duoSteps,
}: BlenderMethodTabsProps) {
  return (
    <Tabs defaultValue="bc151" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="bc151">BC151 Personal Cup</TabsTrigger>
        <TabsTrigger value="duo">Auto-iQ Duo</TabsTrigger>
      </TabsList>

      <TabsContent value="bc151" className="mt-4 space-y-2">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          BC151 Method
        </div>
        <StepList steps={bc151Steps} />
      </TabsContent>

      <TabsContent value="duo" className="mt-4 space-y-2">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Auto-iQ Duo Method
        </div>
        <StepList steps={duoSteps} />
      </TabsContent>
    </Tabs>
  );
}
