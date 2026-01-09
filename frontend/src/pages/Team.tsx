import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Award, Clock, Target, TrendingUp, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { gsap } from 'gsap';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { teamDataService } from '@/services/teamDataService';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  performance: number;
  ticketsResolved: number;
  clientSatisfaction: number;
  utilization: number;
  status: 'active' | 'busy' | 'away';
  email: string;
  joinDate: string;
  lastActivity: Date;
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    department: 'Technical',
    email: ''
  });
  const pageRef = useRef<HTMLDivElement>(null);

  const loadRealTimeData = async () => {
    teamDataService.simulateRealTimeUpdates();
    const members = await teamDataService.getTeamMembers();
    setTeamMembers(members);
    setDepartmentData(teamDataService.getDepartmentData());
    setPerformanceData(teamDataService.getPerformanceHistory());
  };

  useEffect(() => {
    // Load initial data
    loadRealTimeData();

    // Animate page entrance
    const timer = setTimeout(() => {
      if (pageRef.current) {
        const elements = Array.from(pageRef.current.children);
        elements.forEach((element, index) => {
          gsap.fromTo(element,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, delay: index * 0.1, ease: "power2.out" }
          );
        });
      }
    }, 100);

    // Set up real-time updates every 18 seconds
    const interval = setInterval(loadRealTimeData, 18000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (performance >= 80) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  const filteredMembers = selectedDepartment === 'All'
    ? teamMembers
    : teamMembers.filter(member => member.department === selectedDepartment);

  const totalMembers = teamMembers.length;
  const avgPerformance = Math.round(teamMembers.reduce((sum, member) => sum + member.performance, 0) / totalMembers);
  const avgSatisfaction = Math.round(teamMembers.reduce((sum, member) => sum + member.clientSatisfaction, 0) / totalMembers);
  const avgUtilization = Math.round(teamMembers.reduce((sum, member) => sum + member.utilization, 0) / totalMembers);

  const handleAddMember = () => {
    if (newMember.name && newMember.role && newMember.email) {
      teamDataService.addTeamMember({
        name: newMember.name,
        role: newMember.role,
        department: newMember.department,
        email: newMember.email,
        performance: 85 + Math.floor(Math.random() * 15),
        ticketsResolved: Math.floor(Math.random() * 50) + 20,
        clientSatisfaction: 85 + Math.floor(Math.random() * 15),
        utilization: 75 + Math.floor(Math.random() * 25),
        status: 'active' as const,
        joinDate: new Date().toISOString().split('T')[0]
      });
      loadRealTimeData();
      setNewMember({ name: '', role: '', department: 'Technical', email: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div ref={pageRef} className="space-y-6 p-4 sm:p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Team Management</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Employee performance and team analytics</p>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 hover:scale-105 transition-all"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Team Member</span>
          <span className="sm:hidden">Add Member</span>
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-3 sm:p-4 text-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={totalMembers} />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Team Members</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-3 sm:p-4 text-center">
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={avgPerformance} suffix="%" />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Avg Performance</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-3 sm:p-4 text-center">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-violet-500 dark:text-violet-400 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={avgSatisfaction} suffix="%" />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Client Satisfaction</div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-3 sm:p-4 text-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              <AnimatedCounter value={avgUtilization} suffix="%" />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Utilization</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Technical', 'Operations', 'Security', 'Support'].map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDepartment(dept)}
            className={`px-3 py-1 rounded text-xs sm:text-sm transition-colors ${selectedDepartment === dept
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            className="border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            onClick={() => {
              // Interactive drill-down functionality
              console.log('Drilling down into member:', member.name);
            }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{member.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.role}</p>
                    <p className="text-xs text-muted-foreground">Last: {member.lastActivity.toLocaleTimeString()}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {member.department}
                    </Badge>
                  </div>
                </div>
                <div className={`text-xl sm:text-2xl font-bold ${getPerformanceColor(member.performance)}`}>
                  {member.performance}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                <div className="text-center">
                  <div className="font-semibold">{member.ticketsResolved}</div>
                  <div className="text-muted-foreground">Tickets</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{member.clientSatisfaction}%</div>
                  <div className="text-muted-foreground">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{member.utilization}%</div>
                  <div className="text-muted-foreground">Utilization</div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                  <span className="truncate ml-2">{member.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card className="border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="department" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="performance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card className="border hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="performance" stroke="hsl(var(--primary))" strokeWidth={3} name="Performance %" />
                <Line type="monotone" dataKey="satisfaction" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Satisfaction %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Team Member</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  placeholder="e.g. Senior Developer"
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="Technical">Technical</option>
                  <option value="Operations">Operations</option>
                  <option value="Security">Security</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.role || !newMember.email}
              >
                Add Member
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}