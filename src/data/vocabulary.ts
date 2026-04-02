import type { Word, VocabCategory } from "../types";

export const vocabulary: Word[] = [
  // ── GREETINGS ──────────────────────────────────────────────
  {
    id: "g01", armenian: "Բարև", romanization: "Barev", english: "Hello",
    category: "greetings", difficulty: 1,
    exampleSentence: { armenian: "Բարև, ի՞նչ կա:", english: "Hello, what's up?" },
  },
  {
    id: "g02", armenian: "Բարի լույս", romanization: "Bari luys", english: "Good morning",
    category: "greetings", difficulty: 1,
  },
  {
    id: "g03", armenian: "Բարի երեկո", romanization: "Bari yereko", english: "Good evening",
    category: "greetings", difficulty: 1,
  },
  {
    id: "g04", armenian: "Բարի գալուստ", romanization: "Bari galust", english: "Welcome",
    category: "greetings", difficulty: 2,
  },
  {
    id: "g05", armenian: "Ցտեսություն", romanization: "Ts'tesutyun", english: "Goodbye",
    category: "greetings", difficulty: 1,
    exampleSentence: { armenian: "Ցտեսություն, բարի ճանապարհ:", english: "Goodbye, safe travels!" },
  },
  {
    id: "g06", armenian: "Շնորհակալություն", romanization: "Shnorhakalutyun", english: "Thank you",
    category: "greetings", difficulty: 2,
  },
  {
    id: "g07", armenian: "Ներողություն", romanization: "Neroghutyun", english: "Sorry / Excuse me",
    category: "greetings", difficulty: 2,
  },
  {
    id: "g08", armenian: "Այո", romanization: "Ayo", english: "Yes",
    category: "greetings", difficulty: 1,
  },
  {
    id: "g09", armenian: "Ոչ", romanization: "Voch'", english: "No",
    category: "greetings", difficulty: 1,
  },
  {
    id: "g10", armenian: "Խնդրեմ", romanization: "Khndrem", english: "Please / You're welcome",
    category: "greetings", difficulty: 1,
  },
  {
    id: "g11", armenian: "Ինչպե՞ս եք", romanization: "Inch'pes ek'", english: "How are you? (formal)",
    category: "greetings", difficulty: 2,
  },
  {
    id: "g12", armenian: "Լավ եմ", romanization: "Lav em", english: "I am fine",
    category: "greetings", difficulty: 1,
  },

  // ── NUMBERS ────────────────────────────────────────────────
  {
    id: "n01", armenian: "Մեկ", romanization: "Mek", english: "One",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n02", armenian: "Երկու", romanization: "Yerku", english: "Two",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n03", armenian: "Երեք", romanization: "Yerek'", english: "Three",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n04", armenian: "Չորս", romanization: "Ch'ors", english: "Four",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n05", armenian: "Հինգ", romanization: "Hing", english: "Five",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n06", armenian: "Վեց", romanization: "Vets'", english: "Six",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n07", armenian: "Յոթ", romanization: "Yot'", english: "Seven",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n08", armenian: "Ութ", romanization: "Ut'", english: "Eight",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n09", armenian: "Ինը", romanization: "Inə", english: "Nine",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n10", armenian: "Տաս", romanization: "Tas", english: "Ten",
    category: "numbers", difficulty: 1,
  },
  {
    id: "n11", armenian: "Քսան", romanization: "K'san", english: "Twenty",
    category: "numbers", difficulty: 2,
  },
  {
    id: "n12", armenian: "Հարյուր", romanization: "Haryur", english: "One hundred",
    category: "numbers", difficulty: 2,
  },
  {
    id: "n13", armenian: "Հազար", romanization: "Hazar", english: "One thousand",
    category: "numbers", difficulty: 2,
  },

  // ── COLORS ─────────────────────────────────────────────────
  {
    id: "c01", armenian: "Կարմիր", romanization: "Karmir", english: "Red",
    category: "colors", difficulty: 1,
  },
  {
    id: "c02", armenian: "Կանաչ", romanization: "Kanach'", english: "Green",
    category: "colors", difficulty: 1,
  },
  {
    id: "c03", armenian: "Կապույտ", romanization: "Kapuyt", english: "Blue",
    category: "colors", difficulty: 1,
  },
  {
    id: "c04", armenian: "Դեղին", romanization: "Deghin", english: "Yellow",
    category: "colors", difficulty: 1,
  },
  {
    id: "c05", armenian: "Սպիտակ", romanization: "Spitak", english: "White",
    category: "colors", difficulty: 1,
  },
  {
    id: "c06", armenian: "Սև", romanization: "Sev", english: "Black",
    category: "colors", difficulty: 1,
  },
  {
    id: "c07", armenian: "Նարնջագույն", romanization: "Narnjaguyn", english: "Orange",
    category: "colors", difficulty: 2,
  },
  {
    id: "c08", armenian: "Վարդագույն", romanization: "Vardaguyn", english: "Pink",
    category: "colors", difficulty: 2,
  },
  {
    id: "c09", armenian: "Մանուշակագույն", romanization: "Manushakaguyn", english: "Purple",
    category: "colors", difficulty: 3,
  },
  {
    id: "c10", armenian: "Շագանակագույն", romanization: "Shaganakaguyn", english: "Brown",
    category: "colors", difficulty: 3,
  },
  {
    id: "c11", armenian: "Մոխրագույն", romanization: "Mokhrraguyn", english: "Grey",
    category: "colors", difficulty: 2,
  },

  // ── FAMILY ─────────────────────────────────────────────────
  {
    id: "f01", armenian: "Մայր", romanization: "Mayr", english: "Mother",
    category: "family", difficulty: 1,
    exampleSentence: { armenian: "Իմ մայրն ուրախ է:", english: "My mother is happy." },
  },
  {
    id: "f02", armenian: "Հայր", romanization: "Hayr", english: "Father",
    category: "family", difficulty: 1,
  },
  {
    id: "f03", armenian: "Եղբայր", romanization: "Yeghbayr", english: "Brother",
    category: "family", difficulty: 1,
  },
  {
    id: "f04", armenian: "Քույր", romanization: "K'uyr", english: "Sister",
    category: "family", difficulty: 1,
  },
  {
    id: "f05", armenian: "Տատ", romanization: "Tat", english: "Grandmother",
    category: "family", difficulty: 1,
  },
  {
    id: "f06", armenian: "Պապ", romanization: "Pap", english: "Grandfather",
    category: "family", difficulty: 1,
  },
  {
    id: "f07", armenian: "Որդի", romanization: "Vordi", english: "Son",
    category: "family", difficulty: 2,
  },
  {
    id: "f08", armenian: "Դուստր", romanization: "Dustr", english: "Daughter",
    category: "family", difficulty: 2,
  },
  {
    id: "f09", armenian: "Ամուսին", romanization: "Amusin", english: "Spouse / Husband",
    category: "family", difficulty: 2,
  },
  {
    id: "f10", armenian: "Կին", romanization: "Kin", english: "Wife / Woman",
    category: "family", difficulty: 1,
  },
  {
    id: "f11", armenian: "Ընտանիք", romanization: "Əntanik'", english: "Family",
    category: "family", difficulty: 2,
  },

  // ── FOOD ───────────────────────────────────────────────────
  {
    id: "fo01", armenian: "Հաց", romanization: "Hats'", english: "Bread",
    category: "food", difficulty: 1,
  },
  {
    id: "fo02", armenian: "Ջուր", romanization: "Jur", english: "Water",
    category: "food", difficulty: 1,
  },
  {
    id: "fo03", armenian: "Կաթ", romanization: "Kat'", english: "Milk",
    category: "food", difficulty: 1,
  },
  {
    id: "fo04", armenian: "Թեյ", romanization: "T'ey", english: "Tea",
    category: "food", difficulty: 1,
  },
  {
    id: "fo05", armenian: "Սուրճ", romanization: "Surj", english: "Coffee",
    category: "food", difficulty: 1,
  },
  {
    id: "fo06", armenian: "Խնձոր", romanization: "Khndzohr", english: "Apple",
    category: "food", difficulty: 1,
  },
  {
    id: "fo07", armenian: "Բանան", romanization: "Banan", english: "Banana",
    category: "food", difficulty: 1,
  },
  {
    id: "fo08", armenian: "Հավ", romanization: "Hav", english: "Chicken",
    category: "food", difficulty: 1,
  },
  {
    id: "fo09", armenian: "Ձու", romanization: "Dzu", english: "Egg",
    category: "food", difficulty: 1,
  },
  {
    id: "fo10", armenian: "Պանիր", romanization: "Panir", english: "Cheese",
    category: "food", difficulty: 2,
  },
  {
    id: "fo11", armenian: "Կարտոֆիլ", romanization: "Kartofil", english: "Potato",
    category: "food", difficulty: 2,
  },
  {
    id: "fo12", armenian: "Լոլիկ", romanization: "Lolik", english: "Tomato",
    category: "food", difficulty: 2,
  },
  {
    id: "fo13", armenian: "Նուռ", romanization: "Nurr", english: "Pomegranate",
    category: "food", difficulty: 2,
    exampleSentence: { armenian: "Նուռը Հայաստանի խորհրդանիշն է:", english: "The pomegranate is a symbol of Armenia." },
  },

  // ── BODY ───────────────────────────────────────────────────
  {
    id: "b01", armenian: "Ձեռք", romanization: "Dzerrk'", english: "Hand",
    category: "body", difficulty: 1,
  },
  {
    id: "b02", armenian: "Ոտք", romanization: "Votk'", english: "Foot / Leg",
    category: "body", difficulty: 1,
  },
  {
    id: "b03", armenian: "Գլուխ", romanization: "Glukh", english: "Head",
    category: "body", difficulty: 1,
  },
  {
    id: "b04", armenian: "Աչք", romanization: "Achk'", english: "Eye",
    category: "body", difficulty: 1,
  },
  {
    id: "b05", armenian: "Ականջ", romanization: "Akanj", english: "Ear",
    category: "body", difficulty: 1,
  },
  {
    id: "b06", armenian: "Բերան", romanization: "Beran", english: "Mouth",
    category: "body", difficulty: 1,
  },
  {
    id: "b07", armenian: "Քիթ", romanization: "K'it'", english: "Nose",
    category: "body", difficulty: 1,
  },
  {
    id: "b08", armenian: "Ատամ", romanization: "Atam", english: "Tooth",
    category: "body", difficulty: 2,
  },
  {
    id: "b09", armenian: "Սիրտ", romanization: "Sirt", english: "Heart",
    category: "body", difficulty: 1,
  },
  {
    id: "b10", armenian: "Մազ", romanization: "Maz", english: "Hair",
    category: "body", difficulty: 1,
  },
  {
    id: "b11", armenian: "Մատ", romanization: "Mat", english: "Finger",
    category: "body", difficulty: 2,
  },
  {
    id: "b12", armenian: "Թև", romanization: "T'ev", english: "Shoulder / Wing",
    category: "body", difficulty: 2,
  },

  // ── VERBS ──────────────────────────────────────────────────
  {
    id: "v01", armenian: "Ուտել", romanization: "Utel", english: "To eat",
    category: "verbs", difficulty: 1,
    exampleSentence: { armenian: "Ես ուզում եմ ուտել:", english: "I want to eat." },
  },
  {
    id: "v02", armenian: "Խմել", romanization: "Khmel", english: "To drink",
    category: "verbs", difficulty: 1,
  },
  {
    id: "v03", armenian: "Գնալ", romanization: "Gnal", english: "To go",
    category: "verbs", difficulty: 1,
  },
  {
    id: "v04", armenian: "Գալ", romanization: "Gal", english: "To come",
    category: "verbs", difficulty: 1,
  },
  {
    id: "v05", armenian: "Տեսնել", romanization: "Tesnel", english: "To see",
    category: "verbs", difficulty: 1,
  },
  {
    id: "v06", armenian: "Ասել", romanization: "Asel", english: "To say",
    category: "verbs", difficulty: 1,
  },
  {
    id: "v07", armenian: "Սիրել", romanization: "Sirel", english: "To love",
    category: "verbs", difficulty: 1,
    exampleSentence: { armenian: "Ես քեզ սիրում եմ:", english: "I love you." },
  },
  {
    id: "v08", armenian: "Կարդալ", romanization: "Kardal", english: "To read",
    category: "verbs", difficulty: 2,
  },
  {
    id: "v09", armenian: "Գրել", romanization: "Grel", english: "To write",
    category: "verbs", difficulty: 2,
  },
  {
    id: "v10", armenian: "Խոսել", romanization: "Khosel", english: "To speak",
    category: "verbs", difficulty: 2,
  },
  {
    id: "v11", armenian: "Լսել", romanization: "Lsel", english: "To listen / hear",
    category: "verbs", difficulty: 2,
  },
  {
    id: "v12", armenian: "Հասկանալ", romanization: "Haskanal", english: "To understand",
    category: "verbs", difficulty: 3,
  },

  // ── ADJECTIVES ─────────────────────────────────────────────
  {
    id: "adj01", armenian: "Մեծ", romanization: "Mets", english: "Big / Great",
    category: "adjectives", difficulty: 1,
  },
  {
    id: "adj02", armenian: "Փոքր", romanization: "P'ok'r", english: "Small / Little",
    category: "adjectives", difficulty: 1,
  },
  {
    id: "adj03", armenian: "Լավ", romanization: "Lav", english: "Good",
    category: "adjectives", difficulty: 1,
  },
  {
    id: "adj04", armenian: "Վատ", romanization: "Vat", english: "Bad",
    category: "adjectives", difficulty: 1,
  },
  {
    id: "adj05", armenian: "Նոր", romanization: "Nor", english: "New",
    category: "adjectives", difficulty: 1,
  },
  {
    id: "adj06", armenian: "Հին", romanization: "Hin", english: "Old",
    category: "adjectives", difficulty: 1,
  },
  {
    id: "adj07", armenian: "Գեղեցիկ", romanization: "Geghetsi k'", english: "Beautiful",
    category: "adjectives", difficulty: 2,
  },
  {
    id: "adj08", armenian: "Ուժեղ", romanization: "Uzhegh", english: "Strong",
    category: "adjectives", difficulty: 2,
  },
  {
    id: "adj09", armenian: "Արագ", romanization: "Arag", english: "Fast",
    category: "adjectives", difficulty: 1,
  },
  {
    id: "adj10", armenian: "Դանդաղ", romanization: "Dandagh", english: "Slow",
    category: "adjectives", difficulty: 2,
  },
  {
    id: "adj11", armenian: "Ուրախ", romanization: "Urakh", english: "Happy / Joyful",
    category: "adjectives", difficulty: 2,
  },
  {
    id: "adj12", armenian: "Տխուր", romanization: "Tkhur", english: "Sad",
    category: "adjectives", difficulty: 2,
  },

  // ── PLACES ─────────────────────────────────────────────────
  {
    id: "pl01", armenian: "Տուն", romanization: "Tun", english: "House / Home",
    category: "places", difficulty: 1,
    exampleSentence: { armenian: "Ես տանն եմ:", english: "I am at home." },
  },
  {
    id: "pl02", armenian: "Դպրոց", romanization: "Dprots'", english: "School",
    category: "places", difficulty: 1,
  },
  {
    id: "pl03", armenian: "Հիվանդանոց", romanization: "Hivandanots'", english: "Hospital",
    category: "places", difficulty: 2,
  },
  {
    id: "pl04", armenian: "Շուկա", romanization: "Shuka", english: "Market",
    category: "places", difficulty: 1,
  },
  {
    id: "pl05", armenian: "Եկեղեցի", romanization: "Yekelghets'i", english: "Church",
    category: "places", difficulty: 2,
  },
  {
    id: "pl06", armenian: "Բանկ", romanization: "Bank", english: "Bank",
    category: "places", difficulty: 1,
  },
  {
    id: "pl07", armenian: "Հյուրանոց", romanization: "Hyuranots'", english: "Hotel",
    category: "places", difficulty: 2,
  },
  {
    id: "pl08", armenian: "Ռեստորան", romanization: "Restoran", english: "Restaurant",
    category: "places", difficulty: 1,
  },
  {
    id: "pl09", armenian: "Պուրակ", romanization: "Purak", english: "Park",
    category: "places", difficulty: 2,
  },
  {
    id: "pl10", armenian: "Օդանավակայան", romanization: "Odanavakayan", english: "Airport",
    category: "places", difficulty: 3,
  },
  {
    id: "pl11", armenian: "Փողոց", romanization: "P'oghots'", english: "Street",
    category: "places", difficulty: 2,
  },

  // ── TIME ───────────────────────────────────────────────────
  {
    id: "t01", armenian: "Օր", romanization: "Or", english: "Day",
    category: "time", difficulty: 1,
  },
  {
    id: "t02", armenian: "Գիշեր", romanization: "Gisher", english: "Night",
    category: "time", difficulty: 1,
  },
  {
    id: "t03", armenian: "Առավոտ", romanization: "Arravot", english: "Morning",
    category: "time", difficulty: 1,
  },
  {
    id: "t04", armenian: "Երեկո", romanization: "Yereko", english: "Evening",
    category: "time", difficulty: 1,
  },
  {
    id: "t05", armenian: "Շաբաթ", romanization: "Shabat'", english: "Week",
    category: "time", difficulty: 2,
  },
  {
    id: "t06", armenian: "Ամիս", romanization: "Amis", english: "Month",
    category: "time", difficulty: 2,
  },
  {
    id: "t07", armenian: "Տարի", romanization: "Tari", english: "Year",
    category: "time", difficulty: 1,
  },
  {
    id: "t08", armenian: "Հիմա", romanization: "Hima", english: "Now",
    category: "time", difficulty: 1,
  },
  {
    id: "t09", armenian: "Վաղը", romanization: "Vaghn'", english: "Tomorrow",
    category: "time", difficulty: 2,
  },
  {
    id: "t10", armenian: "Երեկ", romanization: "Yerek", english: "Yesterday",
    category: "time", difficulty: 2,
  },
  {
    id: "t11", armenian: "Ժամ", romanization: "Zham", english: "Hour / Time",
    category: "time", difficulty: 1,
  },
  {
    id: "t12", armenian: "Րոպե", romanization: "Rope", english: "Minute",
    category: "time", difficulty: 2,
  },
];

export const VOCAB_CATEGORIES: { value: VocabCategory | "all"; label: string; emoji: string }[] = [
  { value: "all",        label: "All",        emoji: "📚" },
  { value: "greetings",  label: "Greetings",  emoji: "👋" },
  { value: "numbers",    label: "Numbers",    emoji: "🔢" },
  { value: "colors",     label: "Colors",     emoji: "🎨" },
  { value: "family",     label: "Family",     emoji: "👨‍👩‍👧" },
  { value: "food",       label: "Food",       emoji: "🍽️" },
  { value: "body",       label: "Body",       emoji: "🫀" },
  { value: "verbs",      label: "Verbs",      emoji: "⚡" },
  { value: "adjectives", label: "Adjectives", emoji: "✨" },
  { value: "places",     label: "Places",     emoji: "📍" },
  { value: "time",       label: "Time",       emoji: "⏰" },
];
