/**
 * Templates de phrases et dialogues pour la génération de contenu
 * pédagogique sans LLM.
 *
 * Chaque template peut être instancié avec du vocabulaire connu
 * de l'utilisateur pour créer des exercices contextualisés.
 */

export interface PhraseTemplate {
  id: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  pattern_ar: string;
  pattern_fr: string;
  pattern_en: string;
  slots: string[];
  examples: Array<{
    filled_ar: string;
    filled_fr: string;
    filled_en: string;
    slot_values: Record<string, string>;
  }>;
}

export interface DialogueTemplate {
  id: string;
  title_fr: string;
  title_en: string;
  level: "beginner" | "intermediate";
  context_fr: string;
  context_en: string;
  lines: Array<{
    speaker: "A" | "B";
    arabic: string;
    transliteration: string;
    translation_fr: string;
    translation_en: string;
  }>;
}

// ============================================================
// Templates de phrases quotidiennes
// ============================================================

export const PHRASE_TEMPLATES: PhraseTemplate[] = [
  {
    id: "greeting_basic",
    category: "greetings",
    level: "beginner",
    pattern_ar: "مَرْحَبًا، أَنَا {name}",
    pattern_fr: "Bonjour, je suis {name}",
    pattern_en: "Hello, I am {name}",
    slots: ["name"],
    examples: [
      { filled_ar: "مَرْحَبًا، أَنَا أَحْمَد", filled_fr: "Bonjour, je suis Ahmed", filled_en: "Hello, I am Ahmed", slot_values: { name: "أَحْمَد" } },
      { filled_ar: "مَرْحَبًا، أَنَا فَاطِمَة", filled_fr: "Bonjour, je suis Fatima", filled_en: "Hello, I am Fatima", slot_values: { name: "فَاطِمَة" } },
    ],
  },
  {
    id: "this_is",
    category: "description",
    level: "beginner",
    pattern_ar: "هَذَا {object}",
    pattern_fr: "Ceci est {object}",
    pattern_en: "This is {object}",
    slots: ["object"],
    examples: [
      { filled_ar: "هَذَا كِتَاب", filled_fr: "Ceci est un livre", filled_en: "This is a book", slot_values: { object: "كِتَاب" } },
      { filled_ar: "هَذَا بَيْت", filled_fr: "Ceci est une maison", filled_en: "This is a house", slot_values: { object: "بَيْت" } },
    ],
  },
  {
    id: "want_to",
    category: "expression",
    level: "beginner",
    pattern_ar: "أُرِيدُ {object}",
    pattern_fr: "Je veux {object}",
    pattern_en: "I want {object}",
    slots: ["object"],
    examples: [
      { filled_ar: "أُرِيدُ مَاء", filled_fr: "Je veux de l'eau", filled_en: "I want water", slot_values: { object: "مَاء" } },
      { filled_ar: "أُرِيدُ خُبْز", filled_fr: "Je veux du pain", filled_en: "I want bread", slot_values: { object: "خُبْز" } },
    ],
  },
  {
    id: "where_is",
    category: "question",
    level: "beginner",
    pattern_ar: "أَيْنَ {place} ؟",
    pattern_fr: "Où est {place} ?",
    pattern_en: "Where is {place}?",
    slots: ["place"],
    examples: [
      { filled_ar: "أَيْنَ المَدْرَسَة ؟", filled_fr: "Où est l'école ?", filled_en: "Where is the school?", slot_values: { place: "المَدْرَسَة" } },
      { filled_ar: "أَيْنَ البَيْت ؟", filled_fr: "Où est la maison ?", filled_en: "Where is the house?", slot_values: { place: "البَيْت" } },
    ],
  },
  {
    id: "adjective_noun",
    category: "description",
    level: "intermediate",
    pattern_ar: "{noun} {adjective}",
    pattern_fr: "{noun} {adjective}",
    pattern_en: "{noun} is {adjective}",
    slots: ["noun", "adjective"],
    examples: [
      { filled_ar: "البَيْتُ كَبِير", filled_fr: "La maison est grande", filled_en: "The house is big", slot_values: { noun: "البَيْت", adjective: "كَبِير" } },
      { filled_ar: "الكِتَابُ جَدِيد", filled_fr: "Le livre est nouveau", filled_en: "The book is new", slot_values: { noun: "الكِتَاب", adjective: "جَدِيد" } },
    ],
  },
];

// ============================================================
// Mini-dialogues
// ============================================================

export const DIALOGUE_TEMPLATES: DialogueTemplate[] = [
  {
    id: "greeting_dialogue",
    title_fr: "Se saluer",
    title_en: "Greeting each other",
    level: "beginner",
    context_fr: "Deux personnes se rencontrent pour la première fois.",
    context_en: "Two people meeting for the first time.",
    lines: [
      { speaker: "A", arabic: "السَّلَامُ عَلَيْكُم", transliteration: "as-salāmu ʿalaykum", translation_fr: "La paix soit sur vous", translation_en: "Peace be upon you" },
      { speaker: "B", arabic: "وَعَلَيْكُمُ السَّلَام", transliteration: "wa-ʿalaykumu s-salām", translation_fr: "Et sur vous la paix", translation_en: "And upon you peace" },
      { speaker: "A", arabic: "كَيْفَ حَالُكَ ؟", transliteration: "kayfa ḥāluka?", translation_fr: "Comment vas-tu ?", translation_en: "How are you?" },
      { speaker: "B", arabic: "بِخَيْر، الحَمْدُ لِلَّه", transliteration: "bi-khayr, al-ḥamdu li-llāh", translation_fr: "Bien, louange à Dieu", translation_en: "Fine, praise be to God" },
      { speaker: "A", arabic: "مَا اسْمُكَ ؟", transliteration: "mā ismuka?", translation_fr: "Quel est ton nom ?", translation_en: "What is your name?" },
      { speaker: "B", arabic: "اسْمِي أَحْمَد", transliteration: "ismī Aḥmad", translation_fr: "Mon nom est Ahmed", translation_en: "My name is Ahmed" },
    ],
  },
  {
    id: "market_dialogue",
    title_fr: "Au marché",
    title_en: "At the market",
    level: "beginner",
    context_fr: "Un acheteur et un vendeur au marché.",
    context_en: "A buyer and a seller at the market.",
    lines: [
      { speaker: "A", arabic: "مَرْحَبًا، بِكَمْ هَذَا ؟", transliteration: "marḥaban, bi-kam hādhā?", translation_fr: "Bonjour, combien coûte ceci ?", translation_en: "Hello, how much is this?" },
      { speaker: "B", arabic: "هَذَا بِعَشْرَة دَرَاهِم", transliteration: "hādhā bi-ʿashrat darāhim", translation_fr: "C'est dix dirhams", translation_en: "It's ten dirhams" },
      { speaker: "A", arabic: "أُرِيدُ اثْنَيْن، مِنْ فَضْلِكَ", transliteration: "urīdu ithnayn, min faḍlika", translation_fr: "J'en veux deux, s'il vous plaît", translation_en: "I want two, please" },
      { speaker: "B", arabic: "تَفَضَّلْ", transliteration: "tafaḍḍal", translation_fr: "Voilà / Je vous en prie", translation_en: "Here you go" },
      { speaker: "A", arabic: "شُكْرًا جَزِيلًا", transliteration: "shukran jazīlan", translation_fr: "Merci beaucoup", translation_en: "Thank you very much" },
    ],
  },
  {
    id: "family_dialogue",
    title_fr: "Parler de sa famille",
    title_en: "Talking about family",
    level: "beginner",
    context_fr: "Deux amis parlent de leur famille.",
    context_en: "Two friends talking about their families.",
    lines: [
      { speaker: "A", arabic: "هَلْ عِنْدَكَ إِخْوَة ؟", transliteration: "hal ʿindaka ikhwa?", translation_fr: "As-tu des frères et sœurs ?", translation_en: "Do you have siblings?" },
      { speaker: "B", arabic: "نَعَمْ، عِنْدِي أَخ وَأُخْت", transliteration: "naʿam, ʿindī akh wa-ukht", translation_fr: "Oui, j'ai un frère et une sœur", translation_en: "Yes, I have a brother and a sister" },
      { speaker: "A", arabic: "مَا اسْمُ أَخِيكَ ؟", transliteration: "mā ismu akhīka?", translation_fr: "Quel est le nom de ton frère ?", translation_en: "What is your brother's name?" },
      { speaker: "B", arabic: "اسْمُهُ يُوسُف", transliteration: "ismuhu Yūsuf", translation_fr: "Il s'appelle Youssef", translation_en: "His name is Youssef" },
    ],
  },
];
