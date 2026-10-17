PRICE RESEARCH RULES (US market, prices in USD)

For each camera, find:
1. NEW: the current price of a new, US-warranty unit from an authorised US retailer. Check, in this order, as many as you can reach: B&H Photo (bhphotovideo.com), Adorama, the maker's own US store (Leica Store / leica-camera.com US, Fujifilm US shop, Ricoh Imaging US store, Sony US store), Amazon (only when sold by Amazon or the maker), Best Buy. Report the LOWEST current new price you can confirm, which seller, the product page URL, and stock status if stated ("In stock", "Backordered", "Preorder", "Out of stock").
2. DEAL: only if a retailer's own page (or the maker's official promotion page) states a current discount, instant rebate, gift-card or bundle offer below the usual price. Give the deal price, the usual price ("was"), what the offer is in a few words, the end date if stated, seller and URL. Otherwise null. Do not count "free shipping" or financing as a deal.
3. USED: current used prices from MPB (mpb.com, US site) and KEH (keh.com). Give the lowest and highest asking price among the units listed in good / excellent / like-new condition (skip "well used" or for-parts), the seller with the lowest, its URL, the condition of the lowest, and how many units you saw if visible.
4. SOLD (optional): if you can see recent eBay completed/sold prices for the US (ebay.com sold listings, last ~30 days), give the median of what you can see and the count. If eBay cannot be read, null.

Verification: open each page with WebFetch and read the price on the page. If a page cannot be fetched (bot block), you may use a web search result ONLY if the snippet is from that retailer's own domain and clearly shows the current price; mark it "search" in "verified". Never estimate, average across sellers you did not see, or fill in from memory. If you cannot confirm a value, use null and say why in "notes". The camera must be the exact model (e.g. Leica Q3 43, not Q3 or Q2; Ricoh GR IV, not GR IIIx; body only where stated). Watch for "Monochrom", "HDF", kit, limited editions or colour variants and exclude them unless noted.

Return ONLY a JSON object, no prose before or after, of this shape (one key per camera id you were given):
{
 "<camera id>": {
   "new": {"price": 6395, "seller": "B&H Photo", "url": "https://...", "stock": "In stock", "verified": "page"} or null,
   "deal": {"price": 5995, "was": 6395, "what": "$400 instant rebate", "ends": "2026-11-02" or null, "seller": "...", "url": "https://...", "verified": "page"} or null,
   "used": {"low": 5100, "high": 5800, "seller": "MPB", "url": "https://...", "cond": "Excellent", "n": 6, "verified": "page"} or null,
   "sold": {"median": 5400, "n": 12, "url": "https://..."} or null,
   "notes": "anything the reader should know, under 200 characters"
 }
}
Prices are whole US dollars as numbers.

CAMERAS (id: exact model)
- q343: Leica Q3 43 (black, standard edition)
- q328: Leica Q3 (the 28 mm Q3, 60 MP, black standard edition; not the Q3 43 or Q3 Monochrom). If Leica replaces it with a newer model, say so in notes.
- x100vi: Fujifilm X100VI (black or silver, standard; not a limited edition)
- griv: Ricoh GR IV (standard black; not Monochrome or HDF)
- griiix: Ricoh GR IIIx (standard; not HDF or Urban Edition)
- rx1r3: Sony RX1R III
- xe5: Fujifilm X-E5 with XF 23mm f/2.8 R WR lens kit (if only body pricing exists, give that and say so in notes)
- m11: Leica M11 body only (standard black or silver; not M11-P, M11-D or Monochrom). New stock is discontinued at most dealers; say so in notes when that is still true.
- a7c2: Sony A7C II body only (not the A7CR, not a kit)

After the research, tools/prices.py validates the values, keeps the price history and works out alerts.
