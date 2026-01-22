# Affiliate Links Setup Guide

This guide explains how to set up affiliate programs for Pattern 303's recommended products.

## Overview

Pattern 303 uses affiliate links for:
- **Amazon Associates** - Hardware synths, software, pattern books
- **Direct links** - Manufacturer sites (no affiliate, just helpful)

## Amazon Associates Program

### Step 1: Sign Up

1. Go to [Amazon Associates](https://affiliate-program.amazon.com/)
2. Click **"Sign up"**
3. Log in with your existing Amazon account (or create one)
4. Fill out the application:
   - **Account Information**: Your name, address, payment details
   - **Website/App**: Enter your site URL (e.g., `https://p303.xyz`)
   - **Profile**: Describe your site (e.g., "Music synthesizer pattern sharing platform")
   - **Traffic**: Choose categories (Music, Electronics, Software)

### Step 2: Get Your Store ID (Affiliate Tag)

After approval, you'll receive a **Store ID** (also called a tracking tag). 

Example: `p303-20`

This is appended to Amazon URLs like: `?tag=p303-20`

### Step 3: Create Affiliate Links

**Method 1: SiteStripe (Easiest)**
1. When logged into Amazon Associates, browse to any product
2. Use the **SiteStripe** toolbar at the top of the page
3. Click **"Text"** to get a short link with your tag

**Method 2: Manual URLs**
Add `?tag=YOUR_TAG` to any Amazon product URL:
```
# Original URL:
https://www.amazon.com/dp/B09B6SQHXN

# Affiliate URL:
https://www.amazon.com/dp/B09B6SQHXN?tag=p303-20
```

### Step 4: Update Pattern 303 Links

In `src/components/AboutPage.tsx`, update the `hardwareItems` and `softwareItems` arrays:

```typescript
{
  title: 'Behringer TD-3 MO',
  link: 'https://www.amazon.com/dp/B09B6SQHXN?tag=YOUR_TAG_HERE',
  affiliate: true,  // Shows disclosure notice
  // ...
}
```

### Commission Rates

Amazon Associates commissions vary by category:
- **Musical Instruments**: 2.5%
- **Electronics**: 1-4%
- **Software**: 2.5%

Example: $200 synth purchase = ~$5 commission

### Requirements

- Must disclose affiliate relationships (Pattern 303 does this)
- Links must not be cloaked or shortened without Amazon approval
- Cannot use affiliate links in email, PDF, or offline materials
- Must generate sales within 180 days of approval or account closes

---

## Other Affiliate Programs

### Native Instruments (Reaktor)

Native Instruments has an affiliate program:
1. Visit [Native Instruments Affiliate Program](https://www.native-instruments.com/en/specials/affiliate/)
2. Apply with your site details
3. If approved, you'll get custom links

Currently, Pattern 303 uses Amazon links for Reaktor. If you get direct NI affiliate approval, you can update the links.

### Reason Studios (Reason)

Reason Studios doesn't currently have a public affiliate program. Options:
- Use Amazon affiliate links for boxed versions
- Link directly to [reasonstudios.com](https://www.reasonstudios.com/) (no commission)

### Thomann / Sweetwater / Guitar Center

These music retailers have affiliate programs if you prefer them over Amazon:

**Thomann (EU)**
- Apply at: https://www.thomann.de/intl/affiliate_program.html
- Good for European visitors

**Sweetwater (US)**
- Apply at: https://www.sweetwater.com/about/careers/affiliate-program
- Respected music retailer

**Guitar Center (US)**
- Apply through Impact Radius or CJ Affiliate
- Brick-and-mortar + online

---

## Implementing in Pattern 303

### Current Structure

The AboutPage uses this pattern for affiliate items:

```typescript
const hardwareItems = [
  {
    title: 'Product Name',
    description: 'Description here',
    link: 'https://amazon.com/dp/PRODUCT?tag=YOUR_TAG',
    affiliate: true,  // Shows disclosure
    image: 'https://...',
    alt: 'Alt text',
    linkLabel: 'View on Amazon (affiliate link) ↗',
  },
];
```

### Disclosure Requirements

Pattern 303 includes disclosures at two levels:

1. **Per-item disclosure** (when `affiliate: true`):
   ```
   📍 Affiliate disclosure: I earn a small commission...
   ```

2. **Section-level disclosure** (bottom of Museum tab):
   ```
   Affiliate Transparency: Some links above are Amazon affiliate links...
   ```

This satisfies FTC guidelines for affiliate disclosure.

---

## FTC Compliance Checklist

✅ **Clear disclosure** near affiliate links  
✅ **Honest recommendations** (only products you actually use/recommend)  
✅ **No deceptive practices** (don't hide affiliate nature)  
✅ **Disclosure before the link** (or clearly visible)  

Pattern 303 meets all these requirements.

---

## Tracking & Reporting

### Amazon Associates Dashboard

1. Log into [affiliate-program.amazon.com](https://affiliate-program.amazon.com/)
2. View **Reports** → **Earnings**
3. See clicks, orders, and revenue

### Important Metrics

- **Clicks**: How many people clicked your links
- **Conversion Rate**: % of clicks that resulted in purchases
- **Earnings**: Your commission revenue

### Payout

- **Minimum**: $10 (direct deposit) or $100 (check)
- **Payment**: ~60 days after the end of the month items shipped

---

## Quick Reference

### Your Amazon Tag
Replace `p303-20` with your actual tag in all files.

### Files to Update
- `src/components/AboutPage.tsx` - All hardware/software items

### URL Format
```
https://www.amazon.com/dp/PRODUCT_ID?tag=YOUR_TAG
```

### Adding New Products

1. Find product on Amazon
2. Copy the ASIN/product ID (e.g., `B09B6SQHXN`)
3. Create URL: `https://www.amazon.com/dp/B09B6SQHXN?tag=p303-20`
4. Add to appropriate array in AboutPage.tsx
5. Set `affiliate: true`
6. Include `(affiliate link)` in linkLabel

---

## Support

- **Amazon Associates Help**: https://affiliate-program.amazon.com/help
- **FTC Guidelines**: https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers

---

**Remember**: Only recommend products you genuinely believe in! Pattern 303 features items the creator actually uses and loves. 🎛️
