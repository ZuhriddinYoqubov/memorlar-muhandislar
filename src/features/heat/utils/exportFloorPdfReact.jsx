import React from 'react';
import { Document, Page, Text, View, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdfStyles } from './pdfStyles';
import {
    getPhiNote,
    getTIsDavNote,
    getZIsDavNote,
    getTOutNote,
} from "../data/heatCalculations";

// Noto Sans Math fontini ro'yxatdan o'tkazish
import NotoSansMathUrl from '../../../assets/fonts/NotoSansMath-Regular.ttf';

Font.register({
    family: 'NotoSansMath',
    src: NotoSansMathUrl,
});

// PDF Document komponenti - Yerdagi pol uchun
const FloorPdfDocument = ({ initial, climate, heatingSeason, floorData, saved }) => {
    const currentYear = new Date().getFullYear();

    // Obekt nomini tayyorlash
    let objectName = initial.objectName || "Loyiha nomi";
    if (objectName.endsWith(".")) {
        objectName = objectName.slice(0, -1);
    }
    const rawType = (initial.objectType || "").trim();
    const hasValidType = rawType && !/^\d+$/.test(rawType);
    const typePart = hasValidType ? `, ${rawType}` : "";
    const objectInfo = `${objectName}${typePart} bo'yicha`;

    // Province va Region nomlarini olish
    const provinceName = initial.provinceName || initial.province || "Viloyat";
    const regionName = initial.regionName || initial.region || "Tuman/Shahar";

    // Yp natijasi
    const YpResult = floorData?.YpResult;
    const YpNorm = floorData?.YpNorm;
    const isSatisfied = YpResult?.Yp != null && YpNorm != null && YpResult.Yp <= YpNorm;

    return (
        <Document>

            {/* 2-SAHIFA: HISOB */}
            <Page size="A4" style={pdfStyles.page}>
                <View style={pdfStyles.pageBorder} fixed />
                <View style={pdfStyles.pageContent}>
                    {/* Sarlavha */}
                    <Text style={pdfStyles.pageTitle}>
                        Yerdagi pol issiqlik texnik hisobi
                    </Text>
                    <Text style={pdfStyles.pageSubtitle}>
                        Obekt nomi: {initial.objectName || "obekt nomi"}
                    </Text>

                    {/* Dastlabki ma'lumotlar */}
                    <Text style={pdfStyles.sectionTitle}>Dastlabki ma'lumotlar</Text>

                    {/* Hudud */}
                    <View style={pdfStyles.row}>
                        <Text style={{ fontSize: 9, width: 40 }}>Hudud</Text>
                        <Text style={{ flex: 1 }}></Text>
                        <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>
                            {provinceName}, {regionName}
                        </Text>
                    </View>

                    {/* Ichki havoning hisobiy harorati */}
                    <View style={pdfStyles.row}>
                        <View style={pdfStyles.labelWithSubscript}>
                            <Text style={pdfStyles.labelFix}>Ichki havoning hisobiy harorati, </Text>
                            <Text style={pdfStyles.mainVariableText}>t</Text>
                            <Text style={pdfStyles.subscriptText}>i</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
                            <Text style={pdfStyles.value}>
                                {climate?.t_in != null ? `${climate.t_in} °C` : "—"}
                            </Text>
                        </View>
                    </View>

                    {/* Ichki havoning nisbiy namligi */}
                    <View style={pdfStyles.row}>
                        <View style={pdfStyles.labelWithSubscript}>
                            <Text style={pdfStyles.labelFix}>Ichki havoning nisbiy namligi, </Text>
                            <Text style={pdfStyles.mathText}>φ</Text>
                            <Text style={pdfStyles.subscriptText}>i</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
                            <Text style={pdfStyles.value}>
                                {climate?.phi_in != null ? `${climate.phi_in} %` : "—"}
                            </Text>
                        </View>
                    </View>
                    {/**    
                    {saved?.humidityRegimeInfo && getPhiNote(saved.humidityRegimeInfo, climate?.phi_in) && (
                        <Text style={pdfStyles.note}>{getPhiNote(saved.humidityRegimeInfo, climate?.phi_in)}</Text>
                    )}
                    */}



                    {/* Isitish davri harorati */}
                    <View style={pdfStyles.row}>
                        <View style={pdfStyles.labelWithSubscript}>
                            <Text style={pdfStyles.labelFix}>O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning o'rtacha harorati, </Text>
                            <Text style={pdfStyles.mainVariableText}>t</Text>
                            <Text style={pdfStyles.subscriptText}>is.dav</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
                            <Text style={pdfStyles.value}>
                                {heatingSeason?.t_is_dav != null ? `${heatingSeason.t_is_dav.toFixed(1)} °C` : "—"}
                            </Text>
                        </View>
                    </View>
                    {/**  
                    {getTIsDavNote() && (
                        <Text style={pdfStyles.note}>{getTIsDavNote()}</Text>
                    )}
                     */}

                    {/* Isitish davri davomiyligi */}
                    <View style={pdfStyles.row}>
                        <View style={pdfStyles.labelWithSubscript}>
                            <Text style={pdfStyles.labelFix}>O'rtacha kunlik havo harorati 10 °C dan kam yoki unga teng bo'lgan davrning davomiyligi, </Text>
                            <Text style={pdfStyles.mainVariableText}>Z</Text>
                            <Text style={pdfStyles.subscriptText}>is.dav</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
                            <Text style={pdfStyles.value}>
                                {heatingSeason?.Z_is_dav != null ? `${heatingSeason.Z_is_dav.toFixed(0)} sutka` : "—"}
                            </Text>
                        </View>
                    </View>
                    {/**
                      
                     {getZIsDavNote() && (
                        <Text style={pdfStyles.note}>{getZIsDavNote()}</Text>
                    )}
                     */}

                    {/* Tashqi havo harorati */}
                    <View style={pdfStyles.row}>
                        <View style={pdfStyles.labelWithSubscript}>
                            <Text style={pdfStyles.labelFix}>Tashqi havoning hisobiy qishki harorati, </Text>
                            <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>t</Text>
                            <Text style={pdfStyles.subscriptText}>t</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexShrink: 0 }}>
                            <Text style={pdfStyles.value}>
                                {climate?.t_out != null ? `${climate.t_out} °C` : "—"}
                            </Text>
                        </View>
                    </View>
                    {/**
                     {getTOutNote() && (
                        <Text style={pdfStyles.note}>{getTOutNote()}</Text>
                    )}
                     */}

                    {/* Materiallar jadvali */}
                    {floorData?.layers && floorData.layers.length > 0 && (
                        <View style={pdfStyles.section}>
                            <Text style={pdfStyles.sectionTitle}>Pol konstruksiyasi materiallarining xususiyatlari</Text>

                            <View style={pdfStyles.table}>
                                <View style={pdfStyles.tableHeader}>
                                    <Text style={[pdfStyles.tableCell, { flex: 0.3 }]}>#</Text>
                                    <Text style={[pdfStyles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Material</Text>
                                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                                        <Text style={[pdfStyles.mathText, { color: 'black' }]}>δ</Text>, mm
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, { flex: 0.8 }]}>
                                        <Text style={[pdfStyles.mathText, { color: 'black' }]}>γ</Text>
                                        <Text style={{ fontSize: 6 }}>o</Text>, kg/m³
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                                        <Text style={[pdfStyles.mathText, { color: 'black' }]}>λ</Text>
                                    </Text>
                                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>R</Text>
                                    <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>S</Text>
                                </View>

                                {floorData.layers.map((layer, idx) => (
                                    <View key={idx} style={pdfStyles.tableRow}>
                                        <Text style={[pdfStyles.tableCell, { flex: 0.3 }]}>{idx + 1}</Text>
                                        <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'left' }]}>{layer.name || "—"}</Text>
                                        <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer.thickness_mm || "—"}</Text>
                                        <Text style={[pdfStyles.tableCell, { flex: 0.8 }]}>
                                            {layer.rho != null && layer.rho !== "" ? Number(layer.rho).toFixed(0) : "—"}
                                        </Text>
                                        <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer.lambda || "—"}</Text>
                                        <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>{layer.R || "—"}</Text>
                                        <Text style={[pdfStyles.tableCell, { flex: 0.7 }]}>
                                            {layer.s != null
                                                ? (typeof layer.s === 'object'
                                                    ? layer.s[floorData.humidityCondition]
                                                    : layer.s)
                                                : "—"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* D bloki - Issiqlik inersiyasi */}
                    {floorData?.D_data && (
                        <View style={pdfStyles.section}>
                            <Text style={pdfStyles.sectionTitle}>To'suvchi konstruksiyalarning issiqlik inertsiyasi, D</Text>

                            {floorData.D_data.steps.map((step, idx) => (
                                <View key={idx} >
                                    <View style={pdfStyles.row}>
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>D</Text>
                                            <Text style={{ fontSize: 6 }}>{step.index}</Text>
                                            <Text style={{ fontSize: 9 }}> {step.materialName}</Text>
                                        </View>
                                        <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>
                                            {step.D}
                                        </Text>
                                    </View>
                                    <Text style={pdfStyles.note}>
                                        D<Text style={{ fontSize: 5 }}>{step.index}</Text> = R<Text style={{ fontSize: 5 }}>{step.index}</Text> × S<Text style={{ fontSize: 5 }}>{step.index}</Text> = {step.R} × {step.S} = {step.D}
                                    </Text>
                                </View>
                            ))}

                            <View style={pdfStyles.row}>
                                <Text style={{ fontSize: 10, fontWeight: 'semibold' }}>Jami issiqlik inersiyasi
                                    <Text style={{ fontFamily: "NotoSansMath" }}> (ΣD) </Text>
                                </Text>
                                <Text style={{ fontSize: 11, color: '#1080C2', fontWeight: 'bold' }}>
                                    {floorData.D_data.sum_D.toFixed(3)}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Senariy bloki - 1 va 2 senariylar uchun webdagi matnlar */}
                    {YpResult && floorData?.D_data && floorData.D_data.steps?.length > 0 && (
                        <View style={[pdfStyles.section, { alignItems: 'center', marginTop: 10 }]}>
                            {(() => {
                                const caseStr = String(YpResult.case);
                                const dValNum = Number(floorData.D_data.steps[0].D);
                                const dFormatted = Number.isFinite(dValNum)
                                    ? dValNum.toFixed(3)
                                    : floorData.D_data.steps[0].D;

                                if (caseStr === '1') {
                                    // 1-senariy matni (D1 >= 0.5)
                                    return (
                                        <>
                                            <Text style={{ fontSize: 9, marginBottom: 4, textAlign: 'center' }}>
                                                <Text >SHNQ 2.01.04-18 4.2-bandiga asosan:Birinchi qatlamning issiqlik inersiyasi</Text>

                                                <Text style={{ fontFamily: 'NotoSansMath' }}>
                                                    D
                                                    <Text style={{ fontSize: 6 }}>1</Text>
                                                    {" = R"}
                                                    <Text style={{ fontSize: 6 }}>1</Text>
                                                    {" · S"}
                                                    <Text style={{ fontSize: 6 }}>1</Text>
                                                    {` = ${dFormatted} ≥ 0.5`}
                                                </Text>
                                                {" bo'lganligi sababli, pol yuzasining issiqlik o'zlashtirish ko'rsatkichi quyidagi formula yordamida aniqlanadi: "}


                                                <Text style={{ fontSize: 8, textAlign: 'center', color: '#1080C2', fontWeight: 'semibold' }}>
                                                    Y
                                                    <Text style={{ fontSize: 6 }}>p</Text>
                                                    {" = 2 · S"}
                                                    <Text style={{ fontSize: 6 }}>1</Text>
                                                    {" = 2 · "}
                                                    {(() => {
                                                        const sVal = Number(floorData.D_data.steps[0].S);
                                                        return Number.isFinite(sVal) ? sVal.toFixed(2) : floorData.D_data.steps[0].S;
                                                    })()}
                                                    {" = "}
                                                    {YpResult && typeof YpResult.Yp === 'number' ? YpResult.Yp.toFixed(2) : YpResult?.Yp}
                                                </Text>
                                            </Text>
                                        </>
                                    );
                                }

                                if (caseStr === '2') {
                                    // 2-senariy matni (D1 < 0.5)
                                    return (
                                        <>
                                            <Text style={{ fontSize: 9, marginBottom: 4, textAlign: 'center', marginHorizontal: 10 }}>
                                                <Text >SHNQ 2.01.04-18 4.2-bandiga asosan: Birinchi qatlamning issiqlik inersiyasi </Text>

                                                <Text style={{ fontFamily: 'NotoSansMath' }}>
                                                    D
                                                    <Text style={{ fontSize: 6 }}>1</Text>
                                                    {" = R"}
                                                    <Text style={{ fontSize: 6 }}>1</Text>
                                                    {" · S"}
                                                    <Text style={{ fontSize: 6 }}>1</Text>
                                                    {` = ${dFormatted} < 0.5`}
                                                </Text>
                                                {" bo'lganligi sababli, pol yuzasining issiqlik o'zlashtirish ko'rsatkichi quyidagi formulalar yordamida aniqlanadi:"}
                                            </Text>

                                            <View style={{ flexDirection: 'row', paddingVertical: 6, justifyContent: 'center', borderBottom: '1px solid #E5E7EB' }}>
                                                <Text style={{ fontSize: 10, fontWeight: 'semibold', marginRight: 15, color: '#1080C2' }}>
                                                    <Text style={{ fontWeight: 'normal', color: '#6B7280' }}>(22)</Text>
                                                    {" "}
                                                    Y
                                                    <Text style={{ fontSize: 6 }} >n</Text>
                                                    {" = (2 · R"}
                                                    <Text style={{ fontSize: 6 }}>n</Text>
                                                    {" · S"}
                                                    <Text style={{ fontSize: 6 }}>n</Text>
                                                    {"² + S"}
                                                    <Text style={{ fontSize: 6 }}>n+1</Text>
                                                    {") / (0.5 + R"}
                                                    <Text style={{ fontSize: 6 }}>n</Text>
                                                    {" · S"}
                                                    <Text style={{ fontSize: 6 }}>n+1</Text>
                                                    {")"}
                                                </Text>

                                                <Text style={{ fontSize: 10, fontWeight: 'semibold', marginRight: 15, color: '#1080C2' }}>
                                                    <Text style={{ fontWeight: 'normal', color: '#6B7280' }}>(22a)</Text>
                                                    {" "}
                                                    Y
                                                    <Text style={{ fontSize: 6 }}>i</Text>
                                                    {" = (4 · R"}
                                                    <Text style={{ fontSize: 6 }}>i</Text>
                                                    {" · S"}
                                                    <Text style={{ fontSize: 6 }}>i</Text>
                                                    {"² + Y"}
                                                    <Text style={{ fontSize: 6 }}>i+1</Text>
                                                    {") / (1 + R"}
                                                    <Text style={{ fontSize: 6 }}>i</Text>
                                                    {" · Y"}
                                                    <Text style={{ fontSize: 6 }}>i+1</Text>
                                                    {")"}
                                                </Text>
                                            </View>
                                        </>
                                    );
                                }

                                return null;
                            })()}
                        </View>
                    )}

                    {/* Hisob-kitob natijalari (formula qadamlari) - faqat case 2 uchun */}
                    {YpResult && YpResult.case === 2 && YpResult.steps && YpResult.steps.some(step => step.type === 'formula') && (
                        <View >
                            <Text style={[pdfStyles.note, { marginBottom: 8, marginLeft: 10, textAlign: 'center' }]}>
                                {(() => {
                                    // YpResult.steps ichidan text tipidagi qadamni topamiz
                                    const textStep = YpResult.steps.find(step => step.type === 'text');
                                    if (textStep && textStep.content) {
                                        // Matndan raqamlarni ajratib olamiz: "4-qatlamda ΣD₁..D4 ... 3 - qatlamni ..."
                                        const match = textStep.content.match(/(\d+)-qatlamda.*?(\d+)\s*-?\s*qatlamni/);
                                        if (match) {
                                            const mLayer = match[1]; // m qatlam (ΣD birinchi marta 0.5 dan katta bo'lgan)
                                            const nLayer = match[2]; // n qatlam (formuladagi)
                                            return (
                                                <>
                                                    {`${mLayer}-qatlamda `}
                                                    <Text style={{ fontFamily: 'NotoSansMath' }}>Σ</Text>
                                                    {'D'}
                                                    <Text style={{ fontSize: 6 }}>1</Text>
                                                    {'..D'}
                                                    <Text style={{ fontSize: 6 }}>{mLayer}</Text>
                                                    {" issiqlik inersiyasi birinchi bo'lib 0.5 dan katta bo'ldi. Shu sababli "}
                                                    {nLayer}
                                                    {" - qatlamni formuladagi n - qatlam deb olamiz."}
                                                </>
                                            );
                                        }
                                    }
                                    // Fallback
                                    return "Hisob-kitob natijalari";
                                })()}
                            </Text>

                            {YpResult.steps.filter(step => step.type === 'formula').map((step, idx) => {
                                // step.formula ko'rinishi: "Y<sub>p</sub> = ..." yoki "Y<sub>1</sub> = ..."
                                const subMatch = step.formula.match(new RegExp('Y<sub>(.*?)</sub>'));
                                const subIndex = subMatch ? subMatch[1] : '';

                                // Y<sub>...</sub> va uning atrofidagi "=" ni olib tashlab, qolgan formulani matn sifatida olamiz
                                const tagAndEqRegex = new RegExp('Y<sub>.*?</sub>\\s*=\\s*');
                                const cleaned = step.formula
                                    .replace(tagAndEqRegex, '')
                                    .replace(/<[^>]*>/g, '');

                                // cleaned matn ichidagi R1, S2, Y3 kabi ifodalarni subscript bilan chizish
                                const parts = [];
                                const re = /(R|S|Y)(\d+)/g;
                                let lastIndex = 0;
                                let match;
                                while ((match = re.exec(cleaned)) !== null) {
                                    if (match.index > lastIndex) {
                                        parts.push(cleaned.slice(lastIndex, match.index));
                                    }
                                    parts.push({ base: match[1], index: match[2] });
                                    lastIndex = match.index + match[0].length;
                                }
                                if (lastIndex < cleaned.length) {
                                    parts.push(cleaned.slice(lastIndex));
                                }

                                return (
                                    <View key={idx} style={{ marginBottom: 5 }}>
                                        <View style={pdfStyles.row}>
                                            <Text style={{ fontSize: 8 }}>
                                                Y
                                                {subIndex ? (
                                                    <Text style={{ fontSize: 6 }}>{subIndex}</Text>
                                                ) : null}
                                                {' = '}
                                                {parts.map((p, i) =>
                                                    typeof p === 'string' ? (
                                                        <Text key={i}>{p}</Text>
                                                    ) : (
                                                        <Text key={i}>
                                                            {p.base}
                                                            <Text style={{ fontSize: 6 }}>{p.index}</Text>
                                                        </Text>
                                                    )
                                                )}
                                            </Text>
                                            <Text style={{ fontSize: 9, color: '#1080C2', fontWeight: 'bold' }}>
                                                {step.result}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Xulosa */}
                    {YpResult?.Yp != null && YpNorm != null && (
                        <View style={pdfStyles.conclusion} wrap={false} break>
                            <Text style={pdfStyles.conclusionText}>
                                SHNQ 2.01.04-2018 Qurilish issiqlik texnikasining 11-jadvaliga muvofiq pol yuzasining issiqlik o'zlashtirish ko'rsatkichi, Y<Text style={{ fontSize: 8 }}>p</Text> - <Text style={{ fontWeight: 'bold' }}>{YpResult.Yp.toFixed(2)} Vt / (m² · °C)</Text> me'yoriy qiymatdan <Text style={{ fontWeight: 'bold' }}>{YpNorm.toFixed(1)} Vt / (m² · °C)</Text> {isSatisfied ? 'kichik.' : 'katta.'}
                            </Text>
                            <Text style={[pdfStyles.conclusionResult, isSatisfied ? pdfStyles.successText : pdfStyles.errorText]}>
                                {isSatisfied ? "Issiqlik o'zlashtirish me'yoriy talabga muvofiq keladi!" : "Issiqlik o'zlashtirish me'yoriy talabga muvofiq kelmaydi!"}
                            </Text>
                        </View>
                    )}

                </View>

                {/* Footer - ramkadan tashqarida */}
                <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0 }} fixed>
                    <Text style={{ fontSize: 8, color: '#888888', textAlign: 'center' }}>
                        © {currentYear} | Loyiha qiymati kalkulyatori
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

// PDF eksport funksiyasi
export async function exportFloorPdfReact({ initial, climate, heatingSeason, floorData, saved }) {
    try {
        const blob = await pdf(
            <FloorPdfDocument
                initial={initial}
                climate={climate}
                heatingSeason={heatingSeason}
                floorData={floorData}
                saved={saved}
            />
        ).toBlob();

        // Versiya raqami
        const version = 1;
        saveAs(blob, `ITH - Yerdagi pol - v${version}.pdf`);
    } catch (error) {
        console.error('PDF yaratishda xato:', error);
        alert('PDF yaratishda xato yuz berdi!');
    }
}
