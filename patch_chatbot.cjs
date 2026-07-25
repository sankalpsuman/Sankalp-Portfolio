const fs = require('fs');
let content = fs.readFileSync('src/components/portfolio/AIChatbot.tsx', 'utf-8');

const oldLogicStart = "let receivedSuccessfully = false;";
const oldLogicEnd = "} catch (error: any) {";

const startIndex = content.indexOf(oldLogicStart);
const endIndex = content.indexOf(oldLogicEnd, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find blocks");
  process.exit(1);
}

const streamLogic = `
    let receivedSuccessfully = false;
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages })
      });

      if (!response.ok) {
        throw new Error(\`Server returned status \${response.status}\`);
      }

      setIsGenerating(false);
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let currentText = "";
      
      const aiReplyMessage = {
        role: 'model',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...nextMessages, aiReplyMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                receivedSuccessfully = true;
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.error) throw new Error(data.error);
                if (data.text) {
                  currentText += data.text;
                  setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === 'model') {
                      last.content = currentText;
                    }
                    return updated;
                  });
                }
                if (data.leadData) {
                  setIsRecruiter(true);
                  setLeadData(prev => ({ ...prev, ...data.leadData.leadData }));
                }
              } catch (e) {}
            }
          }
        }
      }
      
      const finalMessages = [...nextMessages, { ...aiReplyMessage, content: currentText }];
      sessionStorage.setItem('portfolio_chatbot_history', JSON.stringify(finalMessages));
      if (currentText.includes('sankalpsmn@gmail.com') || currentText.includes('recruit') || currentText.includes('interview')) {
         if (!isRecruiter) setShowExitForm(true);
      }
    `;

content = content.substring(0, startIndex) + streamLogic + content.substring(endIndex);
fs.writeFileSync('src/components/portfolio/AIChatbot.tsx', content);
console.log("Patched correctly");
