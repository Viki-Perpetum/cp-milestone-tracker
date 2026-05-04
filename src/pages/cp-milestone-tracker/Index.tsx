import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Clock, XCircle, Search, Eye, Building2, FileText, Landmark } from "lucide-react";

type Status = "on-track" | "at-risk" | "blocked" | "completed";

interface Milestone {
  id: string;
  cp: string;
  phase: string;
  milestone: string;
  owner: string;
  domain: "finance" | "legal" | "construction";
  deadline: string;
  status: Status;
  docsRequired: number;
  docsReceived: number;
  belfiusCondition: string | null;
  notes: string;
  blockedReason: string | null;
}

const MILESTONES: Milestone[] = [
  { id: "1", cp: "CP-01", phase: "Foundation", milestone: "Structural engineer sign-off", owner: "M. Dubois", domain: "construction", deadline: "2024-06-15", status: "completed", docsRequired: 4, docsReceived: 4, belfiusCondition: null, notes: "All docs uploaded to SharePoint.", blockedReason: null },
  { id: "2", cp: "CP-01", phase: "Foundation", milestone: "Belfius drawdown #1 approval", owner: "S. Peeters", domain: "finance", deadline: "2024-06-28", status: "at-risk", docsRequired: 6, docsReceived: 4, belfiusCondition: "BC-03", notes: "Insurance certificate still missing.", blockedReason: null },
  { id: "3", cp: "CP-02", phase: "Superstructure", milestone: "Contractor progress certificate", owner: "T. Lecomte", domain: "construction", deadline: "2024-07-10", status: "blocked", docsRequired: 3, docsReceived: 1, belfiusCondition: "BC-07", notes: "Awaiting contractor submission.", blockedReason: "Contractor has not submitted interim certificate CP-02-IC-3." },
  { id: "4", cp: "CP-02", phase: "Superstructure", milestone: "Legal title confirmation", owner: "A. Claes", domain: "legal", deadline: "2024-07-20", status: "on-track", docsRequired: 2, docsReceived: 2, belfiusCondition: "BC-02", notes: "Notary confirmed receipt.", blockedReason: null },
  { id: "5", cp: "CP-03", phase: "Facade", milestone: "Environmental permit final", owner: "A. Claes", domain: "legal", deadline: "2024-08-01", status: "at-risk", docsRequired: 5, docsReceived: 3, belfiusCondition: null, notes: "Municipal delay expected.", blockedReason: null },
  { id: "6", cp: "CP-03", phase: "Facade", milestone: "Belfius drawdown #2 approval", owner: "S. Peeters", domain: "finance", deadline: "2024-08-15", status: "blocked", docsRequired: 8, docsReceived: 3, belfiusCondition: "BC-11", notes: "Multiple conditions unmet.", blockedReason: "BC-11 requires CP-02 cert + env permit. Neither delivered." },
  { id: "7", cp: "CP-04", phase: "MEP Roughin", milestone: "MEP contractor delivery cert", owner: "T. Lecomte", domain: "construction", deadline: "2024-09-05", status: "on-track", docsRequired: 4, docsReceived: 4, belfiusCondition: null, notes: "On schedule.", blockedReason: null },
  { id: "8", cp: "CP-04", phase: "MEP Roughin", milestone: "Insurance endorsement update", owner: "S. Peeters", domain: "finance", deadline: "2024-09-12", status: "on-track", docsRequired: 2, docsReceived: 1, belfiusCondition: "BC-09", notes: "Broker confirmation pending.", blockedReason: null },
  { id: "9", cp: "CP-05", phase: "Finishing", milestone: "Snag list sign-off", owner: "M. Dubois", domain: "construction", deadline: "2024-10-30", status: "on-track", docsRequired: 3, docsReceived: 0, belfiusCondition: null, notes: "Not yet started — on schedule.", blockedReason: null },
  { id: "10", cp: "CP-05", phase: "Finishing", milestone: "Final Belfius drawdown", owner: "S. Peeters", domain: "finance", deadline: "2024-11-15", status: "on-track", docsRequired: 10, docsReceived: 0, belfiusCondition: "BC-15", notes: "Depends on all prior CPs.", blockedReason: null }
];

const statusConfig: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  "completed": { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  "on-track": { label: "On Track", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: <Clock className="w-3.5 h-3.5" /> },
  "at-risk": { label: "At Risk", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  "blocked": { label: "Blocked", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="w-3.5 h-3.5" /> }
};

const domainIcon: Record<string, React.ReactNode> = {
  finance: <Landmark className="w-3.5 h-3.5" />,
  legal: <FileText className="w-3.5 h-3.5" />,
  construction: <Building2 className="w-3.5 h-3.5" />
};

export default function CpMilestoneTracker() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Milestone | null>(null);

  const filtered = useMemo(() => {
    return MILESTONES.filter(m => {
      const matchTab = tab === "all" || m.status === tab || m.domain === tab;
      const matchSearch = search === "" ||
        m.cp.toLowerCase().includes(search.toLowerCase()) ||
        m.milestone.toLowerCase().includes(search.toLowerCase()) ||
        m.owner.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [search, tab]);

  const kpis = useMemo(() => ({
    total: MILESTONES.length,
    blocked: MILESTONES.filter(m => m.status === "blocked").length,
    atRisk: MILESTONES.filter(m => m.status === "at-risk").length,
    docsGap: MILESTONES.reduce((a, m) => a + (m.docsRequired - m.docsReceived), 0)
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CP Milestone Tracker</h1>
        <p className="text-muted-foreground mt-1">Single source of truth for Construction Packages, Belfius conditions, and contractor deliverables.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Milestones</p>
            <p className="text-3xl font-bold text-foreground mt-1">{kpis.total}</p>
          </CardContent>
        </Card>
        <Card className="border-red-300 dark:border-red-800">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Blocked</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{kpis.blocked}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-300 dark:border-yellow-800">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">At Risk</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{kpis.atRisk}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Missing Docs</p>
            <p className="text-3xl font-bold text-primary mt-1">{kpis.docsGap}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <CardTitle className="text-base">Milestone Register</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search CP, milestone, owner…" className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
              <TabsTrigger value="at-risk">At Risk</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="construction">Construction</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CP</TableHead>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Docs</TableHead>
                      <TableHead>Belfius</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No milestones match your filter.</TableCell></TableRow>
                    )}
                    {filtered.map(m => {
                      const s = statusConfig[m.status];
                      return (
                        <TableRow key={m.id} className={m.status === "blocked" ? "bg-red-50/40 dark:bg-red-950/20" : ""}>
                          <TableCell className="font-mono text-xs font-semibold">{m.cp}</TableCell>
                          <TableCell className="max-w-[200px]"><span className="text-sm">{m.milestone}</span><div className="text-xs text-muted-foreground">{m.phase}</div></TableCell>
                          <TableCell><span className="flex items-center gap-1 text-xs capitalize text-muted-foreground">{domainIcon[m.domain]}{m.domain}</span></TableCell>
                          <TableCell className="text-sm">{m.owner}</TableCell>
                          <TableCell className="text-sm font-mono">{m.deadline}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: m.docsRequired ? `${(m.docsReceived / m.docsRequired) * 100}%` : "0%" }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{m.docsReceived}/{m.docsRequired}</span>
                            </div>
                          </TableCell>
                          <TableCell>{m.belfiusCondition ? <Badge variant="outline" className="text-xs font-mono">{m.belfiusCondition}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.icon}{s.label}</span>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(m)}><Eye className="h-3.5 w-3.5" /></Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader><DialogTitle>{selected?.cp} — {selected?.milestone}</DialogTitle></DialogHeader>
                                {selected && (
                                  <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div><p className="text-xs text-muted-foreground">Phase</p><p className="font-medium">{selected.phase}</p></div>
                                      <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium">{selected.owner}</p></div>
                                      <div><p className="text-xs text-muted-foreground">Deadline</p><p className="font-mono">{selected.deadline}</p></div>
                                      <div><p className="text-xs text-muted-foreground">Domain</p><p className="capitalize">{selected.domain}</p></div>
                                      <div><p className="text-xs text-muted-foreground">Belfius Condition</p><p className="font-mono">{selected.belfiusCondition ?? "None"}</p></div>
                                      <div><p className="text-xs text-muted-foreground">Documents</p><p>{selected.docsReceived} / {selected.docsRequired} received</p></div>
                                    </div>
                                    <div><p className="text-xs text-muted-foreground mb-1">Status</p><span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[selected.status].color}`}>{statusConfig[selected.status].icon}{statusConfig[selected.status].label}</span></div>
                                    {selected.blockedReason && <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3"><p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Blocked Reason</p><p className="text-red-700 dark:text-red-300 text-xs">{selected.blockedReason}</p></div>}
                                    <div><p className="text-xs text-muted-foreground mb-1">Notes</p><p className="text-muted-foreground">{selected.notes}</p></div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
