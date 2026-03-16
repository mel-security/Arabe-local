// config.js — Static manifests: 28 Arabic letters + 114 Quran surahs
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ASSETS_ROOT = resolve(__dirname, '../../public/assets');

export const AUDIO_DIRS = {
  letters: join(ASSETS_ROOT, 'audio', 'letters'),
  quran:   join(ASSETS_ROOT, 'audio', 'quran'),
  words:   join(ASSETS_ROOT, 'audio', 'words'),
};

export const IMAGE_DIRS = {
  letters: join(ASSETS_ROOT, 'images', 'letters'),
  words:   join(ASSETS_ROOT, 'images', 'words'),
};

// DB relative path convention (no leading slash, no 'public/' prefix)
export const DB_PATH_PREFIX = {
  audio: {
    letters: 'assets/audio/letters',
    quran:   'assets/audio/quran',
    words:   'assets/audio/words',
  },
  images: {
    letters: 'assets/images/letters',
    words:   'assets/images/words',
  },
};

// ── 28 Arabic Letters ──────────────────────────────────────────────────────
// slug: used for filenames (ASCII-safe)
// arabic: the isolated Unicode character (used for TTS + SVG display)
// ttsText: what to send to Google TTS (the letter name in Arabic for clearer pronunciation)
export const LETTERS = [
  { id: 1,  slug: 'alif',     arabic: 'ا', ttsText: 'أَلِف',  nameFr: 'Alif' },
  { id: 2,  slug: 'ba',       arabic: 'ب', ttsText: 'بَاء',   nameFr: 'Ba' },
  { id: 3,  slug: 'ta',       arabic: 'ت', ttsText: 'تَاء',   nameFr: 'Ta' },
  { id: 4,  slug: 'tha',      arabic: 'ث', ttsText: 'ثَاء',   nameFr: 'Tha' },
  { id: 5,  slug: 'jim',      arabic: 'ج', ttsText: 'جِيم',   nameFr: 'Jim' },
  { id: 6,  slug: 'ha',       arabic: 'ح', ttsText: 'حَاء',   nameFr: 'Ha' },
  { id: 7,  slug: 'kha',      arabic: 'خ', ttsText: 'خَاء',   nameFr: 'Kha' },
  { id: 8,  slug: 'dal',      arabic: 'د', ttsText: 'دَال',   nameFr: 'Dal' },
  { id: 9,  slug: 'dhal',     arabic: 'ذ', ttsText: 'ذَال',   nameFr: 'Dhal' },
  { id: 10, slug: 'ra',       arabic: 'ر', ttsText: 'رَاء',   nameFr: 'Ra' },
  { id: 11, slug: 'zay',      arabic: 'ز', ttsText: 'زَاي',   nameFr: 'Zay' },
  { id: 12, slug: 'sin',      arabic: 'س', ttsText: 'سِين',   nameFr: 'Sin' },
  { id: 13, slug: 'shin',     arabic: 'ش', ttsText: 'شِين',   nameFr: 'Shin' },
  { id: 14, slug: 'sad',      arabic: 'ص', ttsText: 'صَاد',   nameFr: 'Sad' },
  { id: 15, slug: 'dad',      arabic: 'ض', ttsText: 'ضَاد',   nameFr: 'Dad' },
  { id: 16, slug: 'ta_emp',   arabic: 'ط', ttsText: 'طَاء',   nameFr: 'Ta emphatique' },
  { id: 17, slug: 'dha_emp',  arabic: 'ظ', ttsText: 'ظَاء',   nameFr: 'Dha emphatique' },
  { id: 18, slug: 'ain',      arabic: 'ع', ttsText: 'عَيْن',  nameFr: 'Aïn' },
  { id: 19, slug: 'ghayn',    arabic: 'غ', ttsText: 'غَيْن',  nameFr: 'Ghaïn' },
  { id: 20, slug: 'fa',       arabic: 'ف', ttsText: 'فَاء',   nameFr: 'Fa' },
  { id: 21, slug: 'qaf',      arabic: 'ق', ttsText: 'قَاف',   nameFr: 'Qaf' },
  { id: 22, slug: 'kaf',      arabic: 'ك', ttsText: 'كَاف',   nameFr: 'Kaf' },
  { id: 23, slug: 'lam',      arabic: 'ل', ttsText: 'لَام',   nameFr: 'Lam' },
  { id: 24, slug: 'mim',      arabic: 'م', ttsText: 'مِيم',   nameFr: 'Mim' },
  { id: 25, slug: 'nun',      arabic: 'ن', ttsText: 'نُون',   nameFr: 'Nun' },
  { id: 26, slug: 'ha2',      arabic: 'ه', ttsText: 'هَاء',   nameFr: 'Ha (léger)' },
  { id: 27, slug: 'waw',      arabic: 'و', ttsText: 'وَاو',   nameFr: 'Waw' },
  { id: 28, slug: 'ya',       arabic: 'ي', ttsText: 'يَاء',   nameFr: 'Ya' },
];

// ── 114 Surahs static metadata ─────────────────────────────────────────────
// Used to insert missing surahs 8-111 into the DB
// revelation_type: 'meccan' | 'medinan'
export const SURAHS = [
  { number: 1,   name_ar: 'الفاتحة',     transliteration: 'Al-Fātiḥa',      name_fr: 'L\'Ouverture',              name_en: 'The Opening',            revelation_type: 'meccan',   verses_count: 7,   order_revealed: 5 },
  { number: 2,   name_ar: 'البقرة',      transliteration: 'Al-Baqara',       name_fr: 'La Vache',                  name_en: 'The Cow',                revelation_type: 'medinan',  verses_count: 286, order_revealed: 87 },
  { number: 3,   name_ar: 'آل عمران',    transliteration: 'Āl \'Imrān',      name_fr: 'La Famille d\'Imrân',       name_en: 'Family of Imran',        revelation_type: 'medinan',  verses_count: 200, order_revealed: 89 },
  { number: 4,   name_ar: 'النساء',      transliteration: 'An-Nisā\'',       name_fr: 'Les Femmes',                name_en: 'The Women',              revelation_type: 'medinan',  verses_count: 176, order_revealed: 92 },
  { number: 5,   name_ar: 'المائدة',     transliteration: 'Al-Mā\'ida',      name_fr: 'La Table Servie',           name_en: 'The Table Spread',       revelation_type: 'medinan',  verses_count: 120, order_revealed: 112 },
  { number: 6,   name_ar: 'الأنعام',     transliteration: 'Al-An\'ām',       name_fr: 'Les Bestiaux',              name_en: 'The Cattle',             revelation_type: 'meccan',   verses_count: 165, order_revealed: 55 },
  { number: 7,   name_ar: 'الأعراف',     transliteration: 'Al-A\'rāf',       name_fr: 'Les Hauteurs',              name_en: 'The Heights',            revelation_type: 'meccan',   verses_count: 206, order_revealed: 39 },
  { number: 8,   name_ar: 'الأنفال',     transliteration: 'Al-Anfāl',        name_fr: 'Le Butin',                  name_en: 'The Spoils of War',      revelation_type: 'medinan',  verses_count: 75,  order_revealed: 88 },
  { number: 9,   name_ar: 'التوبة',      transliteration: 'At-Tawba',        name_fr: 'Le Repentir',               name_en: 'The Repentance',         revelation_type: 'medinan',  verses_count: 129, order_revealed: 113 },
  { number: 10,  name_ar: 'يونس',        transliteration: 'Yūnus',           name_fr: 'Jonas',                     name_en: 'Jonah',                  revelation_type: 'meccan',   verses_count: 109, order_revealed: 51 },
  { number: 11,  name_ar: 'هود',         transliteration: 'Hūd',             name_fr: 'Hûd',                       name_en: 'Hud',                    revelation_type: 'meccan',   verses_count: 123, order_revealed: 52 },
  { number: 12,  name_ar: 'يوسف',        transliteration: 'Yūsuf',           name_fr: 'Joseph',                    name_en: 'Joseph',                 revelation_type: 'meccan',   verses_count: 111, order_revealed: 53 },
  { number: 13,  name_ar: 'الرعد',       transliteration: 'Ar-Ra\'d',        name_fr: 'Le Tonnerre',               name_en: 'The Thunder',            revelation_type: 'medinan',  verses_count: 43,  order_revealed: 96 },
  { number: 14,  name_ar: 'إبراهيم',     transliteration: 'Ibrāhīm',         name_fr: 'Abraham',                   name_en: 'Abraham',                revelation_type: 'meccan',   verses_count: 52,  order_revealed: 72 },
  { number: 15,  name_ar: 'الحجر',       transliteration: 'Al-Ḥijr',         name_fr: 'Al-Hijr',                   name_en: 'The Rocky Tract',        revelation_type: 'meccan',   verses_count: 99,  order_revealed: 54 },
  { number: 16,  name_ar: 'النحل',       transliteration: 'An-Naḥl',         name_fr: 'Les Abeilles',              name_en: 'The Bee',                revelation_type: 'meccan',   verses_count: 128, order_revealed: 70 },
  { number: 17,  name_ar: 'الإسراء',     transliteration: 'Al-Isrā\'',       name_fr: 'Le Voyage Nocturne',        name_en: 'The Night Journey',      revelation_type: 'meccan',   verses_count: 111, order_revealed: 50 },
  { number: 18,  name_ar: 'الكهف',       transliteration: 'Al-Kahf',         name_fr: 'La Caverne',                name_en: 'The Cave',               revelation_type: 'meccan',   verses_count: 110, order_revealed: 69 },
  { number: 19,  name_ar: 'مريم',        transliteration: 'Maryam',          name_fr: 'Marie',                     name_en: 'Mary',                   revelation_type: 'meccan',   verses_count: 98,  order_revealed: 44 },
  { number: 20,  name_ar: 'طه',          transliteration: 'Ṭā Hā',           name_fr: 'Tâ Hâ',                    name_en: 'Ta-Ha',                  revelation_type: 'meccan',   verses_count: 135, order_revealed: 45 },
  { number: 21,  name_ar: 'الأنبياء',    transliteration: 'Al-Anbiyā\'',     name_fr: 'Les Prophètes',             name_en: 'The Prophets',           revelation_type: 'meccan',   verses_count: 112, order_revealed: 73 },
  { number: 22,  name_ar: 'الحج',        transliteration: 'Al-Ḥajj',         name_fr: 'Le Pèlerinage',             name_en: 'The Pilgrimage',         revelation_type: 'medinan',  verses_count: 78,  order_revealed: 103 },
  { number: 23,  name_ar: 'المؤمنون',    transliteration: 'Al-Mu\'minūn',    name_fr: 'Les Croyants',              name_en: 'The Believers',          revelation_type: 'meccan',   verses_count: 118, order_revealed: 74 },
  { number: 24,  name_ar: 'النور',       transliteration: 'An-Nūr',          name_fr: 'La Lumière',                name_en: 'The Light',              revelation_type: 'medinan',  verses_count: 64,  order_revealed: 102 },
  { number: 25,  name_ar: 'الفرقان',     transliteration: 'Al-Furqān',       name_fr: 'Le Critère',                name_en: 'The Criterion',          revelation_type: 'meccan',   verses_count: 77,  order_revealed: 42 },
  { number: 26,  name_ar: 'الشعراء',     transliteration: 'Ash-Shu\'arā\'',  name_fr: 'Les Poètes',                name_en: 'The Poets',              revelation_type: 'meccan',   verses_count: 227, order_revealed: 47 },
  { number: 27,  name_ar: 'النمل',       transliteration: 'An-Naml',         name_fr: 'Les Fourmis',               name_en: 'The Ant',                revelation_type: 'meccan',   verses_count: 93,  order_revealed: 48 },
  { number: 28,  name_ar: 'القصص',       transliteration: 'Al-Qaṣaṣ',        name_fr: 'Le Récit',                  name_en: 'The Stories',            revelation_type: 'meccan',   verses_count: 88,  order_revealed: 49 },
  { number: 29,  name_ar: 'العنكبوت',    transliteration: 'Al-\'Ankabūt',    name_fr: 'L\'Araignée',               name_en: 'The Spider',             revelation_type: 'meccan',   verses_count: 69,  order_revealed: 85 },
  { number: 30,  name_ar: 'الروم',       transliteration: 'Ar-Rūm',          name_fr: 'Les Romains',               name_en: 'The Romans',             revelation_type: 'meccan',   verses_count: 60,  order_revealed: 84 },
  { number: 31,  name_ar: 'لقمان',       transliteration: 'Luqmān',          name_fr: 'Luqmân',                    name_en: 'Luqman',                 revelation_type: 'meccan',   verses_count: 34,  order_revealed: 57 },
  { number: 32,  name_ar: 'السجدة',      transliteration: 'As-Sajda',        name_fr: 'La Prosternation',          name_en: 'The Prostration',        revelation_type: 'meccan',   verses_count: 30,  order_revealed: 75 },
  { number: 33,  name_ar: 'الأحزاب',     transliteration: 'Al-Aḥzāb',        name_fr: 'Les Coalisés',              name_en: 'The Combined Forces',    revelation_type: 'medinan',  verses_count: 73,  order_revealed: 90 },
  { number: 34,  name_ar: 'سبأ',         transliteration: 'Saba\'',          name_fr: 'Saba',                      name_en: 'Sheba',                  revelation_type: 'meccan',   verses_count: 54,  order_revealed: 58 },
  { number: 35,  name_ar: 'فاطر',        transliteration: 'Fāṭir',           name_fr: 'Le Créateur',               name_en: 'Originator',             revelation_type: 'meccan',   verses_count: 45,  order_revealed: 43 },
  { number: 36,  name_ar: 'يس',          transliteration: 'Yā-Sīn',          name_fr: 'Yâ Sîn',                   name_en: 'Ya Sin',                 revelation_type: 'meccan',   verses_count: 83,  order_revealed: 41 },
  { number: 37,  name_ar: 'الصافات',     transliteration: 'Aṣ-Ṣāffāt',      name_fr: 'Ceux qui Font les Rangs',   name_en: 'Those Who Set The Ranks', revelation_type: 'meccan',  verses_count: 182, order_revealed: 56 },
  { number: 38,  name_ar: 'ص',           transliteration: 'Ṣād',             name_fr: 'Sâd',                       name_en: 'The Letter Sad',         revelation_type: 'meccan',   verses_count: 88,  order_revealed: 38 },
  { number: 39,  name_ar: 'الزمر',       transliteration: 'Az-Zumar',        name_fr: 'Les Groupes',               name_en: 'The Troops',             revelation_type: 'meccan',   verses_count: 75,  order_revealed: 59 },
  { number: 40,  name_ar: 'غافر',        transliteration: 'Ghāfir',          name_fr: 'Le Pardonneur',             name_en: 'The Forgiver',           revelation_type: 'meccan',   verses_count: 85,  order_revealed: 60 },
  { number: 41,  name_ar: 'فصلت',        transliteration: 'Fuṣṣilat',        name_fr: 'Expliquées en Détail',      name_en: 'Explained in Detail',    revelation_type: 'meccan',   verses_count: 54,  order_revealed: 61 },
  { number: 42,  name_ar: 'الشورى',      transliteration: 'Ash-Shūrā',       name_fr: 'La Consultation',           name_en: 'The Consultation',       revelation_type: 'meccan',   verses_count: 53,  order_revealed: 62 },
  { number: 43,  name_ar: 'الزخرف',      transliteration: 'Az-Zukhruf',      name_fr: 'Les Ornements',             name_en: 'The Ornaments of Gold',  revelation_type: 'meccan',   verses_count: 89,  order_revealed: 63 },
  { number: 44,  name_ar: 'الدخان',      transliteration: 'Ad-Dukhān',       name_fr: 'La Fumée',                  name_en: 'The Smoke',              revelation_type: 'meccan',   verses_count: 59,  order_revealed: 64 },
  { number: 45,  name_ar: 'الجاثية',     transliteration: 'Al-Jāthiya',      name_fr: 'L\'Agenouillée',            name_en: 'The Crouching',          revelation_type: 'meccan',   verses_count: 37,  order_revealed: 65 },
  { number: 46,  name_ar: 'الأحقاف',     transliteration: 'Al-Aḥqāf',        name_fr: 'Les Dunes',                 name_en: 'The Wind-Curved Sandhills', revelation_type: 'meccan', verses_count: 35, order_revealed: 66 },
  { number: 47,  name_ar: 'محمد',        transliteration: 'Muḥammad',        name_fr: 'Muhammad',                  name_en: 'Muhammad',               revelation_type: 'medinan',  verses_count: 38,  order_revealed: 95 },
  { number: 48,  name_ar: 'الفتح',       transliteration: 'Al-Fatḥ',         name_fr: 'La Victoire',               name_en: 'The Victory',            revelation_type: 'medinan',  verses_count: 29,  order_revealed: 111 },
  { number: 49,  name_ar: 'الحجرات',     transliteration: 'Al-Ḥujurāt',      name_fr: 'Les Appartements',          name_en: 'The Rooms',              revelation_type: 'medinan',  verses_count: 18,  order_revealed: 106 },
  { number: 50,  name_ar: 'ق',           transliteration: 'Qāf',             name_fr: 'Qâf',                       name_en: 'The Letter Qaf',         revelation_type: 'meccan',   verses_count: 45,  order_revealed: 34 },
  { number: 51,  name_ar: 'الذاريات',    transliteration: 'Adh-Dhāriyāt',    name_fr: 'Les Vents Dispersants',     name_en: 'The Winnowing Winds',    revelation_type: 'meccan',   verses_count: 60,  order_revealed: 67 },
  { number: 52,  name_ar: 'الطور',       transliteration: 'Aṭ-Ṭūr',         name_fr: 'Le Mont Sinaï',             name_en: 'The Mount',              revelation_type: 'meccan',   verses_count: 49,  order_revealed: 76 },
  { number: 53,  name_ar: 'النجم',       transliteration: 'An-Najm',         name_fr: 'L\'Étoile',                 name_en: 'The Star',               revelation_type: 'meccan',   verses_count: 62,  order_revealed: 23 },
  { number: 54,  name_ar: 'القمر',       transliteration: 'Al-Qamar',        name_fr: 'La Lune',                   name_en: 'The Moon',               revelation_type: 'meccan',   verses_count: 55,  order_revealed: 37 },
  { number: 55,  name_ar: 'الرحمن',      transliteration: 'Ar-Raḥmān',       name_fr: 'Le Tout Miséricordieux',    name_en: 'The Beneficent',         revelation_type: 'medinan',  verses_count: 78,  order_revealed: 97 },
  { number: 56,  name_ar: 'الواقعة',     transliteration: 'Al-Wāqi\'a',      name_fr: 'L\'Événement',              name_en: 'The Inevitable',         revelation_type: 'meccan',   verses_count: 96,  order_revealed: 46 },
  { number: 57,  name_ar: 'الحديد',      transliteration: 'Al-Ḥadīd',        name_fr: 'Le Fer',                    name_en: 'The Iron',               revelation_type: 'medinan',  verses_count: 29,  order_revealed: 94 },
  { number: 58,  name_ar: 'المجادلة',    transliteration: 'Al-Mujādila',     name_fr: 'La Discussion',             name_en: 'The Pleading Woman',     revelation_type: 'medinan',  verses_count: 22,  order_revealed: 105 },
  { number: 59,  name_ar: 'الحشر',       transliteration: 'Al-Ḥashr',        name_fr: 'L\'Exode',                  name_en: 'The Exile',              revelation_type: 'medinan',  verses_count: 24,  order_revealed: 101 },
  { number: 60,  name_ar: 'الممتحنة',    transliteration: 'Al-Mumtaḥana',    name_fr: 'L\'Éprouvée',               name_en: 'She that is to be Examined', revelation_type: 'medinan', verses_count: 13, order_revealed: 91 },
  { number: 61,  name_ar: 'الصف',        transliteration: 'Aṣ-Ṣaff',        name_fr: 'Le Rang',                   name_en: 'The Ranks',              revelation_type: 'medinan',  verses_count: 14,  order_revealed: 109 },
  { number: 62,  name_ar: 'الجمعة',      transliteration: 'Al-Jumu\'a',      name_fr: 'Le Vendredi',               name_en: 'Friday',                 revelation_type: 'medinan',  verses_count: 11,  order_revealed: 110 },
  { number: 63,  name_ar: 'المنافقون',   transliteration: 'Al-Munāfiqūn',    name_fr: 'Les Hypocrites',            name_en: 'The Hypocrites',         revelation_type: 'medinan',  verses_count: 11,  order_revealed: 104 },
  { number: 64,  name_ar: 'التغابن',     transliteration: 'At-Taghābun',     name_fr: 'La Tricherie',              name_en: 'The Mutual Disillusion', revelation_type: 'medinan',  verses_count: 18,  order_revealed: 108 },
  { number: 65,  name_ar: 'الطلاق',      transliteration: 'Aṭ-Ṭalāq',       name_fr: 'Le Divorce',                name_en: 'Divorce',                revelation_type: 'medinan',  verses_count: 12,  order_revealed: 99 },
  { number: 66,  name_ar: 'التحريم',     transliteration: 'At-Taḥrīm',       name_fr: 'L\'Interdiction',           name_en: 'The Prohibition',        revelation_type: 'medinan',  verses_count: 12,  order_revealed: 107 },
  { number: 67,  name_ar: 'الملك',       transliteration: 'Al-Mulk',         name_fr: 'La Royauté',                name_en: 'The Sovereignty',        revelation_type: 'meccan',   verses_count: 30,  order_revealed: 77 },
  { number: 68,  name_ar: 'القلم',       transliteration: 'Al-Qalam',        name_fr: 'Le Calame',                 name_en: 'The Pen',                revelation_type: 'meccan',   verses_count: 52,  order_revealed: 2 },
  { number: 69,  name_ar: 'الحاقة',      transliteration: 'Al-Ḥāqqa',        name_fr: 'La Réalité',                name_en: 'The Reality',            revelation_type: 'meccan',   verses_count: 52,  order_revealed: 78 },
  { number: 70,  name_ar: 'المعارج',     transliteration: 'Al-Ma\'ārij',     name_fr: 'Les Voies d\'Ascension',    name_en: 'The Ascending Stairways', revelation_type: 'meccan',  verses_count: 44,  order_revealed: 79 },
  { number: 71,  name_ar: 'نوح',         transliteration: 'Nūḥ',             name_fr: 'Noé',                       name_en: 'Noah',                   revelation_type: 'meccan',   verses_count: 28,  order_revealed: 71 },
  { number: 72,  name_ar: 'الجن',        transliteration: 'Al-Jinn',         name_fr: 'Les Djinns',                name_en: 'The Jinn',               revelation_type: 'meccan',   verses_count: 28,  order_revealed: 40 },
  { number: 73,  name_ar: 'المزمل',      transliteration: 'Al-Muzzammil',    name_fr: 'L\'Enveloppé',              name_en: 'The Enshrouded One',     revelation_type: 'meccan',   verses_count: 20,  order_revealed: 3 },
  { number: 74,  name_ar: 'المدثر',      transliteration: 'Al-Muddaththir',  name_fr: 'L\'Enveloppé dans son Manteau', name_en: 'The Cloaked One',  revelation_type: 'meccan',   verses_count: 56,  order_revealed: 4 },
  { number: 75,  name_ar: 'القيامة',     transliteration: 'Al-Qiyāma',       name_fr: 'La Résurrection',           name_en: 'The Resurrection',       revelation_type: 'meccan',   verses_count: 40,  order_revealed: 31 },
  { number: 76,  name_ar: 'الإنسان',     transliteration: 'Al-Insān',        name_fr: 'L\'Homme',                  name_en: 'The Man',                revelation_type: 'medinan',  verses_count: 31,  order_revealed: 98 },
  { number: 77,  name_ar: 'المرسلات',    transliteration: 'Al-Mursalāt',     name_fr: 'Les Envoyés',               name_en: 'The Emissaries',         revelation_type: 'meccan',   verses_count: 50,  order_revealed: 33 },
  { number: 78,  name_ar: 'النبأ',       transliteration: 'An-Naba\'',       name_fr: 'La Nouvelle',               name_en: 'The Tidings',            revelation_type: 'meccan',   verses_count: 40,  order_revealed: 80 },
  { number: 79,  name_ar: 'النازعات',    transliteration: 'An-Nāzi\'āt',     name_fr: 'Les Arracheurs',            name_en: 'Those Who Drag Forth',   revelation_type: 'meccan',   verses_count: 46,  order_revealed: 81 },
  { number: 80,  name_ar: 'عبس',         transliteration: '\'Abasa',         name_fr: 'Il S\'est Renfrogné',       name_en: 'He Frowned',             revelation_type: 'meccan',   verses_count: 42,  order_revealed: 24 },
  { number: 81,  name_ar: 'التكوير',     transliteration: 'At-Takwīr',       name_fr: 'L\'Enroulement',            name_en: 'The Overthrowing',       revelation_type: 'meccan',   verses_count: 29,  order_revealed: 7 },
  { number: 82,  name_ar: 'الانفطار',    transliteration: 'Al-Infiṭār',      name_fr: 'La Déchirure',              name_en: 'The Cleaving',           revelation_type: 'meccan',   verses_count: 19,  order_revealed: 82 },
  { number: 83,  name_ar: 'المطففين',    transliteration: 'Al-Muṭaffifīn',   name_fr: 'Les Fraudeurs',             name_en: 'The Defrauding',         revelation_type: 'meccan',   verses_count: 36,  order_revealed: 86 },
  { number: 84,  name_ar: 'الانشقاق',    transliteration: 'Al-Inshiqāq',     name_fr: 'L\'Éclatement',             name_en: 'The Splitting Open',     revelation_type: 'meccan',   verses_count: 25,  order_revealed: 83 },
  { number: 85,  name_ar: 'البروج',      transliteration: 'Al-Burūj',        name_fr: 'Les Constellations',        name_en: 'The Mansions of the Stars', revelation_type: 'meccan', verses_count: 22, order_revealed: 27 },
  { number: 86,  name_ar: 'الطارق',      transliteration: 'Aṭ-Ṭāriq',       name_fr: 'L\'Astre Nocturne',         name_en: 'The Morning Star',       revelation_type: 'meccan',   verses_count: 17,  order_revealed: 36 },
  { number: 87,  name_ar: 'الأعلى',      transliteration: 'Al-A\'lā',        name_fr: 'Le Très Haut',              name_en: 'The Most High',          revelation_type: 'meccan',   verses_count: 19,  order_revealed: 8 },
  { number: 88,  name_ar: 'الغاشية',     transliteration: 'Al-Ghāshiya',     name_fr: 'L\'Enveloppante',           name_en: 'The Overwhelming',       revelation_type: 'meccan',   verses_count: 26,  order_revealed: 68 },
  { number: 89,  name_ar: 'الفجر',       transliteration: 'Al-Fajr',         name_fr: 'L\'Aurore',                 name_en: 'The Dawn',               revelation_type: 'meccan',   verses_count: 30,  order_revealed: 10 },
  { number: 90,  name_ar: 'البلد',       transliteration: 'Al-Balad',        name_fr: 'La Cité',                   name_en: 'The City',               revelation_type: 'meccan',   verses_count: 20,  order_revealed: 35 },
  { number: 91,  name_ar: 'الشمس',       transliteration: 'Ash-Shams',       name_fr: 'Le Soleil',                 name_en: 'The Sun',                revelation_type: 'meccan',   verses_count: 15,  order_revealed: 26 },
  { number: 92,  name_ar: 'الليل',       transliteration: 'Al-Layl',         name_fr: 'La Nuit',                   name_en: 'The Night',              revelation_type: 'meccan',   verses_count: 21,  order_revealed: 9 },
  { number: 93,  name_ar: 'الضحى',       transliteration: 'Aḍ-Ḍuḥā',        name_fr: 'La Matinée',                name_en: 'The Morning Hours',      revelation_type: 'meccan',   verses_count: 11,  order_revealed: 11 },
  { number: 94,  name_ar: 'الشرح',       transliteration: 'Ash-Sharḥ',       name_fr: 'L\'Ouverture du Cœur',      name_en: 'The Relief',             revelation_type: 'meccan',   verses_count: 8,   order_revealed: 12 },
  { number: 95,  name_ar: 'التين',       transliteration: 'At-Tīn',          name_fr: 'Le Figuier',                name_en: 'The Fig',                revelation_type: 'meccan',   verses_count: 8,   order_revealed: 28 },
  { number: 96,  name_ar: 'العلق',       transliteration: 'Al-\'Alaq',       name_fr: 'L\'Adhérence',              name_en: 'The Clot',               revelation_type: 'meccan',   verses_count: 19,  order_revealed: 1 },
  { number: 97,  name_ar: 'القدر',       transliteration: 'Al-Qadr',         name_fr: 'La Nuit du Destin',         name_en: 'The Power',              revelation_type: 'meccan',   verses_count: 5,   order_revealed: 25 },
  { number: 98,  name_ar: 'البينة',      transliteration: 'Al-Bayyina',      name_fr: 'La Preuve',                 name_en: 'The Clear Proof',        revelation_type: 'medinan',  verses_count: 8,   order_revealed: 100 },
  { number: 99,  name_ar: 'الزلزلة',     transliteration: 'Az-Zalzala',      name_fr: 'Le Tremblement de Terre',   name_en: 'The Earthquake',         revelation_type: 'medinan',  verses_count: 8,   order_revealed: 93 },
  { number: 100, name_ar: 'العاديات',    transliteration: 'Al-\'Ādiyāt',     name_fr: 'Les Coursiers',             name_en: 'The Chargers',           revelation_type: 'meccan',   verses_count: 11,  order_revealed: 14 },
  { number: 101, name_ar: 'القارعة',     transliteration: 'Al-Qāri\'a',      name_fr: 'Le Fracas',                 name_en: 'The Calamity',           revelation_type: 'meccan',   verses_count: 11,  order_revealed: 30 },
  { number: 102, name_ar: 'التكاثر',     transliteration: 'At-Takāthur',     name_fr: 'La Rivalité',               name_en: 'The Rivalry in World Increase', revelation_type: 'meccan', verses_count: 8, order_revealed: 16 },
  { number: 103, name_ar: 'العصر',       transliteration: 'Al-\'Aṣr',        name_fr: 'L\'Après-Midi',             name_en: 'The Declining Day',      revelation_type: 'meccan',   verses_count: 3,   order_revealed: 13 },
  { number: 104, name_ar: 'الهمزة',      transliteration: 'Al-Humaza',       name_fr: 'Le Calomniateur',           name_en: 'The Traducer',           revelation_type: 'meccan',   verses_count: 9,   order_revealed: 32 },
  { number: 105, name_ar: 'الفيل',       transliteration: 'Al-Fīl',          name_fr: 'L\'Éléphant',               name_en: 'The Elephant',           revelation_type: 'meccan',   verses_count: 5,   order_revealed: 19 },
  { number: 106, name_ar: 'قريش',        transliteration: 'Quraysh',         name_fr: 'Quraych',                   name_en: 'Quraysh',                revelation_type: 'meccan',   verses_count: 4,   order_revealed: 29 },
  { number: 107, name_ar: 'الماعون',     transliteration: 'Al-Mā\'ūn',       name_fr: 'Les Ustensiles',            name_en: 'The Small Kindnesses',   revelation_type: 'meccan',   verses_count: 7,   order_revealed: 17 },
  { number: 108, name_ar: 'الكوثر',      transliteration: 'Al-Kawthar',      name_fr: 'L\'Abondance',              name_en: 'The Abundance',          revelation_type: 'meccan',   verses_count: 3,   order_revealed: 15 },
  { number: 109, name_ar: 'الكافرون',    transliteration: 'Al-Kāfirūn',      name_fr: 'Les Mécréants',             name_en: 'The Disbelievers',       revelation_type: 'meccan',   verses_count: 6,   order_revealed: 18 },
  { number: 110, name_ar: 'النصر',       transliteration: 'An-Naṣr',         name_fr: 'Le Secours',                name_en: 'The Divine Support',     revelation_type: 'medinan',  verses_count: 3,   order_revealed: 114 },
  { number: 111, name_ar: 'المسد',       transliteration: 'Al-Masad',        name_fr: 'Les Fibres',                name_en: 'The Palm Fibre',         revelation_type: 'meccan',   verses_count: 5,   order_revealed: 6 },
  { number: 112, name_ar: 'الإخلاص',     transliteration: 'Al-Ikhlāṣ',       name_fr: 'Le Monothéisme Pur',        name_en: 'The Sincerity',          revelation_type: 'meccan',   verses_count: 4,   order_revealed: 22 },
  { number: 113, name_ar: 'الفلق',       transliteration: 'Al-Falaq',        name_fr: 'L\'Aube Naissante',         name_en: 'The Daybreak',           revelation_type: 'meccan',   verses_count: 5,   order_revealed: 20 },
  { number: 114, name_ar: 'الناس',       transliteration: 'An-Nās',          name_fr: 'Les Hommes',                name_en: 'Mankind',                revelation_type: 'meccan',   verses_count: 6,   order_revealed: 21 },
];

// API endpoints
export const API = {
  ALQURAN_CLOUD: 'https://api.alquran.cloud/v1',
  EVERYAYAH_BASE: 'https://everyayah.com/data/Alafasy_128kbps',
  GOOGLE_TTS_BASE: 'https://translate.google.com/translate_tts',
  WIKIMEDIA_API: 'https://commons.wikimedia.org/w/api.php',
};

// Rate limits (ms between requests per domain)
export const RATE_LIMITS = {
  GOOGLE_TTS: 1500,     // 1 req/1.5s hard cap
  ALQURAN_CLOUD: 500,   // 2 req/s (generous)
  EVERYAYAH: 200,       // 5 req/s (file server, more permissive)
  WIKIMEDIA: 300,       // ~3 req/s
};

// Minimum valid file sizes (bytes) — smaller = error/placeholder
export const MIN_VALID_SIZE = {
  MP3: 3000,
  IMAGE: 5000,
};
