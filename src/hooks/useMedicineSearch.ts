import { useState, useEffect, useRef, useCallback } from "react";

export interface MedicineSuggestion {
  name: string;
  strength: string;
  generic: string;
  company: string;
}

interface RawMedicine {
  n: string;
  s: string;
  g: string;
  c: string;
}

let cachedData: RawMedicine[] | null = null;
let loadingPromise: Promise<RawMedicine[]> | null = null;

const loadMedicines = async (): Promise<RawMedicine[]> => {
  if (cachedData) return cachedData;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch("/medicines.json")
    .then((r) => r.json())
    .then((data: RawMedicine[]) => {
      cachedData = data;
      return data;
    });

  return loadingPromise;
};

const searchMedicines = (data: RawMedicine[], query: string): MedicineSuggestion[] => {
  const q = query.toLowerCase();
  const results: MedicineSuggestion[] = [];

  for (const med of data) {
    if (results.length >= 20) break;
    if (med.n.toLowerCase().includes(q)) {
      results.push({ name: med.n, strength: med.s, generic: med.g, company: med.c });
    }
  }

  // Sort: starts-with first
  results.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  });

  return results;
};

export const useMedicineSearch = (query: string) => {
  const [suggestions, setSuggestions] = useState<MedicineSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const data = await loadMedicines();
      const results = searchMedicines(data, query);
      setSuggestions(results);
      setLoading(false);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { suggestions, loading };
};
