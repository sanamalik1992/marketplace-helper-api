# Marketplace Helper API

Backend API for the Marketplace Helper Chrome extension. Provides AI-powered product identification, price comparison, and scam detection.

## Features

- **Product Identification** - Uses Claude AI to identify the exact product from listing title/description
- **Price Comparison** - Searches for retail and used prices via SerpAPI (Google Shopping)
- **Scam Detection** - Analyzes listing for red flags and generates a trust score

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required:
- `ANTHROPIC_API_KEY` - Your Anthropic API key (from console.anthropic.com)

Optional:
- `SERP_API_KEY` - SerpAPI key for Google Shopping results (serpapi.com - has free tier)

### 3. Run locally

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### 4. Update the Chrome extension

In the extension's `content.js`, update the `API_BASE_URL`:

```javascript
const API_BASE_URL = 'http://localhost:3000';
```

## Deployment

### Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

After deployment, update the extension's `API_BASE_URL` to your Vercel URL.

### Environment variables on Vercel

Add your API keys in the Vercel dashboard under Settings > Environment Variables.

## API Endpoints

### POST /api/analyze

Analyze a marketplace listing.

**Request:**
```json
{
  "listing": {
    "id": "123456789",
    "url": "https://facebook.com/marketplace/item/123456789",
    "title": "iPhone 14 Pro Max 256GB",
    "price": "£800",
    "description": "Great condition...",
    "condition": "Used - Like new",
    "seller": {
      "name": "John Doe",
      "joined": "2019"
    },
    "images": ["https://..."],
    "location": "London"
  }
}
```

**Response:**
```json
{
  "success": true,
  "product": {
    "name": "Apple iPhone 14 Pro Max 256GB",
    "brand": "Apple",
    "model": "iPhone 14 Pro Max",
    "category": "Electronics > Phones",
    "searchQuery": "iPhone 14 Pro Max 256GB",
    "confidence": "high"
  },
  "priceComparison": {
    "listingPrice": 800,
    "currency": "GBP",
    "retailPrices": [...],
    "usedPrices": [...],
    "averageRetailPrice": 1099,
    "averageUsedPrice": 850,
    "verdict": "fair_price",
    "savingsPercent": 6
  },
  "scamAnalysis": {
    "score": 85,
    "riskLevel": "low",
    "indicators": [
      {
        "factor": "Seller account age",
        "risk": "low",
        "description": "Account created in 2019, well-established",
        "weight": 3
      }
    ],
    "summary": "This listing appears legitimate with fair pricing."
  }
}
```

## Tech Stack

- Next.js 14 (App Router)
- Anthropic Claude API
- SerpAPI (Google Shopping)
- TypeScript

## Cost Considerations

- **Claude API**: ~$0.003-0.015 per listing analysis
- **SerpAPI**: 100 free searches/month, then $50/month for 5000 searches

For a side project, costs should be minimal. Consider adding rate limiting or user authentication if you plan to make this public.
