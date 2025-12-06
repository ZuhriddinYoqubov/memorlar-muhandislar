// Minimal demo data; replace/extend with full table later
export const MATERIALS = [
  {
    "group_id": "I",
    "group_name": "Betonlar va qorishmalar",
    "classes": [
      {
        "class_id": "A",
        "class_name": "Tabiiy zich to‘ldiruvchi betonlar",
        "materials": [
          {
            "id": "A-1",
            "name": "Temir-beton",
            "variants": [
              {
                "density": 2500,
                "S0": 0.84,
                "lambda_0": 1.69,
                "w": { "A": 2, "B": 3 },
                "lambda": { "A": 1.92, "B": 2.04 },
                "s": { "A": 17.98, "B": 16.95 },
                "mu": 0.03
              }
            ]
          },
          {
            "id": "A-2",
            "name": "Tabiiy toshdan chaqiq tosh yoki shag‘alli beton",
            "variants": [
              {
                "density": 2400,
                "S0": 0.84,
                "lambda_0": 1.51,
                "w": { "A": 2, "B": 3 },
                "lambda": { "A": 1.74, "B": 1.86 },
                "s": { "A": 17.98, "B": 17.88 },
                "mu": 0.03
              }
            ]
          }
        ]
      },

      {
        "class_id": "B",
        "class_name": "Tabiiy g‘ovakli to‘ldiruvchi betonlar",
        "materials": [
          {
            "id": "B-1",
            "name": "Tuf-beton",
            "variants": [
              {
                "density": 1800,
                "S0": 0.84,
                "lambda_0": 0.64,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.87, "B": 0.99 },
                "s": { "A": 11.38, "B": 12.79 },
                "mu": 0.09
              },
              {
                "density": 1600,
                "S0": 0.84,
                "lambda_0": 0.52,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.70, "B": 0.81 },
                "s": { "A": 9.12, "B": 9.61 },
                "mu": 0.08
              },
              {
                "density": 1400,
                "S0": 0.84,
                "lambda_0": 0.41,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.52, "B": 0.58 },
                "s": { "A": 7.78, "B": 8.63 },
                "mu": 0.11
              },
              {
                "density": 1200,
                "S0": 0.84,
                "lambda_0": 0.32,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.42, "B": 0.47 },
                "s": { "A": 6.36, "B": 7.09 },
                "mu": 0.125
              }
            ]
          },

          {
            "id": "B-2",
            "name": "Pemza-beton",
            "variants": [
              {
                "density": 1600,
                "S0": 0.84,
                "lambda_0": 0.52,
                "w": { "A": 4, "B": 6 },
                "lambda": { "A": 0.62, "B": 0.68 },
                "s": { "A": 8.54, "B": 9.30 },
                "mu": 0.07
              },
              {
                "density": 1400,
                "S0": 0.84,
                "lambda_0": 0.42,
                "w": { "A": 4, "B": 6 },
                "lambda": { "A": 0.49, "B": 0.54 },
                "s": { "A": 7.14, "B": 7.76 },
                "mu": 0.083
              },
              {
                "density": 1200,
                "S0": 0.84,
                "lambda_0": 0.34,
                "w": { "A": 4, "B": 6 },
                "lambda": { "A": 0.39, "B": 0.43 },
                "s": { "A": 5.94, "B": 6.22 },
                "mu": 0.098
              }
            ]
          },

          {
            "id": "B-3",
            "name": "Vulqon shlakli beton",
            "variants": [
              {
                "density": 1800,
                "S0": 0.84,
                "lambda_0": 0.52,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.70, "B": 0.81 },
                "s": { "A": 9.12, "B": 10.44 },
                "mu": 0.075
              },
              {
                "density": 1400,
                "S0": 0.84,
                "lambda_0": 0.41,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.52, "B": 0.58 },
                "s": { "A": 7.76, "B": 8.63 },
                "mu": 0.083
              },
              {
                "density": 1200,
                "S0": 0.84,
                "lambda_0": 0.32,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.42, "B": 0.47 },
                "s": { "A": 6.36, "B": 7.09 },
                "mu": 0.098
              },
              {
                "density": 1000,
                "S0": 0.84,
                "lambda_0": 0.24,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.29, "B": 0.35 },
                "s": { "A": 4.90, "B": 5.67 },
                "mu": 0.09
              },
              {
                "density": 800,
                "S0": 0.84,
                "lambda_0": 0.20,
                "w": { "A": 7, "B": 10 },
                "lambda": { "A": 0.23, "B": 0.29 },
                "s": { "A": 3.90, "B": 4.61 },
                "mu": 0.11
              }
            ]
          }
        ]
      },
      {
        "class_id": "V",
        "class_name": "Sun’iy g‘ovakli to‘ldirgichli betonlar",
        "materials": [

          /* ========================== */
          /*        V SINFI             */
          /* Sun’iy g‘ovakli to‘ldiruvchi betonlar */
          /* ========================== */

          {
            "id": "V-17",
            "name": "Keramzit qumli keramzit-beton va ko‘pikli keramzit-beton",
            "variants": [
              {
                "density": 1800,
                "S0": 0.84,
                "lambda_0": 0.66,
                "w": { "A": 5, "B": 10 },
                "lambda": { "A": 0.80, "B": 0.92 },
                "s": { "A": 10.5, "B": 12.33 },
                "mu": 0.09
              },
              {
                "density": 1600,
                "S0": 0.84,
                "lambda_0": 0.58,
                "w": { "A": 5, "B": 10 },
                "lambda": { "A": 0.67, "B": 0.79 },
                "s": { "A": 9.06, "B": 10.77 },
                "mu": 0.09
              },
              {
                "density": 1400,
                "S0": 0.84,
                "lambda_0": 0.47,
                "w": { "A": 5, "B": 10 },
                "lambda": { "A": 0.56, "B": 0.65 },
                "s": { "A": 7.75, "B": 9.14 },
                "mu": 0.098
              },
              {
                "density": 1200,
                "S0": 0.84,
                "lambda_0": 0.36,
                "w": { "A": 5, "B": 10 },
                "lambda": { "A": 0.44, "B": 0.52 },
                "s": { "A": 6.36, "B": 7.57 },
                "mu": 0.11
              },
              {
                "density": 1000,
                "S0": 0.84,
                "lambda_0": 0.27,
                "w": { "A": 5, "B": 10 },
                "lambda": { "A": 0.33, "B": 0.41 },
                "s": { "A": 5.03, "B": 6.13 },
                "mu": 0.14
              },
              {
                "density": 800,
                "S0": 0.84,
                "lambda_0": 0.21,
                "w": { "A": 5, "B": 10 },
                "lambda": { "A": 0.24, "B": 0.31 },
                "s": { "A": 3.83, "B": 4.77 },
                "mu": 0.19
              },
              {
                "density": 600,
                "S0": 0.84,
                "lambda_0": 0.14,
                "w": { "A": 5, "B": 10 },
                "lambda": { "A": 0.17, "B": 0.23 },
                "s": { "A": 2.55, "B": 3.25 },
                "mu": 0.30
              }
            ]
          },

          {
            "id": "V-25",
            "name": "Kvarsli qum asosida g‘ovakli keramzit-beton",
            "variants": [
              {
                "density": 1200,
                "S0": 0.84,
                "lambda_0": 0.41,
                "w": { "A": 4, "B": 8 },
                "lambda": { "A": 0.52, "B": 0.58 },
                "s": { "A": 6.77, "B": 7.72 },
                "mu": 0.075
              },
              {
                "density": 1000,
                "S0": 0.84,
                "lambda_0": 0.33,
                "w": { "A": 4, "B": 8 },
                "lambda": { "A": 0.41, "B": 0.47 },
                "s": { "A": 5.49, "B": 6.35 },
                "mu": 0.075
              },
              {
                "density": 800,
                "S0": 0.84,
                "lambda_0": 0.23,
                "w": { "A": 4, "B": 8 },
                "lambda": { "A": 0.29, "B": 0.35 },
                "s": { "A": 4.13, "B": 4.90 },
                "mu": 0.075
              }
            ]
          },

          {
            "id": "V-28",
            "name": "Perlit qumli keramzit-beton",
            "variants": [
              {
                "density": 1000,
                "S0": 0.84,
                "lambda_0": 0.28,
                "w": { "A": 9, "B": 13 },
                "lambda": { "A": 0.35, "B": 0.41 },
                "s": { "A": 5.57, "B": 6.43 },
                "mu": 0.15
              },
              {
                "density": 800,
                "S0": 0.84,
                "lambda_0": 0.22,
                "w": { "A": 9, "B": 13 },
                "lambda": { "A": 0.29, "B": 0.35 },
                "s": { "A": 4.54, "B": 5.32 },
                "mu": 0.17
              }
            ]
          }
        ]
      },
      {
        "class_id": "G",
        "class_name": "Yacheykali betonlar",
        "materials": [

          {
            "id": "G-63",
            "name": "G‘ovak- va penobeton, g‘ovak- va penosilikat",
            "variants": [
              {
                "density": 1000,
                "S0": 0.84,
                "lambda_0": 0.29,
                "w": { "A": 10, "B": 15 },
                "lambda": { "A": 0.41, "B": 0.47 },
                "s": { "A": 6.77, "B": 7.53 },
                "mu": 0.11
              },
              {
                "density": 800,
                "S0": 0.84,
                "lambda_0": 0.21,
                "w": { "A": 10, "B": 15 },
                "lambda": { "A": 0.33, "B": 0.37 },
                "s": { "A": 5.08, "B": 5.73 },
                "mu": 0.14
              },
              {
                "density": 600,
                "S0": 0.84,
                "lambda_0": 0.14,
                "w": { "A": 10, "B": 15 },
                "lambda": { "A": 0.22, "B": 0.26 },
                "s": { "A": 3.36, "B": 3.91 },
                "mu": 0.18
              }
            ]
          },

          {
            "id": "G-67",
            "name": "G‘ovak-beton va kulli penobeton",
            "variants": [
              {
                "density": 1200,
                "S0": 0.84,
                "lambda_0": 0.29,
                "w": { "A": 15, "B": 20 },
                "lambda": { "A": 0.52, "B": 0.58 },
                "s": { "A": 6.49, "B": 7.2 },
                "mu": 0.075
              },
              {
                "density": 1000,
                "S0": 0.84,
                "lambda_0": 0.23,
                "w": { "A": 15, "B": 20 },
                "lambda": { "A": 0.44, "B": 0.50 },
                "s": { "A": 5.29, "B": 5.88 },
                "mu": 0.09
              }
            ]
          },
        ]
      },
      {
        "class_id": "D",
        "class_name": "Sement, ohak va gipsli qorishmalar",
        "materials": [
          {
            "id": "D-74",
            "name": "Sement-qumli",
            "variants": [
              {
                "density": 1800,
                "S0": 0.84,
                "lambda_0": 0.58,
                "w": { "A": 2, "B": 4 },
                "lambda": { "A": 0.76, "B": 0.93 },
                "s": { "A": 9.6, "B": 11.09 },
                "mu": 0.09
              }
            ]
          },

          {
            "id": "D-75",
            "name": "Murakkab (qum, ohak, sement)",
            "variants": [
              {
                "density": 1700,
                "S0": 0.84,
                "lambda_0": 0.52,
                "w": { "A": 2, "B": 4 },
                "lambda": { "A": 0.70, "B": 0.87 },
                "s": { "A": 8.95, "B": 10.42 },
                "mu": 0.098
              }
            ]
          },

          {
            "id": "D-76",
            "name": "Ohak-qumli",
            "variants": [
              {
                "density": 1600,
                "S0": 0.84,
                "lambda_0": 0.47,
                "w": { "A": 2, "B": 4 },
                "lambda": { "A": 0.70, "B": 0.81 },
                "s": { "A": 8.69, "B": 9.76 },
                "mu": 0.12
              }
            ]
          },

          {
            "id": "D-77",
            "name": "Sement-shlakli",
            "variants": [
              {
                "density": 1400,
                "S0": 0.84,
                "lambda_0": 0.41,
                "w": { "A": 2, "B": 4 },
                "lambda": { "A": 0.52, "B": 0.64 },
                "s": { "A": 7.87, "B": 8.11 },
                "mu": 0.11
              },
              {
                "density": 1200,
                "S0": 0.84,
                "lambda_0": 0.35,
                "w": { "A": 2, "B": 4 },
                "lambda": { "A": 0.47, "B": 0.58 },
                "s": { "A": 6.16, "B": 7.15 },
                "mu": 0.14
              }
            ]
          },

          {
            "id": "D-79",
            "name": "Sement-perlitli",
            "variants": [
              {
                "density": 1000,
                "S0": 0.84,
                "lambda_0": 0.21,
                "w": { "A": 7, "B": 12 },
                "lambda": { "A": 0.26, "B": 0.34 },
                "s": { "A": 4.64, "B": 5.42 },
                "mu": 0.15
              },
              {
                "density": 800,
                "S0": 0.84,
                "lambda_0": 0.16,
                "w": { "A": 7, "B": 12 },
                "lambda": { "A": 0.21, "B": 0.26 },
                "s": { "A": 3.73, "B": 4.51 },
                "mu": 0.16
              }
            ]
          },

          {
            "id": "D-81",
            "name": "Gips-perlitli",
            "variants": [
              {
                "density": 600,
                "S0": 0.84,
                "lambda_0": 0.14,
                "w": { "A": 10, "B": 15 },
                "lambda": { "A": 0.19, "B": 0.23 },
                "s": { "A": 3.24, "B": 3.84 },
                "mu": 0.17
              }
            ]
          },

          {
            "id": "D-82",
            "name": "G‘ovaklangan gips-perlitli",
            "variants": [
              {
                "density": 500,
                "S0": 0.84,
                "lambda_0": 0.12,
                "w": { "A": 6, "B": 10 },
                "lambda": { "A": 0.15, "B": 0.19 },
                "s": { "A": 2.44, "B": 2.95 },
                "mu": 0.43
              },
              {
                "density": 400,
                "S0": 0.84,
                "lambda_0": 0.09,
                "w": { "A": 6, "B": 10 },
                "lambda": { "A": 0.13, "B": 0.15 },
                "s": { "A": 2.03, "B": 2.35 },
                "mu": 0.53
              }
            ]
          },

          {
            "id": "D-84",
            "name": "Gipsdan plitalar",
            "variants": [
              {
                "density": 1200,
                "S0": 0.84,
                "lambda_0": 0.35,
                "w": { "A": 4, "B": 6 },
                "lambda": { "A": 0.41, "B": 0.47 },
                "s": { "A": 6.01, "B": 6.70 },
                "mu": 0.098
              },
              {
                "density": 1000,
                "S0": 0.84,
                "lambda_0": 0.23,
                "w": { "A": 4, "B": 6 },
                "lambda": { "A": 0.29, "B": 0.35 },
                "s": { "A": 4.62, "B": 5.28 },
                "mu": 0.11
              }
            ]
          },

          {
            "id": "D-86",
            "name": "Gipsli qoplama listlar (quruq suvoq)",
            "variants": [
              {
                "density": 800,
                "S0": 0.84,
                "lambda_0": 0.15,
                "w": { "A": 4, "B": 6 },
                "lambda": { "A": 0.19, "B": 0.21 },
                "s": { "A": 3.34, "B": 3.66 },
                "mu": 0.075
              }
            ]
          }

        ]
      }
    ]
  }



];
