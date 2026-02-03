// Types for Marketplace Helper API

export interface ListingData {
  id: string;
  url: string;
  title: string | null;
  price: string | null;
  description: string | null;
  location: string | null;
  seller: {
    name: string | null;
    profileUrl: string | null;
    joined: string | null;
  };
  images: string[];
  condition: string | null;
  listedDate: string | null;
}

export interface IdentifiedProduct {
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  specifications: Record<string, string>;
  searchQuery: string; // Optimized query for price searches
  confidence: 'high' | 'medium' | 'low';
}

export interface PriceData {
  source: string;
  sourceUrl: string;
  price: number;
  currency: string;
  condition: 'new' | 'refurbished' | 'used';
  title: string;
}

export interface PriceComparison {
  listingPrice: number;
  currency: string;
  retailPrices: PriceData[];
  usedPrices: PriceData[];
  averageRetailPrice: number | null;
  averageUsedPrice: number | null;
  verdict: 'great_deal' | 'fair_price' | 'overpriced' | 'unknown';
  savingsPercent: number | null;
}

export interface ScamIndicator {
  factor: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
  weight: number;
}

export interface ScamAnalysis {
  score: number; // 0-100, higher = more trustworthy
  riskLevel: 'low' | 'medium' | 'high';
  indicators: ScamIndicator[];
  summary: string;
}

export interface AnalyzeRequest {
  listing: ListingData;
}

export interface AnalyzeResponse {
  success: boolean;
  product: IdentifiedProduct | null;
  priceComparison: PriceComparison | null;
  scamAnalysis: ScamAnalysis | null;
  error?: string;
}
