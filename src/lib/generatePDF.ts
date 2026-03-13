import jsPDF from "jspdf";
import { businessData } from "@/data/studioData";

interface PdfPackage {
  name: string;
  price: string;
  features: string[];
  subtitle?: string;
  popular?: boolean;
}

export function generatePricingPDF() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // New Orange Gold Color Palette
  const goldRich = [245, 140, 50] as const;      // Orange gold
  const goldLight = [255, 175, 80] as const;     // Light orange gold
  const goldDeep = [200, 90, 15] as const;       // Deep orange gold
  const goldMuted = [180, 110, 40] as const;     // Muted orange
  const goldPale = [255, 215, 160] as const;     // Pale orange
  
  const charcoal = [15, 15, 15] as const;
  const charcoalLight = [25, 25, 25] as const;
  const charcoalMid = [35, 35, 35] as const;
  const cream = [252, 250, 245] as const;

  const drawCornerFlourishes = (x: number, y: number, w: number, h: number, size: number = 15) => {
    doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.setLineWidth(0.8);
    doc.line(x, y + size, x, y);
    doc.line(x, y, x + size, y);
    doc.setLineWidth(0.4);
    doc.line(x + 3, y + 3, x + size - 2, y + 3);
    doc.line(x + 3, y + 3, x + 3, y + size - 2);
    doc.setLineWidth(0.8);
    doc.line(x + w - size, y, x + w, y);
    doc.line(x + w, y, x + w, y + size);
    doc.setLineWidth(0.4);
    doc.line(x + w - size + 2, y + 3, x + w - 3, y + 3);
    doc.line(x + w - 3, y + 3, x + w - 3, y + size - 2);
    doc.setLineWidth(0.8);
    doc.line(x, y + h - size, x, y + h);
    doc.line(x, y + h, x + size, y + h);
    doc.setLineWidth(0.4);
    doc.line(x + 3, y + h - size + 2, x + 3, y + h - 3);
    doc.line(x + 3, y + h - 3, x + size - 2, y + h - 3);
    doc.setLineWidth(0.8);
    doc.line(x + w, y + h - size, x + w, y + h);
    doc.line(x + w - size, y + h, x + w, y + h);
    doc.setLineWidth(0.4);
    doc.line(x + w - 3, y + h - size + 2, x + w - 3, y + h - 3);
    doc.line(x + w - size + 2, y + h - 3, x + w - 3, y + h - 3);
  };

  const drawOrnateDiamond = (x: number, y: number, size: number = 4) => {
    doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
    const half = size / 2;
    doc.triangle(x, y - half, x + half, y, x, y + half, "F");
    doc.triangle(x, y - half, x - half, y, x, y + half, "F");
    doc.setFillColor(goldLight[0], goldLight[1], goldLight[2]);
    const inner = size / 4;
    doc.triangle(x, y - inner, x + inner, y, x, y + inner, "F");
    doc.triangle(x, y - inner, x - inner, y, x, y + inner, "F");
  };

  const drawElegantDivider = (y: number, width: number = 80) => {
    const centerX = pageWidth / 2;
    doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.setLineWidth(0.5);
    doc.line(centerX - width / 2, y, centerX - 8, y);
    doc.line(centerX + 8, y, centerX + width / 2, y);
    doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setLineWidth(0.2);
    doc.line(centerX - width / 2 + 5, y - 2, centerX - 12, y - 2);
    doc.line(centerX + 12, y - 2, centerX + width / 2 - 5, y - 2);
    doc.line(centerX - width / 2 + 5, y + 2, centerX - 12, y + 2);
    doc.line(centerX + 12, y + 2, centerX + width / 2 - 5, y + 2);
    drawOrnateDiamond(centerX, y, 3);
    doc.setFillColor(goldDeep[0], goldDeep[1], goldDeep[2]);
    doc.circle(centerX - width / 2, y, 1, "F");
    doc.circle(centerX + width / 2, y, 1, "F");
  };

  const drawLuxuryCard = (x: number, y: number, w: number, h: number, isHighlighted: boolean = false) => {
    doc.setFillColor(charcoalLight[0], charcoalLight[1], charcoalLight[2]);
    doc.rect(x, y, w, h, "F");
    doc.setFillColor(charcoalMid[0], charcoalMid[1], charcoalMid[2]);
    doc.rect(x, y, w, h * 0.15, "F");
    if (isHighlighted) {
      doc.setDrawColor(goldLight[0], goldLight[1], goldLight[2]);
      doc.setLineWidth(1.2);
    } else {
      doc.setDrawColor(goldDeep[0], goldDeep[1], goldDeep[2]);
      doc.setLineWidth(0.6);
    }
    doc.rect(x, y, w, h);
    doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setLineWidth(0.2);
    doc.rect(x + 2, y + 2, w - 4, h - 4);
  };

  const addPremiumBackground = () => {
    doc.setFillColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 30, 30, "F");
    doc.rect(pageWidth - 30, 0, 30, 30, "F");
    doc.rect(0, pageHeight - 30, 30, 30, "F");
    doc.rect(pageWidth - 30, pageHeight - 30, 30, 30, "F");
    doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
    doc.setLineWidth(1);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    doc.setDrawColor(goldDeep[0], goldDeep[1], goldDeep[2]);
    doc.setLineWidth(0.3);
    doc.rect(11, 11, pageWidth - 22, pageHeight - 22);
    doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setLineWidth(0.2);
    doc.rect(14, 14, pageWidth - 28, pageHeight - 28);
    drawCornerFlourishes(8, 8, pageWidth - 16, pageHeight - 16, 20);
  };

  let pageNum = 1;

  const addElegantFooter = () => {
    doc.setDrawColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 40, pageHeight - 18, pageWidth / 2 + 40, pageHeight - 18);
    drawOrnateDiamond(pageWidth / 2, pageHeight - 18, 2);
    doc.setFontSize(7);
    doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`Page 0${pageNum}`, pageWidth / 2, pageHeight - 13, { align: "center" });
    doc.setFontSize(6);
    doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
    doc.text("A L   A M E E N   S T U D I O S", pageWidth / 2, pageHeight - 9, { align: "center" });
    pageNum++;
  };

  const formatPrice = (price: number) => `N${new Intl.NumberFormat("en-NG").format(price)}`;

  // Mapping Packages
  const compilePackages = (data: any, nameOverrides: any = {}): PdfPackage[] => {
    const list: PdfPackage[] = [];
    Object.entries(data).forEach(([catKey, catObj]: [string, any]) => {
      // If it's the specific frames or add-ons, skip
      if (catKey === "extra_image_cost" || catKey === "specific_frames" || catKey === "add_ons") return;
      Object.entries(catObj).forEach(([k, config]: [string, any]) => {
        let features: string[] = [];
        if (config.outfits) features.push(`${config.outfits} Outfit${config.outfits > 1 ? 's' : ''}`);
        if (config.edited_soft_copies) features.push(`${config.edited_soft_copies} Edited Soft Copies`);
        if (config.extras) features.push(...config.extras);
        if (config.photos) features.push(config.photos);
        if (config.deliverables) features.push(...config.deliverables);
        if (config.rule) features.push(config.rule);
        if (config.type) features.push(config.type);

        const subMap: Record<string, string> = {
          standard: "Standard", super_vip: "Super VIP", silver: "Silver", 
          super: "Super", basic: "Basic", ultra: "Ultra", ultra_plus: "Ultra Plus",
          single: "Single", group: "Group", family_group: "Family Group",
          platinum: "Platinum", premium_family: "Premium Family", gold: "Gold"
        };
        const prettyName = catKey.replace(/_/g, ' ').toUpperCase() + " - " + (subMap[k] || k.toUpperCase());

        list.push({
          name: prettyName,
          price: formatPrice(config.price),
          features: features,
          popular: k === "super" || k === "gold" || k === "silver"
        });
      });
    });
    return list;
  };

  const weddingPkgs = compilePackages({ weddings: businessData.packages.weddings_jan_to_sept });
  const otherPkgs = compilePackages({
    pre_wedding_studio: businessData.packages.pre_wedding_studio,
    couple_portrait_outdoor: businessData.packages.couple_portrait_outdoor,
    maternity_outdoor: businessData.packages.maternity_outdoor,
    corporate_head_shoot: businessData.packages.corporate_head_shoot_studio,
    studio_solo: businessData.packages.studio_package_solo,
    outdoor_solo: businessData.packages.outdoor_package_solo,
    family_and_friends: businessData.packages.family_and_friends_outdoor,
    convocation_graduation: businessData.packages.convocation_graduation,
    call_to_bar: businessData.packages.call_to_bar,
  });

  // ==================== PAGE 1: COVER ====================
  addPremiumBackground();
  let yPos = 45;
  drawElegantDivider(yPos, 100);
  yPos += 30;
  
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setFontSize(50);
  doc.setFont("helvetica", "bold");
  doc.text("AL AMEEN", pageWidth / 2 + 0.5, yPos + 0.5, { align: "center" });
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.text("AL AMEEN", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 14;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.text("S  T  U  D  I  O  S", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 22;
  drawElegantDivider(yPos, 120);
  yPos += 28;
  doc.setFontSize(20);
  doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
  doc.setFont("helvetica", "italic");
  doc.text("Beyond The Ordinary", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 40;
  const boxWidth = 145;
  const boxHeight = 65;
  const boxX = (pageWidth - boxWidth) / 2;
  doc.setFillColor(5, 5, 5);
  doc.rect(boxX + 2, yPos + 2, boxWidth, boxHeight, "F");
  doc.setFillColor(charcoalMid[0], charcoalMid[1], charcoalMid[2]);
  doc.rect(boxX, yPos, boxWidth, boxHeight, "F");
  doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setLineWidth(1);
  doc.rect(boxX, yPos, boxWidth, boxHeight);
  doc.setDrawColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setLineWidth(0.3);
  doc.rect(boxX + 3, yPos + 3, boxWidth - 6, boxHeight - 6);
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
  doc.setFontSize(10);
  doc.setTextColor(cream[0], cream[1], cream[2]);
  doc.setFont("helvetica", "italic");
  doc.text("Kano, Nigeria", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  doc.setFontSize(8);
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.text("✧  Globally Inspired  ·  Destination Ready  ✧", pageWidth / 2, yPos, { align: "center" });
  addElegantFooter();

  // Draw Grid Function
  const renderPackages = (title: string, pkgs: PdfPackage[]) => {
    doc.addPage();
    addPremiumBackground();
    yPos = 32;
    doc.setFontSize(9);
    doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`✦ ${title.toUpperCase()} ✦`, pageWidth / 2, yPos, { align: "center" });
    yPos += 14;
    doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, yPos, { align: "center" });
    yPos += 8;
    drawElegantDivider(yPos, 100);
    yPos += 18;

    const cardsPerRow = 3;
    const cw = (pageWidth - margin * 2 - (cardsPerRow - 1) * 6) / cardsPerRow;
    const ch = 75;

    for (let i = 0; i < pkgs.length; i++) {
      if (yPos + ch > pageHeight - 35) {
        addElegantFooter();
        doc.addPage();
        addPremiumBackground();
        yPos = 35;
      }

      const col = i % cardsPerRow;
      const xPos = margin + col * (cw + 6);
      const pkg = pkgs[i];

      drawLuxuryCard(xPos, yPos, cw, ch, pkg.popular);
      
      doc.setFontSize(6);
      doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
      doc.setFont("helvetica", "bold");
      
      const splitName = doc.splitTextToSize(pkg.name, cw - 8);
      doc.text(splitName, xPos + cw / 2, yPos + 12, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
      doc.text(pkg.price, xPos + cw / 2, yPos + 22 + (splitName.length > 1 ? 4 : 0), { align: "center" });

      doc.setDrawColor(goldDeep[0], goldDeep[1], goldDeep[2]);
      doc.setLineWidth(0.3);
      doc.line(xPos + cw / 2 - 10, yPos + 28, xPos + cw / 2 + 10, yPos + 28);

      doc.setFontSize(5.5);
      doc.setTextColor(cream[0], cream[1], cream[2]);
      doc.setFont("helvetica", "normal");
      
      pkg.features.forEach((feat, fi) => {
        if (fi > 6) return; // Prevent overflow
        doc.setFillColor(goldRich[0], goldRich[1], goldRich[2]);
        doc.circle(xPos + 6, yPos + 35 + fi * 6, 0.6, "F");
        const lines = doc.splitTextToSize(feat, cw - 12);
        doc.text(lines, xPos + 9, yPos + 36 + fi * 6);
      });

      if (col === cardsPerRow - 1 || i === pkgs.length - 1) {
        yPos += ch + 12;
      }
    }
    addElegantFooter();
  };

  renderPackages("Wedding Packages", weddingPkgs);
  renderPackages("Portrait & Pre-Wedding", otherPkgs);

  // ==================== FINAL PAGE: PAYMENT DETAILS ====================
  doc.addPage();
  addPremiumBackground();
  yPos = 70;
  doc.setFontSize(9);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setFont("helvetica", "normal");
  doc.text("SECURE YOUR DATE", pageWidth / 2, yPos, { align: "center" });
  yPos += 25;
  doc.setTextColor(goldDeep[0], goldDeep[1], goldDeep[2]);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", pageWidth / 2 + 0.3, yPos + 0.3, { align: "center" });
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.text("Payment Details", pageWidth / 2, yPos, { align: "center" });
  yPos += 12;
  drawElegantDivider(yPos, 100);
  yPos += 40;

  const paymentCardWidth = 140;
  const paymentCardHeight = 80;
  const paymentCardX = (pageWidth - paymentCardWidth) / 2;
  doc.setFillColor(5, 5, 5);
  doc.rect(paymentCardX + 2, yPos + 2, paymentCardWidth, paymentCardHeight, "F");
  doc.setFillColor(25, 22, 18);
  doc.rect(paymentCardX, yPos, paymentCardWidth, paymentCardHeight, "F");
  
  doc.setDrawColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setLineWidth(1.5);
  doc.rect(paymentCardX, yPos, paymentCardWidth, paymentCardHeight);
  doc.setDrawColor(goldRich[0], goldRich[1], goldRich[2]);
  doc.setLineWidth(0.5);
  doc.rect(paymentCardX + 4, yPos + 4, paymentCardWidth - 8, paymentCardHeight - 8);
  drawCornerFlourishes(paymentCardX, yPos, paymentCardWidth, paymentCardHeight, 12);

  doc.setFontSize(8);
  doc.setTextColor(goldMuted[0], goldMuted[1], goldMuted[2]);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL PAYMENT DETAILS", pageWidth / 2, yPos + 18, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(goldLight[0], goldLight[1], goldLight[2]);
  doc.setFont("helvetica", "bold");
  doc.text("AL AMEEN STUDIOS", pageWidth / 2, yPos + 32, { align: "center" });
  drawElegantDivider(yPos + 40, 70);
  doc.setFontSize(10);
  doc.setTextColor(cream[0], cream[1], cream[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Bank: FIRST BANK", pageWidth / 2, yPos + 54, { align: "center" });
  doc.setFontSize(18);
  doc.setTextColor(goldPale[0], goldPale[1], goldPale[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Account: 2043281301", pageWidth / 2, yPos + 70, { align: "center" });

  addElegantFooter();
  doc.save("Al-Ameen-Studios-Pricing-Guide.pdf");
}
