import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'te';

type TranslationKeys =
  | 'app.title'
  | 'app.subtitle'
  | 'nav.dashboard'
  | 'nav.calculator'
  | 'nav.tracker'
  | 'nav.quests'
  | 'nav.assistant'
  | 'nav.analytics'
  | 'nav.settings'
  | 'nav.landing'
  | 'header.greeting'
  | 'header.quickLog'
  | 'dashboard.annualFootprint'
  | 'dashboard.target'
  | 'dashboard.statusCalc'
  | 'dashboard.statusNoCalc'
  | 'dashboard.totalSavings'
  | 'dashboard.savingsDesc'
  | 'dashboard.activeQuests'
  | 'dashboard.questsDesc'
  | 'dashboard.unlockedBadges'
  | 'dashboard.badgesDesc'
  | 'dashboard.treeOffset'
  | 'dashboard.treeDesc'
  | 'dashboard.emissionsBreakdown'
  | 'dashboard.savingsTrend'
  | 'dashboard.chartPlaceholder'
  | 'dashboard.calcButton'
  | 'dashboard.logButton'
  | 'dashboard.ecoInsights'
  | 'calc.title'
  | 'calc.desc'
  | 'calc.liveTicker'
  | 'calc.step1'
  | 'calc.step2'
  | 'calc.step3'
  | 'calc.step4'
  | 'calc.vehicle'
  | 'calc.vehicleMiles'
  | 'calc.flightsShort'
  | 'calc.flightsLong'
  | 'calc.electric'
  | 'calc.gas'
  | 'calc.cleanEnergy'
  | 'calc.diet'
  | 'calc.localFood'
  | 'calc.wasteBags'
  | 'calc.recycling'
  | 'calc.back'
  | 'calc.next'
  | 'calc.save'
  | 'tracker.title'
  | 'tracker.desc'
  | 'tracker.todaySummary'
  | 'tracker.co2Saved'
  | 'tracker.smartphoneEq'
  | 'tracker.tipTitle'
  | 'tracker.recentHistory'
  | 'tracker.emptyHistory'
  | 'tracker.submit'
  | 'quests.title'
  | 'quests.desc'
  | 'quests.activeQuests'
  | 'quests.activeQuestsDesc'
  | 'settings.title'
  | 'settings.profile'
  | 'settings.language'
  | 'settings.theme'
  | 'settings.notifications'
  | 'settings.save'
  | 'assistant.title'
  | 'assistant.subtitle'
  | 'assistant.placeholder'
  | 'assistant.send'
  | 'dashboard.monthlyGoal'
  | 'dashboard.yearlyGoal'
  | 'dashboard.ecoPoints'
  | 'dashboard.downloadReport'
  | 'dashboard.sustainabilityGrade'
  | 'dashboard.impactScore'
  | 'dashboard.nationalAvg'
  | 'dashboard.remindersTitle'
  | 'quests.setGoals'
  | 'quests.monthlyLabel'
  | 'quests.yearlyLabel'
  | 'quests.saveGoals'
  | 'quests.dailyChallenges'
  | 'quests.weeklyChallenges'
  | 'quests.monthlyChallenges'
  | 'quests.claimPoints'
  | 'quests.completed'
  | 'settings.ecoReminders'
  | 'settings.weeklyDigests';

const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    'app.title': 'EcoTrace',
    'app.subtitle': 'Carbon Compass',
    'nav.dashboard': 'Dashboard',
    'nav.calculator': 'Footprint Calculator',
    'nav.tracker': 'Daily Tracker',
    'nav.quests': 'Quests & Badges',
    'nav.assistant': 'AI Assistant',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.landing': 'Home',
    'header.greeting': 'Hello, Eco-Citizen!',
    'header.quickLog': 'Quick Log',
    'dashboard.annualFootprint': 'Annual Footprint Projection',
    'dashboard.target': 'Target: 3.5 t',
    'dashboard.statusCalc': 'Based on your calculations. Nice work keeping track!',
    'dashboard.statusNoCalc':
      'Please complete the Footprint Calculator to estimate your projected annual footprint.',
    'dashboard.totalSavings': 'Total Savings Logged',
    'dashboard.savingsDesc': 'CO₂e emissions avoided',
    'dashboard.activeQuests': 'Active Challenges',
    'dashboard.questsDesc': 'Quests currently in progress',
    'dashboard.unlockedBadges': 'Unlocked Badges',
    'dashboard.badgesDesc': 'Achievements earned',
    'dashboard.treeOffset': 'Tree Offset Equiv.',
    'dashboard.treeDesc': 'Trees absorbing for 1 year',
    'dashboard.emissionsBreakdown': 'Emissions Breakdown by Category',
    'dashboard.savingsTrend': 'Savings Over Time (Last 7 Days)',
    'dashboard.chartPlaceholder': 'Calculate your footprint or log actions to see data.',
    'dashboard.calcButton': 'Open Calculator',
    'dashboard.logButton': "Log Today's Actions",
    'dashboard.ecoInsights': 'Eco-Insights & Recommendations',
    'calc.title': 'Annual Footprint Calculator',
    'calc.desc':
      'Estimate your annual greenhouse gas emissions using simple parameters from your regular habits.',
    'calc.liveTicker': 'Live Calculation Projection:',
    'calc.step1': 'Transportation',
    'calc.step2': 'Home Energy',
    'calc.step3': 'Diet & Food',
    'calc.step4': 'Waste & Consumption',
    'calc.vehicle': 'Primary Commute Vehicle',
    'calc.vehicleMiles': 'Weekly Driving Distance',
    'calc.flightsShort': 'Short Flights (< 3 hrs)',
    'calc.flightsLong': 'Long Flights (> 3 hrs)',
    'calc.electric': 'Monthly Electricity Bill',
    'calc.gas': 'Monthly Natural Gas Bill',
    'calc.cleanEnergy': 'Clean/Solar Grid Share',
    'calc.diet': 'Diet Pattern',
    'calc.localFood': 'Local / Organic Food Share',
    'calc.wasteBags': 'Waste Produced (Bags per Week)',
    'calc.recycling': 'Household Recycling Rate',
    'calc.back': 'Back',
    'calc.next': 'Next Step',
    'calc.save': 'Save Results',
    'tracker.title': 'Daily Action Tracker',
    'tracker.desc':
      'Log the eco-friendly choices you made today to calculate carbon savings immediately.',
    'tracker.todaySummary': "Today's Summary",
    'tracker.co2Saved': 'CO₂ Saved Today',
    'tracker.smartphoneEq': 'Equivalent to {charges} smartphone charges avoided.',
    'tracker.tipTitle': 'Eco Tip of the Day',
    'tracker.recentHistory': 'Recent Logging History',
    'tracker.emptyHistory': 'No logs recorded yet. Start tracking above!',
    'tracker.submit': "Submit Today's Log",
    'quests.title': 'Achievements & Badges',
    'quests.desc':
      'Complete calculator activities, reach savings targets, and check daily goals to unlock these milestones.',
    'quests.activeQuests': 'Eco-Quests & Challenges',
    'quests.activeQuestsDesc':
      'Accept focused challenges to fast-track your emission reduction and form healthy daily habits.',
    'settings.title': 'Profile & Settings',
    'settings.profile': 'Profile Information',
    'settings.language': 'Language Selection',
    'settings.theme': 'Theme Mode',
    'settings.notifications': 'Notification Preferences',
    'settings.save': 'Save Changes',
    'assistant.title': 'AI Sustainability Assistant',
    'assistant.subtitle': 'Eco Assistant powered by AI',
    'assistant.placeholder': 'Ask me anything about reducing your carbon footprint...',
    'assistant.send': 'Send',
    'dashboard.monthlyGoal': 'Monthly CO₂ Savings Goal',
    'dashboard.yearlyGoal': 'Yearly CO₂ Savings Goal',
    'dashboard.ecoPoints': 'Sustainability Points',
    'dashboard.downloadReport': 'Download Monthly Report',
    'dashboard.sustainabilityGrade': 'Sustainability Grade',
    'dashboard.impactScore': 'Eco Impact Score',
    'dashboard.nationalAvg': 'National Average (US)',
    'dashboard.remindersTitle': 'Eco Reminder',
    'quests.setGoals': 'Personalized Eco Goals',
    'quests.monthlyLabel': 'Monthly CO₂ Reduction Goal (kg)',
    'quests.yearlyLabel': 'Yearly CO₂ Reduction Goal (kg)',
    'quests.saveGoals': 'Save Goals',
    'quests.dailyChallenges': 'Daily Challenges',
    'quests.weeklyChallenges': 'Weekly Challenges',
    'quests.monthlyChallenges': 'Monthly Challenges',
    'quests.claimPoints': 'Claim Points',
    'quests.completed': 'Completed',
    'settings.ecoReminders': 'Smart Eco Reminders',
    'settings.weeklyDigests': 'Weekly Performance Digests',
  },
  te: {
    'app.title': 'EcoTrace (ఈకోట్రేస్)',
    'app.subtitle': 'కార్బన్ దిక్సూచి',
    'nav.dashboard': 'డ్యాష్‌బోర్డ్',
    'nav.calculator': 'కార్బన్ కాలిక్యులేటర్',
    'nav.tracker': 'రోజువారీ ట్రాకర్',
    'nav.quests': 'క్వెస్ట్‌లు & బ్యాడ్జ్‌లు',
    'nav.assistant': 'AI సహాయకుడు',
    'nav.analytics': 'విశ్లేషణలు',
    'nav.settings': 'సెట్టింగులు',
    'nav.landing': 'హోమ్',
    'header.greeting': 'నమస్కారం, పర్యావరణ పౌరుడా!',
    'header.quickLog': 'త్వరిత లాగ్',
    'dashboard.annualFootprint': 'వార్షిక కార్బన్ ఉద్గారాల అంచనా',
    'dashboard.target': 'లక్ష్యం: 3.5 టన్నులు',
    'dashboard.statusCalc': 'మీ లెక్కింపుల ఆధారంగా. పర్యవేక్షిస్తున్నందుకు అభినందనలు!',
    'dashboard.statusNoCalc':
      'మీ వార్షిక కార్బన్ ఉద్గారాలను అంచనా వేయడానికి దయచేసి కార్బన్ కాలిక్యులేటర్ పూర్తి చేయండి.',
    'dashboard.totalSavings': 'మొత్తం ఆదా చేసిన కార్బన్',
    'dashboard.savingsDesc': 'నివారించబడిన CO₂ ఉద్గారాలు',
    'dashboard.activeQuests': 'క్రియాశీల సవాళ్లు',
    'dashboard.questsDesc': 'ప్రస్తుతం పురోగతిలో ఉన్న సవాళ్లు',
    'dashboard.unlockedBadges': 'పొందిన బ్యాడ్జ్‌లు',
    'dashboard.badgesDesc': 'సాధించిన మైలురాళ్ళు',
    'dashboard.treeOffset': 'చెట్ల సమానత్వం',
    'dashboard.treeDesc': '1 సంవత్సరం పాటు శోషించే చెట్లు',
    'dashboard.emissionsBreakdown': 'విభాగాల వారీగా ఉద్గారాల వివరాలు',
    'dashboard.savingsTrend': 'కాలక్రమేణా ఆదా (గత 7 రోజులు)',
    'dashboard.chartPlaceholder':
      'వివరాలను చూడటానికి కాలిక్యులేటర్‌ను పూర్తి చేయండి లేదా పనులను లాగ్ చేయండి.',
    'dashboard.calcButton': 'కాలిక్యులేటర్ తెరవండి',
    'dashboard.logButton': 'ఈరోజు పనులను లాగ్ చేయండి',
    'dashboard.ecoInsights': 'పర్యావరణ సూచనలు & సిఫార్సులు',
    'calc.title': 'వార్షిక కార్బన్ ఉద్గారాల కాలిక్యులేటర్',
    'calc.desc':
      'మీ సాధారణ అలవాట్ల నుండి సాధారణ పారామితులను ఉపయోగించి మీ వార్షిక గ్రీన్‌హౌస్ వాయు ఉద్గారాలను అంచనా వేయండి.',
    'calc.liveTicker': 'లైవ్ లెక్కింపు అంచనా:',
    'calc.step1': 'రవాణా',
    'calc.step2': 'గృహ విద్యుత్',
    'calc.step3': 'ఆహార అలవాట్లు',
    'calc.step4': 'వ్యర్థాలు & రీసైక్లింగ్',
    'calc.vehicle': 'ప్రాథమిక రవాణా వాహనం',
    'calc.vehicleMiles': 'వారపు ప్రయాణ దూరం',
    'calc.flightsShort': 'చిన్న విమానాలు (< 3 గంటలు)',
    'calc.flightsLong': 'పెద్ద విమానాలు (> 3 గంటలు)',
    'calc.electric': 'నెలవారీ విద్యుత్ బిల్లు',
    'calc.gas': 'నెలవారీ గ్యాస్ బిల్లు',
    'calc.cleanEnergy': 'సౌర విద్యుత్ వాటా',
    'calc.diet': 'ఆహార విధానం',
    'calc.localFood': 'స్థానిక / సేంద్రీయ ఆహార వాటా',
    'calc.wasteBags': 'ఉత్పత్తి అయ్యే వ్యర్థాలు (వారానికి సంచులు)',
    'calc.recycling': 'ఇంటి రీసైక్లింగ్ రేటు',
    'calc.back': 'వెనుకకు',
    'calc.next': 'తదుపరి దశ',
    'calc.save': 'ఫలితాలను సేవ్ చేయండి',
    'tracker.title': 'రోజువారీ పనుల ట్రాకర్',
    'tracker.desc':
      'కార్బన్ ఆదాను వెంటనే లెక్కించడానికి ఈరోజు మీరు చేసిన పర్యావరణ అనుకూల ఎంపికలను లాగ్ చేయండి.',
    'tracker.todaySummary': 'ఈరోజు సారాంశం',
    'tracker.co2Saved': 'ఈరోజు ఆదా చేసిన CO₂',
    'tracker.smartphoneEq': 'ఇది {charges} స్మార్ట్‌ఫోన్ ఛార్జీలను నివారించడంతో సమానం.',
    'tracker.tipTitle': 'ఈరోజు పర్యావరణ చిట్కా',
    'tracker.recentHistory': 'ఇటీవలి లాగ్ చరిత్ర',
    'tracker.emptyHistory': 'ఇంకా ఎటువంటి లాగ్‌లు నమోదు చేయబడలేదు. పైన ట్రాక్ చేయడం ప్రారంభించండి!',
    'tracker.submit': 'ఈరోజు లాగ్‌ను సమర్పించండి',
    'quests.title': 'సాధనలు & బ్యాడ్జ్‌లు',
    'quests.desc':
      'ఈ మైలురాళ్లను అన్‌లాక్ చేయడానికి కాలిక్యులేటర్ పనులను పూర్తి చేయండి, ఆదా లక్ష్యాలను చేరుకోండి మరియు రోజువారీ లక్ష్యాలను తనిఖీ చేయండి.',
    'quests.activeQuests': 'పర్యావరణ అన్వేషణలు & సవాళ్లు',
    'quests.activeQuestsDesc':
      'మీ ఉద్గారాల తగ్గింపును వేగవంతం చేయడానికి మరియు ఆరోగ్యకరమైన రోజువారీ అలవాట్లను ఏర్పరచుకోవడానికి నిర్దిష్ట సవాళ్లను అంగీకరించండి.',
    'settings.title': 'ప్రొఫైల్ & సెట్టింగులు',
    'settings.profile': 'ప్రొఫైల్ సమాచారం',
    'settings.language': 'భాష ఎంపిక',
    'settings.theme': 'థీమ్ మోడ్',
    'settings.notifications': 'నోటిఫికేషన్ ప్రాధాన్యతలు',
    'settings.save': 'మార్పులను సేవ్ చేయి',
    'assistant.title': 'AI పర్యావరణ సహాయకుడు',
    'assistant.subtitle': 'AI సహాయంతో పనిచేసే పర్యావరణ సహాయకుడు',
    'assistant.placeholder': 'కార్బన్ ఫుట్‌ప్రింట్‌ను తగ్గించడం గురించి నన్ను ఏదైనా అడగండి...',
    'assistant.send': 'పంపండి',
    'dashboard.monthlyGoal': 'నెలవారీ ఆదా లక్ష్యం',
    'dashboard.yearlyGoal': 'వార్షిక ఆదా లక్ష్యం',
    'dashboard.ecoPoints': 'పర్యావరణ పాయింట్లు',
    'dashboard.downloadReport': 'నివేదికను డౌన్‌లోడ్ చేయి',
    'dashboard.sustainabilityGrade': 'పర్యావరణ గ్రేడ్',
    'dashboard.impactScore': 'పర్యావరణ ప్రభావం స్కోరు',
    'dashboard.nationalAvg': 'జాతీయ సగటు (US)',
    'dashboard.remindersTitle': 'పర్యావరణ రిమైండర్',
    'quests.setGoals': 'వ్యక్తిగతీకరించిన పర్యావరణ లక్ష్యాలు',
    'quests.monthlyLabel': 'నెలవారీ CO₂ తగ్గింపు లక్ష్యం (kg)',
    'quests.yearlyLabel': 'వార్షిక CO₂ తగ్గింపు లక్ష్యం (kg)',
    'quests.saveGoals': 'లక్ష్యాలను సేవ్ చేయి',
    'quests.dailyChallenges': 'రోజువారీ సవాళ్లు',
    'quests.weeklyChallenges': 'వారపు సవాళ్లు',
    'quests.monthlyChallenges': 'నెలవారీ సవాళ్లు',
    'quests.claimPoints': 'పాయింట్లను క్లెయిమ్ చేయి',
    'quests.completed': 'పూర్తయింది',
    'settings.ecoReminders': 'పర్యావరణ అలర్ట్ రిమైండర్లు',
    'settings.weeklyDigests': 'వారపు నివేదికలు',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys, replacements?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ecotrace_language');
    return (saved === 'te' ? 'te' : 'en') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ecotrace_language', lang);
  };

  const t = (key: TranslationKeys, replacements?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations['en'][key] || String(key);
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
export default LanguageProvider;
