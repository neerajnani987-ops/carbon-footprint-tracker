import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { useLanguage } from '../context/LanguageContext';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import {
  Leaf,
  Award,
  Sprout,
  PieChart,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const {
    hasCompletedCalc,
    totalSavings,
    quests,
    unlockedBadges,
    dailyLogs,
    calculateBreakdown,
  } = useAppState();

  const breakdown = useMemo(() => calculateBreakdown(), [calculateBreakdown]);

  // Statistics counters
  const activeQuestsCount = useMemo(() => {
    return quests.filter((q) => q.current > 0 && q.current < q.target).length;
  }, [quests]);

  const badgesCount = useMemo(() => {
    return Object.keys(unlockedBadges).length;
  }, [unlockedBadges]);

  const treeOffset = useMemo(() => {
    return parseFloat((totalSavings / 22.0).toFixed(1)); // Tree absorbs 22kg/yr
  }, [totalSavings]);

  // Circle progress calculation
  const targetEmissions = 3.5; // tons annual target
  const circleRadius = 68;
  const circumference = 2 * Math.PI * circleRadius; // ~427.25
  const strokeDashoffset = useMemo(() => {
    if (!hasCompletedCalc) return circumference;
    const percent = Math.min((breakdown.total / targetEmissions) * 100, 100);
    return circumference - (percent / 100) * circumference;
  }, [hasCompletedCalc, breakdown.total, circumference]);

  const ringColor = useMemo(() => {
    if (breakdown.total <= targetEmissions) return '#10b981'; // green
    if (breakdown.total <= targetEmissions * 1.5) return '#f59e0b'; // amber
    return '#ef4444'; // red
  }, [breakdown.total]);

  // Doughnut Chart details
  const doughnutData = {
    labels: ['Transportation', 'Home Energy', 'Diet & Food', 'Waste'],
    datasets: [
      {
        data: [breakdown.transport, breakdown.energy, breakdown.diet, breakdown.waste],
        backgroundColor: [
          'rgba(99, 102, 241, 0.75)', // Indigo
          'rgba(59, 130, 246, 0.75)', // Blue
          'rgba(16, 185, 129, 0.75)', // Emerald
          'rgba(245, 158, 11, 0.75)', // Amber
        ],
        borderColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 10 },
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw} t CO₂e`,
        },
      },
    },
    cutout: '70%',
  };

  // Line Chart details (last 7 days of logs)
  const lineChartData = useMemo(() => {
    const dates = [];
    const values = [];
    const actionSavings: Record<string, number> = {
      'transit-commute': 2.5,
      'bike-walk-commute': 3.2,
      'carpool': 1.8,
      'energy-standby': 0.3,
      'dryer-avoid': 0.8,
      'temp-thermostat': 1.2,
      'meatless-meals': 1.5,
      'zero-food-waste': 0.5,
      'plastic-free': 0.2,
      'composting': 0.4,
    };

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const label = d.toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      dates.push(label);

      let daySavings = 0;
      const logged = dailyLogs[dateStr] || [];
      logged.forEach((actId) => {
        daySavings += actionSavings[actId] || 0;
      });
      values.push(daySavings);
    }

    return {
      labels: dates,
      datasets: [
        {
          label: 'Daily Savings (kg)',
          data: values,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderColor: '#10b981',
          borderWidth: 2,
          tension: 0.35,
          pointBackgroundColor: '#10b981',
          pointHoverRadius: 6,
        },
      ],
    };
  }, [dailyLogs, language]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 9 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 9 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  const lineHasData = useMemo(() => {
    return lineChartData.datasets[0].data.some((v) => v > 0);
  }, [lineChartData]);

  // Dynamic recommendations
  const recommendations = useMemo(() => {
    if (!hasCompletedCalc) return [];
    const list = [];
    
    if (breakdown.transport > 2.0) {
      list.push({
        cat: 'Transportation',
        color: 'indigo',
        impact: 'High Impact',
        title: 'Optimize Commutes',
        desc: 'Transportation accounts for a large portion of your footprint. Swap 2 car commutes per week with walking, cycling, or public transit to save up to 400kg of CO₂ annually.',
      });
    }

    if (breakdown.energy > 1.8) {
      list.push({
        cat: 'Home Energy',
        color: 'blue',
        impact: 'High Impact',
        title: 'Eco-Thermostat Adjustment',
        desc: 'Your utility carbon projection is high. Adjusting your HVAC thermostat by just 2°F and unplugging standby chargers can reduce energy emissions by 15%.',
      });
    }

    if (breakdown.diet > 1.5) {
      list.push({
        cat: 'Diet & Food',
        color: 'green',
        impact: 'Medium Impact',
        title: 'Introduce Meatless Days',
        desc: 'Meat-heavy diets have a high environmental cost. Eating plant-based meals on weekdays can lower your annual dietary footprint by 0.5 tons.',
      });
    }

    if (breakdown.waste > 0.8) {
      list.push({
        cat: 'Waste',
        color: 'amber',
        impact: 'Medium Impact',
        title: 'Upgrade Recycling Habits',
        desc: 'Your waste volume has room for optimization. Implementing solid kitchen composting and sorting recyclables blocks anaerobic landfill methane releases.',
      });
    }

    // Fallback general recommendations if all sectors are low
    if (list.length === 0) {
      list.push({
        cat: 'General',
        color: 'green',
        impact: 'Low Impact',
        title: 'Maintain Great Habits',
        desc: 'Your carbon scores are excellent and well below targets! Keep logging your daily achievements and try joining new quests to influence other citizens.',
      });
    }

    return list;
  }, [hasCompletedCalc, breakdown]);

  return (
    <div className="flex flex-col gap-8">
      {/* Overview stats grids */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Ring Projected annual footprint card */}
        <div className="glass-card p-6 border border-white/5 lg:col-span-1 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold font-outfit text-sm tracking-wider uppercase">
              {t('dashboard.annualFootprint')}
            </h3>
            <span className="px-2.5 py-1 bg-eco-green/10 text-eco-green rounded-full text-xs font-bold font-outfit">
              {t('dashboard.target')}
            </span>
          </div>

          <div className="flex justify-center items-center my-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="11"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  stroke={ringColor}
                  strokeWidth="11"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="progress-ring__circle"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-outfit font-black text-white leading-none">
                  {hasCompletedCalc ? breakdown.total : '—'}
                </span>
                <span className="text-[10px] text-eco-muted font-medium mt-1">tons CO₂e / yr</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-eco-muted leading-relaxed">
            {hasCompletedCalc ? t('dashboard.statusCalc') : t('dashboard.statusNoCalc')}
          </div>
        </div>

        {/* Action summaries subgrid */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          
          {/* Stat 1: Savings */}
          <div className="glass-card p-5.5 border border-white/5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-eco-green/15 flex items-center justify-center border border-eco-green/25 shrink-0">
              <Leaf className="w-6 h-6 text-eco-green" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-eco-muted">
                {t('dashboard.totalSavings')}
              </span>
              <div className="text-xl font-bold font-outfit text-white mt-0.5">
                {totalSavings.toFixed(1)} kg
              </div>
              <span className="text-[10px] text-eco-muted mt-1 block">
                {t('dashboard.savingsDesc')}
              </span>
            </div>
          </div>

          {/* Stat 2: Quests */}
          <div className="glass-card p-5.5 border border-white/5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/25 shrink-0">
              <Flame className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-eco-muted">
                {t('dashboard.activeQuests')}
              </span>
              <div className="text-xl font-bold font-outfit text-white mt-0.5">
                {activeQuestsCount} / 4
              </div>
              <span className="text-[10px] text-eco-muted mt-1 block">
                {t('dashboard.questsDesc')}
              </span>
            </div>
          </div>

          {/* Stat 3: Badges */}
          <div className="glass-card p-5.5 border border-white/5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/25 shrink-0">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-eco-muted">
                {t('dashboard.unlockedBadges')}
              </span>
              <div className="text-xl font-bold font-outfit text-white mt-0.5">
                {badgesCount} / 8
              </div>
              <span className="text-[10px] text-eco-muted mt-1 block">
                {t('dashboard.badgesDesc')}
              </span>
            </div>
          </div>

          {/* Stat 4: Tree offset */}
          <div className="glass-card p-5.5 border border-white/5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/25 shrink-0">
              <Sprout className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-eco-muted">
                {t('dashboard.treeOffset')}
              </span>
              <div className="text-xl font-bold font-outfit text-white mt-0.5">
                {treeOffset}
              </div>
              <span className="text-[10px] text-eco-muted mt-1 block">
                {t('dashboard.treeDesc')}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Charts section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Doughnut breakdown chart */}
        <div className="glass-card p-6 border border-white/5 flex flex-col justify-between">
          <h3 className="text-white font-bold font-outfit text-sm tracking-wider uppercase mb-4">
            {t('dashboard.emissionsBreakdown')}
          </h3>
          <div className="h-64 relative flex items-center justify-center">
            {hasCompletedCalc ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex flex-col items-center text-center justify-center p-4">
                <PieChart className="w-12 h-12 text-eco-muted/30 mb-3" />
                <p className="text-xs text-eco-muted max-w-xs mb-4">
                  {t('dashboard.chartPlaceholder')}
                </p>
                <button
                  onClick={() => navigate('/calculator')}
                  className="px-4 py-2 bg-eco-green hover:bg-eco-emerald text-white rounded-lg text-xs font-semibold font-outfit transition-all flex items-center gap-1.5"
                >
                  <span>{t('dashboard.calcButton')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Line savings trend chart */}
        <div className="glass-card p-6 border border-white/5 flex flex-col justify-between">
          <h3 className="text-white font-bold font-outfit text-sm tracking-wider uppercase mb-4">
            {t('dashboard.savingsTrend')}
          </h3>
          <div className="h-64 relative flex items-center justify-center">
            {lineHasData ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="flex flex-col items-center text-center justify-center p-4">
                <TrendingUp className="w-12 h-12 text-eco-muted/30 mb-3" />
                <p className="text-xs text-eco-muted max-w-xs mb-4">
                  Log your eco-friendly choices in the Daily Tracker to see savings trends.
                </p>
                <button
                  onClick={() => navigate('/tracker')}
                  className="px-4 py-2 bg-eco-green hover:bg-eco-emerald text-white rounded-lg text-xs font-semibold font-outfit transition-all flex items-center gap-1.5"
                >
                  <span>{t('dashboard.logButton')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* AI Insights and recommendations panel */}
      <div className="glass-card p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-eco-green animate-pulse" />
          <h3 className="text-white font-bold font-outfit text-sm tracking-wider uppercase">
            {t('dashboard.ecoInsights')}
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {hasCompletedCalc ? (
            recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 bg-eco-forest/20 border border-white/5 hover:border-white/10 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/10 font-bold uppercase tracking-wider text-eco-muted">
                      {rec.cat}
                    </span>
                    <span className="text-[10px] font-bold text-eco-green uppercase tracking-wide">
                      {rec.impact}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-sm font-outfit mb-1">{rec.title}</h4>
                  <p className="text-xs text-eco-muted leading-relaxed">{rec.desc}</p>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      rec.cat === 'Transportation'
                        ? '/calculator'
                        : rec.cat === 'Home Energy'
                        ? '/calculator'
                        : '/tracker'
                    )
                  }
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-semibold font-outfit transition-all flex items-center justify-center gap-1 shrink-0"
                >
                  <span>Configure</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-eco-muted leading-relaxed flex flex-col items-center justify-center">
              <Sparkles className="w-8 h-8 text-eco-muted/30 mb-2" />
              <span>
                Please complete the Carbon Footprint Calculator to unlock smart recommendations customized for your metrics.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
