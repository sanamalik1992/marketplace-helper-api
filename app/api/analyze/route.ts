import { NextRequest, NextResponse } from 'next/server';
import { identifyProduct, analyzeForScams } from '@/lib/claude';
import { searchPrices, calculatePriceComparison } from '@/lib/prices';
import { AnalyzeRequest, AnalyzeResponse, ScamAnalysis } from '@/types';

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { listing } = body;

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'No listing data provided' },
        { status: 400 }
      );
    }

    console.log('Analyzing listing:', listing.title);

    // Step 1: Identify the product using Claude
    const product = await identifyProduct(listing);
    console.log('Identified product:', product?.name || 'Unknown');

    // Step 2: Search for prices if we identified a product
    let priceComparison = null;
    if (product && product.searchQuery) {
      console.log('Searching prices for:', product.searchQuery);
      const prices = await searchPrices(product.searchQuery);
      console.log('Found', prices.length, 'price results');
      priceComparison = calculatePriceComparison(listing.price, prices);
    }

    // Step 3: Analyze for scam indicators
    const scamResult = await analyzeForScams(listing, product, priceComparison);
    
    // Calculate overall scam score (0-100, higher = more trustworthy)
    let scamScore = 100;
    for (const indicator of scamResult.indicators) {
      if (indicator.risk === 'high') {
        scamScore -= indicator.weight * 3;
      } else if (indicator.risk === 'medium') {
        scamScore -= indicator.weight * 1.5;
      } else {
        scamScore -= indicator.weight * 0.5;
      }
    }
    scamScore = Math.max(0, Math.min(100, Math.round(scamScore)));

    const scamAnalysis: ScamAnalysis = {
      score: scamScore,
      riskLevel: scamScore >= 70 ? 'low' : scamScore >= 40 ? 'medium' : 'high',
      indicators: scamResult.indicators,
      summary: scamResult.summary,
    };

    const response: AnalyzeResponse = {
      success: true,
      product,
      priceComparison,
      scamAnalysis,
    };

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        product: null,
        priceComparison: null,
        scamAnalysis: null,
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
