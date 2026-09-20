/**
 * PRE-COMPUTED ACCURATE HISTORICAL CHAMPIONSHIP TIMELINES
 * Provides verified, non-decreasing cumulative points progression for completed seasons.
 * Prevents client-side rate-limits (429), dropped endpoints, and cancelled race glitches.
 */

import { SeasonTimeline } from './championshipChart';

export const HISTORICAL_TIMELINES: Record<string, SeasonTimeline> = {
  "2026": {
  "season": "2026",
  "rounds": [
    {
      "round": 1,
      "raceName": "Australian GP",
      "circuitId": "albert_park",
      "driverPoints": {
        "antonelli": 18,
        "russell": 25,
        "hamilton": 12,
        "norris": 10,
        "leclerc": 15,
        "max_verstappen": 8,
        "piastri": 0,
        "hadjar": 0
      }
    },
    {
      "round": 2,
      "raceName": "Chinese GP",
      "circuitId": "shanghai",
      "driverPoints": {
        "antonelli": 47,
        "russell": 51,
        "hamilton": 33,
        "norris": 15,
        "leclerc": 34,
        "max_verstappen": 8,
        "piastri": 3,
        "hadjar": 4
      }
    },
    {
      "round": 3,
      "raceName": "Japanese GP",
      "circuitId": "suzuka",
      "driverPoints": {
        "antonelli": 72,
        "russell": 63,
        "hamilton": 41,
        "norris": 25,
        "leclerc": 49,
        "max_verstappen": 12,
        "piastri": 21,
        "hadjar": 4
      }
    },
    {
      "round": 4,
      "raceName": "Miami GP",
      "circuitId": "miami",
      "driverPoints": {
        "antonelli": 100,
        "russell": 80,
        "hamilton": 51,
        "norris": 51,
        "leclerc": 59,
        "max_verstappen": 26,
        "piastri": 43,
        "hadjar": 4
      }
    },
    {
      "round": 5,
      "raceName": "Canadian GP",
      "circuitId": "villeneuve",
      "driverPoints": {
        "antonelli": 131,
        "russell": 88,
        "hamilton": 72,
        "norris": 58,
        "leclerc": 75,
        "max_verstappen": 43,
        "piastri": 48,
        "hadjar": 14
      }
    },
    {
      "round": 6,
      "raceName": "Monaco GP",
      "circuitId": "monaco",
      "driverPoints": {
        "antonelli": 156,
        "russell": 88,
        "hamilton": 90,
        "norris": 58,
        "leclerc": 75,
        "max_verstappen": 43,
        "piastri": 60,
        "hadjar": 29
      }
    },
    {
      "round": 7,
      "raceName": "Barcelona GP",
      "circuitId": "catalunya",
      "driverPoints": {
        "antonelli": 156,
        "russell": 106,
        "hamilton": 115,
        "norris": 73,
        "leclerc": 75,
        "max_verstappen": 55,
        "piastri": 70,
        "hadjar": 37
      }
    },
    {
      "round": 8,
      "raceName": "Austrian GP",
      "circuitId": "red_bull_ring",
      "driverPoints": {
        "antonelli": 171,
        "russell": 131,
        "hamilton": 125,
        "norris": 79,
        "leclerc": 79,
        "max_verstappen": 73,
        "piastri": 82,
        "hadjar": 45
      }
    },
    {
      "round": 9,
      "raceName": "British GP",
      "circuitId": "silverstone",
      "driverPoints": {
        "antonelli": 179,
        "russell": 154,
        "hamilton": 147,
        "norris": 97,
        "leclerc": 108,
        "max_verstappen": 76,
        "piastri": 84,
        "hadjar": 55
      }
    },
    {
      "round": 10,
      "raceName": "Belgian GP",
      "circuitId": "spa",
      "driverPoints": {
        "antonelli": 204,
        "russell": 154,
        "hamilton": 159,
        "norris": 103,
        "leclerc": 126,
        "max_verstappen": 91,
        "piastri": 94,
        "hadjar": 63
      }
    },
    {
      "round": 11,
      "raceName": "Hungarian GP",
      "circuitId": "hungaroring",
      "driverPoints": {
        "antonelli": 219,
        "russell": 160,
        "hamilton": 169,
        "norris": 128,
        "leclerc": 138,
        "max_verstappen": 109,
        "piastri": 94,
        "hadjar": 71
      }
    },
    {
      "round": 12,
      "raceName": "Dutch GP",
      "circuitId": "zandvoort",
      "driverPoints": {
        "antonelli": 242,
        "russell": 183,
        "hamilton": 183,
        "norris": 159,
        "leclerc": 155,
        "max_verstappen": 112,
        "piastri": 106,
        "hadjar": 71
      }
    },
    {
      "round": 13,
      "raceName": "Italian GP",
      "circuitId": "monza",
      "driverPoints": {
        "antonelli": 267,
        "russell": 201,
        "hamilton": 191,
        "norris": 171,
        "leclerc": 155,
        "max_verstappen": 127,
        "piastri": 116,
        "hadjar": 71
      }
    },
    {
      "round": 14,
      "raceName": "Spanish GP",
      "circuitId": "madring",
      "driverPoints": {
        "antonelli": 292,
        "russell": 211,
        "hamilton": 191,
        "norris": 186,
        "leclerc": 167,
        "max_verstappen": 145,
        "piastri": 120,
        "hadjar": 71
      }
    }
  ],
  "driverIds": [
    "antonelli",
    "russell",
    "hamilton",
    "norris",
    "leclerc",
    "max_verstappen",
    "piastri",
    "hadjar"
  ],
  "driverNames": {
    "antonelli": "Andrea Kimi Antonelli",
    "russell": "George Russell",
    "hamilton": "Lewis Hamilton",
    "norris": "Lando Norris",
    "leclerc": "Charles Leclerc",
    "max_verstappen": "Max Verstappen",
    "piastri": "Oscar Piastri",
    "hadjar": "Isack Hadjar"
  },
  "driverCodes": {
    "antonelli": "ANT",
    "russell": "RUS",
    "hamilton": "HAM",
    "norris": "NOR",
    "leclerc": "LEC",
    "max_verstappen": "VER",
    "piastri": "PIA",
    "hadjar": "HAD"
  },
  "constructorColors": {
    "antonelli": "#27F4D2",
    "russell": "#27F4D2",
    "hamilton": "#E8002D",
    "leclerc": "#E8002D",
    "norris": "#FF8000",
    "piastri": "#FF8000",
    "max_verstappen": "#3671C6",
    "hadjar": "#3671C6"
  }
},
  "2020": {
    "season": "2020",
    "rounds": [
      {
        "round": 1,
        "raceName": "Austrian GP",
        "circuitId": "red_bull_ring",
        "driverPoints": {
          "hamilton": 12,
          "bottas": 25,
          "max_verstappen": 0,
          "perez": 8,
          "ricciardo": 0,
          "sainz": 10,
          "albon": 0,
          "leclerc": 18
        }
      },
      {
        "round": 2,
        "raceName": "Styrian GP",
        "circuitId": "red_bull_ring",
        "driverPoints": {
          "hamilton": 37,
          "bottas": 43,
          "max_verstappen": 15,
          "perez": 16,
          "ricciardo": 4,
          "sainz": 13,
          "albon": 12,
          "leclerc": 18
        }
      },
      {
        "round": 3,
        "raceName": "Hungarian GP",
        "circuitId": "hungaroring",
        "driverPoints": {
          "hamilton": 63,
          "bottas": 58,
          "max_verstappen": 33,
          "perez": 22,
          "ricciardo": 8,
          "sainz": 15,
          "albon": 22,
          "leclerc": 18
        }
      },
      {
        "round": 4,
        "raceName": "British GP",
        "circuitId": "silverstone",
        "driverPoints": {
          "hamilton": 88,
          "bottas": 58,
          "max_verstappen": 52,
          "perez": 22,
          "ricciardo": 20,
          "sainz": 15,
          "albon": 26,
          "leclerc": 33
        }
      },
      {
        "round": 5,
        "raceName": "70th Anniversary GP",
        "circuitId": "silverstone",
        "driverPoints": {
          "hamilton": 107,
          "bottas": 73,
          "max_verstappen": 77,
          "perez": 22,
          "ricciardo": 20,
          "sainz": 15,
          "albon": 36,
          "leclerc": 45
        }
      },
      {
        "round": 6,
        "raceName": "Spanish GP",
        "circuitId": "catalunya",
        "driverPoints": {
          "hamilton": 132,
          "bottas": 89,
          "max_verstappen": 95,
          "perez": 32,
          "ricciardo": 20,
          "sainz": 23,
          "albon": 40,
          "leclerc": 45
        }
      },
      {
        "round": 7,
        "raceName": "Belgian GP",
        "circuitId": "spa",
        "driverPoints": {
          "hamilton": 157,
          "bottas": 107,
          "max_verstappen": 110,
          "perez": 33,
          "ricciardo": 33,
          "sainz": 23,
          "albon": 48,
          "leclerc": 45
        }
      },
      {
        "round": 8,
        "raceName": "Italian GP",
        "circuitId": "monza",
        "driverPoints": {
          "hamilton": 164,
          "bottas": 117,
          "max_verstappen": 110,
          "perez": 34,
          "ricciardo": 41,
          "sainz": 41,
          "albon": 48,
          "leclerc": 45
        }
      },
      {
        "round": 9,
        "raceName": "Tuscan GP",
        "circuitId": "mugello",
        "driverPoints": {
          "hamilton": 190,
          "bottas": 135,
          "max_verstappen": 110,
          "perez": 44,
          "ricciardo": 53,
          "sainz": 41,
          "albon": 63,
          "leclerc": 49
        }
      },
      {
        "round": 10,
        "raceName": "Russian GP",
        "circuitId": "sochi",
        "driverPoints": {
          "hamilton": 205,
          "bottas": 161,
          "max_verstappen": 128,
          "perez": 56,
          "ricciardo": 63,
          "sainz": 41,
          "albon": 64,
          "leclerc": 57
        }
      },
      {
        "round": 11,
        "raceName": "Eifel GP",
        "circuitId": "nurburgring",
        "driverPoints": {
          "hamilton": 230,
          "bottas": 161,
          "max_verstappen": 147,
          "perez": 68,
          "ricciardo": 78,
          "sainz": 51,
          "albon": 64,
          "leclerc": 63
        }
      },
      {
        "round": 12,
        "raceName": "Portuguese GP",
        "circuitId": "portimao",
        "driverPoints": {
          "hamilton": 256,
          "bottas": 179,
          "max_verstappen": 162,
          "perez": 74,
          "ricciardo": 80,
          "sainz": 59,
          "albon": 64,
          "leclerc": 75
        }
      },
      {
        "round": 13,
        "raceName": "Emilia Romagna GP",
        "circuitId": "imola",
        "driverPoints": {
          "hamilton": 282,
          "bottas": 197,
          "max_verstappen": 162,
          "perez": 82,
          "ricciardo": 95,
          "sainz": 65,
          "albon": 64,
          "leclerc": 85
        }
      },
      {
        "round": 14,
        "raceName": "Turkish GP",
        "circuitId": "istanbul",
        "driverPoints": {
          "hamilton": 307,
          "bottas": 197,
          "max_verstappen": 170,
          "perez": 100,
          "ricciardo": 96,
          "sainz": 75,
          "albon": 70,
          "leclerc": 97
        }
      },
      {
        "round": 15,
        "raceName": "Bahrain GP",
        "circuitId": "bahrain",
        "driverPoints": {
          "hamilton": 332,
          "bottas": 201,
          "max_verstappen": 189,
          "perez": 100,
          "ricciardo": 102,
          "sainz": 85,
          "albon": 85,
          "leclerc": 98
        }
      },
      {
        "round": 16,
        "raceName": "Sakhir GP",
        "circuitId": "bahrain",
        "driverPoints": {
          "hamilton": 332,
          "bottas": 205,
          "max_verstappen": 189,
          "perez": 125,
          "ricciardo": 112,
          "sainz": 97,
          "albon": 93,
          "leclerc": 98
        }
      },
      {
        "round": 17,
        "raceName": "Abu Dhabi GP",
        "circuitId": "yas_marina",
        "driverPoints": {
          "hamilton": 347,
          "bottas": 223,
          "max_verstappen": 214,
          "perez": 125,
          "ricciardo": 119,
          "sainz": 105,
          "albon": 105,
          "leclerc": 98
        }
      }
    ],
    "driverIds": [
      "hamilton",
      "bottas",
      "max_verstappen",
      "perez",
      "ricciardo",
      "sainz",
      "albon",
      "leclerc"
    ],
    "driverNames": {
      "hamilton": "Lewis Hamilton",
      "bottas": "Valtteri Bottas",
      "max_verstappen": "Max Verstappen",
      "perez": "Sergio Pérez",
      "ricciardo": "Daniel Ricciardo",
      "sainz": "Carlos Sainz",
      "albon": "Alexander Albon",
      "leclerc": "Charles Leclerc"
    },
    "driverCodes": {
      "hamilton": "HAM",
      "bottas": "BOT",
      "max_verstappen": "VER",
      "perez": "PER",
      "ricciardo": "RIC",
      "sainz": "SAI",
      "albon": "ALB",
      "leclerc": "LEC"
    },
    "constructorColors": {
      "hamilton": "#27F4D2",
      "bottas": "#27F4D2",
      "max_verstappen": "#3671C6",
      "perez": "#F596C8",
      "ricciardo": "#FFF500",
      "sainz": "#FF8000",
      "albon": "#3671C6",
      "leclerc": "#E8002D"
    }
  },
  "2021": {
    "season": "2021",
    "rounds": [
      {
        "round": 1,
        "raceName": "Bahrain GP",
        "circuitId": "bahrain",
        "driverPoints": {
          "max_verstappen": 18,
          "hamilton": 25,
          "bottas": 16,
          "perez": 10,
          "sainz": 4,
          "norris": 12,
          "leclerc": 8,
          "ricciardo": 6
        }
      },
      {
        "round": 2,
        "raceName": "Emilia Romagna GP",
        "circuitId": "imola",
        "driverPoints": {
          "max_verstappen": 43,
          "hamilton": 44,
          "bottas": 16,
          "perez": 10,
          "sainz": 14,
          "norris": 27,
          "leclerc": 20,
          "ricciardo": 14
        }
      },
      {
        "round": 3,
        "raceName": "Portuguese GP",
        "circuitId": "portimao",
        "driverPoints": {
          "max_verstappen": 61,
          "hamilton": 69,
          "bottas": 32,
          "perez": 22,
          "sainz": 14,
          "norris": 37,
          "leclerc": 28,
          "ricciardo": 16
        }
      },
      {
        "round": 4,
        "raceName": "Spanish GP",
        "circuitId": "catalunya",
        "driverPoints": {
          "max_verstappen": 80,
          "hamilton": 94,
          "bottas": 47,
          "perez": 32,
          "sainz": 20,
          "norris": 41,
          "leclerc": 40,
          "ricciardo": 24
        }
      },
      {
        "round": 5,
        "raceName": "Monaco GP",
        "circuitId": "monaco",
        "driverPoints": {
          "max_verstappen": 105,
          "hamilton": 101,
          "bottas": 47,
          "perez": 44,
          "sainz": 38,
          "norris": 56,
          "leclerc": 40,
          "ricciardo": 24
        }
      },
      {
        "round": 6,
        "raceName": "Azerbaijan GP",
        "circuitId": "baku",
        "driverPoints": {
          "max_verstappen": 105,
          "hamilton": 101,
          "bottas": 47,
          "perez": 69,
          "sainz": 42,
          "norris": 66,
          "leclerc": 52,
          "ricciardo": 26
        }
      },
      {
        "round": 7,
        "raceName": "French GP",
        "circuitId": "ricard",
        "driverPoints": {
          "max_verstappen": 131,
          "hamilton": 119,
          "bottas": 59,
          "perez": 84,
          "sainz": 42,
          "norris": 76,
          "leclerc": 52,
          "ricciardo": 34
        }
      },
      {
        "round": 8,
        "raceName": "Styrian GP",
        "circuitId": "red_bull_ring",
        "driverPoints": {
          "max_verstappen": 156,
          "hamilton": 138,
          "bottas": 74,
          "perez": 96,
          "sainz": 50,
          "norris": 86,
          "leclerc": 58,
          "ricciardo": 34
        }
      },
      {
        "round": 9,
        "raceName": "Austrian GP",
        "circuitId": "red_bull_ring",
        "driverPoints": {
          "max_verstappen": 182,
          "hamilton": 150,
          "bottas": 92,
          "perez": 104,
          "sainz": 60,
          "norris": 101,
          "leclerc": 62,
          "ricciardo": 40
        }
      },
      {
        "round": 10,
        "raceName": "British GP",
        "circuitId": "silverstone",
        "driverPoints": {
          "max_verstappen": 185,
          "hamilton": 177,
          "bottas": 108,
          "perez": 104,
          "sainz": 68,
          "norris": 113,
          "leclerc": 80,
          "ricciardo": 50
        }
      },
      {
        "round": 11,
        "raceName": "Hungarian GP",
        "circuitId": "hungaroring",
        "driverPoints": {
          "max_verstappen": 187,
          "hamilton": 195,
          "bottas": 108,
          "perez": 104,
          "sainz": 83,
          "norris": 113,
          "leclerc": 80,
          "ricciardo": 50
        }
      },
      {
        "round": 12,
        "raceName": "Belgian GP",
        "circuitId": "spa",
        "driverPoints": {
          "max_verstappen": 199.5,
          "hamilton": 202.5,
          "bottas": 108,
          "perez": 104,
          "sainz": 83.5,
          "norris": 113,
          "leclerc": 82,
          "ricciardo": 56
        }
      },
      {
        "round": 13,
        "raceName": "Dutch GP",
        "circuitId": "zandvoort",
        "driverPoints": {
          "max_verstappen": 224.5,
          "hamilton": 221.5,
          "bottas": 123,
          "perez": 108,
          "sainz": 89.5,
          "norris": 114,
          "leclerc": 92,
          "ricciardo": 56
        }
      },
      {
        "round": 14,
        "raceName": "Italian GP",
        "circuitId": "monza",
        "driverPoints": {
          "max_verstappen": 226.5,
          "hamilton": 221.5,
          "bottas": 141,
          "perez": 118,
          "sainz": 97.5,
          "norris": 132,
          "leclerc": 104,
          "ricciardo": 83
        }
      },
      {
        "round": 15,
        "raceName": "Russian GP",
        "circuitId": "sochi",
        "driverPoints": {
          "max_verstappen": 244.5,
          "hamilton": 246.5,
          "bottas": 151,
          "perez": 120,
          "sainz": 112.5,
          "norris": 139,
          "leclerc": 104,
          "ricciardo": 95
        }
      },
      {
        "round": 16,
        "raceName": "Turkish GP",
        "circuitId": "istanbul",
        "driverPoints": {
          "max_verstappen": 262.5,
          "hamilton": 256.5,
          "bottas": 177,
          "perez": 135,
          "sainz": 116.5,
          "norris": 145,
          "leclerc": 116,
          "ricciardo": 95
        }
      },
      {
        "round": 17,
        "raceName": "United States GP",
        "circuitId": "americas",
        "driverPoints": {
          "max_verstappen": 287.5,
          "hamilton": 275.5,
          "bottas": 185,
          "perez": 150,
          "sainz": 122.5,
          "norris": 149,
          "leclerc": 128,
          "ricciardo": 105
        }
      },
      {
        "round": 18,
        "raceName": "Mexico City GP",
        "circuitId": "rodriguez",
        "driverPoints": {
          "max_verstappen": 312.5,
          "hamilton": 293.5,
          "bottas": 185,
          "perez": 165,
          "sainz": 130.5,
          "norris": 150,
          "leclerc": 138,
          "ricciardo": 105
        }
      },
      {
        "round": 19,
        "raceName": "São Paulo GP",
        "circuitId": "interlagos",
        "driverPoints": {
          "max_verstappen": 332.5,
          "hamilton": 318.5,
          "bottas": 203,
          "perez": 178,
          "sainz": 139.5,
          "norris": 151,
          "leclerc": 148,
          "ricciardo": 105
        }
      },
      {
        "round": 20,
        "raceName": "Qatar GP",
        "circuitId": "losail",
        "driverPoints": {
          "max_verstappen": 351.5,
          "hamilton": 343.5,
          "bottas": 203,
          "perez": 190,
          "sainz": 145.5,
          "norris": 153,
          "leclerc": 152,
          "ricciardo": 105
        }
      },
      {
        "round": 21,
        "raceName": "Saudi Arabian GP",
        "circuitId": "jeddah",
        "driverPoints": {
          "max_verstappen": 369.5,
          "hamilton": 369.5,
          "bottas": 218,
          "perez": 190,
          "sainz": 149.5,
          "norris": 154,
          "leclerc": 158,
          "ricciardo": 115
        }
      },
      {
        "round": 22,
        "raceName": "Abu Dhabi GP",
        "circuitId": "yas_marina",
        "driverPoints": {
          "max_verstappen": 395.5,
          "hamilton": 387.5,
          "bottas": 226,
          "perez": 190,
          "sainz": 164.5,
          "norris": 160,
          "leclerc": 159,
          "ricciardo": 115
        }
      }
    ],
    "driverIds": [
      "max_verstappen",
      "hamilton",
      "bottas",
      "perez",
      "sainz",
      "norris",
      "leclerc",
      "ricciardo"
    ],
    "driverNames": {
      "max_verstappen": "Max Verstappen",
      "hamilton": "Lewis Hamilton",
      "bottas": "Valtteri Bottas",
      "perez": "Sergio Pérez",
      "sainz": "Carlos Sainz",
      "norris": "Lando Norris",
      "leclerc": "Charles Leclerc",
      "ricciardo": "Daniel Ricciardo"
    },
    "driverCodes": {
      "max_verstappen": "VER",
      "hamilton": "HAM",
      "bottas": "BOT",
      "perez": "PER",
      "sainz": "SAI",
      "norris": "NOR",
      "leclerc": "LEC",
      "ricciardo": "RIC"
    },
    "constructorColors": {
      "max_verstappen": "#3671C6",
      "hamilton": "#27F4D2",
      "bottas": "#27F4D2",
      "perez": "#3671C6",
      "sainz": "#E8002D",
      "norris": "#FF8000",
      "leclerc": "#E8002D",
      "ricciardo": "#FF8000"
    }
  },
  "2022": {
    "season": "2022",
    "rounds": [
      {
        "round": 1,
        "raceName": "Bahrain GP",
        "circuitId": "bahrain",
        "driverPoints": {
          "max_verstappen": 0,
          "leclerc": 26,
          "perez": 0,
          "russell": 12,
          "sainz": 18,
          "hamilton": 15,
          "norris": 0,
          "ocon": 6
        }
      },
      {
        "round": 2,
        "raceName": "Saudi Arabian GP",
        "circuitId": "jeddah",
        "driverPoints": {
          "max_verstappen": 25,
          "leclerc": 45,
          "perez": 12,
          "russell": 22,
          "sainz": 33,
          "hamilton": 16,
          "norris": 6,
          "ocon": 14
        }
      },
      {
        "round": 3,
        "raceName": "Australian GP",
        "circuitId": "albert_park",
        "driverPoints": {
          "max_verstappen": 25,
          "leclerc": 71,
          "perez": 30,
          "russell": 37,
          "sainz": 33,
          "hamilton": 28,
          "norris": 16,
          "ocon": 20
        }
      },
      {
        "round": 4,
        "raceName": "Emilia Romagna GP",
        "circuitId": "imola",
        "driverPoints": {
          "max_verstappen": 59,
          "leclerc": 86,
          "perez": 54,
          "russell": 49,
          "sainz": 38,
          "hamilton": 28,
          "norris": 35,
          "ocon": 20
        }
      },
      {
        "round": 5,
        "raceName": "Miami GP",
        "circuitId": "miami",
        "driverPoints": {
          "max_verstappen": 85,
          "leclerc": 104,
          "perez": 66,
          "russell": 59,
          "sainz": 53,
          "hamilton": 36,
          "norris": 35,
          "ocon": 24
        }
      },
      {
        "round": 6,
        "raceName": "Spanish GP",
        "circuitId": "catalunya",
        "driverPoints": {
          "max_verstappen": 110,
          "leclerc": 104,
          "perez": 85,
          "russell": 74,
          "sainz": 65,
          "hamilton": 46,
          "norris": 39,
          "ocon": 30
        }
      },
      {
        "round": 7,
        "raceName": "Monaco GP",
        "circuitId": "monaco",
        "driverPoints": {
          "max_verstappen": 125,
          "leclerc": 116,
          "perez": 110,
          "russell": 84,
          "sainz": 83,
          "hamilton": 50,
          "norris": 48,
          "ocon": 30
        }
      },
      {
        "round": 8,
        "raceName": "Azerbaijan GP",
        "circuitId": "baku",
        "driverPoints": {
          "max_verstappen": 150,
          "leclerc": 116,
          "perez": 129,
          "russell": 99,
          "sainz": 83,
          "hamilton": 62,
          "norris": 50,
          "ocon": 31
        }
      },
      {
        "round": 9,
        "raceName": "Canadian GP",
        "circuitId": "villeneuve",
        "driverPoints": {
          "max_verstappen": 175,
          "leclerc": 126,
          "perez": 129,
          "russell": 111,
          "sainz": 102,
          "hamilton": 77,
          "norris": 50,
          "ocon": 39
        }
      },
      {
        "round": 10,
        "raceName": "British GP",
        "circuitId": "silverstone",
        "driverPoints": {
          "max_verstappen": 181,
          "leclerc": 138,
          "perez": 147,
          "russell": 111,
          "sainz": 127,
          "hamilton": 93,
          "norris": 58,
          "ocon": 39
        }
      },
      {
        "round": 11,
        "raceName": "Austrian GP",
        "circuitId": "red_bull_ring",
        "driverPoints": {
          "max_verstappen": 208,
          "leclerc": 170,
          "perez": 151,
          "russell": 128,
          "sainz": 133,
          "hamilton": 109,
          "norris": 64,
          "ocon": 52
        }
      },
      {
        "round": 12,
        "raceName": "French GP",
        "circuitId": "ricard",
        "driverPoints": {
          "max_verstappen": 233,
          "leclerc": 170,
          "perez": 163,
          "russell": 143,
          "sainz": 144,
          "hamilton": 127,
          "norris": 70,
          "ocon": 56
        }
      },
      {
        "round": 13,
        "raceName": "Hungarian GP",
        "circuitId": "hungaroring",
        "driverPoints": {
          "max_verstappen": 258,
          "leclerc": 178,
          "perez": 173,
          "russell": 158,
          "sainz": 156,
          "hamilton": 146,
          "norris": 76,
          "ocon": 58
        }
      },
      {
        "round": 14,
        "raceName": "Belgian GP",
        "circuitId": "spa",
        "driverPoints": {
          "max_verstappen": 284,
          "leclerc": 186,
          "perez": 191,
          "russell": 170,
          "sainz": 171,
          "hamilton": 146,
          "norris": 76,
          "ocon": 64
        }
      },
      {
        "round": 15,
        "raceName": "Dutch GP",
        "circuitId": "zandvoort",
        "driverPoints": {
          "max_verstappen": 310,
          "leclerc": 201,
          "perez": 201,
          "russell": 188,
          "sainz": 175,
          "hamilton": 158,
          "norris": 82,
          "ocon": 66
        }
      },
      {
        "round": 16,
        "raceName": "Italian GP",
        "circuitId": "monza",
        "driverPoints": {
          "max_verstappen": 335,
          "leclerc": 219,
          "perez": 210,
          "russell": 203,
          "sainz": 187,
          "hamilton": 168,
          "norris": 88,
          "ocon": 66
        }
      },
      {
        "round": 17,
        "raceName": "Singapore GP",
        "circuitId": "marina_bay",
        "driverPoints": {
          "max_verstappen": 341,
          "leclerc": 237,
          "perez": 235,
          "russell": 203,
          "sainz": 202,
          "hamilton": 170,
          "norris": 100,
          "ocon": 66
        }
      },
      {
        "round": 18,
        "raceName": "Japanese GP",
        "circuitId": "suzuka",
        "driverPoints": {
          "max_verstappen": 366,
          "leclerc": 252,
          "perez": 253,
          "russell": 207,
          "sainz": 202,
          "hamilton": 180,
          "norris": 101,
          "ocon": 78
        }
      },
      {
        "round": 19,
        "raceName": "United States GP",
        "circuitId": "americas",
        "driverPoints": {
          "max_verstappen": 391,
          "leclerc": 267,
          "perez": 265,
          "russell": 218,
          "sainz": 202,
          "hamilton": 198,
          "norris": 109,
          "ocon": 78
        }
      },
      {
        "round": 20,
        "raceName": "Mexico City GP",
        "circuitId": "rodriguez",
        "driverPoints": {
          "max_verstappen": 416,
          "leclerc": 275,
          "perez": 280,
          "russell": 231,
          "sainz": 212,
          "hamilton": 216,
          "norris": 111,
          "ocon": 82
        }
      },
      {
        "round": 21,
        "raceName": "São Paulo GP",
        "circuitId": "interlagos",
        "driverPoints": {
          "max_verstappen": 429,
          "leclerc": 290,
          "perez": 290,
          "russell": 265,
          "sainz": 234,
          "hamilton": 240,
          "norris": 113,
          "ocon": 86
        }
      },
      {
        "round": 22,
        "raceName": "Abu Dhabi GP",
        "circuitId": "yas_marina",
        "driverPoints": {
          "max_verstappen": 454,
          "leclerc": 308,
          "perez": 305,
          "russell": 275,
          "sainz": 246,
          "hamilton": 240,
          "norris": 122,
          "ocon": 92
        }
      }
    ],
    "driverIds": [
      "max_verstappen",
      "leclerc",
      "perez",
      "russell",
      "sainz",
      "hamilton",
      "norris",
      "ocon"
    ],
    "driverNames": {
      "max_verstappen": "Max Verstappen",
      "leclerc": "Charles Leclerc",
      "perez": "Sergio Pérez",
      "russell": "George Russell",
      "sainz": "Carlos Sainz",
      "hamilton": "Lewis Hamilton",
      "norris": "Lando Norris",
      "ocon": "Esteban Ocon"
    },
    "driverCodes": {
      "max_verstappen": "VER",
      "leclerc": "LEC",
      "perez": "PER",
      "russell": "RUS",
      "sainz": "SAI",
      "hamilton": "HAM",
      "norris": "NOR",
      "ocon": "OCO"
    },
    "constructorColors": {
      "max_verstappen": "#3671C6",
      "leclerc": "#E8002D",
      "perez": "#3671C6",
      "russell": "#27F4D2",
      "sainz": "#E8002D",
      "hamilton": "#27F4D2",
      "norris": "#FF8000",
      "ocon": "#0093CC"
    }
  },
  "2023": {
    "season": "2023",
    "rounds": [
      {
        "round": 1,
        "raceName": "Bahrain GP",
        "circuitId": "bahrain",
        "driverPoints": {
          "max_verstappen": 25,
          "perez": 18,
          "hamilton": 10,
          "alonso": 15,
          "leclerc": 0,
          "norris": 0,
          "sainz": 12,
          "russell": 6
        }
      },
      {
        "round": 2,
        "raceName": "Saudi Arabian GP",
        "circuitId": "jeddah",
        "driverPoints": {
          "max_verstappen": 44,
          "perez": 43,
          "hamilton": 20,
          "alonso": 30,
          "leclerc": 6,
          "norris": 0,
          "sainz": 20,
          "russell": 18
        }
      },
      {
        "round": 3,
        "raceName": "Australian GP",
        "circuitId": "albert_park",
        "driverPoints": {
          "max_verstappen": 69,
          "perez": 54,
          "hamilton": 38,
          "alonso": 45,
          "leclerc": 6,
          "norris": 8,
          "sainz": 20,
          "russell": 18
        }
      },
      {
        "round": 4,
        "raceName": "Azerbaijan GP",
        "circuitId": "baku",
        "driverPoints": {
          "max_verstappen": 93,
          "perez": 87,
          "hamilton": 48,
          "alonso": 60,
          "leclerc": 28,
          "norris": 10,
          "sainz": 34,
          "russell": 28
        }
      },
      {
        "round": 5,
        "raceName": "Miami GP",
        "circuitId": "miami",
        "driverPoints": {
          "max_verstappen": 119,
          "perez": 105,
          "hamilton": 56,
          "alonso": 75,
          "leclerc": 34,
          "norris": 10,
          "sainz": 44,
          "russell": 40
        }
      },
      {
        "round": 6,
        "raceName": "Monaco GP",
        "circuitId": "monaco",
        "driverPoints": {
          "max_verstappen": 144,
          "perez": 105,
          "hamilton": 69,
          "alonso": 93,
          "leclerc": 42,
          "norris": 12,
          "sainz": 48,
          "russell": 50
        }
      },
      {
        "round": 7,
        "raceName": "Spanish GP",
        "circuitId": "catalunya",
        "driverPoints": {
          "max_verstappen": 170,
          "perez": 117,
          "hamilton": 87,
          "alonso": 99,
          "leclerc": 42,
          "norris": 12,
          "sainz": 58,
          "russell": 65
        }
      },
      {
        "round": 8,
        "raceName": "Canadian GP",
        "circuitId": "villeneuve",
        "driverPoints": {
          "max_verstappen": 195,
          "perez": 126,
          "hamilton": 102,
          "alonso": 117,
          "leclerc": 54,
          "norris": 12,
          "sainz": 68,
          "russell": 65
        }
      },
      {
        "round": 9,
        "raceName": "Austrian GP",
        "circuitId": "red_bull_ring",
        "driverPoints": {
          "max_verstappen": 229,
          "perez": 148,
          "hamilton": 106,
          "alonso": 131,
          "leclerc": 72,
          "norris": 24,
          "sainz": 82,
          "russell": 72
        }
      },
      {
        "round": 10,
        "raceName": "British GP",
        "circuitId": "silverstone",
        "driverPoints": {
          "max_verstappen": 255,
          "perez": 156,
          "hamilton": 121,
          "alonso": 137,
          "leclerc": 74,
          "norris": 42,
          "sainz": 83,
          "russell": 82
        }
      },
      {
        "round": 11,
        "raceName": "Hungarian GP",
        "circuitId": "hungaroring",
        "driverPoints": {
          "max_verstappen": 281,
          "perez": 171,
          "hamilton": 133,
          "alonso": 139,
          "leclerc": 80,
          "norris": 60,
          "sainz": 87,
          "russell": 90
        }
      },
      {
        "round": 12,
        "raceName": "Belgian GP",
        "circuitId": "spa",
        "driverPoints": {
          "max_verstappen": 314,
          "perez": 189,
          "hamilton": 148,
          "alonso": 149,
          "leclerc": 99,
          "norris": 69,
          "sainz": 92,
          "russell": 99
        }
      },
      {
        "round": 13,
        "raceName": "Dutch GP",
        "circuitId": "zandvoort",
        "driverPoints": {
          "max_verstappen": 339,
          "perez": 201,
          "hamilton": 156,
          "alonso": 168,
          "leclerc": 99,
          "norris": 75,
          "sainz": 102,
          "russell": 99
        }
      },
      {
        "round": 14,
        "raceName": "Italian GP",
        "circuitId": "monza",
        "driverPoints": {
          "max_verstappen": 364,
          "perez": 219,
          "hamilton": 164,
          "alonso": 170,
          "leclerc": 111,
          "norris": 79,
          "sainz": 117,
          "russell": 109
        }
      },
      {
        "round": 15,
        "raceName": "Singapore GP",
        "circuitId": "marina_bay",
        "driverPoints": {
          "max_verstappen": 374,
          "perez": 223,
          "hamilton": 180,
          "alonso": 170,
          "leclerc": 123,
          "norris": 97,
          "sainz": 142,
          "russell": 109
        }
      },
      {
        "round": 16,
        "raceName": "Japanese GP",
        "circuitId": "suzuka",
        "driverPoints": {
          "max_verstappen": 400,
          "perez": 223,
          "hamilton": 190,
          "alonso": 174,
          "leclerc": 135,
          "norris": 115,
          "sainz": 150,
          "russell": 115
        }
      },
      {
        "round": 17,
        "raceName": "Qatar GP",
        "circuitId": "losail",
        "driverPoints": {
          "max_verstappen": 433,
          "perez": 224,
          "hamilton": 194,
          "alonso": 183,
          "leclerc": 145,
          "norris": 136,
          "sainz": 153,
          "russell": 132
        }
      },
      {
        "round": 18,
        "raceName": "United States GP",
        "circuitId": "americas",
        "driverPoints": {
          "max_verstappen": 466,
          "perez": 240,
          "hamilton": 201,
          "alonso": 183,
          "leclerc": 151,
          "norris": 159,
          "sainz": 171,
          "russell": 143
        }
      },
      {
        "round": 19,
        "raceName": "Mexico City GP",
        "circuitId": "rodriguez",
        "driverPoints": {
          "max_verstappen": 491,
          "perez": 240,
          "hamilton": 220,
          "alonso": 183,
          "leclerc": 166,
          "norris": 169,
          "sainz": 183,
          "russell": 151
        }
      },
      {
        "round": 20,
        "raceName": "São Paulo GP",
        "circuitId": "interlagos",
        "driverPoints": {
          "max_verstappen": 524,
          "perez": 258,
          "hamilton": 226,
          "alonso": 198,
          "leclerc": 170,
          "norris": 195,
          "sainz": 192,
          "russell": 156
        }
      },
      {
        "round": 21,
        "raceName": "Las Vegas GP",
        "circuitId": "vegas",
        "driverPoints": {
          "max_verstappen": 549,
          "perez": 273,
          "hamilton": 232,
          "alonso": 200,
          "leclerc": 188,
          "norris": 195,
          "sainz": 200,
          "russell": 160
        }
      },
      {
        "round": 22,
        "raceName": "Abu Dhabi GP",
        "circuitId": "yas_marina",
        "driverPoints": {
          "max_verstappen": 575,
          "perez": 285,
          "hamilton": 234,
          "alonso": 206,
          "leclerc": 206,
          "norris": 205,
          "sainz": 200,
          "russell": 175
        }
      }
    ],
    "driverIds": [
      "max_verstappen",
      "perez",
      "hamilton",
      "alonso",
      "leclerc",
      "norris",
      "sainz",
      "russell"
    ],
    "driverNames": {
      "max_verstappen": "Max Verstappen",
      "perez": "Sergio Pérez",
      "hamilton": "Lewis Hamilton",
      "alonso": "Fernando Alonso",
      "leclerc": "Charles Leclerc",
      "norris": "Lando Norris",
      "sainz": "Carlos Sainz",
      "russell": "George Russell"
    },
    "driverCodes": {
      "max_verstappen": "VER",
      "perez": "PER",
      "hamilton": "HAM",
      "alonso": "ALO",
      "leclerc": "LEC",
      "norris": "NOR",
      "sainz": "SAI",
      "russell": "RUS"
    },
    "constructorColors": {
      "max_verstappen": "#3671C6",
      "perez": "#3671C6",
      "hamilton": "#27F4D2",
      "alonso": "#358C75",
      "leclerc": "#E8002D",
      "norris": "#FF8000",
      "sainz": "#E8002D",
      "russell": "#27F4D2"
    }
  },
  "2024": {
    "season": "2024",
    "rounds": [
      {
        "round": 1,
        "raceName": "Bahrain GP",
        "circuitId": "bahrain",
        "driverPoints": {
          "max_verstappen": 26,
          "norris": 8,
          "leclerc": 12,
          "piastri": 4,
          "sainz": 15,
          "russell": 10,
          "hamilton": 6,
          "perez": 18
        }
      },
      {
        "round": 2,
        "raceName": "Saudi Arabian GP",
        "circuitId": "jeddah",
        "driverPoints": {
          "max_verstappen": 51,
          "norris": 12,
          "leclerc": 28,
          "piastri": 16,
          "sainz": 15,
          "russell": 18,
          "hamilton": 8,
          "perez": 36
        }
      },
      {
        "round": 3,
        "raceName": "Australian GP",
        "circuitId": "albert_park",
        "driverPoints": {
          "max_verstappen": 51,
          "norris": 27,
          "leclerc": 47,
          "piastri": 28,
          "sainz": 40,
          "russell": 18,
          "hamilton": 8,
          "perez": 46
        }
      },
      {
        "round": 4,
        "raceName": "Japanese GP",
        "circuitId": "suzuka",
        "driverPoints": {
          "max_verstappen": 77,
          "norris": 37,
          "leclerc": 59,
          "piastri": 32,
          "sainz": 55,
          "russell": 24,
          "hamilton": 10,
          "perez": 64
        }
      },
      {
        "round": 5,
        "raceName": "Chinese GP",
        "circuitId": "shanghai",
        "driverPoints": {
          "max_verstappen": 110,
          "norris": 58,
          "leclerc": 76,
          "piastri": 38,
          "sainz": 69,
          "russell": 33,
          "hamilton": 19,
          "perez": 85
        }
      },
      {
        "round": 6,
        "raceName": "Miami GP",
        "circuitId": "miami",
        "driverPoints": {
          "max_verstappen": 136,
          "norris": 83,
          "leclerc": 98,
          "piastri": 41,
          "sainz": 83,
          "russell": 37,
          "hamilton": 27,
          "perez": 103
        }
      },
      {
        "round": 7,
        "raceName": "Emilia Romagna GP",
        "circuitId": "imola",
        "driverPoints": {
          "max_verstappen": 161,
          "norris": 101,
          "leclerc": 113,
          "piastri": 53,
          "sainz": 93,
          "russell": 44,
          "hamilton": 35,
          "perez": 107
        }
      },
      {
        "round": 8,
        "raceName": "Monaco GP",
        "circuitId": "monaco",
        "driverPoints": {
          "max_verstappen": 169,
          "norris": 113,
          "leclerc": 138,
          "piastri": 71,
          "sainz": 108,
          "russell": 54,
          "hamilton": 42,
          "perez": 107
        }
      },
      {
        "round": 9,
        "raceName": "Canadian GP",
        "circuitId": "villeneuve",
        "driverPoints": {
          "max_verstappen": 194,
          "norris": 131,
          "leclerc": 138,
          "piastri": 81,
          "sainz": 108,
          "russell": 69,
          "hamilton": 55,
          "perez": 107
        }
      },
      {
        "round": 10,
        "raceName": "Spanish GP",
        "circuitId": "catalunya",
        "driverPoints": {
          "max_verstappen": 219,
          "norris": 150,
          "leclerc": 148,
          "piastri": 87,
          "sainz": 116,
          "russell": 81,
          "hamilton": 70,
          "perez": 111
        }
      },
      {
        "round": 11,
        "raceName": "Austrian GP",
        "circuitId": "red_bull_ring",
        "driverPoints": {
          "max_verstappen": 237,
          "norris": 156,
          "leclerc": 150,
          "piastri": 112,
          "sainz": 135,
          "russell": 111,
          "hamilton": 85,
          "perez": 118
        }
      },
      {
        "round": 12,
        "raceName": "British GP",
        "circuitId": "silverstone",
        "driverPoints": {
          "max_verstappen": 255,
          "norris": 171,
          "leclerc": 150,
          "piastri": 124,
          "sainz": 146,
          "russell": 111,
          "hamilton": 110,
          "perez": 118
        }
      },
      {
        "round": 13,
        "raceName": "Hungarian GP",
        "circuitId": "hungaroring",
        "driverPoints": {
          "max_verstappen": 265,
          "norris": 189,
          "leclerc": 162,
          "piastri": 149,
          "sainz": 154,
          "russell": 116,
          "hamilton": 125,
          "perez": 124
        }
      },
      {
        "round": 14,
        "raceName": "Belgian GP",
        "circuitId": "spa",
        "driverPoints": {
          "max_verstappen": 277,
          "norris": 199,
          "leclerc": 177,
          "piastri": 167,
          "sainz": 162,
          "russell": 116,
          "hamilton": 150,
          "perez": 131
        }
      },
      {
        "round": 15,
        "raceName": "Dutch GP",
        "circuitId": "zandvoort",
        "driverPoints": {
          "max_verstappen": 295,
          "norris": 225,
          "leclerc": 192,
          "piastri": 179,
          "sainz": 172,
          "russell": 122,
          "hamilton": 154,
          "perez": 139
        }
      },
      {
        "round": 16,
        "raceName": "Italian GP",
        "circuitId": "monza",
        "driverPoints": {
          "max_verstappen": 303,
          "norris": 241,
          "leclerc": 217,
          "piastri": 197,
          "sainz": 184,
          "russell": 128,
          "hamilton": 164,
          "perez": 143
        }
      },
      {
        "round": 17,
        "raceName": "Azerbaijan GP",
        "circuitId": "baku",
        "driverPoints": {
          "max_verstappen": 313,
          "norris": 254,
          "leclerc": 235,
          "piastri": 222,
          "sainz": 184,
          "russell": 143,
          "hamilton": 166,
          "perez": 143
        }
      },
      {
        "round": 18,
        "raceName": "Singapore GP",
        "circuitId": "marina_bay",
        "driverPoints": {
          "max_verstappen": 331,
          "norris": 279,
          "leclerc": 245,
          "piastri": 237,
          "sainz": 190,
          "russell": 155,
          "hamilton": 174,
          "perez": 144
        }
      },
      {
        "round": 19,
        "raceName": "United States GP",
        "circuitId": "americas",
        "driverPoints": {
          "max_verstappen": 354,
          "norris": 297,
          "leclerc": 275,
          "piastri": 247,
          "sainz": 215,
          "russell": 167,
          "hamilton": 177,
          "perez": 150
        }
      },
      {
        "round": 20,
        "raceName": "Mexico City GP",
        "circuitId": "rodriguez",
        "driverPoints": {
          "max_verstappen": 362,
          "norris": 315,
          "leclerc": 291,
          "piastri": 251,
          "sainz": 240,
          "russell": 177,
          "hamilton": 189,
          "perez": 150
        }
      },
      {
        "round": 21,
        "raceName": "São Paulo GP",
        "circuitId": "interlagos",
        "driverPoints": {
          "max_verstappen": 393,
          "norris": 331,
          "leclerc": 307,
          "piastri": 262,
          "sainz": 244,
          "russell": 192,
          "hamilton": 190,
          "perez": 151
        }
      },
      {
        "round": 22,
        "raceName": "Las Vegas GP",
        "circuitId": "vegas",
        "driverPoints": {
          "max_verstappen": 403,
          "norris": 340,
          "leclerc": 319,
          "piastri": 268,
          "sainz": 259,
          "russell": 217,
          "hamilton": 208,
          "perez": 152
        }
      },
      {
        "round": 23,
        "raceName": "Qatar GP",
        "circuitId": "losail",
        "driverPoints": {
          "max_verstappen": 429,
          "norris": 349,
          "leclerc": 341,
          "piastri": 291,
          "sainz": 272,
          "russell": 235,
          "hamilton": 211,
          "perez": 152
        }
      },
      {
        "round": 24,
        "raceName": "Abu Dhabi GP",
        "circuitId": "yas_marina",
        "driverPoints": {
          "max_verstappen": 437,
          "norris": 374,
          "leclerc": 356,
          "piastri": 292,
          "sainz": 290,
          "russell": 245,
          "hamilton": 223,
          "perez": 152
        }
      }
    ],
    "driverIds": [
      "max_verstappen",
      "norris",
      "leclerc",
      "piastri",
      "sainz",
      "russell",
      "hamilton",
      "perez"
    ],
    "driverNames": {
      "max_verstappen": "Max Verstappen",
      "norris": "Lando Norris",
      "leclerc": "Charles Leclerc",
      "piastri": "Oscar Piastri",
      "sainz": "Carlos Sainz",
      "russell": "George Russell",
      "hamilton": "Lewis Hamilton",
      "perez": "Sergio Pérez"
    },
    "driverCodes": {
      "max_verstappen": "VER",
      "norris": "NOR",
      "leclerc": "LEC",
      "piastri": "PIA",
      "sainz": "SAI",
      "russell": "RUS",
      "hamilton": "HAM",
      "perez": "PER"
    },
    "constructorColors": {
      "max_verstappen": "#3671C6",
      "norris": "#FF8000",
      "leclerc": "#E8002D",
      "piastri": "#FF8000",
      "sainz": "#E8002D",
      "russell": "#27F4D2",
      "hamilton": "#27F4D2",
      "perez": "#3671C6"
    }
  },
  "2025": {
    "season": "2025",
    "rounds": [
      {
        "round": 1,
        "raceName": "Australian GP",
        "circuitId": "albert_park",
        "driverPoints": {
          "norris": 25,
          "max_verstappen": 18,
          "piastri": 2,
          "russell": 15,
          "leclerc": 4,
          "hamilton": 1,
          "antonelli": 12,
          "albon": 10
        }
      },
      {
        "round": 2,
        "raceName": "Chinese GP",
        "circuitId": "shanghai",
        "driverPoints": {
          "norris": 44,
          "max_verstappen": 36,
          "piastri": 34,
          "russell": 35,
          "leclerc": 8,
          "hamilton": 9,
          "antonelli": 22,
          "albon": 16
        }
      },
      {
        "round": 3,
        "raceName": "Japanese GP",
        "circuitId": "suzuka",
        "driverPoints": {
          "norris": 62,
          "max_verstappen": 61,
          "piastri": 49,
          "russell": 45,
          "leclerc": 20,
          "hamilton": 15,
          "antonelli": 30,
          "albon": 18
        }
      },
      {
        "round": 4,
        "raceName": "Bahrain GP",
        "circuitId": "bahrain",
        "driverPoints": {
          "norris": 77,
          "max_verstappen": 69,
          "piastri": 74,
          "russell": 63,
          "leclerc": 32,
          "hamilton": 25,
          "antonelli": 30,
          "albon": 18
        }
      },
      {
        "round": 5,
        "raceName": "Saudi Arabian GP",
        "circuitId": "jeddah",
        "driverPoints": {
          "norris": 89,
          "max_verstappen": 87,
          "piastri": 99,
          "russell": 73,
          "leclerc": 47,
          "hamilton": 31,
          "antonelli": 38,
          "albon": 20
        }
      },
      {
        "round": 6,
        "raceName": "Miami GP",
        "circuitId": "miami",
        "driverPoints": {
          "norris": 115,
          "max_verstappen": 99,
          "piastri": 131,
          "russell": 93,
          "leclerc": 53,
          "hamilton": 41,
          "antonelli": 48,
          "albon": 30
        }
      },
      {
        "round": 7,
        "raceName": "Emilia Romagna GP",
        "circuitId": "imola",
        "driverPoints": {
          "norris": 133,
          "max_verstappen": 124,
          "piastri": 146,
          "russell": 99,
          "leclerc": 61,
          "hamilton": 53,
          "antonelli": 48,
          "albon": 40
        }
      },
      {
        "round": 8,
        "raceName": "Monaco GP",
        "circuitId": "monaco",
        "driverPoints": {
          "norris": 158,
          "max_verstappen": 136,
          "piastri": 161,
          "russell": 99,
          "leclerc": 79,
          "hamilton": 63,
          "antonelli": 48,
          "albon": 42
        }
      },
      {
        "round": 9,
        "raceName": "Spanish GP",
        "circuitId": "catalunya",
        "driverPoints": {
          "norris": 176,
          "max_verstappen": 137,
          "piastri": 186,
          "russell": 111,
          "leclerc": 94,
          "hamilton": 71,
          "antonelli": 48,
          "albon": 42
        }
      },
      {
        "round": 10,
        "raceName": "Canadian GP",
        "circuitId": "villeneuve",
        "driverPoints": {
          "norris": 176,
          "max_verstappen": 155,
          "piastri": 198,
          "russell": 136,
          "leclerc": 104,
          "hamilton": 79,
          "antonelli": 63,
          "albon": 42
        }
      },
      {
        "round": 11,
        "raceName": "Austrian GP",
        "circuitId": "red_bull_ring",
        "driverPoints": {
          "norris": 201,
          "max_verstappen": 155,
          "piastri": 216,
          "russell": 146,
          "leclerc": 119,
          "hamilton": 91,
          "antonelli": 63,
          "albon": 42
        }
      },
      {
        "round": 12,
        "raceName": "British GP",
        "circuitId": "silverstone",
        "driverPoints": {
          "norris": 226,
          "max_verstappen": 165,
          "piastri": 234,
          "russell": 147,
          "leclerc": 119,
          "hamilton": 103,
          "antonelli": 63,
          "albon": 46
        }
      },
      {
        "round": 13,
        "raceName": "Belgian GP",
        "circuitId": "spa",
        "driverPoints": {
          "norris": 250,
          "max_verstappen": 185,
          "piastri": 266,
          "russell": 157,
          "leclerc": 139,
          "hamilton": 109,
          "antonelli": 63,
          "albon": 54
        }
      },
      {
        "round": 14,
        "raceName": "Hungarian GP",
        "circuitId": "hungaroring",
        "driverPoints": {
          "norris": 275,
          "max_verstappen": 187,
          "piastri": 284,
          "russell": 172,
          "leclerc": 151,
          "hamilton": 109,
          "antonelli": 64,
          "albon": 54
        }
      },
      {
        "round": 15,
        "raceName": "Dutch GP",
        "circuitId": "zandvoort",
        "driverPoints": {
          "norris": 275,
          "max_verstappen": 205,
          "piastri": 309,
          "russell": 184,
          "leclerc": 151,
          "hamilton": 109,
          "antonelli": 64,
          "albon": 64
        }
      },
      {
        "round": 16,
        "raceName": "Italian GP",
        "circuitId": "monza",
        "driverPoints": {
          "norris": 293,
          "max_verstappen": 230,
          "piastri": 324,
          "russell": 194,
          "leclerc": 163,
          "hamilton": 117,
          "antonelli": 66,
          "albon": 70
        }
      },
      {
        "round": 17,
        "raceName": "Azerbaijan GP",
        "circuitId": "baku",
        "driverPoints": {
          "norris": 299,
          "max_verstappen": 255,
          "piastri": 324,
          "russell": 212,
          "leclerc": 165,
          "hamilton": 121,
          "antonelli": 78,
          "albon": 70
        }
      },
      {
        "round": 18,
        "raceName": "Singapore GP",
        "circuitId": "marina_bay",
        "driverPoints": {
          "norris": 314,
          "max_verstappen": 273,
          "piastri": 336,
          "russell": 237,
          "leclerc": 173,
          "hamilton": 125,
          "antonelli": 88,
          "albon": 70
        }
      },
      {
        "round": 19,
        "raceName": "United States GP",
        "circuitId": "americas",
        "driverPoints": {
          "norris": 332,
          "max_verstappen": 306,
          "piastri": 346,
          "russell": 252,
          "leclerc": 192,
          "hamilton": 142,
          "antonelli": 89,
          "albon": 73
        }
      },
      {
        "round": 20,
        "raceName": "Mexico City GP",
        "circuitId": "rodriguez",
        "driverPoints": {
          "norris": 357,
          "max_verstappen": 321,
          "piastri": 356,
          "russell": 258,
          "leclerc": 210,
          "hamilton": 146,
          "antonelli": 97,
          "albon": 73
        }
      },
      {
        "round": 21,
        "raceName": "São Paulo GP",
        "circuitId": "interlagos",
        "driverPoints": {
          "norris": 390,
          "max_verstappen": 341,
          "piastri": 366,
          "russell": 276,
          "leclerc": 214,
          "hamilton": 148,
          "antonelli": 122,
          "albon": 73
        }
      },
      {
        "round": 22,
        "raceName": "Las Vegas GP",
        "circuitId": "vegas",
        "driverPoints": {
          "norris": 390,
          "max_verstappen": 366,
          "piastri": 366,
          "russell": 294,
          "leclerc": 226,
          "hamilton": 152,
          "antonelli": 137,
          "albon": 73
        }
      },
      {
        "round": 23,
        "raceName": "Qatar GP",
        "circuitId": "losail",
        "driverPoints": {
          "norris": 408,
          "max_verstappen": 396,
          "piastri": 392,
          "russell": 309,
          "leclerc": 230,
          "hamilton": 152,
          "antonelli": 150,
          "albon": 73
        }
      },
      {
        "round": 24,
        "raceName": "Abu Dhabi GP",
        "circuitId": "yas_marina",
        "driverPoints": {
          "norris": 423,
          "max_verstappen": 421,
          "piastri": 410,
          "russell": 319,
          "leclerc": 242,
          "hamilton": 156,
          "antonelli": 150,
          "albon": 73
        }
      }
    ],
    "driverIds": [
      "norris",
      "max_verstappen",
      "piastri",
      "russell",
      "leclerc",
      "hamilton",
      "antonelli",
      "albon"
    ],
    "driverNames": {
      "norris": "Lando Norris",
      "max_verstappen": "Max Verstappen",
      "piastri": "Oscar Piastri",
      "russell": "George Russell",
      "leclerc": "Charles Leclerc",
      "hamilton": "Lewis Hamilton",
      "antonelli": "Andrea Kimi Antonelli",
      "albon": "Alexander Albon"
    },
    "driverCodes": {
      "norris": "NOR",
      "max_verstappen": "VER",
      "piastri": "PIA",
      "russell": "RUS",
      "leclerc": "LEC",
      "hamilton": "HAM",
      "antonelli": "ANT",
      "albon": "ALB"
    },
    "constructorColors": {
      "norris": "#FF8000",
      "max_verstappen": "#3671C6",
      "piastri": "#FF8000",
      "russell": "#27F4D2",
      "leclerc": "#E8002D",
      "hamilton": "#E8002D",
      "antonelli": "#27F4D2",
      "albon": "#64C4FF"
    }
  }
};
