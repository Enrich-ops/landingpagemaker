import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Search,
  Globe,
  Palette,
  Type,
  Image,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export interface BrandData {
  siteName: string;
  siteUrl: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImage: string | null;
  colors: Array<{ hex: string; source: string; label?: string }>;
  fonts: Array<{ family: string; source: string; weights?: string[]; url?: string }>;
}

interface BrandScannerProps {
  open: boolean;
  onClose: () => void;
  onApply: (brand: BrandData) => void;
}

export default function BrandScanner({ open, onClose, onApply }: BrandScannerProps) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<BrandData | null>(null);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedFonts, setSelectedFonts] = useState<Set<string>>(new Set());
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const scanMutation = trpc.brandScanner.scan.useMutation({
    onSuccess(data) {
      if (data.success) {
        setResult(data.data);
        // Pre-select first 5 useful colors and first 2 fonts
        setSelectedColors(new Set(data.data.colors.slice(0, 5).map((c) => c.hex)));
        setSelectedFonts(new Set(data.data.fonts.slice(0, 2).map((f) => f.family)));
      } else {
        toast.error(`Scan failed: ${data.error}`);
      }
    },
    onError(err) {
      toast.error(`Could not reach site: ${err.message}`);
    },
  });

  const handleScan = () => {
    if (!url.trim()) return;
    setResult(null);
    scanMutation.mutate({ url: url.trim() });
  };

  const toggleColor = (hex: string) => {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      next.has(hex) ? next.delete(hex) : next.add(hex);
      return next;
    });
  };

  const toggleFont = (family: string) => {
    setSelectedFonts((prev) => {
      const next = new Set(prev);
      next.has(family) ? next.delete(family) : next.add(family);
      return next;
    });
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleApply = () => {
    if (!result) return;
    const filtered: BrandData = {
      ...result,
      colors: result.colors.filter((c) => selectedColors.has(c.hex)),
      fonts: result.fonts.filter((f) => selectedFonts.has(f.family)),
    };
    onApply(filtered);
    toast.success("Brand applied to style guide!");
    onClose();
  };

  const sourceLabel: Record<string, string> = {
    "css-variable": "CSS var",
    background: "BG",
    text: "Text",
    border: "Border",
    computed: "Computed",
    "google-fonts": "Google Fonts",
    "font-face": "@font-face",
    system: "CSS",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Brand Scanner
          </DialogTitle>
          <DialogDescription>
            Paste any website URL to extract its colors, fonts, and logo — then apply them to your landing page.
          </DialogDescription>
        </DialogHeader>

        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="flex-1"
          />
          <Button
            onClick={handleScan}
            disabled={scanMutation.isPending || !url.trim()}
          >
            {scanMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {scanMutation.isPending ? "Scanning…" : "Scan"}
          </Button>
        </div>

        {/* Loading state */}
        {scanMutation.isPending && (
          <div className="flex flex-col items-center py-10 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm">Fetching stylesheets and parsing brand assets…</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5">
            {/* Site info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {(result.faviconUrl || result.logoUrl) && (
                <img
                  src={result.logoUrl ?? result.faviconUrl ?? ""}
                  alt="logo"
                  className="h-8 w-8 object-contain rounded"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <div>
                <p className="font-semibold">{result.siteName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">{result.siteUrl}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto shrink-0" />
            </div>

            {/* OG Image preview */}
            {result.ogImage && (
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5 mb-2">
                  <Image className="h-4 w-4" /> OG Image
                </p>
                <img
                  src={result.ogImage}
                  alt="og"
                  className="rounded-lg w-full max-h-32 object-cover border"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}

            <Separator />

            {/* Colors */}
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5 mb-3">
                <Palette className="h-4 w-4" />
                Colors
                <span className="text-muted-foreground font-normal">
                  ({result.colors.length} found — click to select)
                </span>
              </p>
              {result.colors.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> No colors extracted from this site.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.colors.map((color) => {
                    const selected = selectedColors.has(color.hex);
                    return (
                      <button
                        key={color.hex}
                        onClick={() => toggleColor(color.hex)}
                        className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                          selected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-border hover:border-blue-300"
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-mono">{color.hex}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {sourceLabel[color.source] ?? color.source}
                        </Badge>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyHex(color.hex); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedHex === color.hex ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Fonts */}
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5 mb-3">
                <Type className="h-4 w-4" />
                Fonts
                <span className="text-muted-foreground font-normal">
                  ({result.fonts.length} found — click to select)
                </span>
              </p>
              {result.fonts.length === 0 ? (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> No web fonts detected.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.fonts.map((font) => {
                    const selected = selectedFonts.has(font.family);
                    return (
                      <button
                        key={font.family}
                        onClick={() => toggleFont(font.family)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                          selected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-border hover:border-blue-300"
                        }`}
                        style={{ fontFamily: `'${font.family}', sans-serif` }}
                      >
                        <span className="font-medium">{font.family}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 font-sans">
                          {sourceLabel[font.source] ?? font.source}
                        </Badge>
                        {font.weights && font.weights.length > 0 && (
                          <span className="text-xs text-muted-foreground font-sans">
                            {font.weights.slice(0, 3).join(", ")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Apply button */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-sm text-muted-foreground">
                {selectedColors.size} color{selectedColors.size !== 1 ? "s" : ""} &amp;{" "}
                {selectedFonts.size} font{selectedFonts.size !== 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={handleApply}
                  disabled={selectedColors.size === 0 && selectedFonts.size === 0}
                >
                  Apply to Style Guide
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
