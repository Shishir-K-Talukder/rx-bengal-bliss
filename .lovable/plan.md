

# Backend Fixes — Attach Missing Database Triggers

## Current State
Your database tables (`profiles`, `patients`, `prescriptions`, `doctor_settings`) and functions (`handle_new_user`, `update_updated_at_column`) already exist with proper RLS policies. However, **no triggers are attached**, meaning:

1. **New signups don't auto-create a profile** — the `handle_new_user` function exists but isn't wired to fire on `auth.users` inserts
2. **`updated_at` columns don't auto-update** — the function exists but no trigger fires it

## What Will Be Done

### Migration: Attach triggers

```sql
-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profiles, patients, prescriptions, doctor_settings
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_settings_updated_at
  BEFORE UPDATE ON public.doctor_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

No code changes needed — just this one migration to wire up the existing functions.

