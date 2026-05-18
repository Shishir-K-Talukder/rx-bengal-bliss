import { useMemo, useState } from "react";
import FloatingNav from "@/components/FloatingNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, CalendarHeart, Scale, Pill } from "lucide-react";
import { PEDIATRIC_DRUGS, calculateDose, type PediatricDrug } from "@/lib/pediatricDrugs";
import { addDays, differenceInDays, differenceInWeeks, format, parseISO } from "date-fns";

/* -------------------- EDD Calculator -------------------- */
const EDDCalculator = () => {
  const [lmp, setLmp] = useState("");
  const result = useMemo(() => {
    if (!lmp) return null;
    try {
      const d = parseISO(lmp);
      const edd = addDays(d, 280);
      const today = new Date();
      const days = differenceInDays(today, d);
      const weeks = Math.floor(days / 7);
      const remDays = days - weeks * 7;
      return {
        edd: format(edd, "dd-MM-yyyy"),
        ga: days >= 0 && days <= 300 ? `${weeks} weeks ${remDays} days` : "—",
        daysLeft: differenceInDays(edd, today),
      };
    } catch { return null; }
  }, [lmp]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarHeart className="w-4 h-4 text-primary" /> EDD Calculator (Naegele's rule)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">First day of LMP</Label>
          <Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="h-9" />
        </div>
        {result && (
          <div className="rounded-lg border bg-accent/30 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">EDD</span><span className="font-bold text-primary">{result.edd}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gestational age</span><span className="font-semibold">{result.ga}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Days to EDD</span><span className="font-semibold">{result.daysLeft}</span></div>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">EDD = LMP + 280 days (40 weeks).</p>
      </CardContent>
    </Card>
  );
};

/* -------------------- BMI / Weight Chart -------------------- */
const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");

  const bmi = useMemo(() => {
    const w = parseFloat(weight), h = parseFloat(height) / 100;
    if (!w || !h) return null;
    const val = w / (h * h);
    let cat = "";
    if (val < 18.5) cat = "Underweight";
    else if (val < 25) cat = "Normal";
    else if (val < 30) cat = "Overweight";
    else cat = "Obese";
    return { val: val.toFixed(1), cat };
  }, [weight, height]);

  const peds = useMemo(() => {
    const a = parseFloat(age);
    if (!a || a < 1 || a > 12) return null;
    // Standard pediatric formulas
    const expectedWt = 2 * a + 8;            // kg (1–10 yr)
    const expectedHt = 6 * a + 77;           // cm
    return { wt: expectedWt.toFixed(1), ht: expectedHt.toFixed(0) };
  }, [age]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="w-4 h-4 text-primary" /> BMI & Pediatric Weight Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Weight (kg)</Label>
            <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Height (cm)</Label>
            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-9" />
          </div>
        </div>
        {bmi && (
          <div className="rounded-lg border bg-accent/30 p-3 text-sm flex justify-between">
            <span className="text-muted-foreground">BMI</span>
            <span className="font-bold text-primary">{bmi.val} kg/m² <span className="text-xs text-muted-foreground ml-1">({bmi.cat})</span></span>
          </div>
        )}
        <div className="pt-2 border-t">
          <Label className="text-xs">Child Age (1–12 yr) – Expected values</Label>
          <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-9" placeholder="years" />
          {peds && (
            <div className="mt-2 rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Weight</span><span className="font-semibold">{peds.wt} kg</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Height</span><span className="font-semibold">{peds.ht} cm</span></div>
              <p className="text-[10px] text-muted-foreground italic">Formulas: Wt = 2×age+8 kg • Ht = 6×age+77 cm</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/* -------------------- Pediatric Dose Calculator -------------------- */
const PediatricDose = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PediatricDrug | null>(null);
  const [weight, setWeight] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    return PEDIATRIC_DRUGS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query]);

  const result = selected && weight ? calculateDose(selected, parseFloat(weight)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Baby className="w-4 h-4 text-primary" /> Pediatric Dose Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Label className="text-xs">Medicine / Generic Name</Label>
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="e.g. Paracetamol, Amoxicillin..."
            className="h-9"
          />
          {open && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {suggestions.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-0 text-xs"
                  onMouseDown={(e) => { e.preventDefault(); setSelected(d); setQuery(d.name); setOpen(false); }}
                >
                  <div className="font-medium text-foreground">{d.name} <span className="text-muted-foreground">• {d.strength}</span></div>
                  <div className="text-[10px] text-muted-foreground">{d.generic} • {d.frequency}{d.dailyDose ? ` • ${d.dailyDose}` : ""}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="text-xs">Baby Weight (kg)</Label>
          <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" placeholder="e.g. 8" />
        </div>

        {selected && (
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Strength</span><span className="font-semibold">{selected.strength}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Std dose</span><span className="font-semibold">{selected.dailyDose || "—"}</span></div>
          </div>
        )}

        {result && (
          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Prescription Dose</p>
            <p className="text-2xl font-bold text-primary">{result.prescription}</p>
            <p className="text-[11px] text-muted-foreground mt-2">{result.details}</p>
            {selected?.notes && <p className="text-[11px] text-foreground mt-1 italic">{selected.notes}</p>}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground italic">
          Reference: Paediatrics Dose (Dr. Sumon) & QuickRx Pediatric Drug Dose. Always cross-check before prescribing.
        </p>
      </CardContent>
    </Card>
  );
};

/* -------------------- Page -------------------- */
const Tools = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Pill className="w-6 h-6 text-primary" /> Clinical Tools</h1>
          <p className="text-sm text-muted-foreground">Quick calculators for daily practice.</p>
        </div>
        <Tabs defaultValue="pedidose" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pedidose">Pediatric Dose</TabsTrigger>
            <TabsTrigger value="edd">EDD</TabsTrigger>
            <TabsTrigger value="bmi">BMI / Weight</TabsTrigger>
          </TabsList>
          <TabsContent value="pedidose"><PediatricDose /></TabsContent>
          <TabsContent value="edd"><EDDCalculator /></TabsContent>
          <TabsContent value="bmi"><BMICalculator /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Tools;
