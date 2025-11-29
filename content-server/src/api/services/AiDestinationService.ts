import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ExtractedItem {
  country: string;
  title: string;
  link: string;
  studyField?: string;
}

export async function extractSectionWithAI(
  sectionTitle: string,
  sectionHtml: string,
  panelCountry: string,
  studyField: string,
): Promise<ExtractedItem[]> {
  const prompt = `
You are an expert parser. Extract ALL destinations from the following HTML.
Return ONLY JSON.

### Rules:
- Each destination must include:
  "country": string
  "title": string
  "link": string
  "studyField": string

- If HTML includes a study field, use it.
- If HTML does NOT include one, use this fallback: "${studyField}"

- The studyField must NOT contain duplicated text.
- Ensure clean, human-readable titles.
- Remove trailing colons.
- Use "" for missing links.
- Use panel-level country if HTML does not provide one: "${panelCountry}"

NO commentary. Return ONLY JSON.

### HTML:
${sectionHtml}

### JSON format:
[
  {
    "country": "string",
    "title": "string",
    "link": "string",
    "studyField": "string"
  }
]
  `;

  const response = await client.responses.create({
    model: 'gpt-4o',
    input: prompt,
    temperature: 0,
  });

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
        typeof item.link === 'string' &&
        typeof item.studyField === 'string'
    )
  ) {
    console.error('AI returned an invalid structure:', parsed);
    throw new Error('Invalid response format from AI');
  }

  return parsed;
}
