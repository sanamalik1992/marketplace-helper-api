export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🛒 Marketplace Helper API</h1>
      <p>Backend API for the Marketplace Helper Chrome extension.</p>
      
      <h2>Endpoints</h2>
      <ul>
        <li>
          <code>POST /api/analyze</code> - Analyze a marketplace listing
        </li>
      </ul>

      <h2>Example Request</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`POST /api/analyze
Content-Type: application/json

{
  "listing": {
    "id": "123456789",
    "url": "https://facebook.com/marketplace/item/123456789",
    "title": "iPhone 14 Pro Max 256GB",
    "price": "£800",
    "description": "Great condition, always had a case...",
    "condition": "Used - Like new",
    "seller": {
      "name": "John Doe",
      "joined": "2019"
    },
    "images": ["https://..."],
    "location": "London"
  }
}`}
      </pre>

      <h2>Response</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`{
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
    "averageRetailPrice": 1099,
    "averageUsedPrice": 850,
    "verdict": "fair_price",
    "savingsPercent": 6
  },
  "scamAnalysis": {
    "score": 85,
    "riskLevel": "low",
    "indicators": [...],
    "summary": "This listing appears legitimate..."
  }
}`}
      </pre>
    </main>
  );
}
