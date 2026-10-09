import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Phone } from 'lucide-react';

const SilverMascot = ({ result }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Olá! Sou o Silver, seu guia de cores! 🎨 Como posso te ajudar hoje?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // WhatsApp Config
  const STORE_PHONE = "551932660789"; // Número da loja atualizado
  const whatsappLink = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(
    result
      ? `Olá! Estou procurando a cor ${result.name} (${result.hex}) e gostaria de mais informações.`
      : "Olá! Gostaria de tirar algumas dúvidas sobre as tintas."
  )}`;

  const handleAiChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/ai-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();

      if (data.code) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.explanation }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: `${data.explanation} Não se preocupe! Você pode falar agora mesmo com um de nossos especialistas pelo WhatsApp clicando no botão abaixo. 👇`
        }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Ops, tive um probleminha. Tente falar com a gente pelo WhatsApp!' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isChatOpen && (
        <div className="w-[350px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-[#1a1464] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              <span className="font-bold">Silver Assistente AI</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#1a1464] text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm text-sm text-gray-500 italic">
                  Silver está pensando...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiChat()}
                placeholder="Pergunte ao Silver..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1a1464]/20 focus:border-[#1a1464]"
              />
              <button onClick={handleAiChat} className="bg-[#1a1464] text-white p-2 rounded-lg hover:bg-indigo-900 transition-colors">
                <Send size={18} />
              </button>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-green-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
            >
              <Phone size={14} /> Falar com Especialista (WhatsApp)
            </a>
          </div>
        </div>
      )}

      {/* Mascot Button */}
      <div className="relative group">
        {/* Bubble hint */}
        {!isChatOpen && (
          <div className="absolute -top-12 right-0 bg-white text-gray-800 px-3 py-2 rounded-full text-xs font-medium shadow-lg border border-gray-100 whitespace-nowrap animate-bounce">
            Oi! Precisa de ajuda? 👋
          </div>
        )}
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-16 h-16 bg-[#1a1464] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 border-4 border-white"
        >
          <div className="text-center">
            <div className="text-2xl">🎨</div>
            <div className="text-[8px] font-bold uppercase">Silver</div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default SilverMascot;
