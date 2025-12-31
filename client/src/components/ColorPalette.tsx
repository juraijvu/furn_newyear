import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ColorSwatch from "./ColorSwatch";
import { colorPalette, type ColorItem } from "@/data/colorPalette";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColorPaletteProps {
  selectedColor?: ColorItem | null;
  onColorSelect?: (color: ColorItem) => void;
  recentColors?: ColorItem[];
}

export default function ColorPalette({ selectedColor, onColorSelect, recentColors = [] }: ColorPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPalette = colorPalette.map(category => ({
    ...category,
    colors: category.colors.filter(color =>
      color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      color.code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.colors.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3 tracking-wide uppercase text-sm">Color Palette</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-color-search"
            type="search"
            placeholder="Search colors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {recentColors.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Recently Used</h3>
          <div className="grid grid-cols-4 gap-3">
            {recentColors.slice(0, 8).map((color) => (
              <ColorSwatch
                key={color.id}
                color={color}
                isSelected={selectedColor?.id === color.id}
                onClick={() => onColorSelect?.(color)}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["stainless-steel", "wooden-finishing"]} className="space-y-2">
            {filteredPalette.map((category) => (
              <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline py-3" data-testid={`accordion-${category.id}`}>
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({category.colors.length})</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2">
                  <div className="grid grid-cols-4 gap-3">
                    {category.colors.map((color) => (
                      <ColorSwatch
                        key={color.id}
                        color={color}
                        isSelected={selectedColor?.id === color.id}
                        onClick={() => onColorSelect?.(color)}
                        size="sm"
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
