import jsPDF from "jspdf";

export function generatePricingPDF() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Enhanced Gold Color Palette
  const goldRich = [218, 165, 32] as const;      // Rich gold
  const goldLight = [245, 215, 110] as const;    // Light gold highlight
  const goldDeep = [184, 134, 11] as const;      // Deep gold accent
  const goldMuted = [139, 117, 61] as const;     // Muted gold for subtle elements
  const goldPale = [255, 235, 180] as const;     // Pale gold for gradients
  const charcoal = [15, 15, 15] as const;        // Deep black
  const charcoalLight = [25, 25, 25] as const;   // Card backgrounds
  const charcoalMid = [35, 35, 35] as const;     // Secondary backgrounds
  const cream = [252, 250, 245] as const;        // Warm cream text

  // Helper function to draw elegant corner flourishes
  const drawCornerFlourishes = (x: number, y: number, w: number, h: number, size: number = 15) => {
    doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.setLineWidth(0.8);
    
    // Top left flourish
    doc.line(x, y + size, x, y);
    doc.line(x, y, x + size, y);
    doc.setLineWidth(0.4);
    doc.line(x + 3, y + 3, x + size - 2, y + 3);
    doc.line(x + 3, y + 3, x + 3, y + size - 2);
    
    // Top right flourish
    doc.setLineWidth(0.8);
    doc.line(x + w - size, y, x + w, y);
    doc.line(x + w, y, x + w, y + size);
    doc.setLineWidth(0.4);
    doc.line(x + w - size + 2, y + 3, x + w - 3, y + 3);
    doc.line(x + w - 3, y + 3, x + w - 3, y + size - 2);
    
    // Bottom left flourish
    doc.setLineWidth(0.8);
    doc.line(x, y + h - size, x, y + h);
    doc.line(x, y + h, x + size, y + h);
    doc.setLineWidth(0.4);
    doc.line(x + 3, y + h - size + 2, x + 3, y + h - 3);
    doc.line(x + 3, y + h - 3, x + size - 2, y + h - 3);
    
    // Bottom right flourish
    doc.setLineWidth(0.8);
    doc.line(x + w, y + h - size, x + w, y + h);
    doc.line(x + w - size, y + h, x + w, y + h);
    doc.setLineWidth(0.4);
    doc.line(x + w - 3, y + h - size + 2, x + w - 3, y + h - 3);
    doc.line(x + w - size + 2, y + h - 3, x + w - 3, y + h - 3);
  };

  // Helper to draw ornate diamond
  const drawOrnateDiamond = (x: number, y: number, size: number = 4) => {
    doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
    const half = size / 2;
    doc.triangle(x, y - half, x + half, y, x, y + half, "F");
    doc.triangle(x, y - half, x - half, y, x, y + half, "F");
    
    // Inner highlight
    doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
    const inner = size / 4;
    doc.triangle(x, y - inner, x + inner, y, x, y + inner, "F");
    doc.triangle(x, y - inner, x - inner, y, x, y + inner, "F");
  };

  // Helper to draw elegant decorative divider
  const drawElegantDivider = (y: number, width: number = 80) => {
    const centerX = pageWidth / 2;
    
    // Main lines
    doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.setLineWidth(0.5);
    doc.line(centerX - width / 2, y, centerX - 8, y);
    doc.line(centerX + 8, y, centerX + width / 2, y);
    
    // Outer accent lines
    doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setLineWidth(0.2);
    doc.line(centerX - width / 2 + 5, y - 2, centerX - 12, y - 2);
    doc.line(centerX + 12, y - 2, centerX + width / 2 - 5, y - 2);
    doc.line(centerX - width / 2 + 5, y + 2, centerX - 12, y + 2);
    doc.line(centerX + 12, y + 2, centerX + width / 2 - 5, y + 2);
    
    // Center diamond
    drawOrnateDiamond(centerX, y, 3);
    
    // End diamonds
    doc.setFillColor(goldDeep[0], goldDeep[1], goldDeep[2]);
    doc.circle(centerX - width / 2, y, 1, "F");
    doc.circle(centerX + width / 2, y, 1, "F");
  };

  // Helper to draw luxury card gradient effect (simulated)
  const drawLuxuryCard = (x: number, y: number, w: number, h: number, isHighlighted: boolean = false) => {
    // Main card background with subtle gradient effect
    doc.setFillColor(charcoalLight[0], charcoalLight[1], charcoalLight[2]);
    doc.rect(x, y, w, h, "F");
    
    // Top highlight strip
    doc.setFillColor(charcoalMid[0], charcoalMid[1], charcoalMid[2]);
    doc.rect(x, y, w, h * 0.15, "F");
    
    // Border
    if (isHighlighted) {
      doc.setDrawColor(goldLight[0], goldLight[1], goldLight[2]);
      doc.setLineWidth(1.2);
    } else {
      doc.setDrawColor(goldDeep[0], goldDeep[1], goldDeep[2]);
      doc.setLineWidth(0.6);
    }
    doc.rect(x, y, w, h);
    
    // Inner border for premium feel
    doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setLineWidth(0.2);
    doc.rect(x + 2, y + 2, w - 4, h - 4);
  };

  // Helper to add premium page background
  const addPremiumBackground = () => {
    // Deep charcoal base
    doc.setFillColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    
    // Subtle corner vignettes (darker corners)
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 30, 30, "F");
    doc.rect(pageWidth - 30, 0, 30, 30, "F");
    doc.rect(0, pageHeight - 30, 30, 30, "F");
    doc.rect(pageWidth - 30, pageHeight - 30, 30, 30, "F");
    
    // Outer gold border
    doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.setLineWidth(1);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    
    // Secondary accent border
    doc.setDrawColor(goldDeep[0], goldDeep[1], goldDeep[2]);
    doc.setLineWidth(0.3);
    doc.rect(11, 11, pageWidth - 22, pageHeight - 22);
    
    // Inner subtle frame
    doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setLineWidth(0.2);
    doc.rect(14, 14, pageWidth - 28, pageHeight - 28);
    
    // Corner flourishes
    drawCornerFlourishes(8, 8, pageWidth - 16, pageHeight - 16, 20);
  };

  // Helper to add elegant page footer
  const addElegantFooter = (pageNum: number, totalPages: number) => {
    // Footer divider
    doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 40, pageHeight - 18, pageWidth / 2 + 40, pageHeight - 18);
    
    drawOrnateDiamond(pageWidth / 2, pageHeight - 18, 2);
    
    doc.setFontSize(7);
    doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`${pageNum}  ·  ${totalPages}`, pageWidth / 2, pageHeight - 13, { align: "center" });
    
    doc.setFontSize(6);
    doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
    doc.text("D O N Y A S S   P H O T O G R A P H Y", pageWidth / 2, pageHeight - 9, { align: "center" });
  };

  // ==================== PAGE 1: LUXURY COVER ====================
  addPremiumBackground();
  
  let yPos = 45;
  
  // Top ornamental header
  drawElegantDivider(yPos, 100);
  
  yPos += 30;
  
  // Main Brand Name with shadow effect
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setFontSize(56);
  doc.setFont("helvetica", "bold");
  doc.text("DONYASS", pageWidth / 2 + 0.5, yPos + 0.5, { align: "center" });
  
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.text("DONYASS", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 14;
  
  // Photography with luxury spacing
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.text("P  H  O  T  O  G  R  A  P  H  Y", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 22;
  
  // Elegant divider
  drawElegantDivider(yPos, 120);
  
  yPos += 28;
  
  // Tagline with gold gradient effect
  doc.setFontSize(20);
  doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
  doc.setFont("helvetica", "italic");
  doc.text("Beyond The Ordinary", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 40;
  
  // Central luxury box
  const boxWidth = 145;
  const boxHeight = 65;
  const boxX = (pageWidth - boxWidth) / 2;
  
  // Box shadow effect
  doc.setFillColor(5, 5, 5);
  doc.rect(boxX + 2, yPos + 2, boxWidth, boxHeight, "F");
  
  // Main box
  doc.setFillColor(charcoalMid[0], charcoalMid[1], charcoalMid[2]);
  doc.rect(boxX, yPos, boxWidth, boxHeight, "F");
  
  // Gold border with double line
  doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setLineWidth(1);
  doc.rect(boxX, yPos, boxWidth, boxHeight);
  doc.setDrawColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setLineWidth(0.3);
  doc.rect(boxX + 3, yPos + 3, boxWidth - 6, boxHeight - 6);
  
  // Box corner accents
  drawCornerFlourishes(boxX, yPos, boxWidth, boxHeight, 10);
  
  doc.setFontSize(10);
  doc.setTextColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setFont("helvetica", "normal");
  doc.text("✦  SIGNATURE COLLECTIONS  ✦", pageWidth / 2, yPos + 20, { align: "center" });
  
  doc.setFontSize(8);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.text("—  &  —", pageWidth / 2, yPos + 30, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.text("✦  PRICING PACKAGE  ✦", pageWidth / 2, yPos + 40, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setFont("helvetica", "bold");
  doc.text(new Date().getFullYear().toString(), pageWidth / 2, yPos + 55, { align: "center" });
  
  yPos += boxHeight + 45;
  
  // Location with luxury styling
  doc.setFontSize(10);
  doc.setTextColor(cream[0], cream[1], cream[2]);
  doc.setFont("helvetica", "italic");
  doc.text("Abuja & Kaduna, Nigeria", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  
  doc.setFontSize(8);
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.text("✧  Globally Inspired  ·  Destination Ready  ✧", pageWidth / 2, yPos, { align: "center" });
  
  addElegantFooter(1, 5);

  // ==================== PAGE 2: WEDDING COLLECTIONS ====================
  doc.addPage();
  addPremiumBackground();
  
  yPos = 32;
  
  // Section Header
  doc.setFontSize(9);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setFont("helvetica", "normal");
  doc.text("✦  SIGNATURE COLLECTIONS  ✦", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 14;
  
  // Main title with glow effect
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text("Wedding Packages", pageWidth / 2 + 0.3, yPos + 0.3, { align: "center" });
  
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.text("Wedding Packages", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  drawElegantDivider(yPos, 90);
  
  yPos += 18;
  
  const weddingPackages = [
    {
      name: "NAIROBI",
      subtitle: "Timeless Starter",
      price: "N550,000",
      features: [
        "One event coverage",
        "12x24 premium photobook",
        "All edited soft copies",
        "Branded flash drive delivery",
      ],
    },
    {
      name: "MOSCOW",
      subtitle: "Most Popular",
      price: "N750,000",
      features: [
        "Two professional photographers",
        "12x32 premium photobook",
        "16x20 framed print",
        "Private online gallery access",
        "Branded flash drive",
      ],
      popular: true,
    },
    {
      name: "HELSINKI",
      subtitle: "Ultimate Luxury",
      price: "N1,000,000",
      features: [
        "12x36 premium photobook",
        "Two 20x24 framed prints",
        "Full bridal prep coverage",
        "Two complimentary pre/post sessions",
      ],
    },
  ];

  const cardWidth = (pageWidth - margin * 2 - 16) / 3;
  const cardHeight = 115;

  weddingPackages.forEach((pkg, index) => {
    const xPos = margin + (cardWidth + 8) * index;

    drawLuxuryCard(xPos, yPos, cardWidth, cardHeight, pkg.popular);

    if (pkg.popular) {
      // Luxe popular badge
      doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
      doc.rect(xPos + cardWidth / 2 - 16, yPos - 4, 32, 7, "F");
      doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
      doc.rect(xPos + cardWidth / 2 - 14, yPos - 3, 28, 5, "F");
      doc.setFontSize(5);
      doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
      doc.setFont("helvetica", "bold");
      doc.text("★ MOST POPULAR ★", xPos + cardWidth / 2, yPos + 0.5, { align: "center" });
    }

    // Tier indicator with gold dots
    const tierY = yPos + 14;
    for (let i = 0; i < 3; i++) {
      if (i <= index) {
        doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
        doc.circle(xPos + cardWidth / 2 - 5 + i * 5, tierY, 1.5, "F");
        doc.setFillColor(goldDeep[0], goldDeep[1], goldDeep[2]);
        doc.circle(xPos + cardWidth / 2 - 5 + i * 5, tierY, 0.8, "F");
      } else {
        doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
        doc.setLineWidth(0.4);
        doc.circle(xPos + cardWidth / 2 - 5 + i * 5, tierY, 1.2, "S");
      }
    }

    // Package name
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text(pkg.name, xPos + cardWidth / 2, yPos + 28, { align: "center" });

    // Subtitle
    doc.setFontSize(7);
    doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setFont("helvetica", "italic");
    doc.text(pkg.subtitle, xPos + cardWidth / 2, yPos + 35, { align: "center" });

    // Gold decorative line under subtitle
    doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.setLineWidth(0.4);
    doc.line(xPos + cardWidth / 2 - 15, yPos + 40, xPos + cardWidth / 2 + 15, yPos + 40);
    drawOrnateDiamond(xPos + cardWidth / 2, yPos + 40, 1.5);

    // Price with luxe styling
    doc.setFontSize(15);
    doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
    doc.setFont("helvetica", "bold");
    doc.text(pkg.price, xPos + cardWidth / 2, yPos + 54, { align: "center" });

    // Features with gold bullets
    doc.setFontSize(6.5);
    doc.setTextColor(cream[0], cream[1], cream[2]);
    doc.setFont("helvetica", "normal");
    pkg.features.forEach((feature, i) => {
      doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
      doc.circle(xPos + 6, yPos + 64 + i * 10, 1, "F");
      
      const maxWidth = cardWidth - 14;
      const lines = doc.splitTextToSize(feature, maxWidth);
      doc.text(lines, xPos + 10, yPos + 66 + i * 10);
    });
  });

  yPos += cardHeight + 15;
  
  // What's Included luxury box (moved here, on page 2)
  doc.setFillColor(charcoalMid[0], charcoalMid[1], charcoalMid[2]);
  doc.rect(margin, yPos, pageWidth - margin * 2, 28, "F");
  doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setLineWidth(0.6);
  doc.rect(margin, yPos, pageWidth - margin * 2, 28);
  doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setLineWidth(0.2);
  doc.rect(margin + 2, yPos + 2, pageWidth - margin * 2 - 4, 24);
  
  doc.setFontSize(8);
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setFont("helvetica", "bold");
  doc.text("ALL PACKAGES INCLUDE", pageWidth / 2, yPos + 8, { align: "center" });
  
  doc.setFontSize(7);
  doc.setTextColor(cream[0], cream[1], cream[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Professional editing by lead photographer  ·  High-resolution images  ·  3-week delivery turnaround", pageWidth / 2, yPos + 17, { align: "center" });
  doc.text("Online proofing gallery  ·  Print release for personal use", pageWidth / 2, yPos + 23, { align: "center" });

  addElegantFooter(2, 5);

  // ==================== PAGE 3: VIENNA PREMIER COLLECTION ====================
  doc.addPage();
  addPremiumBackground();
  
  yPos = 45;
  
  // Section Header
  doc.setFontSize(9);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setFont("helvetica", "normal");
  doc.text("PREMIER COLLECTION", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 20;
  
  // Vienna Title with glow effect
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  doc.text("VIENNA", pageWidth / 2 + 0.5, yPos + 0.5, { align: "center" });
  
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.text("VIENNA", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 12;
  
  doc.setFontSize(12);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setFont("helvetica", "italic");
  doc.text("The Complete Signature Experience", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  drawElegantDivider(yPos, 100);
  
  yPos += 25;
  
  // Vienna Price - large and prominent
  doc.setFontSize(36);
  doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
  doc.setFont("helvetica", "bold");
  doc.text("N1,500,000", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 30;
  
  // Vienna features card
  const viennaCardWidth = pageWidth - margin * 2 - 20;
  const viennaCardHeight = 90;
  const viennaCardX = (pageWidth - viennaCardWidth) / 2;
  
  drawLuxuryCard(viennaCardX, yPos, viennaCardWidth, viennaCardHeight, true);
  
  doc.setFontSize(9);
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setFont("helvetica", "bold");
  doc.text("INCLUDED IN THIS COLLECTION", pageWidth / 2, yPos + 14, { align: "center" });
  
  drawElegantDivider(yPos + 20, 60);
  
  const viennaFeatures = [
    "12x36 premium photobook",
    "Two large photo frames (20x24)",
    "Complete bridal prep coverage",
    "Two pre/post-wedding sessions",
    "Two professional photographers",
    "Full video content coverage",
    "Photo booth at reception",
    "Private online gallery access",
  ];
  
  doc.setFontSize(9);
  doc.setTextColor(cream[0], cream[1], cream[2]);
  doc.setFont("helvetica", "normal");
  
  // Two columns layout
  const colWidth = (viennaCardWidth - 30) / 2;
  viennaFeatures.forEach((feature, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const xPos = viennaCardX + 20 + col * colWidth;
    const yOffset = yPos + 32 + row * 14;
    
    doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.circle(xPos, yOffset, 1.2, "F");
    doc.text(feature, xPos + 5, yOffset + 1);
  });

  addElegantFooter(3, 5);

  // ==================== PAGE 4: OTHER PACKAGES & INFO ====================
  doc.addPage();
  addPremiumBackground();
  
  yPos = 32;
  
  // Pre-Wedding Section
  doc.setFontSize(9);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setFont("helvetica", "normal");
  doc.text("PORTRAIT SESSIONS", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 14;
  
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Pre-Wedding & Studio", pageWidth / 2 + 0.3, yPos + 0.3, { align: "center" });
  
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.text("Pre-Wedding & Studio", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 8;
  drawElegantDivider(yPos, 80);
  
  yPos += 18;
  
  // Pre-Wedding Grid Header
  doc.setFontSize(9);
  doc.setTextColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setFont("helvetica", "bold");
  doc.text("PRE-WEDDING SESSIONS", margin, yPos);
  
  yPos += 12;
  
  const preWedding = [
    { tier: "TIER 1", price: "N75,000", desc: "7 retouched images" },
    { tier: "TIER 2", price: "N105,000", desc: "12 retouched images" },
    { tier: "TIER 3", price: "N150,000", desc: "12 images + 16x20 frame" },
    { tier: "TIER 4", price: "N200,000", desc: "Printed backdrop + frame" },
  ];

  const preWedCardWidth = (pageWidth - margin * 2 - 12) / 4;
  const preWedCardHeight = 42;

  preWedding.forEach((item, index) => {
    const xPos = margin + (preWedCardWidth + 4) * index;

    drawLuxuryCard(xPos, yPos, preWedCardWidth, preWedCardHeight, false);

    // Tier badge
    doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.rect(xPos + preWedCardWidth / 2 - 11, yPos + 6, 22, 6, "F");
    doc.setFontSize(6);
    doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.setFont("helvetica", "bold");
    doc.text(item.tier, xPos + preWedCardWidth / 2, yPos + 10, { align: "center" });

    // Price
    doc.setFontSize(13);
    doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
    doc.text(item.price, xPos + preWedCardWidth / 2, yPos + 24, { align: "center" });

    // Description
    doc.setFontSize(6);
    doc.setTextColor(cream[0], cream[1], cream[2]);
    doc.setFont("helvetica", "normal");
    doc.text(item.desc, xPos + preWedCardWidth / 2, yPos + 34, { align: "center" });
  });

  yPos += preWedCardHeight + 20;
  
  // Studio Sessions Header
  doc.setFontSize(9);
  doc.setTextColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setFont("helvetica", "bold");
  doc.text("STUDIO SESSIONS", margin, yPos);
  
  yPos += 12;
  
  const studio = [
    { name: "ESSENTIAL", price: "N50,000", desc: "1 outfit  ·  7 retouched images  ·  1 hour session" },
    { name: "PREMIUM", price: "N85,000", desc: "2 outfits  ·  13 retouched images  ·  2 hour session" },
  ];

  const studioCardWidth = (pageWidth - margin * 2 - 8) / 2;
  const studioCardHeight = 42;

  studio.forEach((item, index) => {
    const xPos = margin + (studioCardWidth + 8) * index;

    drawLuxuryCard(xPos, yPos, studioCardWidth, studioCardHeight, index === 1);

    // Name badge
    doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.rect(xPos + studioCardWidth / 2 - 15, yPos + 6, 30, 6, "F");
    doc.setFontSize(6);
    doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.setFont("helvetica", "bold");
    doc.text(item.name, xPos + studioCardWidth / 2, yPos + 10, { align: "center" });

    // Price
    doc.setFontSize(15);
    doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
    doc.text(item.price, xPos + studioCardWidth / 2, yPos + 25, { align: "center" });

    // Description
    doc.setFontSize(6.5);
    doc.setTextColor(cream[0], cream[1], cream[2]);
    doc.setFont("helvetica", "normal");
    doc.text(item.desc, xPos + studioCardWidth / 2, yPos + 35, { align: "center" });
  });

  yPos += studioCardHeight + 20;

  // Important Notes Section with luxury styling
  doc.setFillColor(charcoalMid[0], charcoalMid[1], charcoalMid[2]);
  doc.rect(margin, yPos, pageWidth - margin * 2, 50, "F");
  doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setLineWidth(0.8);
  doc.rect(margin, yPos, pageWidth - margin * 2, 50);
  drawCornerFlourishes(margin, yPos, pageWidth - margin * 2, 50, 8);

  doc.setFontSize(9);
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT NOTES", pageWidth / 2, yPos + 10, { align: "center" });

  drawElegantDivider(yPos + 16, 50);

  doc.setFontSize(7);
  doc.setTextColor(cream[0], cream[1], cream[2]);
  doc.setFont("helvetica", "normal");
  const notes = [
    "Travel and accommodation outside Abuja/Kaduna are billed separately",
    "Your date is not secured until the booking fee is received and confirmed",
    "Availability operates on a first-come, first-served basis",
    "Standard turnaround time is 3 weeks from your event date",
  ];
  notes.forEach((note, i) => {
    doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.circle(margin + 8, yPos + 25 + i * 6, 1, "F");
    doc.text(note, margin + 12, yPos + 26 + i * 6);
  });

  addElegantFooter(4, 5);

  // ==================== PAGE 5: PAYMENT DETAILS ====================
  doc.addPage();
  addPremiumBackground();
  
  yPos = 70;
  
  // Section Header
  doc.setFontSize(9);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setFont("helvetica", "normal");
  doc.text("SECURE YOUR DATE", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 25;
  
  // Main title
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", pageWidth / 2 + 0.3, yPos + 0.3, { align: "center" });
  
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.text("Payment Details", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 12;
  drawElegantDivider(yPos, 100);
  
  yPos += 40;

  // Payment Details Card - centered and spacious
  const paymentCardWidth = 140;
  const paymentCardHeight = 80;
  const paymentCardX = (pageWidth - paymentCardWidth) / 2;

  // Card shadow
  doc.setFillColor(5, 5, 5);
  doc.rect(paymentCardX + 2, yPos + 2, paymentCardWidth, paymentCardHeight, "F");

  // Card background
  doc.setFillColor(25, 22, 18);
  doc.rect(paymentCardX, yPos, paymentCardWidth, paymentCardHeight, "F");
  
  // Luxe double gold border
  doc.setDrawColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setLineWidth(1.5);
  doc.rect(paymentCardX, yPos, paymentCardWidth, paymentCardHeight);
  doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setLineWidth(0.5);
  doc.rect(paymentCardX + 4, yPos + 4, paymentCardWidth - 8, paymentCardHeight - 8);
  
  drawCornerFlourishes(paymentCardX, yPos, paymentCardWidth, paymentCardHeight, 12);

  // Official header
  doc.setFontSize(8);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL PAYMENT DETAILS", pageWidth / 2, yPos + 18, { align: "center" });

  // Brand name
  doc.setFontSize(16);
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setFont("helvetica", "bold");
  doc.text("DONYASS PHOTOGRAPHY", pageWidth / 2, yPos + 32, { align: "center" });

  drawElegantDivider(yPos + 40, 70);

  // Bank name
  doc.setFontSize(10);
  doc.setTextColor(cream[0], cream[1], cream[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Bank: First City Monument Bank (FCMB)", pageWidth / 2, yPos + 54, { align: "center" });
  
  // Account number - prominent
  doc.setFontSize(18);
  doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Account: ", pageWidth / 2, yPos + 70, { align: "center" });

  addElegantFooter(5, 5);

  // Save the PDF
  doc.save("Donyass-Photography-Signature-Guide.pdf");
}
