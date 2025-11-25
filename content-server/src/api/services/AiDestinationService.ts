import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ExtractedItem {
  country: string;
  title: string;
  link: string;
}

async function extractSectionWithAI(
  sectionTitle: string,
  sectionHtml: string
): Promise<ExtractedItem[]> {
  const prompt = `
You are an expert parser. Extract *all destinations* from the following HTML.
Return ONLY valid JSON.

### Rules:
- Each destination must have:
  - "country": string
  - "title": string
  - "link": string (absolute or relative)
- For each <li>, <a>, or text combo, reconstruct the most human-readable title.
- Do NOT include colons at the end.
- If no link exists, return an empty string.
- Country is the heading (aria-labelledby text) or closest country-like text.
- Cleanup weird punctuation: merge duplicated colons, semicolons, etc.

### Input HTML:
${sectionHtml}

### Output JSON format:
[
  {
    "country": "...",
    "title": "...",
    "link": "..."
  }
]
`;

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: prompt,
    temperature: 0,
    top_p: 1,
  });

  const output = response.output[0];
  if (Array.isArray(output) && output.every(item =>
    typeof item.country === "string" &&
    typeof item.title === "string" &&
    typeof item.link === "string"
  )) {
    return output as ExtractedItem[];
  } else {
    throw new Error("Invalid response format");
  }
}

export { extractSectionWithAI, ExtractedItem };

