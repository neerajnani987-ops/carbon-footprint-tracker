import React, { useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useLanguage } from '../hooks/useLanguage';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler,
} from 'chart.js';
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
);

const Analytics: React.FC = () => {
  const { language } = useLanguage();
  const { hasCompletedCalc, dailyLogs, calculateBreakdown, calculator } = useAppState();

  const breakdown = useMemo(() => calculateBreakdown(), [calculateBreakdown]);

  // Compare categories bar chart data
  const barChartData = {
    labels: ['Transportation', 'Home Energy', 'Diet & Food', 'Waste'],
    datasets: [
      {
        label: 'Your Projected Emissions',
        data: [breakdown.transport, breakdown.energy, breakdown.diet, breakdown.waste],
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // emerald green
        borderColor: '#10b981',
        borderWidth: 1.5,
      },
      {
        label: 'Eco Target Benchmark',
        data: [1.2, 1.0, 0.8, 0.5], // target bounds (sum = 3.5)
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1.5,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } },
        title: {
          display: true,
          text: 'Tons CO₂e / Year',
          color: '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 10 },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 10 },
        },
      },
    },
  };

  // Line Chart (larger view of 7-day savings trend)
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
          label: 'Daily Savings (kg CO₂e)',
          data: values,
          fill: true,
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderColor: '#10b981',
          borderWidth: 2.5,
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
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  const lineHasData = useMemo(() => {
    return lineChartData.datasets[0].data.some((v) => v > 0);
  }, [lineChartData]);

  // Target comparison math
  const targetDiffPercentage = useMemo(() => {
    if (!hasCompletedCalc) return 0;
    const diff = ((breakdown.total - 3.5) / 3.5) * 100;
    return parseFloat(diff.toFixed(1));
  }, [hasCompletedCalc, breakdown.total]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-white font-bold font-outfit text-xl mb-1">Advanced Carbon Analytics</h2>
        <p className="text-xs text-eco-muted leading-relaxed">
          Compare your emissions profile against sustainability targets and evaluate your daily habits timeline.
        </p>
      </div>

      {!hasCompletedCalc ? (
        <div className="glass-card p-12 text-center border border-white/5 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-eco-muted/30 mb-3" />
          <h3 className="font-outfit font-bold text-white text-lg mb-2">No Calculator Metrics Found</h3>
          <p className="text-xs text-eco-muted max-w-md leading-relaxed">
            Please complete the Carbon Footprint Calculator to populate your category emission reports, benchmarks comparison, and trend graphics.
          </p>
        </div>
      ) : (
        <>
          {/* Comparison and stats grids */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* National Target Card */}
            <div className="glass-card p-6 border border-white/5 flex flex-col justify-between lg:col-span-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-eco-muted">
                Target Offset Status
              </span>

              <div className="my-6">
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-4xl font-outfit font-black text-white leading-none">
                    {breakdown.total}
                  </span>
                  <span className="text-xs text-eco-muted">tons / yr</span>
                </div>
                
                {targetDiffPercentage <= 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-eco-green font-semibold">
                    <TrendingDown className="w-4 h-4 shrink-0" />
                    <span>{Math.abs(targetDiffPercentage)}% below eco-target benchmark</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span>{targetDiffPercentage}% above eco-target benchmark</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-eco-forest/20 border border-white/5 rounded-xl text-[11px] text-eco-muted leading-relaxed">
                {targetDiffPercentage <= 0
                  ? 'Excellent work! Your carbon emissions profile is compliant with our sustainability threshold. Keep logging daily choices to reduce even further.'
                  : 'Your carbon score exceeds targets. Review the transportation and utilities categories to identify quick changes that can trim your footprint.'}
              </div>
            </div>

            {/* Category Comparison Bar Chart */}
            <div className="glass-card p-6 border border-white/5 lg:col-span-2 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold font-outfit text-sm tracking-wider uppercase">
                  Category Carbon Benchmarking
                </h3>
              </div>
              <div className="h-60 relative">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

          </div>

          {/* Timeline and Insights Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Daily Tracker Savings Chart */}
            <div className="glass-card p-6 border border-white/5 lg:col-span-2 flex flex-col justify-between">
              <h3 className="text-white font-bold font-outfit text-sm tracking-wider uppercase mb-4">
                Daily Actions Savings Timeline
              </h3>
              <div className="h-60 relative flex items-center justify-center">
                {lineHasData ? (
                  <Line data={lineChartData} options={lineChartOptions} />
                ) : (
                  <div className="text-center p-6 flex flex-col items-center">
                    <TrendingUp className="w-10 h-10 text-eco-muted/30 mb-2" />
                    <p className="text-xs text-eco-muted">
                      No daily action logs registered during the past 7 days.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights & Trend metrics */}
            <div className="glass-card p-6 border border-white/5 lg:col-span-1 flex flex-col gap-5">
              <h3 className="text-white font-bold font-outfit text-sm tracking-wider uppercase">
                Carbon Trends & Insights
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex gap-3 items-start">
                  <div className="p-1.5 bg-eco-green/10 text-eco-green border border-eco-green/20 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Daily Commutes</h5>
                    <p className="text-[10.5px] text-eco-muted leading-relaxed mt-1">
                      {calculator.vehicleType === 'ev' 
                        ? 'By driving an EV, your vehicle commutes save 1.7 tons of CO₂ annually compared to gasoline equivalents.'
                        : 'Your weekly vehicle travel is a primary source of emissions. Try working from home or riding transit.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Clean Energy Share</h5>
                    <p className="text-[10.5px] text-eco-muted leading-relaxed mt-1">
                      {calculator.cleanEnergyShare > 0
                        ? `Your grid utilizes ${calculator.cleanEnergyShare}% clean electricity. Upgrading this share further blocks major annual grid charges.`
                        : 'Your household is running on standard grid electricity. Consider clean energy suppliers or solar upgrades.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg shrink-0 mt-0.5">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Waste & Methane</h5>
                    <p className="text-[10.5px] text-eco-muted leading-relaxed mt-1">
                      {calculator.recyclingRate >= 50
                        ? `Your recycling rate of ${calculator.recyclingRate}% reduces waste-to-landfill volumes significantly.`
                        : 'Recycling and composting can prevent raw garbage fermentation in landfill dumps.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
