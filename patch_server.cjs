const fs = require('fs');
const content = fs.readFileSync('api/_server.ts', 'utf-8');

const newEndpoint = `
  app.post('/api/chat/stream', async (req, res) => {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const { messages } = req.body || {};
      const ai = getGeminiClient();
      
      if (!Array.isArray(messages)) {
        res.write('data: {"error": "Invalid messages"}\n\n');
        return res.end();
      }
      
      const conversationHistory = messages.map((m: any) => \`\${m.role === 'user' ? 'Visitor' : 'Sankalp\\'s Representative'}: \${m.content}\`).join('\\n');
      const userMessages = messages.filter((m: any) => m.role === 'user');
      const latestQuery = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';
      
      const retrievedContext = await retrieveRelevantContext(latestQuery, undefined, db);
      
      const systemPrompt = \`You are Sankalp Suman’s premium professional Manager and Digital Representative based in India, acting as a real-world human liaison on Sankalp Suman's portfolio.
YOUR PRIME DIRECTIVE: Respond in a highly professional, conversational, and natural human tone.

CONTEXT:
\${retrievedContext}

SETTINGS:
- Notice Period: 1 month / negotiable
- Relocation: Globally open (India, Germany, USA, etc.)
- Salary: Highly competitive
- Geography: COMPLETELY GLOBAL

RULES:
1. Base specific answers on the retrieved context.
2. If general knowledge is needed, use your own intelligence.
3. STRICT HUMAN TONALITY REQUIREMENT: Speak EXACTLY like a highly polished, warm professional human colleague or manager from India representing Sankalp Suman.
4. Do NOT use typical AI phrasing (Avoid: "Certainly", "As an AI").
5. Respond directly with the message text. No JSON wrapping.\`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-flash",
        contents: \`\${systemPrompt}\\n\\nClient Conversation History:\\n\${conversationHistory}\\n\\nProvide the next reply.\`
      });

      let fullText = "";
      for await (const chunk of responseStream) {
        fullText += chunk.text;
        res.write(\`data: \${JSON.stringify({ text: chunk.text })}\\n\\n\`);
      }
      
      // Secondary check for recruiter lead (async)
      try {
        const leadCheck = await ai.models.generateContent({
           model: "gemini-3.1-flash",
           contents: \`Analyze this conversation:\\n\${conversationHistory}\\n\\nExtract recruiter/lead data in JSON format: { "isRecruiterLead": boolean, "leadData": { "recruiterName": string, "companyName": string, "email": string, "roleDetails": string, "location": string } }\`,
           config: {
             responseMimeType: "application/json"
           }
        });
        const leadResult = JSON.parse(leadCheck.text || '{}');
        if (leadResult.isRecruiterLead) {
           res.write(\`data: \${JSON.stringify({ leadData: leadResult })}\\n\\n\`);
        }
      } catch(e) {
        console.error("Lead check failed", e);
      }

      res.write('data: [DONE]\\n\\n');
      res.end();
    } catch (error: any) {
      console.error('Stream error:', error);
      res.write(\`data: \${JSON.stringify({ error: error.message })}\\n\\n\`);
      res.end();
    }
  });
`;

const updatedContent = content.replace("app.post('/api/chat/message', async (req, res) => {", newEndpoint + "\n  app.post('/api/chat/message', async (req, res) => {");
fs.writeFileSync('api/_server.ts', updatedContent);
console.log('Patched API');
