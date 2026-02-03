import Anthropic from '@anthropic-ai/sdk';
import { IdentifiedProduct, ListingData } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function identifyProduct(listing: ListingData): Promise<IdentifiedProduct | null> {
  const prompt = `You are a product identification expert. Analyze this Facebook Marketplace listing and identify the exact product being sold.

LISTING DETAILS:
Title: ${listing.title || 'Not provided'}
Price: ${listing.price || 'Not provided'}
Description: ${listing.description || 'Not provided'}
Condition: ${listing.condition || 'Not provided'}
Location: ${listing.location || 'Not provided'}

Based on this information, identify:
1. The exact product name
2. Brand (if identifiable)
3. Model number/name (if identifiable)
4. Category (e.g., "Electronics > Phones", "Home > Furniture", "Vehicles > Cars")
5. Key specifications that affect price
6. An optimized search query to find this product's retail price online

Respond in this exact JSON format:
{
  "name": "Full product name",
  "brand": "Brand name or null",
  "model": "Model number/name or null",
  "category": "Category > Subcategory",
  "specifications": {
    "key1": "value1",
    "key2": "value2"
  },
  "searchQuery": "optimized search query for price comparison",
  "confidence": "high|medium|low"
}

Set confidence to:
- "high" if you can identify the exact product
- "medium" if you know the general product but not exact model
- "low" if you're guessing based on limited information

Return ONLY the JSON, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse the JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const product = JSON.parse(jsonMatch[0]) as IdentifiedProduct;
    return product;
  } catch (error) {
    console.error('Error identifying product:', error);
    return null;
  }
}

export async function analyzeForScams(
  listing: ListingData,
  product: IdentifiedProduct | null,
  priceComparison: { listingPrice: number; averageRetailPrice: number | null; averageUsedPrice: number | null } | null
): Promise<{
  indicators: Array<{ factor: string; risk: 'low' | 'medium' | 'high'; description: string; weight: number }>;
  summary: string;
}> {
  const prompt = `You are a fraud detection expert for online marketplaces. Analyze this Facebook Marketplace listing for potential scam indicators.

LISTING DETAILS:
Title: ${listing.title || 'Not provided'}
Price: ${listing.price || 'Not provided'}
Description: ${listing.description || 'Not provided'}
Condition: ${listing.condition || 'Not provided'}
Seller Name: ${listing.seller?.name || 'Unknown'}
Seller Joined: ${listing.seller?.joined || 'Unknown'}
Listed: ${listing.listedDate || 'Unknown'}
Number of Images: ${listing.images?.length || 0}

${product ? `IDENTIFIED PRODUCT: ${product.name} (${product.brand || 'Unknown brand'})` : 'PRODUCT: Could not be identified'}

${priceComparison ? `
PRICE ANALYSIS:
- Listing Price: £${priceComparison.listingPrice}
- Average Retail Price: ${priceComparison.averageRetailPrice ? `£${priceComparison.averageRetailPrice}` : 'Unknown'}
- Average Used Price: ${priceComparison.averageUsedPrice ? `£${priceComparison.averageUsedPrice}` : 'Unknown'}
` : ''}

Analyze for these scam indicators:
1. Price too good to be true (significantly below market value)
2. New seller account (joined recently)
3. Vague or generic description
4. Stock photos or limited images
5. Urgency language ("must sell today", "moving")
6. Requests for payment outside platform
7. Inconsistencies in listing details
8. High-value item with suspiciously low price

Respond in this exact JSON format:
{
  "indicators": [
    {
      "factor": "Name of the risk factor",
      "risk": "low|medium|high",
      "description": "Brief explanation",
      "weight": 1-10
    }
  ],
  "summary": "One sentence overall assessment"
}

Return ONLY the JSON, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing for scams:', error);
    return {
      indicators: [],
      summary: 'Unable to perform scam analysis',
    };
  }
}
