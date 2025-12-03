import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {
  getPhiNote,
  getTIsDavNote,
  getZIsDavNote,
  getTOutNote,
  getDeltaTtNote,
  getAlphaINote,
  getAlphaTNote,
  getDIsDavNote,
  getRoTalSGNote,
  getRoTalNote,
  getRkNote,
  getRoNote,
} from "../data/heatCalculations";

// pdfmake shriftlarini sozlash
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// Heat hisoblari uchun umumiy PDF eksport funksiyasi
// initial, climate, heatingSeason, heatSteps, CONSTRUCTION_TYPES parametrlarini qabul qiladi
export function exportHeatPdf({ initial, climate, heatingSeason, heatSteps, CONSTRUCTION_TYPES }) {
  const doc = new jsPDF();

  // ========== TITLE SAHIFA ==========
  // Radiusli border
  doc.setDrawColor(16, 128, 194);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 15, 180, 267, 3, 3);

  let yPos = 35;

  // Yuqorida tashkilot nomi
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ARCHIPELAG MCHJ", 105, yPos, { align: "center" });

  // O'rtada obekt ma'lumotlari (hudud siz)
  yPos = 130;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");

  // Obekt nomidan nuqtani olib tashlash va "bo'yicha" qo'shish
  let objectName = initial.objectName || "Loyiha nomi";
  if (objectName.endsWith(".")) {
    objectName = objectName.slice(0, -1);
  }

  // Obekt turi faqat matn bo'lsa qo'shiladi (faqat raqam bo'lsa yoki bo'sh bo'lsa, qo'shilmaydi)
  const rawType = (initial.objectType || "").trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : "";

  const objectInfo = `${objectName}${typePart} bo'yicha`;

  // Matnni o'rtada ko'p qatorli qilib chiqarish
  const lines = doc.splitTextToSize(objectInfo, 150);
  lines.forEach((line, idx) => {
    doc.text(line, 105, yPos + idx * 7, { align: "center" });
  });

  // Sarlavha (16px ga yaqin masofa)
  yPos += lines.length * 7 + 6;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ISSIQLIK TEXNIK XISOBI", 105, yPos, { align: "center" });

  // Pastda viloyat va yil
  yPos = 265;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const currentYear = new Date().getFullYear();
  doc.text(`${initial.province || "Viloyat"} - ${currentYear}-yil`, 105, yPos, { align: "center" });

  // ========== MUNDARIJA ==========
  doc.addPage();
  yPos = 20;

  doc.setFillColor(16, 128, 194);
  doc.rect(0, 10, 210, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("MUNDARIJA", 105, 20, { align: "center" });

  yPos = 40;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const contents = ["1. Me'yoriy issiqlik sarfi"]; // 3-step

  heatSteps.forEach((heatStep, index) => {
    if (heatStep.savedState) {
      const constructionType = CONSTRUCTION_TYPES.find(
        (ct) => ct.id === heatStep.savedState.constructionType,
      );
      contents.push(`${index + 2}. ${constructionType?.label || "Konstruksiya"} (${heatStep.label})`);
    }
  });

  contents.forEach((item, idx) => {
    doc.text(`${item}`, 30, yPos);
    doc.text(`${idx + 3}`, 180, yPos, { align: "right" });
    yPos += 10;
  });

  // ========== 3-STEP: ME'YORIY ISSIQLIK SARFI ==========
  doc.addPage();
  yPos = 20;

  doc.setFillColor(16, 128, 194);
  doc.rect(0, 10, 210, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. ME'YORIY ISSIQLIK SARFI", 105, 20, { align: "center" });

  yPos = 35;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("(Bu bo'lim NormativeQStep ma'lumotlari bilan to'ldiriladi)", 20, yPos);

  // ========== 2.N STEPLAR: ISSIQLIK TEXNIK HISOB-KITOBLAR ==========
  heatSteps.forEach((heatStep, index) => {
    const saved = heatStep.savedState;
    if (!saved) return;

    doc.addPage();
    yPos = 20;

    const constructionType = CONSTRUCTION_TYPES.find((ct) => ct.id === saved.constructionType);

    // Sarlavha
    doc.setFillColor(16, 128, 194);
    doc.rect(0, 10, 210, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 2}. ${constructionType?.label || "Konstruksiya"} (${heatStep.label})`, 105, 20, {
      align: "center",
    });

    yPos = 35;
    doc.setTextColor(0, 0, 0);

    // Dastlabki ma'lumotlar
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Dastlabki ma'lumotlar", 20, yPos);
    yPos += 8;

    const initialData = [
      ["Obekt nomi", initial.objectName || "—"],
      ["Ichki harorat t_i", climate.t_in != null ? `${climate.t_in} °C` : "—"],
      ["Nisbiy namlik φ_i", climate.phi_in != null ? `${climate.phi_in} %` : "—"],
      [
        "O'rtacha isitish davri harorati t_is.dav",
        heatingSeason.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—",
      ],
      [
        "Isitish davri davomiyligi Z_is.dav",
        heatingSeason.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—",
      ],
      ["Tashqi havo hisobiy harorati t_t", climate.t_out != null ? `${climate.t_out} °C` : "—"],
    ];

    autoTable(doc, {
      startY: yPos,
      body: initialData,
      theme: "striped",
      headStyles: { fillColor: [16, 128, 194] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Normativ parametrlar
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Normativ parametrlar", 20, yPos);
    yPos += 8;

    const normativeData = [["Konstruksiya turi", constructionType?.label || "—"]];

    if (saved.ribHeightRatio) {
      normativeData.push(["Qovurg'a balandligi nisbati", saved.ribHeightRatio]);
    }

    autoTable(doc, {
      startY: yPos,
      body: normativeData,
      theme: "striped",
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Qatlamlar jadvali
    if (saved.layers && saved.layers.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Konstruksiya qatlamlari", 20, yPos);
      yPos += 8;

      const layersData = saved.layers.map((layer, idx) => [
        idx + 1,
        layer.name || "—",
        layer.thickness_mm ? `${layer.thickness_mm} mm` : "—",
        layer.lambda || "—",
        layer.mu || "—",
        layer.rho || "—",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["№", "Material", "Qalinlik", "λ", "μ", "ρ"]],
        body: layersData,
        theme: "grid",
        headStyles: {
          fillColor: [16, 128, 194],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
          halign: "center",
        },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 20, right: 20 },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Hisoblangan natijalar
    const resultsData = [];
    if (saved.Ro_calc != null)
      resultsData.push(["Hisoblangan qarshilik R₀", `${saved.Ro_calc.toFixed(3)} m²·°C/Vt`]);
    if (saved.RoTalab != null)
      resultsData.push(["Talab qilinadigan qarshilik R₀ᵗᵃˡᵃᵇ", `${saved.RoTalab.toFixed(3)} m²·°C/Vt`]);
    if (saved.delta_R_pr != null) resultsData.push(["Δ R_pr", `${saved.delta_R_pr.toFixed(3)}`]);

    if (resultsData.length > 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Hisoblangan natijalar", 20, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        body: resultsData,
        theme: "striped",
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 10, cellPadding: 3, fontStyle: "bold" },
        margin: { left: 20, right: 20 },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Ishlab chiqdi
    yPos = 270;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Ishlab chiqdi: _______________________", 105, yPos, { align: "center" });
  });

  doc.save("ISSIQLIK TEXNIK XISOBI.pdf");
}

// 1-step (boshlang'ich ma'lumotlar) uchun alohida PDF
export function exportInitialStepPdf({ initial, climate, heatingSeason }) {
  const doc = new jsPDF();

  // Title sahifasi
  doc.setDrawColor(16, 128, 194);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 15, 180, 267, 3, 3);

  let yPos = 35;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ARCHIPELAG MCHJ", 105, yPos, { align: "center" });

  yPos = 130;
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");

  let objectName = initial.objectName || "Loyiha nomi";
  if (objectName.endsWith(".")) {
    objectName = objectName.slice(0, -1);
  }

  const rawType = (initial.objectType || "").trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : "";

  const objectInfo = `${objectName}${typePart} bo'yicha`;

  const lines = doc.splitTextToSize(objectInfo, 150);
  lines.forEach((line, idx) => {
    doc.text(line, 105, yPos + idx * 7, { align: "center" });
  });

  yPos += lines.length * 7 + 6;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ISSIQLIK TEXNIK XISOBI", 105, yPos, { align: "center" });

  yPos = 265;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const currentYear = new Date().getFullYear();
  doc.text(`${initial.province || "Viloyat"} - ${currentYear}-yil`, 105, yPos, { align: "center" });

  // 1-step ma'lumotlari uchun alohida sahifa
  doc.addPage();
  yPos = 20;

  doc.setFillColor(16, 128, 194);
  doc.rect(0, 10, 210, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. BOSHLANG'ICH MA'LUMOTLAR", 105, 20, { align: "center" });

  yPos = 35;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const initialData = [
    ["Obekt nomi", initial.objectName || "—"],
    ["Obekt turi", initial.objectType || "—"],
    ["Hudud (viloyat)", initial.province || "—"],
    ["Hudud (tuman/shahar)", initial.region || "—"],
    ["Issiqlik himoyasi darajasi", initial.protectionLevel || "—"],
    ["Ichki harorat t_i", climate.t_in != null ? `${climate.t_in} °C` : "—"],
    ["Nisbiy namlik φ_i", climate.phi_in != null ? `${climate.phi_in} %` : "—"],
    [
      "O'rtacha isitish davri harorati t_is.dav",
      heatingSeason.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—",
    ],
    [
      "Isitish davri davomiyligi Z_is.dav",
      heatingSeason.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—",
    ],
    ["Tashqi havo hisobiy harorati t_t", climate.t_out != null ? `${climate.t_out} °C` : "—"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Ko'rsatkich", "Qiymat"]],
    body: initialData,
    theme: "grid",
    headStyles: { fillColor: [16, 128, 194], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 20, right: 20 },
  });

  doc.save("ISSIQLIK TEXNIK XISOBI - 1-bosqich.pdf");
}

// 3-step (Normativ Q) uchun alohida PDF
export function exportNormativeStepPdf({ initial }) {
  const doc = new jsPDF();

  // Title sahifasi
  doc.setDrawColor(16, 128, 194);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 15, 180, 267, 3, 3);

  let yPos = 35;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ARCHIPELAG MCHJ", 105, yPos, { align: "center" });

  yPos = 130;
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");

  let objectName = initial.objectName || "Loyiha nomi";
  if (objectName.endsWith(".")) {
    objectName = objectName.slice(0, -1);
  }

  const rawType = (initial.objectType || "").trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : "";

  const objectInfo = `${objectName}${typePart} bo'yicha`;

  const lines = doc.splitTextToSize(objectInfo, 150);
  lines.forEach((line, idx) => {
    doc.text(line, 105, yPos + idx * 7, { align: "center" });
  });

  yPos += lines.length * 7 + 6;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ISSIQLIK TEXNIK XISOBI", 105, yPos, { align: "center" });

  yPos = 265;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const currentYear = new Date().getFullYear();
  doc.text(`${initial.province || "Viloyat"} - ${currentYear}-yil`, 105, yPos, { align: "center" });

  // Normativ step ma'lumotlari uchun sahifa (hozircha placeholder)
  doc.addPage();
  yPos = 20;

  doc.setFillColor(16, 128, 194);
  doc.rect(0, 10, 210, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. ME'YORIY ISSIQLIK SARFI", 105, 20, { align: "center" });

  yPos = 40;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("(NormativeQStep ma'lumotlari bu yerga qo'shiladi)", 20, yPos);

  doc.save("ISSIQLIK TEXNIK XISOBI - Normativ.pdf");
}

// Bitta issiqlik texnik hisob (2.n step) uchun alohida PDF - pdfmake bilan
export function exportHeatStepPdf({ initial, climate, heatingSeason, heatStep, CONSTRUCTION_TYPES }) {
  const saved = heatStep?.savedState;
  console.log("PDF Export - heatStep:", heatStep);
  console.log("PDF Export - saved:", saved);
  console.log("PDF Export - layers:", saved?.layers);
  const currentYear = new Date().getFullYear();

  const constructionType = saved
    ? CONSTRUCTION_TYPES.find((ct) => ct.id === saved.constructionType)
    : null;

  // Obekt nomini tayyorlash
  let objectName = initial.objectName || "Loyiha nomi";
  if (objectName.endsWith(".")) {
    objectName = objectName.slice(0, -1);
  }
  const rawType = (initial.objectType || "").trim();
  const hasValidType = rawType && !/^\d+$/.test(rawType);
  const typePart = hasValidType ? `, ${rawType}` : "";
  const objectInfo = `${objectName}${typePart} bo'yicha`;

  // Ranglar
  const blueColor = "#1080C2";
  const grayColor = "#888888";
  const lightGray = "#E8E8E8";
  const greenColor = "#00A064";
  const redColor = "#DC3232";

  // Subscript yordamchi funksiya - matnni subscript bilan formatlash
  const sub = (main, subscript) => ({
    text: [
      { text: main },
      { text: subscript, fontSize: 6, baseline: -3 }
    ]
  });

  // Dastlabki ma'lumotlar - subscript bilan (step UI dagi kabi)
  const climateRows = [
    {
      label: [{ text: "Ichki havoning hisobiy harorati t" }, { text: "i", fontSize: 6, baseline: -3 }, { text: ", °C" }],
      value: climate.t_in != null ? `${climate.t_in} °C` : "—",
    },
    {
      label: [{ text: "Ichki havoning nisbiy namligi φ" }, { text: "i", fontSize: 6, baseline: -3 }, { text: ", %" }],
      value: climate.phi_in != null ? `${climate.phi_in} %` : "—",
      note: getPhiNote(saved?.humidityRegimeInfo, climate?.phi_in)
    },
    {
      label: [{ text: "O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning o'rtacha harorati, t" }, { text: "is.dav", fontSize: 6, baseline: -3 }],
      value: heatingSeason.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—",
      note: getTIsDavNote()
    },
    {
      label: [{ text: "O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning davomiyligi, Z" }, { text: "is.dav", fontSize: 6, baseline: -3 }],
      value: heatingSeason.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—",
      note: getZIsDavNote()
    },
    {
      label: [{ text: "Tashqi havoning hisobiy qishki harorati, t" }, { text: "t", fontSize: 6, baseline: -3 }],
      value: climate.t_out != null ? `${climate.t_out} °C` : "—",
      note: getTOutNote()
    },
  ];

  // Klimat parametrlarini content ga aylantirish - divider to'liq kenglikda
  const climateContent = [];
  climateRows.forEach((row) => {
    climateContent.push({ canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: lightGray }], margin: [0, 0, 0, 3] });
    climateContent.push({
      columns: [
        { text: row.label, width: "*", fontSize: 9 },
        { text: row.value, width: "auto", fontSize: 9, bold: true, color: blueColor, alignment: "right" }
      ],
      margin: [0, 0, 0, 2]
    });
    if (row.note) {
      climateContent.push({
        text: row.note,
        fontSize: 7,
        italics: true,
        color: grayColor,
        margin: [0, 0, 0, 5]
      });
    }
  });

  // Qatlamlar jadvali header - subscript bilan
  const layersTableBody = [
    [
      { text: "#", style: "tableHeader" },
      { text: "Material (Tashqaridan ichkariga)", style: "tableHeader" },
      { text: [{ text: "Qalinlik δ,\nmm" }], style: "tableHeader" },
      { text: [{ text: "Zichlik γ" }, { text: "o", fontSize: 5, baseline: -2 }, { text: ",\nkg/m³" }], style: "tableHeader" },
      { text: [{ text: "Issiqlik\no'tk.lik λ" }], style: "tableHeader" },
      { text: "Termik\nqarshilik R", style: "tableHeader" }
    ]
  ];

  if (saved?.layers) {
    saved.layers.forEach((layer, idx) => {
      layersTableBody.push([
        { text: (idx + 1).toString(), alignment: "center", fontSize: 9 },
        { text: layer.name || "—", alignment: "left", fontSize: 9 },
        { text: layer.thickness_mm ? `${layer.thickness_mm}` : "—", alignment: "center", fontSize: 9 },
        { text: layer.rho || "—", alignment: "center", fontSize: 9 },
        { text: layer.lambda || "—", alignment: "center", fontSize: 9 },
        { text: layer.R || "—", alignment: "center", fontSize: 9 }
      ]);
    });
  }

  // Jadval balandligini hisoblash (radius uchun)
  const tableRowHeight = 22;
  const tableHeight = (layersTableBody.length) * tableRowHeight + 5;

  // Formula izohlarini pdfmake formatiga aylantirish helper funksiyasi
  const formatFormulaNote = (noteData, type) => {
    if (!noteData) return null;
    
    if (type === "D_is_dav") {
      return [
        { text: "D" }, { text: "is.dav", fontSize: 5, baseline: -2 }, 
        { text: ` = (t` }, { text: "i", fontSize: 5, baseline: -2 }, 
        { text: ` - t` }, { text: "is.dav", fontSize: 5, baseline: -2 }, 
        { text: `) × Z` }, { text: "is.dav", fontSize: 5, baseline: -2 },
        { text: ` = ${noteData.calculation}` }
      ];
    }
    if (type === "RoTalSG") {
      return [
        { text: "R" }, { text: "o", fontSize: 5, baseline: -8 }, { text: "" }, { text: "Tal.SG", fontSize: 4, baseline: 8 },
        { text: ` = n(t` }, { text: "i", fontSize: 5, baseline: -2 }, 
        { text: ` - t` }, { text: "t", fontSize: 5, baseline: -2 }, 
        { text: `) / (Δt` }, { text: "t", fontSize: 5, baseline: -2 },
        { text: ` × α` }, { text: "i", fontSize: 5, baseline: -2 },
        { text: `) = ${noteData.calculation}` }
      ];
    }
    if (type === "Rk") {
      const layerCount = saved?.layers?.length || 0;
      return [
        { text: "R" }, { text: "k", fontSize: 5, baseline: -2 },
        { text: ` = R` }, { text: "1", fontSize: 5, baseline: -2 },
        { text: `+R` }, { text: "2", fontSize: 5, baseline: -2 },
        { text: `+...+R` }, { text: `${layerCount}`, fontSize: 5, baseline: -2 },
        { text: ` = ${noteData.calculation}` }
      ];
    }
    if (type === "Ro") {
      return [
        { text: "R" }, { text: "o", fontSize: 5, baseline: -2 },
        { text: ` = 1/α` }, { text: "i", fontSize: 5, baseline: -2 },
        { text: ` + R` }, { text: "k", fontSize: 5, baseline: -2 },
        { text: ` + 1/α` }, { text: "t", fontSize: 5, baseline: -2 },
        { text: ` = ${noteData.calculation}` }
      ];
    }
    return null;
  };

  // Normativ parametrlar - subscript va izohlar bilan (step UI dagi kabi)
  const normParams = [
    {
      label: [{ text: "Ichki havo harorati va to'suvchi konstruksiyaning ichki yuzasi harorati o'rtasidagi me'yoriy harorat farqi, Δt" }, { text: "t", fontSize: 6, baseline: -3 }],
      value: saved?.delta_t_n != null ? [{ text: "Δt" }, { text: "t", fontSize: 6, baseline: -3 }, { text: ` = ${saved.delta_t_n.toFixed(1)} °C` }] : "—",
      note: getDeltaTtNote(saved?.delta_t_n_row)
    },
    {
      label: [{ text: "To'suvchi konstruksiyalarning ichki yuzasining issiqlik berish koeffitsienti α" }, { text: "i", fontSize: 6, baseline: -3 }],
      value: saved?.alpha_i != null ? [{ text: "α" }, { text: "i", fontSize: 6, baseline: -3 }, { text: ` = ${saved.alpha_i.toFixed(1)} Vt/(m²·°C)` }] : "—",
      note: getAlphaINote(saved?.alpha_i_row)
    },
    {
      label: [{ text: "To'suvchi konstruksiyalarning tashqi yuzasining issiqlik berish koeffitsienti α" }, { text: "t", fontSize: 6, baseline: -3 }],
      value: saved?.alpha_t != null ? [{ text: "α" }, { text: "t", fontSize: 6, baseline: -3 }, { text: ` = ${saved.alpha_t.toFixed(0)} Vt/(m²·°C)` }] : "—",
      note: getAlphaTNote(saved?.alpha_t_row)
    },
    {
      label: [{ text: "Isitish davrining gradus-sutkasi, D" }, { text: "is.dav", fontSize: 6, baseline: -3 }],
      value: saved?.D_d_dav != null ? [{ text: "D" }, { text: "is.dav", fontSize: 6, baseline: -3 }, { text: ` = ${saved.D_d_dav.toFixed(0)} °C·sutka` }] : "—",
      note: formatFormulaNote(getDIsDavNote({ t_in: saved?.t_in, t_is_dav: saved?.t_is_dav, Z_is_dav: saved?.Z_is_dav, D_d_dav: saved?.D_d_dav }), "D_is_dav")
    },
    {
      label: [{ text: "Sanitariya-gigiena talablariga muvofiq me'yoriy (ruxsat etilgan maksimal) qarshilik, R" }, { text: "o", fontSize: 6, baseline: -3 }, { text: "Tal.SG", fontSize: 5, baseline: 6 }],
      value: saved?.Ro_MG != null ? [{ text: "R" }, { text: "o", fontSize: 6, baseline: -3 }, { text: "Tal.SG", fontSize: 5, baseline: 6 }, { text: ` = ${saved.Ro_MG.toFixed(2)} m²·°C/Vt` }] : "—",
      note: formatFormulaNote(getRoTalSGNote({ t_in: saved?.t_in, t_out: saved?.t_out, delta_t_n: saved?.delta_t_n, alpha_i: saved?.alpha_i, Ro_MG: saved?.Ro_MG }), "RoTalSG")
    },
    {
      label: [{ text: "To'suvchi konstruksiyaning talab etilgan issiqlik uzatilishiga keltirilgan qarshiligi, R" }, { text: "o", fontSize: 6, baseline: -3 }, { text: "Tal.", fontSize: 5, baseline: 6 }],
      value: saved?.RoTalab != null ? [{ text: "R" }, { text: "o", fontSize: 6, baseline: -3 }, { text: "Tal.", fontSize: 5, baseline: 6 }, { text: ` = ${saved.RoTalab.toFixed(2)} m²·°C/Vt` }] : "—",
      note: getRoTalNote(saved?.RoResult_row, saved?.protectionLevel)
    },
    {
      label: [{ text: "Ko'p qatlamli to'suvchi konstruksiyaning termik qarshiligi, R" }, { text: "k", fontSize: 6, baseline: -3 }],
      value: saved?.R_k != null ? [{ text: "R" }, { text: "k", fontSize: 6, baseline: -3 }, { text: ` = ${saved.R_k.toFixed(2)} m²·°C/Vt` }] : "—",
      note: formatFormulaNote(getRkNote(saved?.layers, saved?.R_k), "Rk")
    },
    {
      label: [{ text: "To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi, R" }, { text: "o", fontSize: 6, baseline: -3 }],
      value: saved?.Ro_calc != null ? [{ text: "R" }, { text: "o", fontSize: 6, baseline: -3 }, { text: ` = ${saved.Ro_calc.toFixed(2)} m²·°C/Vt` }] : "—",
      note: formatFormulaNote(getRoNote({ alpha_i: saved?.alpha_i, alpha_t: saved?.alpha_t, R_k: saved?.R_k, Ro_calc: saved?.Ro_calc }), "Ro")
    },
  ];

  // Normativ content - divider to'liq kenglikda va izohlar bilan
  const normContent = [];
  normParams.forEach((param) => {
    normContent.push({ canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: lightGray }], margin: [0, 0, 0, 3] });
    normContent.push({
      columns: [
        { text: param.label, width: "*", fontSize: 9 },
        { text: param.value, width: "auto", fontSize: 9, bold: true, color: blueColor, alignment: "right" }
      ],
      margin: [0, 0, 0, 2]
    });
    // Izoh qo'shish
    if (param.note) {
      normContent.push({
        text: param.note,
        fontSize: 7,
        italics: true,
        color: grayColor,
        margin: [0, 0, 0, 5]
      });
    } else {
      normContent.push({ text: "", margin: [0, 0, 0, 3] });
    }
  });

  // Xulosa - subscript bilan
  // Ro ham RoTalSG dan, ham RoTalab dan katta yoki teng bo'lishi kerak
  const RoCalc = saved?.Ro_calc;
  const RoTalSGVal = saved?.Ro_MG; // RoTalSG savedState da Ro_MG sifatida saqlangan
  const RoTalabVal = saved?.RoTalab;
  
  const isSatisfied = RoCalc != null && RoTalabVal != null && RoTalSGVal != null 
    ? (RoCalc >= RoTalSGVal && RoCalc >= RoTalabVal)
    : (RoCalc != null && RoTalabVal != null && RoCalc >= RoTalabVal);
  
  // Xulosa matni - uch qatorga ajratilgan (hammasi bold)
  // 1-qator: Ro qiymati
  const conclusionLine1 = RoCalc != null && RoTalabVal != null
    ? {
        text: [
          { text: "To'suvchi konstruksiyalarning issiqlik uzatilishiga keltirilgan qarshiligi ( R" },
          { text: "o", fontSize: 7, baseline: -2 },
          { text: ` = ${RoCalc.toFixed(2)} m²·°C/Vt)` }
        ],
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 2]
      }
    : null;
  
  // 2-qator: RoTal qiymati va katta/kichik
  const conclusionLine2 = RoCalc != null && RoTalabVal != null
    ? {
        text: [
          { text: "talab etilganidan ( R" },
          { text: "o", fontSize: 8, baseline: -3 },
          { text: "Tal.", fontSize: 7, baseline: 6 },
          { text: ` = ${RoTalabVal.toFixed(2)} m²·°C/Vt) ${isSatisfied ? 'katta.' : 'kichik.'}` }
        ],
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 5]
      }
    : null;
  
  // 3-qator: yakuniy natija
  const conclusionLine3 = RoCalc != null && RoTalabVal != null
    ? {
        text: isSatisfied ? 'Issiqlik himoyasi talabiga muvofiq keladi!' : 'Issiqlik himoyasi talabiga muvofiq kelmaydi!',
        fontSize: 16,
        bold: true,
        color: isSatisfied ? greenColor : redColor,
        margin: [0, 0, 0, 0]
      }
    : null;

  // PDF hujjat tuzilishi
  const docDefinition = {
    pageSize: "A4",
    pageMargins: [20, 20, 20, 20],
    background: function(currentPage) {
      // 1-sahifadan tashqari barcha sahifalarda ko'k ramka
      if (currentPage >= 2) {
        return {
          canvas: [
            {
              type: "rect",
              x: 15,
              y: 15,
              w: 565,
              h: 812,
              r: 8,
              lineWidth: 1.5,
              lineColor: blueColor
            }
          ]
        };
      }
      return null;
    },
    content: [
      // ========== 1-SAHIFA: TITLE ==========
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 555,
            h: 780,
            r: 8,
            lineWidth: 1.5,
            lineColor: blueColor
          }
        ]
      },
      { text: "ARCHIPELAG MCHJ", alignment: "center", bold: true, fontSize: 11, margin: [0, -740, 0, 0] },
      { text: objectInfo, alignment: "center", fontSize: 14, margin: [0, 280, 0, 0] },
      { text: "ISSIQLIK TEXNIK XISOBI", alignment: "center", bold: true, fontSize: 16, margin: [0, 10, 0, 0] },
      { text: `${initial.province || "Viloyat"} - ${currentYear}-yil`, alignment: "center", fontSize: 10, margin: [0, 280, 0, 0] },

      // ========== 2-SAHIFA: HISOB ==========
      { text: "", pageBreak: "after" },
      
      // Sarlavha
      { text: `${heatStep?.label || "2"}.${constructionType?.label || "Tashqi devor"} issiqlik texnik hisobi`, fontSize: 14, bold: true, color: blueColor, alignment: "center", margin: [0, 10, 0, 3] },
      { text: `Obekt nomi: ${initial.objectName || "obekt nomi"}`, alignment: "center", fontSize: 10, color: grayColor, margin: [0, 0, 0, 15] },

      // Dastlabki ma'lumotlar
      { text: "Dastlabki ma'lumotlar", bold: true, fontSize: 10, margin: [10, 0, 10, 0] },
      {
        columns: [
          { text: "Hudud", fontSize: 9, width: 40 },
          { text: "", width: "*" },
          { text: `${initial.province || "Viloyat"}, ${initial.region || "Tuman/Shahar"}`, alignment: "right", fontSize: 9, color: blueColor }
        ],
        margin: [10, 5, 10, 5]
      },
      { stack: climateContent, margin: [10, 0, 10, 0] },

      // Qatlamlar jadvali sarlavhasi
      { text: "To'suvchi konstruksiya materiallarining xususiyatlari", bold: true, fontSize: 10, margin: [10, 15, 10, 8] },
      
      // Jadval atrofida radiusli ramka
      {
        stack: [
          {
            canvas: [
              {
                type: "rect",
                x: 0,
                y: 0,
                w: 535,
                h: tableHeight,
                r: 6,
                lineWidth: 0.5,
                lineColor: "#CCCCCC"
              }
            ]
          },
          {
            table: {
              headerRows: 1,
              widths: [18, "*", 50, 55, 45, 55],
              body: layersTableBody
            },
            layout: {
              hLineWidth: (i, node) => (i === 1) ? 0.5 : 0,
              vLineWidth: () => 0,
              hLineColor: () => "#DDDDDD",
              fillColor: (rowIndex) => rowIndex === 0 ? "#E8F4FC" : null,
              paddingTop: () => 5,
              paddingBottom: () => 5,
              paddingLeft: () => 5,
              paddingRight: () => 5
            },
            margin: [5, -tableHeight + 3, 5, 0]
          }
        ],
        margin: [10, 0, 10, 10]
      },

      // Normativ parametrlar
      { text: "Normativ parametrlar", bold: true, fontSize: 10, margin: [10, 10, 10, 5] },
      { stack: normContent, margin: [10, 0, 10, 0] },

      // Xulosa - barcha 3 qator birgalikda (ajralmasin)
      {
        stack: [
          { text: "", margin: [0, 25, 0, 0] },
          // 1-qator: asosiy matn
          conclusionLine1 ? { ...conclusionLine1, alignment: "center", margin: [10, 0, 10, 3] } : {},
          // 2-qator: katta/kichik
          conclusionLine2 ? { ...conclusionLine2, alignment: "center", margin: [10, 0, 10, 5] } : {},
          // 3-qator: yakuniy natija
          conclusionLine3 ? { ...conclusionLine3, alignment: "center", margin: [10, 0, 10, 0] } : {}
        ],
        unbreakable: true
      }
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 8,
        alignment: "center",
        fillColor: "#E8F4FC",
        color: "#333333"
      }
    }
  };

  // PDF yaratish va yuklab olish
  pdfMake.createPdf(docDefinition).download(`ISSIQLIK TEXNIK XISOBI - ${heatStep?.label || "2.n"}.pdf`);
}
