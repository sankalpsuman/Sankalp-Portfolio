export async function generateAIResponse(prompt: string, userInput: string) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, userInput }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate response');
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error('Gemini Service Error:', error);
    throw error;
  }
}
