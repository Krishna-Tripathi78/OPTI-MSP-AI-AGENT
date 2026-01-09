import { useState, useEffect, useRef } from "react";
import { Palette, Check, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/context/ThemeContext";

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, colorTheme, setColorTheme, availableColorThemes, isDarkMode } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
          <Card className="border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Theme Customizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Dark/Light Mode Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer" onClick={toggleDarkMode}>
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="text-sm">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all duration-200 ${isDarkMode ? 'bg-primary' : 'bg-gray-300'
                  } relative cursor-pointer`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 absolute top-0.5 shadow-sm ${isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                </div>
              </div>

              <Separator />

              {/* Color Themes */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color Themes</span>
                {availableColorThemes.map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => setColorTheme(t.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-sm">{t.name}</span>
                    </div>
                    {colorTheme === t.name && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}