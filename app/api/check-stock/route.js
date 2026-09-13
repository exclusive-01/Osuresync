import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { productUrl } = await req.json();

    if (!productUrl) {
      return NextResponse.json({ error: 'Product destination URL is required' }, { status: 400 });
    }

    // Sanitize and append Shopify .json endpoint
    const cleanUrl = productUrl.split('?')[0].replace(/\/$/, "");
    const targetJsonUrl = `${cleanUrl}.json`;

    const res = await fetch(targetJsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
      },
      next: { revalidate: 30 }
    });

    if (!res.ok) {
      return NextResponse.json({
        status: 'UNSUPPORTED_OR_BLOCKED',
        message: 'Could not fetch data. Ensure this is an active public Shopify store product URL.'
      }, { status: 404 });
    }

    const data = await res.json();
    const product = data.product;

    if (!product || !product.variants) {
      return NextResponse.json({ error: 'Unrecognized product schema' }, { status: 422 });
    }

    const variants = product.variants;
    const totalVariants = variants.length;
    const unavailableVariants = variants.filter(v => !v.available);
    const isAllSoldOut = unavailableVariants.length === totalVariants;

    // Check apparel and standard consumer hero sizes
    const primarySizes = ['S', 'M', 'L', 'XL', 'Free Size', 'Default Title'];
    const soldOutPrimary = variants
      .filter(v => primarySizes.includes(v.title.trim()) && !v.available)
      .map(v => v.title.trim());

    let healthStatus = 'HEALTHY';
    let riskLevel = 'LOW';

    if (isAllSoldOut) {
      healthStatus = 'GHOST_AD_CRITICAL';
      riskLevel = 'HIGH';
    } else if (soldOutPrimary.length > 0) {
      healthStatus = 'HERO_SIZES_EMPTY';
      riskLevel = 'MEDIUM';
    }

    return NextResponse.json({
      title: product.title,
      vendor: product.vendor || 'D2C Brand',
      healthStatus,
      riskLevel,
      isAllSoldOut,
      soldOutPrimary,
      totalVariants,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return NextResponse.json({ error: 'Internal audit failure: ' + err.message }, { status: 500 });
  }
                               }
      
