import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Settings, Pencil, Check, X } from "lucide-react";

export interface MedicineOptions {
  types: string[];
  doses: string[];
  durations: string[];
  meals: string[];
  adviceList: string[];
  followUpOptions: { label: string; days: number }[];
}

const STORAGE_KEY = "medicine-options";

const DEFAULT_OPTIONS: MedicineOptions = {
  types: ["Tab", "Cap", "Syr", "Inj", "Supp", "Drop", "Cream", "Oint"],
  doses: ["1+0+0", "0+0+1", "1+0+1", "1+1+1", "1+1+1+1", "0+1+0"],
  durations: ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "Continue"],
  meals: ["খাবার পরে (After meal)", "খাবার আগে (Before meal)", "Empty stomach"],
  adviceList: [
    "প্রচুর পানি পান করুন",
    "বিশ্রাম নিন",
    "তৈলাক্ত খাবার পরিহার করুন",
    "নিয়মিত ব্যায়াম করুন",
    "লবণ কম খান",
    "ধূমপান পরিহার করুন",
    "সময়মতো ওষুধ সেবন করুন",
    "পরবর্তী ভিজিটে রিপোর্ট নিয়ে আসুন",
  ],
  followUpOptions: [
    { label: "3 দিন পর", days: 3 },
    { label: "5 দিন পর", days: 5 },
    { label: "7 দিন পর", days: 7 },
    { label: "10 দিন পর", days: 10 },
    { label: "15 দিন পর", days: 15 },
    { label: "1 মাস পর", days: 30 },
    { label: "2 মাস পর", days: 60 },
    { label: "3 মাস পর", days: 90 },
  ],
};

export const loadMedicineOptions = (): MedicineOptions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_OPTIONS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_OPTIONS;
};

const saveMedicineOptions = (options: MedicineOptions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
};

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}

const ListEditor = ({ items, onChange, placeholder }: ListEditorProps) => {
  const [newItem, setNewItem] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addItem = () => {
    const v = newItem.trim();
    if (v && !items.includes(v)) {
      onChange([...items, v]);
      setNewItem("");
    }
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(items[idx]);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const v = editValue.trim();
    if (v) {
      const updated = [...items];
      updated[editIdx] = v;
      onChange(updated);
    }
    setEditIdx(null);
    setEditValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          className="h-8 text-xs"
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={addItem}>
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1 bg-muted/50 rounded px-2 py-1 text-xs group">
            {editIdx === idx ? (
              <>
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-6 text-xs flex-1" onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveEdit}><Check className="w-3 h-3 text-green-600" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditIdx(null)}><X className="w-3 h-3" /></Button>
              </>
            ) : (
              <>
                <span className="flex-1">{item}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => startEdit(idx)}><Pencil className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeItem(idx)}><Trash2 className="w-3 h-3" /></Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FollowUpEditor = ({ items, onChange }: { items: { label: string; days: number }[]; onChange: (items: { label: string; days: number }[]) => void }) => {
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDays, setEditDays] = useState("");

  const addItem = () => {
    const l = newLabel.trim();
    const d = parseInt(newDays);
    if (l && !isNaN(d) && d > 0) {
      onChange([...items, { label: l, days: d }]);
      setNewLabel(""); setNewDays("");
    }
  };

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditLabel(items[idx].label);
    setEditDays(String(items[idx].days));
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const l = editLabel.trim();
    const d = parseInt(editDays);
    if (l && !isNaN(d) && d > 0) {
      const updated = [...items];
      updated[editIdx] = { label: l, days: d };
      onChange(updated);
    }
    setEditIdx(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label (e.g. ৭ দিন পর)" className="h-8 text-xs flex-1" />
        <Input value={newDays} onChange={(e) => setNewDays(e.target.value)} placeholder="Days" type="number" className="h-8 text-xs w-20" />
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={addItem}><Plus className="w-3 h-3" /> Add</Button>
      </div>
      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1 bg-muted/50 rounded px-2 py-1 text-xs group">
            {editIdx === idx ? (
              <>
                <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-6 text-xs flex-1" />
                <Input value={editDays} onChange={(e) => setEditDays(e.target.value)} type="number" className="h-6 text-xs w-16" />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveEdit}><Check className="w-3 h-3 text-green-600" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditIdx(null)}><X className="w-3 h-3" /></Button>
              </>
            ) : (
              <>
                <span className="flex-1">{item.label} ({item.days}d)</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => startEdit(idx)}><Pencil className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => onChange(items.filter((_, i) => i !== idx))}><Trash2 className="w-3 h-3" /></Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface Props {
  options: MedicineOptions;
  onChange: (options: MedicineOptions) => void;
}

const MedicineSettings = ({ options, onChange }: Props) => {
  const handleChange = (key: keyof MedicineOptions, items: string[]) => {
    const updated = { ...options, [key]: items };
    onChange(updated);
    saveMedicineOptions(updated);
  };

  const handleFollowUpChange = (items: { label: string; days: number }[]) => {
    const updated = { ...options, followUpOptions: items };
    onChange(updated);
    saveMedicineOptions(updated);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <Settings className="w-3 h-3" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Medicine Options Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="types">
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="types" className="text-xs">Types</TabsTrigger>
            <TabsTrigger value="doses" className="text-xs">Doses</TabsTrigger>
            <TabsTrigger value="durations" className="text-xs">Duration</TabsTrigger>
            <TabsTrigger value="meals" className="text-xs">Meal</TabsTrigger>
            <TabsTrigger value="advice" className="text-xs">Advice</TabsTrigger>
            <TabsTrigger value="followup" className="text-xs">Follow-up</TabsTrigger>
          </TabsList>
          <TabsContent value="types">
            <Label className="text-xs text-muted-foreground mb-2 block">Medicine types (Tab, Cap, Syr...)</Label>
            <ListEditor items={options.types} onChange={(v) => handleChange("types", v)} placeholder="e.g. Nebulizer" />
          </TabsContent>
          <TabsContent value="doses">
            <Label className="text-xs text-muted-foreground mb-2 block">Dose patterns</Label>
            <ListEditor items={options.doses} onChange={(v) => handleChange("doses", v)} placeholder="e.g. 2+0+2" />
          </TabsContent>
          <TabsContent value="durations">
            <Label className="text-xs text-muted-foreground mb-2 block">Duration options</Label>
            <ListEditor items={options.durations} onChange={(v) => handleChange("durations", v)} placeholder="e.g. 21 days" />
          </TabsContent>
          <TabsContent value="meals">
            <Label className="text-xs text-muted-foreground mb-2 block">Meal timing options</Label>
            <ListEditor items={options.meals} onChange={(v) => handleChange("meals", v)} placeholder="e.g. With food" />
          </TabsContent>
          <TabsContent value="advice">
            <Label className="text-xs text-muted-foreground mb-2 block">Advice options (পরামর্শ)</Label>
            <ListEditor items={options.adviceList} onChange={(v) => handleChange("adviceList", v)} placeholder="e.g. প্রচুর পানি পান করুন" />
          </TabsContent>
          <TabsContent value="followup">
            <Label className="text-xs text-muted-foreground mb-2 block">Follow-up options (label — days)</Label>
            <FollowUpEditor items={options.followUpOptions} onChange={(v) => handleFollowUpChange(v)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineSettings;
