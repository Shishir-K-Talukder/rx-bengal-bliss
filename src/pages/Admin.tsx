import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Stethoscope, FileText, Shield, Search, Trash2, Eye, UserCheck, UserX, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Navigate, useNavigate } from "react-router-dom";

interface DoctorProfile {
  id: string;
  user_id: string;
  name: string;
  degrees: string;
  specialization: string;
  bmdc_no: string;
  phone: string;
  chamber_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Patient {
  id: string;
  user_id: string;
  name: string;
  age: string;
  sex: string;
  mobile: string;
  address: string;
  created_at: string;
}

interface Prescription {
  id: string;
  user_id: string;
  patient_data: any;
  clinical_data: any;
  medicines: any;
  advice: any;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [search, setSearch] = useState("");
  const [newAdminUserId, setNewAdminUserId] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  const loadAll = async () => {
    setLoading(true);
    const [docRes, patRes, rxRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
      supabase.from("prescriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
    ]);
    if (docRes.data) setDoctors(docRes.data as any);
    if (patRes.data) setPatients(patRes.data);
    if (rxRes.data) setPrescriptions(rxRes.data);
    if (roleRes.data) setRoles(roleRes.data as any);
    setLoading(false);
  };

  const toggleUserActive = async (userId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentActive } as any)
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update user status");
      return;
    }
    setDoctors((prev) =>
      prev.map((d) => (d.user_id === userId ? { ...d, is_active: !currentActive } : d))
    );
    toast.success(!currentActive ? "User activated" : "User deactivated");
  };

  const deletePatient = async (id: string) => {
    await supabase.from("patients").delete().eq("id", id);
    setPatients((p) => p.filter((x) => x.id !== id));
    toast.success("Patient deleted");
  };

  const deletePrescription = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    setPrescriptions((p) => p.filter((x) => x.id !== id));
    toast.success("Prescription deleted");
  };

  const addAdminRole = async () => {
    if (!newAdminUserId.trim()) return;
    const { error } = await supabase.from("user_roles").insert({
      user_id: newAdminUserId.trim(),
      role: "admin" as any,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Admin role assigned");
      setNewAdminUserId("");
      loadAll();
    }
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    setRoles((r) => r.filter((x) => x.id !== id));
    toast.success("Role removed");
  };

  if (adminLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const filteredDoctors = doctors.filter((d) =>
    `${d.name} ${d.specialization} ${d.bmdc_no} ${d.phone}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPatients = patients.filter((p) =>
    `${p.name} ${p.mobile} ${p.address}`.toLowerCase().includes(search.toLowerCase())
  );

  const getDoctorName = (userId: string) => {
    const doc = doctors.find((d) => d.user_id === userId);
    return doc?.name || userId.slice(0, 8) + "...";
  };

  const getDoctorPrescriptionCount = (userId: string) =>
    prescriptions.filter((rx) => rx.user_id === userId).length;

  const getDoctorPatientCount = (userId: string) =>
    patients.filter((p) => p.user_id === userId).length;

  const activeDoctors = doctors.filter((d) => d.is_active !== false).length;
  const inactiveDoctors = doctors.filter((d) => d.is_active === false).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-6 px-4 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <Badge variant="outline" className="ml-auto text-xs">Secret Access</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{doctors.length}</p>
                <p className="text-[10px] text-muted-foreground">Total Doctors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-xl font-bold">{activeDoctors}</p>
                <p className="text-[10px] text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <UserX className="w-6 h-6 text-destructive" />
              <div>
                <p className="text-xl font-bold">{inactiveDoctors}</p>
                <p className="text-[10px] text-muted-foreground">Deactivated</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{patients.length}</p>
                <p className="text-[10px] text-muted-foreground">Patients</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{prescriptions.length}</p>
                <p className="text-[10px] text-muted-foreground">Prescriptions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search doctors, patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Tabs defaultValue="doctors">
          <TabsList className="mb-4">
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="roles">Admin Access</TabsTrigger>
          </TabsList>

          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader><CardTitle>All Doctors / Users</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>BMDC</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-center">Rx</TableHead>
                      <TableHead className="text-center">Patients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map((doc) => (
                      <TableRow key={doc.id} className={doc.is_active === false ? "opacity-50" : ""}>
                        <TableCell className="font-medium">
                          <button className="text-left hover:underline" onClick={() => setSelectedDoctor(doc)}>
                            {doc.name || "—"}
                          </button>
                        </TableCell>
                        <TableCell className="text-xs">{doc.specialization || "—"}</TableCell>
                        <TableCell className="text-xs">{doc.bmdc_no || "—"}</TableCell>
                        <TableCell className="text-xs">{doc.phone || "—"}</TableCell>
                        <TableCell className="text-center text-xs">{getDoctorPrescriptionCount(doc.user_id)}</TableCell>
                        <TableCell className="text-center text-xs">{getDoctorPatientCount(doc.user_id)}</TableCell>
                        <TableCell>
                          <Badge variant={doc.is_active !== false ? "default" : "destructive"} className="text-[10px]">
                            {doc.is_active !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {new Date(doc.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={doc.is_active !== false}
                              onCheckedChange={() => toggleUserActive(doc.user_id, doc.is_active !== false)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDoctors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground">No doctors found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader><CardTitle>All Patients</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name || "—"}</TableCell>
                        <TableCell>{p.age}</TableCell>
                        <TableCell>{p.sex}</TableCell>
                        <TableCell>{p.mobile}</TableCell>
                        <TableCell className="text-xs">{getDoctorName(p.user_id)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePatient(p.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPatients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">No patients found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader><CardTitle>All Prescriptions</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((rx) => {
                      const pd = rx.patient_data as any;
                      return (
                        <TableRow key={rx.id}>
                          <TableCell className="font-medium">{pd?.name || "—"}</TableCell>
                          <TableCell className="text-xs">{getDoctorName(rx.user_id)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(rx.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedPrescription(rx)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePrescription(rx.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {prescriptions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No prescriptions found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Access Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader><CardTitle>Manage Admin Access</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="User ID to assign admin role"
                    value={newAdminUserId}
                    onChange={(e) => setNewAdminUserId(e.target.value)}
                  />
                  <Button onClick={addAdminRole}>Assign Admin</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{getDoctorName(r.user_id)}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground">{r.user_id}</TableCell>
                        <TableCell><Badge>{r.role}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRole(r.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {roles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">No roles assigned</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Doctor Detail Dialog */}
        <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Doctor Details</DialogTitle>
            </DialogHeader>
            {selectedDoctor && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Name:</span> <strong>{selectedDoctor.name || "—"}</strong></div>
                  <div><span className="text-muted-foreground">Degrees:</span> {selectedDoctor.degrees || "—"}</div>
                  <div><span className="text-muted-foreground">Specialization:</span> {selectedDoctor.specialization || "—"}</div>
                  <div><span className="text-muted-foreground">BMDC No:</span> {selectedDoctor.bmdc_no || "—"}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedDoctor.phone || "—"}</div>
                  <div><span className="text-muted-foreground">Chamber:</span> {selectedDoctor.chamber_address || "—"}</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={selectedDoctor.is_active !== false ? "default" : "destructive"}>{selectedDoctor.is_active !== false ? "Active" : "Inactive"}</Badge></div>
                  <div><span className="text-muted-foreground">Joined:</span> {new Date(selectedDoctor.created_at).toLocaleDateString()}</div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground font-mono">User ID: {selectedDoctor.user_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{getDoctorPrescriptionCount(selectedDoctor.user_id)}</p><p className="text-[10px] text-muted-foreground">Prescriptions</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{getDoctorPatientCount(selectedDoctor.user_id)}</p><p className="text-[10px] text-muted-foreground">Patients</p></CardContent></Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Prescription Detail Dialog */}
        <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
            </DialogHeader>
            {selectedPrescription && (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Patient</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(selectedPrescription.patient_data, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Clinical Data</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(selectedPrescription.clinical_data, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Medicines</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(selectedPrescription.medicines, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Advice</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">{JSON.stringify(selectedPrescription.advice, null, 2)}</pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
