import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Leaf, Sparkles, User, ArrowDown, HelpCircle, Info } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const generateMsgId = () => Math.random().toString(36).substring(2, 9);
const createDate = () => new Date();

const AIAssistant: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { calculator, hasCompletedCalc, calculateBreakdown } = useAppState();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name || 'Eco-Citizen'}! I am your AI Sustainability Assistant. Ask me anything about how you can reduce your carbon emissions, optimize home utilities, or improve recycling habits.`,
      timestamp: createDate(),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const breakdown = calculateBreakdown();

  const suggestedQuestions = [
    'Analyze my monthly footprint.',
    'How can I reduce my transport emissions?',
    'Suggest ways to save electricity.',
    'Tips for zero-waste recycling.',
  ];

  // Scroll to bottom on new messages
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    chatBottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isTyping]);

  // Monitor scroll height to show/hide "Scroll to Bottom" arrow button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
  };

  const generateAIResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    // Helper math coefficients
    const c_vehicle = {
      petrol: 0.411,
      diesel: 0.355,
      hybrid: 0.22,
      ev: 0.08,
      motorbike: 0.18,
      none: 0.0,
    } as Record<string, number>;
    const c_diet = {
      'heavy-meat': 3.3,
      'moderate-meat': 2.5,
      'low-meat': 1.7,
      vegetarian: 1.2,
      vegan: 0.9,
    } as Record<string, number>;

    // 1. Analyze footprint & audit
    if (
      text.includes('analyze') ||
      text.includes('audit') ||
      text.includes('monthly') ||
      text.includes('report') ||
      text.includes('footprint') ||
      text.includes('score')
    ) {
      if (!hasCompletedCalc) {
        return "It looks like you haven't completed your Carbon Footprint Calculator yet! Please fill out the form in the 'Footprint Calculator' tab so I can inspect your habits and provide a customized analysis of your carbon footprint.";
      }

      const totalTons = breakdown.total;
      const vehicleType = calculator.vehicleType;
      const miles = calculator.vehicleMiles;

      // Detect highest sector
      const sectorMap = {
        Transportation: breakdown.transport,
        'Home Energy': breakdown.energy,
        'Diet & Food': breakdown.diet,
        'Waste & Consumption': breakdown.waste,
      };
      const highestSector = Object.entries(sectorMap).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

      // Audit notes
      const unhealthyHabits = [];
      const plans = [];

      if (breakdown.transport > 1.2) {
        unhealthyHabits.push(
          `High transportation footprint (${breakdown.transport} tons vs target 1.2t)`
        );
        if (vehicleType === 'petrol' || vehicleType === 'diesel') {
          const evSavings = Math.round(miles * 52 * (c_vehicle[vehicleType] - 0.08));
          plans.push(
            `• **Transport**: Swap your ${vehicleType} car for an EV or hybrid. Swapping for an EV saves **${evSavings} kg CO₂/year**.`
          );
        }
      }
      if (breakdown.energy > 1.0) {
        unhealthyHabits.push(`Utility energy waste (${breakdown.energy} tons vs target 1.0t)`);
        const solarSavings = Math.round(
          (calculator.electricBill / 0.15) * 12 * (1 - calculator.cleanEnergyShare / 100) * 0.39
        );
        if (solarSavings > 0) {
          plans.push(
            `• **Energy**: Upgrade your home grid clean energy share to 100%. This will offset **${solarSavings} kg CO₂/year**.`
          );
        }
      }
      if (breakdown.diet > 0.8) {
        unhealthyHabits.push(
          `High dietary emissions footprint (${breakdown.diet} tons vs target 0.8t)`
        );
        if (calculator.dietType === 'heavy-meat' || calculator.dietType === 'moderate-meat') {
          const vegSavings = Math.round((c_diet[calculator.dietType] - 1.2) * 1000);
          plans.push(
            `• **Diet**: Swap to a vegetarian diet. Sourcing plant meals instead of meat offsets **${vegSavings} kg CO₂/year**.`
          );
        }
      }
      if (breakdown.waste > 0.5) {
        unhealthyHabits.push(
          `Garbage landfill waste volumes (${breakdown.waste} tons vs target 0.5t)`
        );
        const wasteBase = calculator.wasteBags * 0.25;
        const potentialRecycleSavings = Math.round(
          wasteBase * 0.5 * (1 - calculator.recyclingRate / 100) * 1000
        );
        if (potentialRecycleSavings > 0) {
          plans.push(
            `• **Waste**: Increase recycling sorting to 100%. This trims **${potentialRecycleSavings} kg CO₂/year**.`
          );
        }
      }

      const habitsStr =
        unhealthyHabits.length > 0
          ? unhealthyHabits.map((h) => `• ${h}`).join('\n')
          : '• None detected! You maintain outstanding carbon stewardship.';

      return `Based on your calculator inputs, your projected annual emissions are **${totalTons} metric tons of CO₂e**. 

Here is your category breakdown:
• **Transportation**: ${breakdown.transport} tons/yr (Benchmark target: 1.2t)
• **Home Energy**: ${breakdown.energy} tons/yr (Benchmark target: 1.0t)
• **Diet & Food**: ${breakdown.diet} tons/yr (Benchmark target: 0.8t)
• **Waste & Recycling**: ${breakdown.waste} tons/yr (Benchmark target: 0.5t)

### 🔍 Carbon Audit Summary:
**Highest Emission Sector**: ${highestSector}

**Detected Habits to Optimize**:
${habitsStr}

### 🌱 Personalized Carbon Reduction Plan:
${plans.length > 0 ? plans.join('\n') : 'Your footprint is already below target benchmarks! Keep tracking and logging daily actions to maintain this status.'}`;
    }

    // 2. Transport emissions
    if (
      text.includes('transport') ||
      text.includes('car') ||
      text.includes('flight') ||
      text.includes('travel') ||
      text.includes('commute') ||
      text.includes('driving')
    ) {
      if (
        calculator.vehicleType === 'none' &&
        calculator.flightsShort === 0 &&
        calculator.flightsLong === 0
      ) {
        return 'Outstanding! Your transportation emissions are currently zero or extremely low since you walk, cycle, and do not fly. Keep up this world-class sustainability benchmark!';
      }

      const vehicleType = calculator.vehicleType;
      const miles = calculator.vehicleMiles;
      const annualMiles = miles * 52;
      const vehicleEmissions = Math.round(annualMiles * (c_vehicle[vehicleType] || 0));
      const shortFlightEmissions = calculator.flightsShort * 225;
      const longFlightEmissions = calculator.flightsLong * 820;

      let response = `Your transportation emissions total **${breakdown.transport} metric tons/year**. 
• Vehicle Travel: **${vehicleEmissions} kg CO₂/year** (Driving ${miles} miles/week in a **${vehicleType}** vehicle)
• Short Flights (<3 hrs): **${shortFlightEmissions} kg CO₂/year** (${calculator.flightsShort} flights)
• Long Flights (>3 hrs): **${longFlightEmissions} kg CO₂/year** (${calculator.flightsLong} flights)

### 📈 Potential Carbon Savings Math:
`;

      if (vehicleType !== 'none' && vehicleType !== 'ev') {
        const evSavings = Math.round(annualMiles * (c_vehicle[vehicleType] - 0.08));
        const hybridSavings = Math.round(annualMiles * (c_vehicle[vehicleType] - 0.22));
        response += `• Swapping your ${vehicleType} car for an EV saves **${evSavings} kg CO₂/year**; swapping for a Hybrid saves **${hybridSavings} kg CO₂/year**.\n`;
      }
      if (calculator.flightsShort > 0) {
        response += `• Swapping 2 short flights for rail or virtual calls saves **450 kg CO₂/year**.\n`;
      }
      response += `• Commuting by cycling/walking instead of driving saves **3.2 kg CO₂/day** logged.`;

      return response;
    }

    // 3. Electricity / utilities
    if (
      text.includes('electric') ||
      text.includes('energy') ||
      text.includes('power') ||
      text.includes('bill') ||
      text.includes('gas') ||
      text.includes('solar') ||
      text.includes('utility')
    ) {
      const elecAnnual = Math.round(
        (calculator.electricBill / 0.15) * 12 * (1 - calculator.cleanEnergyShare / 100) * 0.39
      );
      const gasAnnual = Math.round((calculator.gasBill / 1.0) * 12 * 5.3);

      let response = `Your annual home energy footprint is **${breakdown.energy} metric tons/year**. 
• Electricity Bill ($${calculator.electricBill}/mo): **${elecAnnual} kg CO₂/year** (Solar share: ${calculator.cleanEnergyShare}%)
• Natural Gas Bill ($${calculator.gasBill}/mo): **${gasAnnual} kg CO₂/year**

### 📈 Potential Carbon Savings Math:
`;

      if (calculator.cleanEnergyShare < 100) {
        const fullSolarSavings = Math.round(
          (calculator.electricBill / 0.15) * 12 * (1 - calculator.cleanEnergyShare / 100) * 0.39
        );
        response += `• Moving your solar renewable share to 100% saves **${fullSolarSavings} kg CO₂/year**.\n`;
      }
      response += `• Adjusting your thermostat by 2°F and unplugging standby phantom loads saves **1.2 kg CO₂/day** logged.\n`;
      response += `• Swapping electric clothes dryer load for air-drying saves **0.8 kg CO₂/load** logged.`;

      return response;
    }

    // 4. Food / diet
    if (
      text.includes('food') ||
      text.includes('diet') ||
      text.includes('meat') ||
      text.includes('vegan') ||
      text.includes('vegetarian') ||
      text.includes('local') ||
      text.includes('organic')
    ) {
      const currentDietBase = c_diet[calculator.dietType] || 2.0;

      let response = `Your dietary carbon footprint totals **${breakdown.diet} metric tons/year** (Based on a **${calculator.dietType}** diet with ${calculator.localFoodShare}% local food share).

### 📈 Potential Carbon Savings Math:
`;

      if (calculator.dietType !== 'vegan') {
        const veganSavings = Math.round((currentDietBase - 0.9) * 1000);
        response += `• Swapping to a 100% Vegan diet saves **${veganSavings} kg CO₂/year**.\n`;
      }
      if (calculator.dietType !== 'vegetarian' && calculator.dietType !== 'vegan') {
        const vegSavings = Math.round((currentDietBase - 1.2) * 1000);
        response += `• Swapping to a Vegetarian diet saves **${vegSavings} kg CO₂/year**.\n`;
      }
      response += `• Swapping red meat for plant proteins on a single day saves **1.5 kg CO₂/day** logged.\n`;
      response += `• Eating 100% locally grown foods to minimize transit food-miles saves **10%** of your dietary footprint.`;

      return response;
    }

    // 5. Waste / recycling
    if (
      text.includes('waste') ||
      text.includes('recycle') ||
      text.includes('recycling') ||
      text.includes('trash') ||
      text.includes('compost')
    ) {
      const wasteBase = calculator.wasteBags * 0.25;

      let response = `Your annual waste footprint is **${breakdown.waste} metric tons/year** (Based on **${calculator.wasteBags} bags/week** and a **${calculator.recyclingRate}%** recycling rate).

### 📈 Potential Carbon Savings Math:
`;

      if (calculator.recyclingRate < 100) {
        const maxRecyclingSavings = Math.round(
          wasteBase * 0.5 * (1 - calculator.recyclingRate / 100) * 1000
        );
        response += `• Increasing your household recycling rate to 100% saves **${maxRecyclingSavings} kg CO₂/year**.\n`;
      }
      response += `• Composting organic scraps avoids anaerobic landfill dump decay and saves **0.4 kg CO₂/day** logged.\n`;
      response += `• Avoiding single-use plastics saves **0.2 kg CO₂/day** logged.`;

      return response;
    }

    // 6. General / fallbacks
    return "That is a great question! Reducing carbon footprint starts with minor, consistent adjustments: using public transport, reducing home thermostat margins, introducing meatless days, and sorting recyclable plastics. Let me know if you'd like a specific breakdown of your transportation, utility, or dietary carbon footprint!";
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: generateMsgId(),
      sender: 'user',
      text,
      timestamp: createDate(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responseText = generateAIResponse(text);
      const aiMsg: ChatMessage = {
        id: generateMsgId(),
        sender: 'assistant',
        text: responseText,
        timestamp: createDate(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputVal);
    }
  };

  return (
    <div className="glass-card border border-white/5 flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto overflow-hidden relative">
      {/* Header bar */}
      <div className="p-4 bg-eco-forest/20 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-eco-green/10 border border-eco-green/20 rounded-xl flex items-center justify-center text-eco-green relative">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-eco-green rounded-full border-2 border-eco-bg"></span>
          </div>
          <div>
            <h3 className="text-white font-bold font-outfit text-sm leading-none">
              {t('assistant.title')}
            </h3>
            <p className="text-[10px] text-eco-muted mt-1">{t('assistant.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-eco-muted font-semibold">
          <Info className="w-3.5 h-3.5 text-eco-green" />
          <span>V1.4 Active</span>
        </div>
      </div>

      {/* Messages layout */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scrollbar-thin"
      >
        <AnimatePresence>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 text-xs shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-eco-green/20 to-eco-teal/20 text-eco-green border-eco-green/35'
                      : 'bg-gradient-to-tr from-white/5 to-white/10 text-white border-white/15'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
                </div>

                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-lg ${
                    isUser
                      ? 'bg-eco-green text-white font-medium rounded-tr-none'
                      : 'bg-[#0f1f18]/90 border border-white/5 text-eco-text rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* AI Typing loading indicator */}
        {isTyping && (
          <div className="flex gap-3 self-start max-w-[85%]">
            <div className="w-9 h-9 rounded-xl border bg-gradient-to-tr from-white/5 to-white/10 text-white border-white/15 flex items-center justify-center shrink-0 text-xs">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="p-4 bg-[#0f1f18]/90 border border-white/5 text-eco-text rounded-2xl rounded-tl-none flex items-center gap-1 w-16 justify-center">
              <span className="w-1.5 h-1.5 bg-eco-muted rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-eco-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-eco-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-20 right-6 p-2.5 bg-eco-green hover:bg-eco-emerald text-white rounded-full shadow-lg transition-all border border-white/10 cursor-pointer animate-bounce z-40"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Suggested question chips */}
      {messages.length === 1 && !isTyping && (
        <div className="px-6 py-3 border-t border-white/5 flex flex-wrap gap-2 justify-center shrink-0 bg-[#050c09]/30">
          <span className="text-[10px] uppercase font-bold text-eco-muted w-full text-center mb-1 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-eco-green" />
            <span>Suggested Questions</span>
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3.5 py-2 bg-white/5 border border-white/10 hover:border-eco-green/45 rounded-full text-[10.5px] font-semibold text-eco-muted hover:text-white hover:bg-white/10 transition-all font-outfit cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input textbox */}
      <div className="p-4 bg-eco-forest/10 border-t border-white/5 shrink-0 flex gap-3 items-center">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('assistant.placeholder')}
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-eco-green/40 focus:bg-white/10 text-xs font-outfit focus:outline-none transition-all text-white placeholder-eco-muted/50"
          disabled={isTyping}
        />
        <button
          onClick={() => handleSendMessage(inputVal)}
          disabled={!inputVal.trim() || isTyping}
          className="p-3 bg-eco-green hover:bg-eco-emerald disabled:bg-eco-green/40 text-white rounded-xl transition-all shadow-md shadow-eco-green/10 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
