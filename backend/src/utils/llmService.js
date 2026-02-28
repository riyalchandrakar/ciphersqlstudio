const generateHint = async ({
  question,
  tableSchemas,
  userQuery,
  hintLevel = 1,
}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured in .env file.");
  }

  const schemaText = tableSchemas
    .map((t) => {
      const cols = t.columns
        .map((c) => `  ${c.name} ${c.type} ${c.constraints}`)
        .join("\n");
      return `Table: ${t.tableName}\nColumns:\n${cols}`;
    })
    .join("\n\n");

  const userQuerySection = userQuery
    ? `The student has written the following query (which may be incomplete or incorrect):\n\`\`\`sql\n${userQuery}\n\`\`\``
    : "The student has not written any query yet.";

  const systemPrompt = `You are a SQL teaching assistant for CipherSQLStudio, an educational SQL learning platform.

Your role is STRICTLY to provide HINTS, NEVER complete solutions.

RULES YOU MUST FOLLOW:
1. NEVER write the complete SQL answer or solution
2. NEVER complete a partial query directly
3. NEVER say "the answer is" or "you should write"
4. DO guide the student's thinking with questions and concepts
5. DO point to relevant SQL concepts they should look up
6. DO identify what is wrong conceptually in their approach without fixing it
7. Keep hints concise - 2 to 4 sentences maximum
8. Be encouraging and educational in tone

HINT LEVEL ${hintLevel} guidance:
- Level 1: Very subtle hint, point to the SQL concept needed
- Level 2: More specific hint about the structure
- Level 3: Direct conceptual guidance without writing any code`;

  const userMessage = `Assignment Question:
${question}

Available Tables and Schema:
${schemaText}

${userQuerySection}

Please provide a Level ${hintLevel} hint to help the student figure out the solution on their own.`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "CipherSQLStudio",
        },
        body: JSON.stringify({
          model:
            process.env.OPENROUTER_MODEL ||
            "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `OpenRouter API error: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    if (error.message.includes("401")) {
      throw new Error(
        "Invalid OpenRouter API key. Check your OPENROUTER_API_KEY in .env",
      );
    }
    if (error.message.includes("429")) {
      throw new Error(
        "Rate limit reached. Please wait before requesting another hint.",
      );
    }
    throw new Error(`Hint service error: ${error.message}`);
  }
};

module.exports = { generateHint };
