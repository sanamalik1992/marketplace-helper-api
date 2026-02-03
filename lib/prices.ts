import { PriceData, PriceComparison } from '@/types';

interface SerpApiShoppingResult {
  title: string;
  link: string;
  source: string;
  price: string;
  extracted_price: number;
  thumbnail: string;
  delivery?: string;
  second_hand_condition?: string;
}

interface SerpApiResponse {
  shopping_results?: SerpApiShoppingResult[];
  error?: string;
}

// Parse price string to number (handles £1,234.56 format)
function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[£$€,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Extract currency from price string
function extractCurrency(priceStr: string): string {
  if (priceStr.includes('£')) return 'GBP';
  if (priceStr.includes('$')) return 'USD';
  if (priceStr.includes('€')) return 'EUR';
  return 'GBP'; // Default for UK
}

export async function searchPrices(searchQuery: string, location: string = 'United Kingdom'): Promise<PriceData[]> {
  const apiKey = process.env.SERP_API_KEY;
  
  // If no API key, return empty (will fall back to manual)
  if (!apiKey) {
    console.log('No SERP_API_KEY configured, skipping price search');
    return [];
  }

  try {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: searchQuery,
      api_key: apiKey,
      gl: 'uk', // UK results
      hl: 'en',
      num: '10',
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.shopping_results || data.shopping_results.length === 0) {
      return [];
    }

    const prices: PriceData[] = data.shopping_results
      .filter(result => result.extracted_price && result.extracted_price > 0)
      .map(result => ({
        source: result.source || 'Unknown',
        sourceUrl: result.link || '',
        price: result.extracted_price,
        currency: 'GBP',
        condition: result.second_hand_condition ? 'used' : 'new',
        title: result.title || searchQuery,
      }));

    return prices;
  } catch (error) {
    console.error('Error fetching prices from SerpAPI:', error);
    return [];
  }
}

// Alternative: Simple eBay sold prices scraper (no API needed)
export async function searchEbaySoldPrices(searchQuery: string): Promise<PriceData[]> {
  // This would require actual scraping - for now return empty
  // In production, you'd use a service like ScraperAPI or build a proper scraper
  console.log('eBay sold prices search not implemented yet');
  return [];
}

export function calculatePriceComparison(
  listingPriceStr: string | null,
  prices: PriceData[]
): PriceComparison {
  const listingPrice = parsePrice(listingPriceStr || '0') || 0;
  const currency = extractCurrency(listingPriceStr || '£0');

  const retailPrices = prices.filter(p => p.condition === 'new');
  const usedPrices = prices.filter(p => p.condition === 'used');

  const avgRetail = retailPrices.length > 0
    ? retailPrices.reduce((sum, p) => sum + p.price, 0) / retailPrices.length
    : null;

  const avgUsed = usedPrices.length > 0
    ? usedPrices.reduce((sum, p) => sum + p.price, 0) / usedPrices.length
    : null;

  // Determine verdict
  let verdict: PriceComparison['verdict'] = 'unknown';
  let savingsPercent: number | null = null;

  // Compare against appropriate benchmark (used if condition is used, otherwise retail)
  const benchmark = avgUsed || avgRetail;

  if (benchmark && listingPrice > 0) {
    savingsPercent = Math.round(((benchmark - listingPrice) / benchmark) * 100);

    if (savingsPercent >= 30) {
      verdict = 'great_deal';
    } else if (savingsPercent >= -10) {
      verdict = 'fair_price';
    } else {
      verdict = 'overpriced';
    }
  }

  return {
    listingPrice,
    currency,
    retailPrices,
    usedPrices,
    averageRetailPrice: avgRetail ? Math.round(avgRetail) : null,
    averageUsedPrice: avgUsed ? Math.round(avgUsed) : null,
    verdict,
    savingsPercent,
  };
}
