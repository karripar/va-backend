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

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    let fixed = str;

    // Remove code fences
    fixed = fixed.replace(/```[\s\S]*?```/g, m => m.replace(/```(?:json)?/g, "").replace(/```/g, ""));

    // Replace single quotes with double
    fixed = fixed.replace(/'/g, '"');

    // Fix trailing commas in arrays or objects
    fixed = fixed.replace(/,(\s*[}\]])/g, "$1");

    // Remove invalid unescaped backslashes
    fixed = fixed.replace(/\\(?!["\\/bfnrt])/g, "");

    // Remove newlines inside string values
    fixed = fixed.replace(/\n+/g, " ");

    return JSON.parse(fixed);
  }
}

export async function extractSectionWithAI(
  sectionTitle: string,
  sectionHtml: string,
  panelCountry: string,
  studyField: string,
): Promise<ExtractedItem[]> {
  const prompt = `
You are an expert parser. Extract ALL destinations from the following HTML.
Return ONLY valid JSON, no backticks.

### Rules:
- Each destination must include:
  "country": string
  "title": string
  "link": string
  "studyField": string

- If HTML does NOT include a study field, use fallback: "${studyField}"
- If HTML does NOT include country, use fallback: "${panelCountry}"
- Titles must be clean, readable, and not duplicated.
- studyField must NOT contain duplicated text.
- Use "" for missing links.

### HTML:
${sectionHtml}

### JSON output format:
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

  const raw = response.output_text.trim();

  let parsed;

  try {
    parsed = safeJsonParse(raw);
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
