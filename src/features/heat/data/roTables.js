// Ro^pr (keltirilgan issiqlik uzatish qarshiligi) uchun normativ jadvallar (2a, 2b, 2v)
// DIQQAT: Quyidagi struktura normativ jadvallarni kodda ifodalash uchun tayyorlangan.
// Raqamli qiymatlarni 2a, 2b, 2v-jadvallardan mos ravishda o'zingiz to'ldirishingiz kerak.
// Tuzilma:
// RO_TABLES[daraja][obyekt_kategoriya][qavat_band][D4_band][konstruksiya_id] = Ro_pr
//  - daraja: 'I', 'II', 'III' (issiqlik himoyasi darajasi)
//  - obyekt_kategoriya: 'res_low', 'res_high', 'public', 'industrial'
//  - qavat_band: 'up_to_3', 'over_3'
//  - D4_band: 'lt_2000', '2000_3000', 'gt_3000'
//  - konstruksiya_id: '1'..'9' (mapConstructionTypeToId funksiyasi bo'yicha)

export const RO_TABLES = {
    I: {
        res_low: {
            lt_2000: {
                // Masalan: 3 qavatgacha bo'lgan turar-joylar, D4<2000, 1-daraja
                '1': 1.12, // tashqi devorlar uchun
                '2': 1.12, // ventfasad
                '3': 2.6,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.6,  // Chortoq orayopmasi
                '5': 2.1,  // o'tish joylari orayopmasi
                '6': 2.1,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.1,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.1,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.1,  // Yer satxidan pas isitilmaydigan tagxona
                '10': 0.45,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 1.5, // tashqi devorlar uchun
                '2': 1.5, // ventfasad
                //**** */
                '3': 3,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3,  // Chortoq orayopmasi
                //***** */
                '5': 2.5,  // o'tish joylari orayopmasi
                '6': 2.5,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.5,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.5,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.5,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            gt_3000: {
                // 3000 dan ko'p qiymatlari
                '1': 1.6, // tashqi devorlar uchun
                '2': 1.6, // ventfasad
                //**** */
                '3': 3.4,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.4,  // Chortoq orayopmasi
                //***** */
                '5': 3,  // o'tish joylari orayopmasi
                '6': 3,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },


        },
        res_high: {
            lt_2000: {
                '1': 1.5, // tashqi devorlar uchun
                '2': 1.5, // ventfasad
                //**** */
                '3': 2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2,  // Chortoq orayopmasi
                //***** */
                '5': 1.8,  // o'tish joylari orayopmasi
                '6': 1.8,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 1.8,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 1.8,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 1.8,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.45,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 1.8, // tashqi devorlar uchun
                '2': 1.8, // ventfasad
                //**** */
                '3': 2.4,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.4,  // Chortoq orayopmasi
                //***** */
                '5': 2.3,  // o'tish joylari orayopmasi
                '6': 2.3,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.3,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.3,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.3,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            gt_3000: {
                '1': 2, // tashqi devorlar uchun
                '2': 2, // ventfasad
                //**** */
                '3': 2.8,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.8,  // Chortoq orayopmasi
                //***** */
                '5': 2.7,  // o'tish joylari orayopmasi
                '6': 2.7,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.7,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.7,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.7,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
        },
        public: {
            lt_2000: {
                '1': 1.2, // tashqi devorlar uchun
                '2': 1.2, // ventfasad
                //**** */
                '3': 1.8,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 1.8,  // Chortoq orayopmasi
                //***** */
                '5': 2,  // o'tish joylari orayopmasi
                '6': 2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.45,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 1.5, // tashqi devorlar uchun
                '2': 1.5, // ventfasad
                //**** */
                '3': 2.0,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.0,  // Chortoq orayopmasi
                //***** */
                '5': 2.2,  // o'tish joylari orayopmasi
                '6': 2.2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
            gt_3000: {
                '1': 1.5, // tashqi devorlar uchun
                '2': 1.5, // ventfasad
                //**** */
                '3': 2.0,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.0,  // Chortoq orayopmasi
                //***** */
                '5': 2.4,  // o'tish joylari orayopmasi
                '6': 2.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
        },
        industrial: {
            lt_2000: {
                '1': 0.98, // tashqi devorlar uchun
                '2': 0.98, // ventfasad
                //**** */
                '3': 1,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 1,  // Chortoq orayopmasi
                //***** */
                '5': 1.4,  // o'tish joylari orayopmasi
                '6': 1.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 1.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 1.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 1.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.15,  // Deraza va balkon eshiklari
                '11': 0.15,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 1.12, // tashqi devorlar uchun
                '2': 1.12, // ventfasad
                //**** */
                '3': 1.2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 1.2,  // Chortoq orayopmasi
                //***** */
                '5': 1.7,  // o'tish joylari orayopmasi
                '6': 1.7,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 1.7,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 1.7,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 1.7,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.31,  // Deraza va balkon eshiklari
                '11': 0.15,  // Fonarlarniki
            },
            gt_3000: {
                '1': 1.26, // tashqi devorlar uchun
                '2': 1.26, // ventfasad
                //**** */
                '3': 1.5,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 1.5,  // Chortoq orayopmasi
                //***** */
                '5': 2.0,  // o'tish joylari orayopmasi
                '6': 2.0,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.0,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.0,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.0,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.34,  // Deraza va balkon eshiklari
                '11': 0.15,  // Fonarlarniki
            },
        },
    },
    II: {
        res_low: {
            lt_2000: {
                // Masalan: 3 qavatgacha bo'lgan turar-joylar, D4<2000, 1-daraja
                '1': 1.6, // tashqi devorlar uchun
                '2': 1.6, // ventfasad
                //*** */
                '3': 2.8,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.8,  // Chortoq orayopmasi
                //*** */
                '5': 2.6,  // o'tish joylari orayopmasi
                '6': 2.6,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.6,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.6,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.6,  // Yer satxidan pas isitilmaydigan tagxona
                //*** */
                '10': 0.45,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 2., // tashqi devorlar uchun
                '2': 2., // ventfasad
                //**** */
                '3': 3.2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.2,  // Chortoq orayopmasi
                //***** */
                '5': 3.0,  // o'tish joylari orayopmasi
                '6': 3.0,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3.0,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3.0,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3.0,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            gt_3000: {
                // 3000 dan ko'p qiymatlari
                '1': 2.4, // tashqi devorlar uchun
                '2': 2.4, // ventfasad
                //**** */
                '3': 3.8,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.8,  // Chortoq orayopmasi
                //***** */
                '5': 3.4,  // o'tish joylari orayopmasi
                '6': 3.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },


        },
        res_high: {
            lt_2000: {
                '1': 1.8, // tashqi devorlar uchun
                '2': 1.8, // ventfasad
                //**** */
                '3': 2.6,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.6,  // Chortoq orayopmasi
                //***** */
                '5': 2.4,  // o'tish joylari orayopmasi
                '6': 2.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.45,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 2.2, // tashqi devorlar uchun
                '2': 2.2, // ventfasad
                //**** */
                '3': 3.0,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.0,  // Chortoq orayopmasi
                //***** */
                '5': 2.8,  // o'tish joylari orayopmasi
                '6': 2.8,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.8,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.8,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.8,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            gt_3000: {
                '1': 2.6, // tashqi devorlar uchun
                '2': 2.6, // ventfasad
                //**** */
                '3': 3.6,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.6,  // Chortoq orayopmasi
                //***** */
                '5': 3.2,  // o'tish joylari orayopmasi
                '6': 3.2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3.2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3.2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3.2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
        },
        public: {
            lt_2000: {
                '1': 1.6, // tashqi devorlar uchun
                '2': 1.6, // ventfasad
                //**** */
                '3': 2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2,  // Chortoq orayopmasi
                //***** */
                '5': 1.8,  // o'tish joylari orayopmasi
                '6': 1.8,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 1.8,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 1.8,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 1.8,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.45,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 1.9, // tashqi devorlar uchun
                '2': 1.9, // ventfasad
                //**** */
                '3': 2.4,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.4,  // Chortoq orayopmasi
                //***** */
                '5': 2.2,  // o'tish joylari orayopmasi
                '6': 2.2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            gt_3000: {
                '1': 2.2, // tashqi devorlar uchun
                '2': 2.2, // ventfasad
                //**** */
                '3': 2.8,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.8,  // Chortoq orayopmasi
                //***** */
                '5': 2.4,  // o'tish joylari orayopmasi
                '6': 2.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
        },
        industrial: {
            lt_2000: {
                '1': 1.2, // tashqi devorlar uchun
                '2': 1.2, // ventfasad
                //**** */
                '3': 1.6,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 1.6,  // Chortoq orayopmasi
                //***** */
                '5': 1.4,  // o'tish joylari orayopmasi
                '6': 1.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 1.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 1.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 1.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.3,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 1.4, // tashqi devorlar uchun
                '2': 1.4, // ventfasad
                //**** */
                '3': 1.9,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 1.9,  // Chortoq orayopmasi
                //***** */
                '5': 1.8,  // o'tish joylari orayopmasi
                '6': 1.8,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 1.8,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 1.8,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 1.8,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.31,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
            gt_3000: {
                '1': 1.6, // tashqi devorlar uchun
                '2': 1.6, // ventfasad
                //**** */
                '3': 2.3,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.3,  // Chortoq orayopmasi
                //***** */
                '5': 2.2,  // o'tish joylari orayopmasi
                '6': 2.2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.34,  // Deraza va balkon eshiklari
                '11': 0.3,  // Fonarlarniki
            },
        },
    },
    III: {
        res_low: {
            lt_2000: {
                // Masalan: 3 qavatgacha bo'lgan turar-joylar, D4<2000, 1-daraja
                '1': 1.8, // tashqi devorlar uchun
                '2': 1.8, // ventfasad
                '3': 3.2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.2,  // Chortoq orayopmasi
                '5': 3,  // o'tish joylari orayopmasi
                '6': 3,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3,  // Yer satxidan pas isitilmaydigan tagxona
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.34,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 2.2, // tashqi devorlar uchun
                '2': 2.2, // ventfasad
                //**** */
                '3': 4,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 4,  // Chortoq orayopmasi
                //***** */
                '5': 3.4,  // o'tish joylari orayopmasi
                '6': 3.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.6,  // Deraza va balkon eshiklari
                '11': 0.34,  // Fonarlarniki
            },
            gt_3000: {
                // 3000 dan ko'p qiymatlari
                '1': 2.4, // tashqi devorlar uchun
                '2': 2.4, // ventfasad
                //**** */
                '3': 4.2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 4.2,  // Chortoq orayopmasi
                //***** */
                '5': 3.6,  // o'tish joylari orayopmasi
                '6': 3.6,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3.6,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3.6,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3.6,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.6,  // Deraza va balkon eshiklari
                '11': 0.34,  // Fonarlarniki
            },


        },
        res_high: {
            lt_2000: {
                '1': 2.2, // tashqi devorlar uchun
                '2': 2.2, // ventfasad
                //**** */
                '3': 3.2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.2,  // Chortoq orayopmasi
                //***** */
                '5': 2.8,  // o'tish joylari orayopmasi
                '6': 2.8,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.8,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.8,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.8,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.34,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 2.6, // tashqi devorlar uchun
                '2': 2.6, // ventfasad
                //**** */
                '3': 3.7,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.7,  // Chortoq orayopmasi
                //***** */
                '5': 3.2,  // o'tish joylari orayopmasi
                '6': 3.2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3.2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3.2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3.2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.6,  // Deraza va balkon eshiklari
                '11': 0.34,  // Fonarlarniki
            },
            gt_3000: {
                '1': 3, // tashqi devorlar uchun
                '2': 3, // ventfasad
                //**** */
                '3': 4.2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 4.2,  // Chortoq orayopmasi
                //***** */
                '5': 3.6,  // o'tish joylari orayopmasi
                '6': 3.6,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 3.6,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 3.6,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 3.6,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.6,  // Deraza va balkon eshiklari
                '11': 0.34,  // Fonarlarniki
            },
        },
        public: {
            lt_2000: {
                '1': 1.8, // tashqi devorlar uchun
                '2': 1.8, // ventfasad
                //**** */
                '3': 2.4,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.4,  // Chortoq orayopmasi
                //***** */
                '5': 2,  // o'tish joylari orayopmasi
                '6': 2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.53,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 2.2, // tashqi devorlar uchun
                '2': 2.2, // ventfasad
                //**** */
                '3': 2.8,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.8,  // Chortoq orayopmasi
                //***** */
                '5': 2.4,  // o'tish joylari orayopmasi
                '6': 2.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.6,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            gt_3000: {
                '1': 2.6, // tashqi devorlar uchun
                '2': 2.6, // ventfasad
                //**** */
                '3': 3.2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 3.2,  // Chortoq orayopmasi
                //***** */
                '5': 2.7,  // o'tish joylari orayopmasi
                '6': 2.7,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.7,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.7,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.7,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.6,  // Deraza va balkon eshiklari
                '11': 0.34,  // Fonarlarniki
            },
        },
        industrial: {
            lt_2000: {
                '1': 1.4, // tashqi devorlar uchun
                '2': 1.4, // ventfasad
                //**** */
                '3': 2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2,  // Chortoq orayopmasi
                //***** */
                '5': 2,  // o'tish joylari orayopmasi
                '6': 2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.31,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            '2000_3000': {
                '1': 1.8, // tashqi devorlar uchun
                '2': 1.8, // ventfasad
                //**** */
                '3': 2.2,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.2,  // Chortoq orayopmasi
                //***** */
                '5': 2.2,  // o'tish joylari orayopmasi
                '6': 2.2,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.2,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.2,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.2,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.34,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
            gt_3000: {
                '1': 2.2, // tashqi devorlar uchun
                '2': 2.2, // ventfasad
                //**** */
                '3': 2.4,  // Tomyopma va chortoq usti(ochiq chortoq)
                '4': 2.4,  // Chortoq orayopmasi
                //***** */
                '5': 2.4,  // o'tish joylari orayopmasi
                '6': 2.4,  // Tashqi xavo sovuq yerto'la tagxona
                '7': 2.4,  // Devorda oynasi bor isitilmaydigan yerto'la
                '8': 2.4,  // Devorda yorug'lik oraliqlari yo'q isitilmaydigan yerto'la
                '9': 2.4,  // Yer satxidan pas isitilmaydigan tagxona
                //**** */
                '10': 0.39,  // Deraza va balkon eshiklari
                '11': 0.31,  // Fonarlarniki
            },
        },
    },
};
