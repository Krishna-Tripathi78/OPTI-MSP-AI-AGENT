import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingDown, DollarSign, Users, Zap, CheckCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { AnimatedCounter } from '@/components/AnimatedCounter';

interface License {
  id: string;
  name: string;
  totalSeats: number;
  usedSeats: number;
  monthlyCost: number;
  costPerSeat: number;
  utilization: number;
  unusedSeats: number;
  potentialSavings: number;
}

interface Recommendation {
  id: string;
  action: string;
  description: string;
  annualSavings: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const mockLicenses: License[] = [
  {
    id: '1',
    name: 'Microsoft 365',
    totalSeats: 150,
    usedSeats: 93,
    monthlyCost: 8200,
    costPerSeat: 55,
    utilization: 62,
    unusedSeats: 57,
    potentialSavings: 3135
  },
  {
    id: '2',
    name: 'Adobe Creative Cloud',
    totalSeats: 80,
    usedSeats: 62,
    monthlyCost: 4800,
    costPerSeat: 60,
    utilization: 78,
    unusedSeats: 18,
    potentialSavings: 1080
  },
  {
    id: '3',
    name: 'Slack Enterprise',
    totalSeats: 120,
    usedSeats: 98,
    monthlyCost: 2400,
    costPerSeat: 20,
    utilization: 82,
    unusedSeats: 22,
    potentialSavings: 440
  },
  {
    id: '4',
    name: 'Zoom Pro',
    totalSeats: 100,
    usedSeats: 67,
    monthlyCost: 1500,
    costPerSeat: 15,
    utilization: 67,
    unusedSeats: 33,
    potentialSavings: 495
  }
];

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    action: 'Remove unused licenses',
    description: 'Remove 57 M365 licenses → Save $37K annually',
    annualSavings: 37620,
    priority: 'HIGH'
  },
  {
    id: '2',
    action: 'Downgrade seats',
    description: 'Downgrade 18 Adobe seats → Save $13K annually',
    annualSavings: 12960,
    priority: 'MEDIUM'
  },
  {
    id: '3',
    action: 'Consolidate licenses',
    description: 'Consolidate 33 Zoom Pro → Save $6K annually',
    annualSavings: 5940,
    priority: 'MEDIUM'
  }
];

export default function LicenseOptimization() {
  const [licenses, setLicenses] = useState<License[]>(mockLicenses);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [optimizedLicenses, setOptimizedLicenses] = useState<Set<string>>(new Set());
  const pageRef = useRef<HTMLDivElement>(null);

  const totalLicenses = licenses.reduce((sum, license) => sum + license.totalSeats, 0);
  const totalUnused = licenses.reduce((sum, license) => sum + license.unusedSeats, 0);
  const totalSavings = licenses.reduce((sum, license) => sum + license.potentialSavings, 0);

  const simulateRealTimeUpdates = () => {
    setLicenses(prev => prev.map(license => ({
      ...license,
      usedSeats: Math.max(1, license.usedSeats + Math.floor(Math.random() * 6 - 3)),
      utilization: Math.round((license.usedSeats / license.totalSeats) * 100),
      unusedSeats: license.totalSeats - license.usedSeats,
      potentialSavings: (license.totalSeats - license.usedSeats) * license.costPerSeat
    })));
  };

  useEffect(() => {
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

    const interval = setInterval(simulateRealTimeUpdates, 20000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleOptimize = (licenseId: string) => {
    setOptimizedLicenses(prev => new Set([...prev, licenseId]));
    
    // Animate optimization
    const card = document.querySelector(`[data-license-id="${licenseId}"]`);
    if (card) {
      gsap.to(card, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (utilization >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-destructive';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'LOW': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div ref={pageRef} className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">License Optimization</h1>
            <p className="text-sm text-muted-foreground">AI-powered license usage analysis and cost optimization</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Licenses</span>
            </div>
            <div className="text-3xl font-bold">
              <AnimatedCounter value={totalLicenses} />
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Unused</span>
            </div>
            <div className="text-3xl font-bold text-destructive">
              <AnimatedCounter value={totalUnused} />
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-muted-foreground">Potential Savings</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              <AnimatedCounter value={Math.round(totalSavings / 1000)} prefix="$" suffix="K" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* License Utilization */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          License Utilization
        </h2>
        
        {licenses.map((license) => (
          <Card 
            key={license.id}
            data-license-id={license.id}
            className={`border hover:shadow-lg transition-all duration-300 ${
              optimizedLicenses.has(license.id) ? 'border-emerald-500 bg-emerald-500/10' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{license.name}</h3>
                {optimizedLicenses.has(license.id) && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Optimized
                  </Badge>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className={`font-medium ${getUtilizationColor(license.utilization)}`}>
                        {license.utilization}% utilized
                      </span>
                      <span className="text-muted-foreground">
                        {license.unusedSeats} unused
                      </span>
                    </div>
                    <Progress value={license.utilization} className="h-3" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Monthly Cost:</span>
                    <span className="font-semibold ml-2">
                      ${license.monthlyCost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Used Seats:</span>
                    <span className="font-semibold ml-2">
                      {license.usedSeats}/{license.totalSeats}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Potential Savings:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-2">
                      ${license.potentialSavings.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleOptimize(license.id)}
                    disabled={optimizedLicenses.has(license.id)}
                    className={`hover:scale-105 transition-all ${
                      optimizedLicenses.has(license.id) 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    {optimizedLicenses.has(license.id) ? 'Optimized' : 'Optimize Now'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Recommendations */}
      <Card className="border hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                  <span>{rec.description}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ${rec.annualSavings.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">annually</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-primary">
                Total Annual Savings Potential:
              </span>
              <span className="text-2xl font-bold text-primary">
                ${recommendations.reduce((sum, rec) => sum + rec.annualSavings, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}