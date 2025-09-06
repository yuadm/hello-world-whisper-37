import { useEffect, useState } from "react";
import { Users, Calendar, FileX, Shield, TrendingUp, Clock, Activity, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { EnhancedStatCard } from "./EnhancedStatCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocumentCountryMap } from "./DocumentCountryMap";

interface DashboardStats {
  totalEmployees: number;
  leavesThisMonth: number;
  expiringDocuments: number;
  complianceDue: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    leavesThisMonth: 0,
    expiringDocuments: 0,
    complianceDue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch total employees
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      // Fetch leaves this month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { count: leavesCount } = await supabase
        .from('leaves')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', `${currentMonth}-01`)
        .lt('start_date', `${currentMonth}-32`)
        .eq('status', 'approved');

      // Fetch expiring documents (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const { count: expiringDocsCount } = await supabase
        .from('document_tracker')
        .select('*', { count: 'exact', head: true })
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0]);

      // Fetch compliance tasks due (simplified - count all records)
      const { count: complianceCount } = await supabase
        .from('compliance_records')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalEmployees: employeeCount || 0,
        leavesThisMonth: leavesCount || 0,
        expiringDocuments: expiringDocsCount || 0,
        complianceDue: complianceCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error loading dashboard",
        description: "Could not fetch dashboard statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-lg w-64"></div>
          <div className="h-5 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl card-glass p-8 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-hero opacity-10" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary-glow flex items-center justify-center animate-float">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Welcome back! Here's your HR & Compliance command center
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">System Healthy</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <EnhancedStatCard
            title="Total Employees"
            value={stats.totalEmployees}
            description="Active staff members across all branches"
            icon={Users}
            variant="default"
            trend={{ value: 12, label: "vs last month" }}
            showGlow={true}
          />
          
          <EnhancedStatCard
            title="Leaves This Month"
            value={stats.leavesThisMonth}
            description="Approved leave requests"
            icon={Calendar}
            variant="success"
            trend={{ value: -5, label: "vs last month" }}
          />
          
          <EnhancedStatCard
            title="Expiring Documents"
            value={stats.expiringDocuments}
            description="Require immediate attention"
            icon={AlertTriangle}
            variant="warning"
            trend={{ value: 3, label: "vs last month" }}
          />
          
          <EnhancedStatCard
            title="Compliance Tasks"
            value={stats.complianceDue}
            description="Active monitoring records"
            icon={Shield}
            variant="info"
            trend={{ value: -8, label: "vs last month" }}
          />
        </div>

        {/* Enhanced Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 card-glass p-8 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary-glow flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Recent Activity</h3>
                  <p className="text-muted-foreground">Real-time system updates</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
                Live
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-success/5 to-success/10 border border-success/20 hover:border-success/40 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-success">New employee onboarded</p>
                  <p className="text-sm text-muted-foreground">Sarah Johnson joined the development team</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">2h ago</span>
              </div>
              
              <div className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-warning/5 to-warning/10 border border-warning/20 hover:border-warning/40 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-warning">Document expiring soon</p>
                  <p className="text-sm text-muted-foreground">3 BRP documents need renewal</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">5h ago</span>
              </div>
              
              <div className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary">Compliance task completed</p>
                  <p className="text-sm text-muted-foreground">Monthly safety inspection finished</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">1d ago</span>
              </div>
            </div>
          </div>

          <div className="card-glass p-8 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center animate-pulse">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Upcoming Deadlines</h3>
                  <p className="text-muted-foreground">Critical items requiring attention</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-medium">
                Urgent
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/30 hover:border-destructive/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-destructive text-lg">BRP Documents Review</p>
                    <p className="text-sm text-muted-foreground mt-1">3 documents expiring soon</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-destructive bg-destructive/20 animate-pulse">
                      2 days
                    </span>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-destructive/20 to-destructive/40" />
              </div>
              
              <div className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/30 hover:border-warning/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-warning text-lg">Monthly Compliance Check</p>
                    <p className="text-sm text-muted-foreground mt-1">All branches scheduled</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-warning bg-warning/20">
                      1 week
                    </span>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-warning/20 to-warning/40" />
              </div>
              
              <div className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-primary text-lg">Employee Review Cycle</p>
                    <p className="text-sm text-muted-foreground mt-1">Q1 performance evaluations</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-primary bg-primary/20">
                      2 weeks
                    </span>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/20 to-primary/40" />
              </div>
            </div>
          </div>

          {/* Documents by Country - Enhanced */}
          <section aria-labelledby="documents-by-country" className="lg:col-span-2 xl:col-span-3 card-glass p-8 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <FileX className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 id="documents-by-country" className="text-2xl font-bold">Documents by Country</h2>
                  <p className="text-muted-foreground">Interactive world map of document distribution</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Global View
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border/50">
              <DocumentCountryMap />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}