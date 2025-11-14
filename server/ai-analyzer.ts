import OpenAI from "openai";
import { ENV } from "./_core/env";

/**
 * OpenRouter client (compatible with OpenAI API)
 */
const openrouter = new OpenAI({
  apiKey: ENV.openRouterApiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3001",
    "X-Title": "Local Business Scraper",
  },
});

/**
 * Structure for extracted business data
 */
export interface ExtractedBusinessData {
  businessName: string;
  email?: string[];
  phone?: string[];
  address?: string;
  website?: string;
  isRelevant: boolean;
  relevanceScore: number;
  extractedInfo: string;
}

/**
 * Analyze HTML content and extract business information using AI
 */
export async function analyzeBusinessPage(
  htmlContent: string,
  url: string,
  expectedSector: string,
  expectedDepartment: string
): Promise<ExtractedBusinessData | null> {
  try {
    // Truncate HTML to avoid token limits (keep first 8000 chars)
    const truncatedHtml = htmlContent.substring(0, 8000);

    const prompt = `Tu es un expert en extraction de données d'entreprises françaises. Analyse cette page web et extrais les informations suivantes :

CONTEXTE DE RECHERCHE:
- Secteur attendu : ${expectedSector}
- Département/Ville : ${expectedDepartment}

PAGE WEB:
URL: ${url}
HTML: ${truncatedHtml}

TÂCHE:
1. Détermine si cette page correspond VRAIMENT à une entreprise du secteur "${expectedSector}" dans la zone "${expectedDepartment}"
2. Extrais les informations suivantes (si disponibles):
   - Nom exact de l'entreprise
   - Email(s) de contact (pas de noreply/donotreply)
   - Téléphone(s) français
   - Adresse complète
   - Site web

3. Donne un score de pertinence de 0 à 100:
   - 100 = correspond parfaitement au secteur ET à la zone géographique
   - 50-99 = correspond au secteur mais zone incertaine
   - 0-49 = ne correspond pas au secteur ou zone incorrecte

RÉPONDS UNIQUEMENT EN JSON VALIDE (sans markdown):
{
  "businessName": "nom exact",
  "email": ["email1@example.com", "email2@example.com"],
  "phone": ["+33123456789"],
  "address": "adresse complète",
  "website": "${url}",
  "isRelevant": true/false,
  "relevanceScore": 85,
  "extractedInfo": "brève explication de ce que fait l'entreprise"
}`;

    const response = await openrouter.chat.completions.create({
      model: ENV.openRouterModel,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("[AI] No response from OpenRouter");
      return null;
    }

    // Parse JSON response
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const extracted: ExtractedBusinessData = JSON.parse(cleaned);

    console.log(`[AI] Analyzed ${url}: relevance=${extracted.relevanceScore}%, name="${extracted.businessName}"`);

    return extracted;
  } catch (error) {
    console.error("[AI] Error analyzing page:", error);
    return null;
  }
}

/**
 * Analyze search results from Firecrawl/PagesJaunes and improve data quality
 */
export async function analyzeSearchResults(
  rawResults: Array<{
    name: string;
    website?: string;
    address?: string;
    phone?: string;
  }>,
  sector: string,
  department: string
): Promise<Array<{
  name: string;
  website?: string;
  address?: string;
  phone?: string;
  relevanceScore: number;
}>> {
  try {
    const prompt = `Tu es un expert en validation de données d'entreprises françaises.

CONTEXTE:
- Secteur recherché: ${sector}
- Zone géographique: ${department}

RÉSULTATS BRUTS (${rawResults.length} entreprises):
${JSON.stringify(rawResults, null, 2)}

TÂCHE:
Pour chaque entreprise, évalue sa pertinence (score 0-100) par rapport au secteur et à la zone.
Corrige les noms d'entreprises si nécessaire (enlève les suffixes inutiles, normalise).
Filtre les résultats non pertinents (score < 50).

RÉPONDS UNIQUEMENT EN JSON VALIDE (sans markdown):
[
  {
    "name": "Nom corrigé",
    "website": "https://...",
    "address": "adresse",
    "phone": "téléphone",
    "relevanceScore": 85
  }
]

Trie par score de pertinence décroissant.`;

    const response = await openrouter.chat.completions.create({
      model: ENV.openRouterModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("[AI] No response from OpenRouter");
      return rawResults.map(r => ({ ...r, relevanceScore: 50 }));
    }

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analyzed = JSON.parse(cleaned);

    console.log(`[AI] Analyzed ${rawResults.length} results, kept ${analyzed.length} relevant ones`);

    return analyzed;
  } catch (error) {
    console.error("[AI] Error analyzing search results:", error);
    return rawResults.map(r => ({ ...r, relevanceScore: 50 }));
  }
}
