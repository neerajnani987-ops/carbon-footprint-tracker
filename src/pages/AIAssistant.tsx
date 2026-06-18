import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Leaf, Sparkles, User, ArrowDown, HelpCircle, Info } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { calculator, hasCompletedCalc, calculateBreakdown } = useAppState();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name || 'Eco-Citizen'}! I am your AI Sustainability Assistant. Ask me anything about how you can reduce your carbon emissions, optimize home utilities, or improve recycling habits.`,
      timestamp: new Date(),
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
    'Tips for zero-waste recycling.'
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

    // 1. Analyze monthly footprint
    if (text.includes('analyze') || text.includes('monthly') || text.includes('report') || text.includes('footprint') || text.includes('score')) {
      if (!hasCompletedCalc) {
        return "It looks like you haven't completed your Carbon Footprint Calculator yet! Please fill out the form in the 'Footprint Calculator' tab so I can inspect your habits and provide a customized analysis of your carbon footprint.";
      }
      const totalTons = breakdown.total;
      const highestSector = Object.entries({
        Transportation: breakdown.transport,
        'Home Energy': breakdown.energy,
        'Diet & Food': breakdown.diet,
        Waste: breakdown.waste,
      }).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

      return `Based on your calculator inputs, your projected annual emissions are **${totalTons} metric tons of CO₂e**. 

Here is your category breakdown:
• **Transportation**: ${breakdown.transport} tons/yr
• **Home Energy**: ${breakdown.energy} tons/yr
• **Diet & Food**: ${breakdown.diet} tons/yr
• **Waste & Recycling**: ${breakdown.waste} tons/yr

Your highest emission sector is **${highestSector}**. I recommend reviewing your inputs in this category. For example, if you commute via a gasoline vehicle, trying to carpool or walk just 1-2 days a week can significantly lower your overall score.`;
    }

    // 2. Transport emissions
    if (text.includes('transport') || text.includes('car') || text.includes('flight') || text.includes('travel') || text.includes('commute') || text.includes('driving')) {
      if (calculator.vehicleType === 'none' && calculator.flightsShort === 0 && calculator.flightsLong === 0) {
        return 'Outstanding! Your transportation emissions are currently zero or extremely low since you walk, cycle, and do not fly. Keep up this world-class sustainability benchmark!';
      }

      let response = `Your primary transport is a **${calculator.vehicleType}** vehicle driving **${calculator.vehicleMiles} miles per week**. `;
      if (calculator.flightsShort > 0 || calculator.flightsLong > 0) {
        response += `You also take **${calculator.flightsShort + calculator.flightsLong} flights** per year. `;
      }

      response += `\n\nHere are some focused ways to reduce transport emissions:
• **Transition to Active Travel**: Try walking, cycling, or using an electric scooter for trips under 2 miles.
• **Carpooling**: Sharing rides for commutes cut vehicle emissions in half.
• **Optimize Flight Schedules**: Choose direct flights when possible, as landing and takeoff cycles consume the most jet fuel.
• **Consider an EV**: If buying a new car, electric vehicles (EVs) have an emissions rate that is 80% lower than petrol vehicles.`;

      return response;
    }

    // 3. Electricity / utilities
    if (text.includes('electric') || text.includes('energy') || text.includes('power') || text.includes('bill') || text.includes('gas') || text.includes('solar') || text.includes('utility')) {
      return `Your monthly electricity bill is set to **$${calculator.electricBill}**, with natural gas at **$${calculator.gasBill}**, and renewable solar share at **${calculator.cleanEnergyShare}%**.

Here are some high-impact adjustments you can make at home:
• **E-Thermostats**: Lower heating or raise A/C by just 2°F to save up to 10% on monthly power bills.
• **Wash Clothes in Cold Water**: Cold cycles save up to 90% of the energy consumed by washing machines.
• **Unplug Standby Loads**: Chargers and television sets still draw 'phantom load' currents when idle. Unplugging them avoids unnecessary energy leakage.
• **Air Dry Laundry**: Swapping a clothes dryer for drying racks prevents about 0.8 kg of CO₂ per load.`;
    }

    // 4. Food / diet
    if (text.includes('food') || text.includes('diet') || text.includes('meat') || text.includes('vegan') || text.includes('vegetarian') || text.includes('local') || text.includes('organic')) {
      return `Your diet is configured as **${calculator.dietType}**, with local organic food sourcing at **${calculator.localFoodShare}%**.

To reduce your food-related carbon impact, you can:
• **Eat Plant-Based Meals**: Meat production (especially beef and lamb) releases 10-50x more greenhouse gases than farming legumes, tofu, and grains. Eating plant-based once or twice a week makes a significant dent.
• **Minimize Food Waste**: Decaying food in landfills produces methane. Storing vegetables properly and eating leftovers prevents waste.
• **Eat Local**: Buying local produce cuts food freight transportation emissions.`;
    }

    // 5. Waste / recycling
    if (text.includes('waste') || text.includes('recycle') || text.includes('recycling') || text.includes('trash') || text.includes('compost')) {
      return `Your household waste production is **${calculator.wasteBags} bags/week**, with a recycling rate of **${calculator.recyclingRate}%**.

Here are some quick waste reduction tips:
• **Composting**: Divert organic food scraps from landfills to compost bins, avoiding anaerobic methane releases.
• **Strict Sorting**: Wash and separate plastic bottles, aluminum cans, and cardboard from general trash.
• **Reusables**: Bring reusable canvas tote bags and stainless steel coffee mugs when out.`;
    }

    // 6. General / fallbacks
    return "That is a great question! Reducing carbon footprint starts with minor, consistent adjustments: using public transport, reducing home thermostat margins, introducing meatless days, and sorting recyclable plastics. Let me know if you'd like a specific breakdown of your transportation, utility, or dietary carbon footprint!";
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responseText = generateAIResponse(text);
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date(),
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
            <h3 className="text-white font-bold font-outfit text-sm leading-none">{t('assistant.title')}</h3>
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
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 text-xs shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-eco-green/20 to-eco-teal/20 text-eco-green border-eco-green/35'
                    : 'bg-gradient-to-tr from-white/5 to-white/10 text-white border-white/15'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
                </div>

                {/* Text Bubble */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-lg ${
                  isUser
                    ? 'bg-eco-green text-white font-medium rounded-tr-none'
                    : 'bg-[#0f1f18]/90 border border-white/5 text-eco-text rounded-tl-none'
                }`}>
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
