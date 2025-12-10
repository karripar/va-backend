import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const client = new OpenAI({ apiKey });

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
    fixed = fixed.replace(/```[\s\S]*?```/g, (m) =>
      m.replace(/```(?:json)?/g, '').replace(/```/g, ''),
    );

    // Replace single quotes with double
    fixed = fixed.replace(/'/g, '"');

    // Fix trailing commas in arrays or objects
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // Remove invalid unescaped backslashes
    fixed = fixed.replace(/\\(?!["\\/bfnrt])/g, '');

    // Remove newlines inside string values
    fixed = fixed.replace(/\n+/g, ' ');

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
  You are an expert HTML data extractor.

  Your job: Extract ALL individual destination items from the HTML.
  A destination = one unique combination of title + link (or similar clickable entity).

  ### STRICT RULES:
  1. DO NOT invent, merge, summarize, or reorganize items.
  2. Each HTML link or heading referring to a destination MUST produce exactly ONE item.
  3. No duplicates. If two items have the same title+link, keep only one.
  4. For each extracted item:
      - "country":
          * If explicitly shown in the HTML near this item → use it.
          * Otherwise → use fallback: "${panelCountry}"
      - "title": must be the exact title text for that item, cleaned.
      - "link": must be the href URL (or "" if none).
      - "studyField":
          * If a study field is present ANYWHERE near the item, extract it.
          * Otherwise use fallback: "${studyField}"
          * NEVER return "unknown".

  ### Additional rules:
  - You MUST check ALL parent/child/sibling HTML tags related to each item to find study fields.
  - Do NOT reuse study fields from unrelated items.
  - Do NOT duplicate country names or study fields.
  - Output must be ONLY valid JSON. No commentary.

  ### HTML to parse:
  ${sectionHtml}

  ### Final output format:
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
        typeof item.studyField === 'string',
    )
  ) {
    console.error('AI returned an invalid structure:', parsed);
    throw new Error('Invalid response format from AI');
  }

  return parsed;
}
