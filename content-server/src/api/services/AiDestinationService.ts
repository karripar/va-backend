import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export interface ExtractedItem {
  country: string;
  title: string;
  link: string;
}

export async function extractSectionWithAI(
  sectionTitle: string,
  sectionHtml: string,
  panelCountry: string, // new parameter
): Promise<ExtractedItem[]> {
  const prompt = `
You are an expert parser. Extract ALL destinations from the following HTML.
Return ONLY valid JSON. The HTML might be in English or Finnish.

### Rules:
- Each destination must include:
  "country": string
  "title": string
  "link": string
- Reconstruct the cleanest human-readable title.
- Remove trailing colons.
- Replace missing links with "".
- Cleanup punctuation issues.
- If the HTML does not contain a country for an item, use the panel-level country: "${panelCountry}".
- DO NOT include commentary. Only JSON.

### HTML:
${sectionHtml}

### JSON format:
[
  {
    "country": "string",
    "title": "string",
    "link": "string"
  }
]
`;

  const response = await client.responses.create({
    model: 'gpt-4o',
    input: prompt,
    temperature: 0,
  });

  // --- Use output_text to get plain JSON ---
  const raw = response.output_text;

  let parsed;
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/, '')
      .replace(/```$/, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('Failed to parse AI JSON:', raw);
    throw new Error('AI did not return valid JSON');
  }

  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (item) =>
        typeof item.country === 'string' &&
        typeof item.title === 'string' &&
        typeof item.link === 'string',
    )
  ) {
    console.error('AI returned an invalid structure:', parsed);
    throw new Error('Invalid response format from AI');
  }

  return parsed as ExtractedItem[];
}

