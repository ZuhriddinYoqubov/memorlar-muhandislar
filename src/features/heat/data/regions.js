// Minimal demo data; replace/extend with full table later
export const REGIONS = [
  {
  "viloyat": "Qoraqalpog'iston Respublikasi",
  "hududlar": [
    {
      "hudud": "Qoraqalpoq",
      "gpa": 1010,
      "kenglik": 45,
      "a_param": {
        "sovuq_davr": { "t": -13, "i_kj_kt": -10.8, "v_mc": 5.8 },
        "issiq_davr": { "t": 33.2, "i_kj_kt": 55.3, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -26, "i_kj_kt": -25.5, "v_mc": 5.7 },
        "issiq_davr": { "t": 33.7, "i_kj_kt": 59.0, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -32, "0,92": -29 },
        "yillik_taminot_5_kunlik": -30
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 174, "ortacha_harorat": -2.4 },
        "t_12": { "davom_etish_sutka": 202, "ortacha_harorat": -0.9 }
      }
    },

    {
      "hudud": "Mo‘ynoq",
      "gpa": 1010,
      "kenglik": 44,
      "a_param": {
        "sovuq_davr": { "t": -8, "i_kj_kt": -4.5, "v_mc": 8.3 },
        "issiq_davr": { "t": 30.2, "i_kj_kt": 58.6, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -19, "i_kj_kt": -17.8, "v_mc": 11.3 },
        "issiq_davr": { "t": 31.5, "i_kj_kt": 72.9, "v_mc": 3.4 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -25, "0,92": -23 },
        "yillik_taminot_5_kunlik": -25
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 167, "ortacha_harorat": -1.2 },
        "t_12": { "davom_etish_sutka": 190, "ortacha_harorat": 0.3 }
      }
    },

    {
      "hudud": "Nukus",
      "gpa": 1010,
      "kenglik": 43,
      "a_param": {
        "sovuq_davr": { "t": -9, "i_kj_kt": -6.2, "v_mc": 6.2 },
        "issiq_davr": { "t": 33.4, "i_kj_kt": 56.1, "v_mc": 4.4 }
      },
      "b_param": {
        "sovuq_davr": { "t": -20, "i_kj_kt": -19.1, "v_mc": 5.0 },
        "issiq_davr": { "t": 37.3, "i_kj_kt": 65.3, "v_mc": 4.4 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -27, "0,92": -24 },
        "yillik_taminot_5_kunlik": -23
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 143, "ortacha_harorat": -0.6 },
        "t_12": { "davom_etish_sutka": 182, "ortacha_harorat": 1.0 }
      }
    },

    {
      "hudud": "Chimboy",
      "gpa": 1010,
      "kenglik": 43,
      "a_param": {
        "sovuq_davr": { "t": -10, "i_kj_kt": -7.6, "v_mc": 5.8 },
        "issiq_davr": { "t": 34.7, "i_kj_kt": 58.6, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -20, "i_kj_kt": -19.1, "v_mc": 3.2 },
        "issiq_davr": { "t": 39.2, "i_kj_kt": 69.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -27, "0,92": -23 },
        "yillik_taminot_5_kunlik": -27
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 163, "ortacha_harorat": -1.3 },
        "t_12": { "davom_etish_sutka": 190, "ortacha_harorat": 0.3 }
      }
    }
  ]
}, {
  "viloyat": "Andijon viloyati",
  "hududlar": [
    {
      "hudud": "Andijon",
      "gpa": 970,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -5, "i_kj_kt": -0.5, "v_mc": 1.1 },
        "issiq_davr": { "t": 32.5, "i_kj_kt": 60.7, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -13, "i_kj_kt": -10.8, "v_mc": 1.0 },
        "issiq_davr": { "t": 36.4, "i_kj_kt": 70.6, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -19, "0,92": -16 },
        "yillik_taminot_5_kunlik": -20
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 130, "ortacha_harorat": 1.6 },
        "t_12": { "davom_etish_sutka": 162, "ortacha_harorat": 3.2 }
      }
    },
    {
      "hudud": "Xonobod",
      "gpa": 930,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -6, "i_kj_kt": -2.2, "v_mc": 2.4 },
        "issiq_davr": { "t": 31.3, "i_kj_kt": 54.4, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -15, "i_kj_kt": -13.4, "v_mc": 1.0 },
        "issiq_davr": { "t": 35.2, "i_kj_kt": 64.9, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -20, "0,92": -18 },
        "yillik_taminot_5_kunlik": -17
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 140, "ortacha_harorat": 1.1 },
        "t_12": { "davom_etish_sutka": 173, "ortacha_harorat": 3.0 }
      }
    }
  ]
},
{
  "viloyat": "Buxoro viloyati",
  "hududlar": [
    {
      "hudud": "Buxoro",
      "gpa": 990,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 1.4, "v_mc": 5.4 },
        "issiq_davr": { "t": 34.1, "i_kj_kt": 57.8, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -10.1, "v_mc": 5.6 },
        "issiq_davr": { "t": 38.4, "i_kj_kt": 66.6, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -19, "0,92": -16 },
        "yillik_taminot_5_kunlik": -15
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 126, "ortacha_harorat": 3.1 },
        "t_12": { "davom_etish_sutka": 162, "ortacha_harorat": 4.7 }
      }
    },
    {
      "hudud": "G‘ijduvon",
      "gpa": 990,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 1.9, "v_mc": 3.6 },
        "issiq_davr": { "t": 34.6, "i_kj_kt": 56.5, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -11.5, "v_mc": 3.9 },
        "issiq_davr": { "t": 38.0, "i_kj_kt": 65.5, "v_mc": 3.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -20, "0,92": -17 },
        "yillik_taminot_5_kunlik": -16
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 127, "ortacha_harorat": 2.9 },
        "t_12": { "davom_etish_sutka": 160, "ortacha_harorat": 3.7 }
      }
    },
    {
      "hudud": "Qorako‘l",
      "gpa": 990,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 1.6, "v_mc": 4.6 },
        "issiq_davr": { "t": 34.6, "i_kj_kt": 55.3, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -10.3, "v_mc": 3.0 },
        "issiq_davr": { "t": 38.7, "i_kj_kt": 67.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -17, "0,92": -15 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 122, "ortacha_harorat": 2.2 },
        "t_12": { "davom_etish_sutka": 155, "ortacha_harorat": 4.6 }
      }
    }
  ]
},
{
  "viloyat": "Jizzax viloyati",
  "hududlar": [
    {
      "hudud": "G‘allaorol",
      "gpa": 950,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -6, "i_kj_kt": 2.3, "v_mc": 3.3 },
        "issiq_davr": { "t": 33.3, "i_kj_kt": 53.6, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -19, "i_kj_kt": -18.0, "v_mc": 1.7 },
        "issiq_davr": { "t": 37.5, "i_kj_kt": 61.5, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -23, "0,92": -22 },
        "yillik_taminot_5_kunlik": -20
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 144, "ortacha_harorat": 1.4 },
        "t_12": { "davom_etish_sutka": 180, "ortacha_harorat": 4.2 }
      }
    },
    {
      "hudud": "Jizzax",
      "gpa": 970,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -4, "i_kj_kt": 2.3, "v_mc": 2.7 },
        "issiq_davr": { "t": 33.4, "i_kj_kt": 54.4, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -16, "i_kj_kt": -14.6, "v_mc": 1.4 },
        "issiq_davr": { "t": 37.4, "i_kj_kt": 60.3, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -22, "0,92": -19 },
        "yillik_taminot_5_kunlik": -18
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 126, "ortacha_harorat": 2.7 },
        "t_12": { "davom_etish_sutka": 161, "ortacha_harorat": 4.2 }
      }
    },
    {
      "hudud": "Do‘stlik",
      "gpa": 970,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -4, "i_kj_kt": 2.5, "v_mc": 2.3 },
        "issiq_davr": { "t": 33.9, "i_kj_kt": 57.8, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -15, "i_kj_kt": -13.0, "v_mc": 2.0 },
        "issiq_davr": { "t": 37.0, "i_kj_kt": 62.7, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -21, "0,92": -18 },
        "yillik_taminot_5_kunlik": -19
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 126, "ortacha_harorat": 2.5 },
        "t_12": { "davom_etish_sutka": 163, "ortacha_harorat": 4.4 }
      }
    }
  ]
},
{
  "viloyat": "Qashqadaryo viloyati",
  "hududlar": [
    {
      "hudud": "G‘uzor",
      "gpa": 950,
      "kenglik": 39,
      "a_param": {
        "sovuq_davr": { "t": -2, "i_kj_kt": 2.5, "v_mc": 2.0 },
        "issiq_davr": { "t": 33.8, "i_kj_kt": 59.9, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -11, "i_kj_kt": -9.0, "v_mc": 4.0 },
        "issiq_davr": { "t": 40.1, "i_kj_kt": 68.7, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -14, "0,92": -13 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 100, "ortacha_harorat": 4.7 },
        "t_12": { "davom_etish_sutka": 126, "ortacha_harorat": 5.9 }
      }
    },
    {
      "hudud": "Qarshi",
      "gpa": 970,
      "kenglik": 39,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 1.7, "v_mc": 2.4 },
        "issiq_davr": { "t": 35.7, "i_kj_kt": 55.7, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -14, "i_kj_kt": -12.3, "v_mc": 4.3 },
        "issiq_davr": { "t": 39.0, "i_kj_kt": 67.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -18, "0,92": -17 },
        "yillik_taminot_5_kunlik": -18
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 115, "ortacha_harorat": 3.7 },
        "t_12": { "davom_etish_sutka": 152, "ortacha_harorat": 5.2 }
      }
    },
    {
      "hudud": "Minchuqur",
      "gpa": 790,
      "kenglik": 39,
      "a_param": {
        "sovuq_davr": { "t": -6, "i_kj_kt": -2.7, "v_mc": 2.5 },
        "issiq_davr": { "t": 33.5, "i_kj_kt": 51.9, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -14, "i_kj_kt": -12.2, "v_mc": 2.5 },
        "issiq_davr": { "t": 37.0, "i_kj_kt": 49.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -19, "0,92": -16 },
        "yillik_taminot_5_kunlik": -17
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 187, "ortacha_harorat": 1.6 },
        "t_12": { "davom_etish_sutka": 234, "ortacha_harorat": 2.7 }
      }
    },
    {
      "hudud": "Muborak",
      "gpa": 990,
      "kenglik": 39,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 1.9, "v_mc": 2.7 },
        "issiq_davr": { "t": 34.7, "i_kj_kt": 56.3, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -12.5, "v_mc": 2.9 },
        "issiq_davr": { "t": 39.0, "i_kj_kt": 49.3, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -17, "0,92": -16 },
        "yillik_taminot_5_kunlik": -15
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 152, "ortacha_harorat": 3.2 },
        "t_12": { "davom_etish_sutka": 197, "ortacha_harorat": 5.3 }
      }
    },
    {
      "hudud": "Shahrisabz",
      "gpa": 950,
      "kenglik": 39,
      "a_param": {
        "sovuq_davr": { "t": -2, "i_kj_kt": 2.6, "v_mc": 2.4 },
        "issiq_davr": { "t": 33.8, "i_kj_kt": 55.7, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -11, "i_kj_kt": -8.9, "v_mc": 3.4 },
        "issiq_davr": { "t": 37.1, "i_kj_kt": 62.8, "v_mc": 1.9 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -17, "0,92": -14 },
        "yillik_taminot_5_kunlik": -16
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 115, "ortacha_harorat": 4.1 },
        "t_12": { "davom_etish_sutka": 153, "ortacha_harorat": 5.7 }
      }
    }
  ]
}
,{
  "viloyat": "Navoiy viloyati",
  "hududlar": [
    {
      "hudud": "Zarafshon",
      "gpa": 970,
      "kenglik": 42,
      "a_param": {
        "sovuq_davr": { "t": -5, "i_kj_kt": 1.3, "v_mc": 3.7 },
        "issiq_davr": { "t": 33.6, "i_kj_kt": 54.4, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -10.0, "v_mc": 3.5 },
        "issiq_davr": { "t": 38.4, "i_kj_kt": 66.2, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -15, "0,92": -14 },
        "yillik_taminot_5_kunlik": -15
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 136, "ortacha_harorat": 1.5 },
        "t_12": { "davom_etish_sutka": 166, "ortacha_harorat": 2.9 }
      }
    },
    {
      "hudud": "Navoiy",
      "gpa": 970,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -2, "i_kj_kt": 3.0, "v_mc": 3.9 },
        "issiq_davr": { "t": 33.9, "i_kj_kt": 55.6, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -13, "i_kj_kt": -11.3, "v_mc": 3.2 },
        "issiq_davr": { "t": 38.0, "i_kj_kt": 64.9, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -16, "0,92": -16 },
        "yillik_taminot_5_kunlik": -15
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 123, "ortacha_harorat": 3.5 },
        "t_12": { "davom_etish_sutka": 160, "ortacha_harorat": 4.4 }
      }
    },
    {
      "hudud": "Nurota",
      "gpa": 950,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -4, "i_kj_kt": 2.2, "v_mc": 3.5 },
        "issiq_davr": { "t": 33.4, "i_kj_kt": 50.4, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -13, "i_kj_kt": -12.5, "v_mc": 2.8 },
        "issiq_davr": { "t": 37.8, "i_kj_kt": 61.7, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -19, "0,92": -18 },
        "yillik_taminot_5_kunlik": -19
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 114, "ortacha_harorat": 1.8 },
        "t_12": { "davom_etish_sutka": 149, "ortacha_harorat": 2.7 }
      }
    },
    {
      "hudud": "Uchquduq",
      "gpa": 990,
      "kenglik": 42,
      "a_param": {
        "sovuq_davr": { "t": -7, "i_kj_kt": -3.8, "v_mc": 3.0 },
        "issiq_davr": { "t": 34.5, "i_kj_kt": 52.8, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -16, "i_kj_kt": -14.9, "v_mc": 2.3 },
        "issiq_davr": { "t": 39.8, "i_kj_kt": 67.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -20, "0,92": -19 },
        "yillik_taminot_5_kunlik": -20
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 140, "ortacha_harorat": 1.6 },
        "t_12": { "davom_etish_sutka": 171, "ortacha_harorat": 2.7 }
      }
    }
  ]
}
, {
  "viloyat": "Namangan viloyati",
  "hududlar": [
    {
      "hudud": "Kosonsoy",
      "gpa": 910,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -4, "i_kj_kt": -0.1, "v_mc": 3.3 },
        "issiq_davr": { "t": 32.9, "i_kj_kt": 52.3, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -10.1, "v_mc": 3.9 },
        "issiq_davr": { "t": 36.7, "i_kj_kt": 62.0, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -17, "0,92": -15 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 138, "ortacha_harorat": 2.0 },
        "t_12": { "davom_etish_sutka": 174, "ortacha_harorat": 3.6 }
      }
    },
    {
      "hudud": "Namangan",
      "gpa": 970,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -6, "i_kj_kt": -2.8, "v_mc": 2.1 },
        "issiq_davr": { "t": 32.8, "i_kj_kt": 60.0, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -14, "i_kj_kt": -13.0, "v_mc": 3.5 },
        "issiq_davr": { "t": 35.7, "i_kj_kt": 70.0, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -20, "0,92": -17 },
        "yillik_taminot_5_kunlik": -18
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 128, "ortacha_harorat": 1.8 },
        "t_12": { "davom_etish_sutka": 159, "ortacha_harorat": 3.6 }
      }
    },
    {
      "hudud": "Pop",
      "gpa": 970,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 2.1, "v_mc": 1.4 },
        "issiq_davr": { "t": 32.5, "i_kj_kt": 60.3, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -11, "i_kj_kt": -8.4, "v_mc": 1.1 },
        "issiq_davr": { "t": 36.2, "i_kj_kt": 70.0, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -15, "0,92": -13 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 125, "ortacha_harorat": 1.8 },
        "t_12": { "davom_etish_sutka": 156, "ortacha_harorat": 3.6 }
      }
    }
  ]
}
,{
  "viloyat": "Samarqand viloyati",
  "hududlar": [
    {
      "hudud": "Kattaqo'rg'on",
      "gpa": 950,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 2.1, "v_mc": 5.6 },
        "issiq_davr": { "t": 31.1, "i_kj_kt": 56.5, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -13, "i_kj_kt": -10.9, "v_mc": 5.3 },
        "issiq_davr": { "t": 37.2, "i_kj_kt": 64.9, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -19, "0,92": -16 },
        "yillik_taminot_5_kunlik": -16
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 134, "ortacha_harorat": 2.8 },
        "t_12": { "davom_etish_sutka": 170, "ortacha_harorat": 4.4 }
      }
    },
    {
      "hudud": "Qo‘shrabod",
      "gpa": 930,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -5, "i_kj_kt": -0.9, "v_mc": 2.8 },
        "issiq_davr": { "t": 32.8, "i_kj_kt": 52.3, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -16, "i_kj_kt": -14.7, "v_mc": 3.7 },
        "issiq_davr": { "t": 36.9, "i_kj_kt": 60.7, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -22, "0,92": -20 },
        "yillik_taminot_5_kunlik": -19
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 145, "ortacha_harorat": 1.9 },
        "t_12": { "davom_etish_sutka": 182, "ortacha_harorat": 4.8 }
      }
    },
    {
      "hudud": "Samarqand",
      "gpa": 930,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 1.7, "v_mc": 3.7 },
        "issiq_davr": { "t": 31.7, "i_kj_kt": 54.5, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -9.9, "v_mc": 3.1 },
        "issiq_davr": { "t": 36.0, "i_kj_kt": 62.8, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -18, "0,92": -15 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 133, "ortacha_harorat": 3.3 },
        "t_12": { "davom_etish_sutka": 172, "ortacha_harorat": 4.8 }
      }
    }
  ]
}
,{
  "viloyat": "Surxondaryo viloyati",
  "hududlar": [
    {
      "hudud": "Denov",
      "gpa": 950,
      "kenglik": 38,
      "a_param": {
        "sovuq_davr": { "t": 0, "i_kj_kt": 5.4, "v_mc": 2.2 },
        "issiq_davr": { "t": 33.7, "i_kj_kt": 50.7, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -10, "i_kj_kt": -5.3, "v_mc": 2.7 },
        "issiq_davr": { "t": 37.4, "i_kj_kt": 58.6, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -14, "0,92": -11 },
        "yillik_taminot_5_kunlik": -12
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 89, "ortacha_harorat": 5.1 },
        "t_12": { "davom_etish_sutka": 139, "ortacha_harorat": 6.8 }
      }
    },
    {
      "hudud": "Termiz",
      "gpa": 970,
      "kenglik": 37,
      "a_param": {
        "sovuq_davr": { "t": -1, "i_kj_kt": 4.1, "v_mc": 4.7 },
        "issiq_davr": { "t": 38.2, "i_kj_kt": 60.2, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -10, "i_kj_kt": -7.7, "v_mc": 6.2 },
        "issiq_davr": { "t": 42.2, "i_kj_kt": 71.2, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -14, "0,92": -12 },
        "yillik_taminot_5_kunlik": -12
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 91, "ortacha_harorat": 4.5 },
        "t_12": { "davom_etish_sutka": 134, "ortacha_harorat": 7.1 }
      }
    },
    {
      "hudud": "Sherobod",
      "gpa": 970,
      "kenglik": 38,
      "a_param": {
        "sovuq_davr": { "t": -1, "i_kj_kt": 6.6, "v_mc": 4.3 },
        "issiq_davr": { "t": 36.4, "i_kj_kt": 62.5, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -13, "i_kj_kt": -5.4, "v_mc": 3.0 },
        "issiq_davr": { "t": 40.7, "i_kj_kt": 60.1, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -18, "0,92": -14 },
        "yillik_taminot_5_kunlik": -16
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 110, "ortacha_harorat": 2.7 },
        "t_12": { "davom_etish_sutka": 148, "ortacha_harorat": 4.2 }
      }
    }
  ]
},{
  "viloyat": "Sirdaryo viloyati",
  "hududlar": [
    {
      "hudud": "Guliston",
      "gpa": 990,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -6, "i_kj_kt": -2.3, "v_mc": 2.2 },
        "issiq_davr": { "t": 33.6, "i_kj_kt": 56.5, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -19, "i_kj_kt": -20.0, "v_mc": 1.7 },
        "issiq_davr": { "t": 37.5, "i_kj_kt": 67.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -22, "0,92": -22 },
        "yillik_taminot_5_kunlik": -22
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 130, "ortacha_harorat": 1.8 },
        "t_12": { "davom_etish_sutka": 170, "ortacha_harorat": 3.6 }
      }
    },
    {
      "hudud": "Sirdaryo",
      "gpa": 970,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -5, "i_kj_kt": -0.9, "v_mc": 2.0 },
        "issiq_davr": { "t": 32.3, "i_kj_kt": 51.7, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -17, "i_kj_kt": -15.7, "v_mc": 1.5 },
        "issiq_davr": { "t": 37.1, "i_kj_kt": 60.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -20, "0,92": -19 },
        "yillik_taminot_5_kunlik": -20
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 134, "ortacha_harorat": 1.8 },
        "t_12": { "davom_etish_sutka": 168, "ortacha_harorat": 3.4 }
      }
    },
    {
      "hudud": "Yangiyer",
      "gpa": 970,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -4, "i_kj_kt": -0.1, "v_mc": 3.0 },
        "issiq_davr": { "t": 33.9, "i_kj_kt": 56.5, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -16, "i_kj_kt": -14.7, "v_mc": 1.8 },
        "issiq_davr": { "t": 37.8, "i_kj_kt": 65.3, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -23, "0,92": -19 },
        "yillik_taminot_5_kunlik": -19
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 121, "ortacha_harorat": 2.9 },
        "t_12": { "davom_etish_sutka": 152, "ortacha_harorat": 4.4 }
      }
    }
  ]
}
,{
  "viloyat": "Toshkent viloyati",
  "hududlar": [
    {
      "hudud": "Olmaliq",
      "gpa": 950,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -2, "i_kj_kt": 3.2, "v_mc": 2.9 },
        "issiq_davr": { "t": 33.1, "i_kj_kt": 56.9, "v_mc": 3.1 }
      },
      "b_param": {
        "sovuq_davr": { "t": -9.9, "i_kj_kt": 2.9, "v_mc": 3.7 },
        "issiq_davr": { "t": 37.0, "i_kj_kt": 65.3, "v_mc": 3.1 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -17, "0,92": -15 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 124, "ortacha_harorat": 3.2 },
        "t_12": { "davom_etish_sutka": 152, "ortacha_harorat": 5.1 }
      }
    },
    {
      "hudud": "Oxangaron",
      "gpa": 910,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 0.9, "v_mc": 2.5 },
        "issiq_davr": { "t": 30.5, "i_kj_kt": 51.5, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -10.3, "v_mc": 3.5 },
        "issiq_davr": { "t": 34.3, "i_kj_kt": 60.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -17, "0,92": -15 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 135, "ortacha_harorat": 2.9 },
        "t_12": { "davom_etish_sutka": 172, "ortacha_harorat": 4.8 }
      }
    },
    {
      "hudud": "Bekobod",
      "gpa": 970,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -2, "i_kj_kt": 3.3, "v_mc": 6.2 },
        "issiq_davr": { "t": 32.2, "i_kj_kt": 54.4, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -13, "i_kj_kt": -11.2, "v_mc": 3.4 },
        "issiq_davr": { "t": 34.5, "i_kj_kt": 62.8, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -21, "0,92": -18 },
        "yillik_taminot_5_kunlik": -17
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 116, "ortacha_harorat": 3.9 },
        "t_12": { "davom_etish_sutka": 152, "ortacha_harorat": 5.5 }
      }
    },
    {
      "hudud": "O‘yg‘ain (Bo‘stonliq)",
      "gpa": 770,
      "kenglik": 42,
      "a_param": {
        "sovuq_davr": { "t": -8, "i_kj_kt": -10.8, "v_mc": 3.1 },
        "issiq_davr": { "t": 31.6, "i_kj_kt": 56.4, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -20, "i_kj_kt": -19.0, "v_mc": 4.0 },
        "issiq_davr": { "t": 34.5, "i_kj_kt": 69.8, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -25, "0,92": -23 },
        "yillik_taminot_5_kunlik": -24
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 139, "ortacha_harorat": -0.1 },
        "t_12": { "davom_etish_sutka": 228, "ortacha_harorat": 1.5 }
      }
    },
    {
      "hudud": "Toshkent",
      "gpa": 950,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -4, "i_kj_kt": -1.4, "v_mc": 2.3 },
        "issiq_davr": { "t": 33.0, "i_kj_kt": 55.7, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -14, "i_kj_kt": -12.4, "v_mc": 1.2 },
        "issiq_davr": { "t": 37.5, "i_kj_kt": 65.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -22, "0,92": -16 },
        "yillik_taminot_5_kunlik": -15
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 129, "ortacha_harorat": 2.7 },
        "t_12": { "davom_etish_sutka": 166, "ortacha_harorat": 4.0 }
      }
    },
    {
      "hudud": "Chorvoq",
      "gpa": 950,
      "kenglik": 42,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": 2.1, "v_mc": 3.3 },
        "issiq_davr": { "t": 29.8, "i_kj_kt": 51.5, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -11.6, "v_mc": 1.4 },
        "issiq_davr": { "t": 34.8, "i_kj_kt": 59.9, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -19, "0,92": -16 },
        "yillik_taminot_5_kunlik": -15
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 146, "ortacha_harorat": 2.7 },
        "t_12": { "davom_etish_sutka": 179, "ortacha_harorat": 3.9 }
      }
    },
    {
      "hudud": "Chirchiq",
      "gpa": 950,
      "kenglik": 42,
      "a_param": {
        "sovuq_davr": { "t": -3, "i_kj_kt": -1.0, "v_mc": 4.1 },
        "issiq_davr": { "t": 34.1, "i_kj_kt": 53.6, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -14, "i_kj_kt": -12.4, "v_mc": 2.2 },
        "issiq_davr": { "t": 35.8, "i_kj_kt": 62.4, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -19, "0,92": -16 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 130, "ortacha_harorat": 2.8 },
        "t_12": { "davom_etish_sutka": 163, "ortacha_harorat": 3.9 }
      }
    }
  ]
}
,{
  "viloyat": "Farg‘ona viloyati",
  "hududlar": [
    {
      "hudud": "Qo‘qon",
      "gpa": 970,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -5, "i_kj_kt": -0.4, "v_mc": 2.6 },
        "issiq_davr": { "t": 32.3, "i_kj_kt": 59.7, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -12, "i_kj_kt": -10.0, "v_mc": 2.6 },
        "issiq_davr": { "t": 35.8, "i_kj_kt": 69.7, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -17, "0,92": -14 },
        "yillik_taminot_5_kunlik": -14
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 131, "ortacha_harorat": 1.8 },
        "t_12": { "davom_etish_sutka": 161, "ortacha_harorat": 3.5 }
      }
    },
    {
      "hudud": "Farg‘ona",
      "gpa": 950,
      "kenglik": 40,
      "a_param": {
        "sovuq_davr": { "t": -6, "i_kj_kt": -2.9, "v_mc": 2.2 },
        "issiq_davr": { "t": 32.0, "i_kj_kt": 59.0, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -14, "i_kj_kt": -12.6, "v_mc": 3.0 },
        "issiq_davr": { "t": 35.9, "i_kj_kt": 68.1, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -18, "0,92": -15 },
        "yillik_taminot_5_kunlik": -15
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 132, "ortacha_harorat": 1.9 },
        "t_12": { "davom_etish_sutka": 164, "ortacha_harorat": 3.4 }
      }
    },
    {
      "hudud": "Shohimardon",
      "gpa": 880,
      "kenglik": 38,
      "a_param": {
        "sovuq_davr": { "t": -6, "i_kj_kt": -2.6, "v_mc": 2.3 },
        "issiq_davr": { "t": 25.6, "i_kj_kt": 49.0, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -13, "i_kj_kt": -11.6, "v_mc": 2.2 },
        "issiq_davr": { "t": 28.9, "i_kj_kt": 50.9, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -16, "0,92": -15 },
        "yillik_taminot_5_kunlik": -16
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 160, "ortacha_harorat": 0.6 },
        "t_12": { "davom_etish_sutka": 201, "ortacha_harorat": 2.5 }
      }
    }
  ]
}
,{
  "viloyat": "Xorazm viloyati",
  "hududlar": [
    {
      "hudud": "Urganch",
      "gpa": 1010,
      "kenglik": 42,
      "a_param": {
        "sovuq_davr": { "t": -8, "i_kj_kt": -4.9, "v_mc": 3.7 },
        "issiq_davr": { "t": 33.7, "i_kj_kt": 54.4, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -18, "i_kj_kt": -16.8, "v_mc": 3.7 },
        "issiq_davr": { "t": 37.6, "i_kj_kt": 62.0, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -23, "0,92": -21 },
        "yillik_taminot_5_kunlik": -23
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 148, "ortacha_harorat": 0.8 },
        "t_12": { "davom_etish_sutka": 176, "ortacha_harorat": 2.4 }
      }
    },
    {
      "hudud": "Xiva",
      "gpa": 1010,
      "kenglik": 41,
      "a_param": {
        "sovuq_davr": { "t": -7, "i_kj_kt": -3.4, "v_mc": 5.7 },
        "issiq_davr": { "t": 33.1, "i_kj_kt": 57.8, "v_mc": 1.0 }
      },
      "b_param": {
        "sovuq_davr": { "t": -17, "i_kj_kt": -15.6, "v_mc": 6.2 },
        "issiq_davr": { "t": 34.6, "i_kj_kt": 66.2, "v_mc": 1.0 }
      },
      "eng_sov_davr_harorat": {
        "yillik_taminot_b": { "0,98": -24, "0,92": -20 },
        "yillik_taminot_5_kunlik": -20
      },
      "havo_sutka_ortacha_c": {
        "t_8": { "davom_etish_sutka": 143, "ortacha_harorat": 0.5 },
        "t_12": { "davom_etish_sutka": 174, "ortacha_harorat": 2.4 }
      }
    }
  ]
}
];
