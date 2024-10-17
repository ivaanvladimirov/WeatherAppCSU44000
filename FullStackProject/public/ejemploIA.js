const { OpenAI } = require("openai");

const baseURL = "https://api.aimlapi.com/v1";
const apiKey = "72cda8d25fa2426db79a375d59911531";
const systemPrompt = "You are a travel agent. Be descriptive and helpful";
const userPrompt = "Tell me about San Francisco";

const api = new OpenAI({
  apiKey,
  baseURL,
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const completion = await api.chat.completions.create({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 256,
      });

      const response = completion.choices[0].message.content;

      console.log("User:", userPrompt);
      console.log("AI:", response);
      break; // Salir del bucle si la solicitud es exitosa
    } catch (error) {
      if (error.status === 429 || error.status === 500) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000; // Retraso exponencial
        console.log(`Error ${error.status}. Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
      } else {
        console.error("An error occurred:", error);
        break;
      }
    }
  }
};

main();