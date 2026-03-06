-- ============================================================
-- ARABE LOCAL — Données initiales (seed)
-- Contient : 28 lettres + 50 mots + 10 leçons + Al-Fatiha
-- ============================================================

-- Utilisateur par défaut
INSERT OR IGNORE INTO users (id, name, level, language, theme, font_size)
VALUES (1, 'Étudiant', 'beginner', 'fr', 'light', 3);

-- Paramètres par défaut
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('notifications',       'true'),
  ('auto_play_audio',     'false'),
  ('show_transliteration','true'),
  ('show_translation',    'true'),
  ('quiz_questions_count','10'),
  ('daily_goal',          '15');

-- ============================================================
-- CATÉGORIES DE VOCABULAIRE
-- ============================================================
INSERT OR IGNORE INTO vocabulary_categories (id, slug, name_fr, name_en, icon, color, order_num) VALUES
  (1,  'greetings', 'Salutations',      'Greetings',     '👋', '#22c55e', 1),
  (2,  'family',    'Famille',           'Family',        '👨‍👩‍👧‍👦', '#3b82f6', 2),
  (3,  'home',      'Maison',            'Home',          '🏠', '#f59e0b', 3),
  (4,  'school',    'École',             'School',        '🎓', '#8b5cf6', 4),
  (5,  'food',      'Nourriture',        'Food',          '🍽️', '#ef4444', 5),
  (6,  'numbers',   'Chiffres',          'Numbers',       '🔢', '#06b6d4', 6),
  (7,  'verbs',     'Verbes fréquents',  'Common Verbs',  '✍️', '#ec4899', 7),
  (8,  'religion',  'Religion',          'Religion',      '☪️', '#78716c', 8),
  (9,  'nature',    'Nature',            'Nature',        '🌿', '#10b981', 9),
  (10, 'travel',    'Voyage',            'Travel',        '✈️', '#6366f1', 10);

-- ============================================================
-- LES 28 LETTRES DE L'ALPHABET ARABE
-- ============================================================
INSERT OR IGNORE INTO letters
  (order_num, arabic, name_ar, name_fr, name_en, transliteration, pronunciation_fr,
   isolated_form, initial_form, medial_form, final_form, connects_left, level,
   description_fr, youtube_query, examples_json, vowels_json)
VALUES
(1,'ا','أَلِف','Alif','Alif','a / ā','comme "a" dans "ami"',
 'ا','ا','ا','ا',0,'beginner',
 'L''Alif est la première lettre. Elle ne se connecte qu''à droite.',
 'apprendre alif arabe débutant',
 '[{"arabic":"أَب","transliteration":"ab","translation_fr":"père","translation_en":"father","position":"initial"},{"arabic":"كِتَاب","transliteration":"kitāb","translation_fr":"livre","translation_en":"book","position":"medial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"اَ","pronunciation":"a"},{"name":"kasra","arabic":"ِ","combined":"اِ","pronunciation":"i"},{"name":"damma","arabic":"ُ","combined":"اُ","pronunciation":"ou"}]'),

(2,'ب','بَاء','Ba','Ba','b','comme "b" dans "beau"',
 'ب','بـ','ـبـ','ـب',1,'beginner',
 'Le Ba est la deuxième lettre. Il possède un point en dessous.',
 'apprendre ba arabe',
 '[{"arabic":"بَيْت","transliteration":"bayt","translation_fr":"maison","translation_en":"house","position":"initial"},{"arabic":"كِتَاب","transliteration":"kitāb","translation_fr":"livre","translation_en":"book","position":"final"}]',
 '[{"name":"fatha","arabic":"َ","combined":"بَ","pronunciation":"ba"},{"name":"kasra","arabic":"ِ","combined":"بِ","pronunciation":"bi"},{"name":"damma","arabic":"ُ","combined":"بُ","pronunciation":"bu"},{"name":"soukoun","arabic":"ْ","combined":"بْ","pronunciation":"b"}]'),

(3,'ت','تَاء','Ta','Ta','t','comme "t" dans "table"',
 'ت','تـ','ـتـ','ـت',1,'beginner',
 'Le Ta est similaire au Ba mais avec deux points au-dessus.',
 'apprendre ta arabe',
 '[{"arabic":"تُفَّاح","transliteration":"tuffāḥ","translation_fr":"pomme","translation_en":"apple","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"تَ","pronunciation":"ta"},{"name":"kasra","arabic":"ِ","combined":"تِ","pronunciation":"ti"},{"name":"damma","arabic":"ُ","combined":"تُ","pronunciation":"tu"}]'),

(4,'ث','ثَاء','Tha','Tha','th','comme "th" anglais dans "think"',
 'ث','ثـ','ـثـ','ـث',1,'beginner',
 'Le Tha a trois points au-dessus. Se prononce comme le "th" anglais sourd.',
 'apprendre tha arabe',
 '[{"arabic":"ثَلَاثَة","transliteration":"thalātha","translation_fr":"trois","translation_en":"three","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"ثَ","pronunciation":"tha"},{"name":"kasra","arabic":"ِ","combined":"ثِ","pronunciation":"thi"}]'),

(5,'ج','جِيم','Jim','Jim','j','comme "dj" dans "djinn"',
 'ج','جـ','ـجـ','ـج',1,'beginner',
 'Le Jim se prononce "dj". En Égypte, il se prononce "g" dur.',
 'apprendre jim arabe',
 '[{"arabic":"جَمِيل","transliteration":"jamīl","translation_fr":"beau","translation_en":"beautiful","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"جَ","pronunciation":"ja"},{"name":"kasra","arabic":"ِ","combined":"جِ","pronunciation":"ji"},{"name":"damma","arabic":"ُ","combined":"جُ","pronunciation":"ju"}]'),

(6,'ح','حَاء','Ha','Ha','ḥ','h aspiré fort (gorge)','ح','حـ','ـحـ','ـح',1,'beginner',
 'Le Ha pharyngal est un h profond, soufflé depuis la gorge.',
 'apprendre ha pharyngal arabe',
 '[{"arabic":"حَيَاة","transliteration":"ḥayāt","translation_fr":"vie","translation_en":"life","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"حَ","pronunciation":"ḥa"}]'),

(7,'خ','خَاء','Kha','Kha','kh','comme "j" espagnol dans "jota"',
 'خ','خـ','ـخـ','ـخ',1,'beginner',
 'Le Kha est une friction gutturale, similaire au "ch" allemand dans "Bach".',
 'apprendre kha arabe',
 '[{"arabic":"خُبْز","transliteration":"khubz","translation_fr":"pain","translation_en":"bread","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"خَ","pronunciation":"kha"}]'),

(8,'د','دَال','Dal','Dal','d','comme "d" dans "dur"',
 'د','د','ـد','ـد',0,'beginner',
 'Le Dal ne se connecte qu''à droite.',
 'apprendre dal arabe',
 '[{"arabic":"دَار","transliteration":"dār","translation_fr":"demeure","translation_en":"home","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"دَ","pronunciation":"da"}]'),

(9,'ذ','ذَال','Dhal','Dhal','dh','comme "th" anglais dans "this"',
 'ذ','ذ','ـذ','ـذ',0,'beginner',
 'Le Dhal est le pendant sonore du Tha.',
 'apprendre dhal arabe',
 '[{"arabic":"ذَهَب","transliteration":"dhahab","translation_fr":"or","translation_en":"gold","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"ذَ","pronunciation":"dha"}]'),

(10,'ر','رَاء','Ra','Ra','r','r roulé',
 'ر','ر','ـر','ـر',0,'beginner',
 'Le Ra ne se connecte qu''à droite. C''est un r bien roulé.',
 'apprendre ra arabe',
 '[{"arabic":"رَجُل","transliteration":"rajul","translation_fr":"homme","translation_en":"man","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"رَ","pronunciation":"ra"}]'),

(11,'ز','زَاي','Zay','Zay','z','comme "z" dans "zèbre"',
 'ز','ز','ـز','ـز',0,'beginner',
 'Le Zay est similaire au Ra mais avec un point au-dessus.',
 'apprendre zay arabe',
 '[{"arabic":"زَيْت","transliteration":"zayt","translation_fr":"huile","translation_en":"oil","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"زَ","pronunciation":"za"}]'),

(12,'س','سِين','Sin','Sin','s','comme "s" dans "sac"',
 'س','سـ','ـسـ','ـس',1,'beginner',
 'Le Sin a trois dents caractéristiques.',
 'apprendre sin arabe',
 '[{"arabic":"سَمَاء","transliteration":"samāʾ","translation_fr":"ciel","translation_en":"sky","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"سَ","pronunciation":"sa"}]'),

(13,'ش','شِين','Shin','Shin','sh','comme "ch" dans "chat"',
 'ش','شـ','ـشـ','ـش',1,'beginner',
 'Le Shin est le Sin avec trois points au-dessus.',
 'apprendre shin arabe',
 '[{"arabic":"شَمْس","transliteration":"shams","translation_fr":"soleil","translation_en":"sun","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"شَ","pronunciation":"sha"}]'),

(14,'ص','صَاد','Sad','Sad','ṣ','s emphatique (dorsale)',
 'ص','صـ','ـصـ','ـص',1,'intermediate',
 'Le Sad est un s emphatique prononcé avec la langue aplatie.',
 'apprendre sad arabe emphatique',
 '[{"arabic":"صَبْر","transliteration":"ṣabr","translation_fr":"patience","translation_en":"patience","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"صَ","pronunciation":"ṣa"}]'),

(15,'ض','ضَاد','Dad','Dad','ḍ','d emphatique (dorsale)',
 'ض','ضـ','ـضـ','ـض',1,'intermediate',
 'Le Dad est une lettre unique à l''arabe, très emphatique.',
 'apprendre dad arabe emphatique',
 '[{"arabic":"ضَوْء","transliteration":"ḍawʾ","translation_fr":"lumière","translation_en":"light","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"ضَ","pronunciation":"ḍa"}]'),

(16,'ط','طَاء','Ta emphatique','Emphatic Ta','ṭ','t emphatique (dorsale)',
 'ط','طـ','ـطـ','ـط',1,'intermediate',
 'Le Ta emphatique est prononcé avec la langue aplatie.',
 'apprendre ta emphatique arabe',
 '[{"arabic":"طَائِر","transliteration":"ṭāʾir","translation_fr":"oiseau","translation_en":"bird","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"طَ","pronunciation":"ṭa"}]'),

(17,'ظ','ظَاء','Dha emphatique','Emphatic Dha','ẓ','dh emphatique',
 'ظ','ظـ','ـظـ','ـظ',1,'intermediate',
 'Le Dha emphatique est la version emphatique du Dhal.',
 'apprendre dha emphatique arabe',
 '[{"arabic":"ظِلّ","transliteration":"ẓill","translation_fr":"ombre","translation_en":"shadow","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"ظَ","pronunciation":"ẓa"}]'),

(18,'ع','عَيْن','Aïn','Ain','ʿ','son gutturale unique',
 'ع','عـ','ـعـ','ـع',1,'intermediate',
 'L''Aïn est une constriction pharyngée, n''a pas d''équivalent français.',
 'apprendre ain arabe gutturale',
 '[{"arabic":"عَيْن","transliteration":"ʿayn","translation_fr":"œil / source","translation_en":"eye / spring","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"عَ","pronunciation":"ʿa"}]'),

(19,'غ','غَيْن','Ghaïn','Ghayin','gh','comme r grasseyé parisien',
 'غ','غـ','ـغـ','ـغ',1,'intermediate',
 'Le Ghaïn ressemble au r grasseyé du français parisien.',
 'apprendre ghayin arabe',
 '[{"arabic":"غُرْفَة","transliteration":"ghurfa","translation_fr":"chambre","translation_en":"room","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"غَ","pronunciation":"gha"}]'),

(20,'ف','فَاء','Fa','Fa','f','comme "f" dans "feu"',
 'ف','فـ','ـفـ','ـف',1,'beginner',
 'Le Fa est proche du f français.',
 'apprendre fa arabe',
 '[{"arabic":"فَتَح","transliteration":"fataḥa","translation_fr":"ouvrir","translation_en":"to open","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"فَ","pronunciation":"fa"}]'),

(21,'ق','قَاف','Qaf','Qaf','q','k guttural profond',
 'ق','قـ','ـقـ','ـق',1,'intermediate',
 'Le Qaf est un k prononcé très en arrière de la gorge.',
 'apprendre qaf arabe',
 '[{"arabic":"قَمَر","transliteration":"qamar","translation_fr":"lune","translation_en":"moon","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"قَ","pronunciation":"qa"}]'),

(22,'ك','كَاف','Kaf','Kaf','k','comme "k" dans "kilo"',
 'ك','كـ','ـكـ','ـك',1,'beginner',
 'Le Kaf est équivalent au k français.',
 'apprendre kaf arabe',
 '[{"arabic":"كِتَاب","transliteration":"kitāb","translation_fr":"livre","translation_en":"book","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"كَ","pronunciation":"ka"}]'),

(23,'ل','لَام','Lam','Lam','l','comme "l" dans "lune"',
 'ل','لـ','ـلـ','ـل',1,'beginner',
 'Le Lam est équivalent au l français.',
 'apprendre lam arabe',
 '[{"arabic":"لَيْل","transliteration":"layl","translation_fr":"nuit","translation_en":"night","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"لَ","pronunciation":"la"}]'),

(24,'م','مِيم','Mim','Mim','m','comme "m" dans "mer"',
 'م','مـ','ـمـ','ـم',1,'beginner',
 'Le Mim est équivalent au m français.',
 'apprendre mim arabe',
 '[{"arabic":"مَاء","transliteration":"māʾ","translation_fr":"eau","translation_en":"water","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"مَ","pronunciation":"ma"}]'),

(25,'ن','نُون','Nun','Nun','n','comme "n" dans "nuit"',
 'ن','نـ','ـنـ','ـن',1,'beginner',
 'Le Nun est équivalent au n français.',
 'apprendre nun arabe',
 '[{"arabic":"نَار","transliteration":"nār","translation_fr":"feu","translation_en":"fire","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"نَ","pronunciation":"na"}]'),

(26,'ه','هَاء','Ha','Ha (light)','h','h aspiré léger',
 'ه','هـ','ـهـ','ـه',1,'beginner',
 'Le Ha léger est un h soufflé doucement, différent du Ha pharyngal.',
 'apprendre ha leger arabe',
 '[{"arabic":"هَوَاء","transliteration":"hawāʾ","translation_fr":"air","translation_en":"air","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"هَ","pronunciation":"ha"}]'),

(27,'و','وَاو','Waw','Waw','w / ū','comme "ou" dans "oui"',
 'و','و','ـو','ـو',0,'beginner',
 'Le Waw peut être consonne (w) ou voyelle longue (ū). Ne se connecte qu''à droite.',
 'apprendre waw arabe',
 '[{"arabic":"وَلَد","transliteration":"walad","translation_fr":"enfant/garçon","translation_en":"child/boy","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"وَ","pronunciation":"wa"}]'),

(28,'ي','يَاء','Ya','Ya','y / ī','comme "y" dans "yoga"',
 'ي','يـ','ـيـ','ـي',1,'beginner',
 'Le Ya peut être consonne (y) ou voyelle longue (ī).',
 'apprendre ya arabe',
 '[{"arabic":"يَد","transliteration":"yad","translation_fr":"main","translation_en":"hand","position":"initial"}]',
 '[{"name":"fatha","arabic":"َ","combined":"يَ","pronunciation":"ya"}]');

-- ============================================================
-- VOCABULAIRE DE BASE (50 mots)
-- ============================================================
INSERT OR IGNORE INTO vocabulary_words
  (arabic, transliteration, translation_fr, translation_en, category_id, level, example_ar, example_fr, example_en, gender, plural_ar, root_ar)
VALUES
-- SALUTATIONS
('مَرْحَبًا','marḥaban','Bonjour / Bienvenue','Hello / Welcome',1,'beginner','مَرْحَبًا بِكَ','Bienvenue chez toi','Welcome to you',NULL,NULL,'ر ح ب'),
('السَّلَامُ عَلَيْكُم','as-salāmu ʿalaykum','La paix soit sur vous','Peace be upon you',1,'beginner',NULL,'Formule de salutation islamique','Islamic greeting',NULL,NULL,'س ل م'),
('وَعَلَيْكُمُ السَّلَام','wa-ʿalaykumu s-salām','Et sur vous la paix','And upon you peace',1,'beginner',NULL,'Réponse à la salutation islamique','Response to Islamic greeting',NULL,NULL,'س ل م'),
('شُكْرًا','shukran','Merci','Thank you',1,'beginner','شُكْرًا جَزِيلًا','Merci beaucoup','Thank you very much',NULL,NULL,'ش ك ر'),
('عَفْوًا','ʿafwan','De rien / Pardon','You are welcome / Excuse me',1,'beginner',NULL,'Réponse à merci','Response to thank you',NULL,NULL,'ع ف و'),
('نَعَم','naʿam','Oui','Yes',1,'beginner',NULL,NULL,NULL,NULL,NULL,NULL),
('لَا','lā','Non','No',1,'beginner',NULL,NULL,NULL,NULL,NULL,NULL),
('مِنْ فَضْلِكَ','min faḍlik','S''il vous plaît','Please',1,'beginner',NULL,NULL,NULL,NULL,NULL,'ف ض ل'),
('مَعَ السَّلَامَة','maʿa s-salāma','Au revoir','Goodbye',1,'beginner',NULL,NULL,NULL,NULL,NULL,'س ل م'),
('أَهْلًا وَسَهْلًا','ahlan wa-sahlan','Bienvenue','Welcome',1,'beginner',NULL,NULL,NULL,NULL,NULL,'أ ه ل'),

-- FAMILLE
('أَب','ab','père','father',2,'beginner','أَبِي طَبِيب','Mon père est médecin','My father is a doctor','m','آبَاء','أ ب و'),
('أُمّ','umm','mère','mother',2,'beginner','أُمِّي طَيِّبَة','Ma mère est gentille','My mother is kind','f','أُمَّهَات','أ م م'),
('أَخ','akh','frère','brother',2,'beginner','عِنْدِي أَخٌ وَاحِد','J''ai un seul frère','I have one brother','m','إِخْوَة','أ خ و'),
('أُخْت','ukht','sœur','sister',2,'beginner',NULL,NULL,NULL,'f','أَخَوَات','أ خ ت'),
('وَلَد','walad','garçon / enfant','boy / child',2,'beginner',NULL,NULL,NULL,'m','أَوْلَاد','و ل د'),
('بِنْت','bint','fille','girl',2,'beginner',NULL,NULL,NULL,'f','بَنَات','ب ن ت'),
('جَدّ','jadd','grand-père','grandfather',2,'beginner',NULL,NULL,NULL,'m','أَجْدَاد','ج د د'),
('جَدَّة','jadda','grand-mère','grandmother',2,'beginner',NULL,NULL,NULL,'f','جَدَّات','ج د د'),

-- MAISON
('بَيْت','bayt','maison','house',3,'beginner','بَيْتِي كَبِير','Ma maison est grande','My house is big','m','بُيُوت','ب ي ت'),
('غُرْفَة','ghurfa','chambre','room',3,'beginner',NULL,NULL,NULL,'f','غُرَف','غ ر ف'),
('مَطْبَخ','maṭbakh','cuisine','kitchen',3,'beginner',NULL,NULL,NULL,'m','مَطَابِخ','ط ب خ'),
('بَاب','bāb','porte','door',3,'beginner',NULL,NULL,NULL,'m','أَبْوَاب','ب و ب'),
('نَافِذَة','nāfidha','fenêtre','window',3,'beginner',NULL,NULL,NULL,'f','نَوَافِذ','ن ف ذ'),
('مَاء','māʾ','eau','water',3,'beginner',NULL,NULL,NULL,'m',NULL,'م و ه'),

-- ÉCOLE
('مَدْرَسَة','madrasa','école','school',4,'beginner','أَذْهَبُ إِلَى الْمَدْرَسَة','Je vais à l''école','I go to school','f','مَدَارِس','د ر س'),
('كِتَاب','kitāb','livre','book',4,'beginner',NULL,NULL,NULL,'m','كُتُب','ك ت ب'),
('قَلَم','qalam','stylo / crayon','pen',4,'beginner',NULL,NULL,NULL,'m','أَقْلَام','ق ل م'),
('مُعَلِّم','muʿallim','professeur (masc.)','teacher (m)',4,'beginner',NULL,NULL,NULL,'m','مُعَلِّمُون','ع ل م'),
('طَالِب','ṭālib','étudiant','student',4,'beginner',NULL,NULL,NULL,'m','طُلَّاب','ط ل ب'),
('دَرْس','dars','leçon / cours','lesson',4,'beginner',NULL,NULL,NULL,'m','دُرُوس','د ر س'),

-- NOURRITURE
('خُبْز','khubz','pain','bread',5,'beginner',NULL,NULL,NULL,'m',NULL,'خ ب ز'),
('لَحْم','laḥm','viande','meat',5,'beginner',NULL,NULL,NULL,'m',NULL,'ل ح م'),
('تُفَّاح','tuffāḥ','pomme','apple',5,'beginner',NULL,NULL,NULL,'m',NULL,'ت ف ح'),
('مَوْز','mawz','banane','banana',5,'beginner',NULL,NULL,NULL,'m',NULL,'م و ز'),
('أَرُزّ','aruzz','riz','rice',5,'beginner',NULL,NULL,NULL,'m',NULL,'أ ر ز'),
('حَلِيب','ḥalīb','lait','milk',5,'beginner',NULL,NULL,NULL,'m',NULL,'ح ل ب'),

-- CHIFFRES
('وَاحِد','wāḥid','un','one',6,'beginner',NULL,NULL,NULL,'m',NULL,'و ح د'),
('اثْنَان','ithnān','deux','two',6,'beginner',NULL,NULL,NULL,'m',NULL,'ث ن ي'),
('ثَلَاثَة','thalātha','trois','three',6,'beginner',NULL,NULL,NULL,'f',NULL,'ث ل ث'),
('أَرْبَعَة','arbaʿa','quatre','four',6,'beginner',NULL,NULL,NULL,'f',NULL,'ر ب ع'),
('خَمْسَة','khamsa','cinq','five',6,'beginner',NULL,NULL,NULL,'f',NULL,'خ م س'),
('عَشَرَة','ʿashara','dix','ten',6,'beginner',NULL,NULL,NULL,'f',NULL,'ع ش ر'),

-- RELIGION
('اللَّه','allāh','Allah (Dieu)','God / Allah',8,'beginner',NULL,NULL,NULL,NULL,NULL,'أ ل ه'),
('إِسْلَام','islām','Islam','Islam',8,'beginner',NULL,NULL,NULL,'m',NULL,'س ل م'),
('مُسْلِم','muslim','musulman','Muslim',8,'beginner',NULL,NULL,NULL,'m','مُسْلِمُون','س ل م'),
('صَلَاة','ṣalāt','prière','prayer',8,'beginner','أُصَلِّي خَمْسَ مَرَّات','Je prie cinq fois','I pray five times','f','صَلَوَات','ص ل و'),
('مَسْجِد','masjid','mosquée','mosque',8,'beginner',NULL,NULL,NULL,'m','مَسَاجِد','س ج د'),
('قُرْآن','qurʾān','Coran','Quran',8,'beginner',NULL,NULL,NULL,'m',NULL,'ق ر أ'),
('رَمَضَان','ramaḍān','Ramadan','Ramadan',8,'beginner',NULL,NULL,NULL,'m',NULL,'ر م ض'),
('حَلَال','ḥalāl','licite / halal','halal',8,'beginner',NULL,NULL,NULL,NULL,NULL,'ح ل ل');

-- ============================================================
-- LEÇONS DE LECTURE (10 leçons progressives)
-- ============================================================
INSERT OR IGNORE INTO reading_lessons (order_num, title_fr, title_en, level, type, description_fr, content_json, exercises_json) VALUES

(1, 'Introduction : les voyelles courtes', 'Introduction: Short Vowels', 'beginner', 'syllables',
 'Apprenez les trois voyelles courtes : fatha (a), kasra (i), damma (ou).',
 '[{"arabic":"بَ","transliteration":"ba","translation_fr":"ba","audio_file":null,"item_type":"syllable"},{"arabic":"بِ","transliteration":"bi","translation_fr":"bi","audio_file":null,"item_type":"syllable"},{"arabic":"بُ","transliteration":"bu","translation_fr":"bu","audio_file":null,"item_type":"syllable"},{"arabic":"تَ","transliteration":"ta","translation_fr":"ta","audio_file":null,"item_type":"syllable"},{"arabic":"تِ","transliteration":"ti","translation_fr":"ti","audio_file":null,"item_type":"syllable"},{"arabic":"تُ","transliteration":"tu","translation_fr":"tu","audio_file":null,"item_type":"syllable"}]',
 '[{"exercise_type":"identify","question":"Comment se prononce ce signe ?","arabic":"بَ","options":["ba","bi","bu","b"],"correct_answer":"ba"},{"exercise_type":"identify","question":"Comment se prononce ce signe ?","arabic":"بِ","options":["ba","bi","bu","b"],"correct_answer":"bi"},{"exercise_type":"identify","question":"Comment se prononce ce signe ?","arabic":"بُ","options":["ba","bi","bu","b"],"correct_answer":"bu"}]'),

(2, 'Les syllabes avec les lettres B, T, N', 'Syllables with B, T, N', 'beginner', 'syllables',
 'Combinez les lettres Ba, Ta, Nun avec les voyelles courtes.',
 '[{"arabic":"بَا","transliteration":"bā","translation_fr":"ba long","audio_file":null,"item_type":"syllable"},{"arabic":"نَ","transliteration":"na","translation_fr":"na","audio_file":null,"item_type":"syllable"},{"arabic":"تَا","transliteration":"tā","translation_fr":"tā long","audio_file":null,"item_type":"syllable"},{"arabic":"نِي","transliteration":"nī","translation_fr":"nī","audio_file":null,"item_type":"syllable"}]',
 '[{"exercise_type":"identify","question":"Quelle syllabe voyez-vous ?","arabic":"بَا","options":["bā","bi","tu","na"],"correct_answer":"bā"},{"exercise_type":"identify","question":"Quelle syllabe voyez-vous ?","arabic":"نَ","options":["ta","na","ba","ni"],"correct_answer":"na"}]'),

(3, 'Premiers mots simples', 'First Simple Words', 'beginner', 'words',
 'Lisez et reconnaissez vos premiers mots arabes complets.',
 '[{"arabic":"أَب","transliteration":"ab","translation_fr":"père","audio_file":null,"item_type":"word"},{"arabic":"أُمّ","transliteration":"umm","translation_fr":"mère","audio_file":null,"item_type":"word"},{"arabic":"يَد","transliteration":"yad","translation_fr":"main","audio_file":null,"item_type":"word"},{"arabic":"نَار","transliteration":"nār","translation_fr":"feu","audio_file":null,"item_type":"word"},{"arabic":"بَاب","transliteration":"bāb","translation_fr":"porte","audio_file":null,"item_type":"word"}]',
 '[{"exercise_type":"translate","question":"Que signifie ce mot ?","arabic":"أَب","options":["père","mère","frère","sœur"],"correct_answer":"père"},{"exercise_type":"translate","question":"Que signifie ce mot ?","arabic":"يَد","options":["pied","tête","main","œil"],"correct_answer":"main"},{"exercise_type":"translate","question":"Que signifie ce mot ?","arabic":"نَار","options":["eau","feu","terre","air"],"correct_answer":"feu"}]'),

(4, 'L''article défini : ال (Al)', 'The Definite Article: Al', 'beginner', 'words',
 'Apprenez à utiliser l''article défini arabe.',
 '[{"arabic":"الْبَيْت","transliteration":"al-bayt","translation_fr":"la maison","audio_file":null,"item_type":"word"},{"arabic":"الْكِتَاب","transliteration":"al-kitāb","translation_fr":"le livre","audio_file":null,"item_type":"word"},{"arabic":"الْمَاء","transliteration":"al-māʾ","translation_fr":"l''eau","audio_file":null,"item_type":"word"},{"arabic":"الشَّمْس","transliteration":"ash-shams","translation_fr":"le soleil","audio_file":null,"item_type":"word"}]',
 '[{"exercise_type":"translate","question":"Que signifie ce mot ?","arabic":"الْكِتَاب","options":["un livre","le livre","des livres","cette livre"],"correct_answer":"le livre"}]'),

(5, 'Phrases simples : sujet + attribut', 'Simple Sentences', 'beginner', 'sentences',
 'Formez vos premières phrases arabes sans verbe "être".',
 '[{"arabic":"الْبَيْتُ كَبِير","transliteration":"al-baytu kabīr","translation_fr":"La maison est grande","audio_file":null,"item_type":"sentence"},{"arabic":"الْوَلَدُ صَغِير","transliteration":"al-waladu ṣaghīr","translation_fr":"Le garçon est petit","audio_file":null,"item_type":"sentence"},{"arabic":"الْكِتَابُ جَمِيل","transliteration":"al-kitābu jamīl","translation_fr":"Le livre est beau","audio_file":null,"item_type":"sentence"}]',
 '[{"exercise_type":"translate","question":"Que signifie cette phrase ?","arabic":"الْبَيْتُ كَبِير","options":["La maison est grande","Le garçon est grand","La porte est grande","La maison est petite"],"correct_answer":"La maison est grande"}]'),

(6, 'Les salutations', 'Greetings', 'beginner', 'sentences',
 'Apprenez les formules de salutation essentielles.',
 '[{"arabic":"السَّلَامُ عَلَيْكُم","transliteration":"as-salāmu ʿalaykum","translation_fr":"La paix soit sur vous","audio_file":null,"item_type":"sentence"},{"arabic":"وَعَلَيْكُمُ السَّلَام","transliteration":"wa-ʿalaykumu s-salām","translation_fr":"Et sur vous la paix","audio_file":null,"item_type":"sentence"},{"arabic":"كَيْفَ حَالُكَ؟","transliteration":"kayfa ḥāluka?","translation_fr":"Comment vas-tu ?","audio_file":null,"item_type":"sentence"},{"arabic":"بِخَيْر، شُكْرًا","transliteration":"bi-khayr, shukran","translation_fr":"Bien, merci","audio_file":null,"item_type":"sentence"}]',
 '[{"exercise_type":"translate","question":"Comment dit-on ''Merci'' en arabe ?","arabic":null,"options":["شُكْرًا","نَعَم","لَا","مَرْحَبًا"],"correct_answer":"شُكْرًا"}]'),

(7, 'Les chiffres de 1 à 10', 'Numbers 1 to 10', 'beginner', 'words',
 'Apprenez à compter en arabe.',
 '[{"arabic":"وَاحِد","transliteration":"wāḥid","translation_fr":"1 - un","audio_file":null,"item_type":"word"},{"arabic":"اثْنَان","transliteration":"ithnān","translation_fr":"2 - deux","audio_file":null,"item_type":"word"},{"arabic":"ثَلَاثَة","transliteration":"thalātha","translation_fr":"3 - trois","audio_file":null,"item_type":"word"},{"arabic":"أَرْبَعَة","transliteration":"arbaʿa","translation_fr":"4 - quatre","audio_file":null,"item_type":"word"},{"arabic":"خَمْسَة","transliteration":"khamsa","translation_fr":"5 - cinq","audio_file":null,"item_type":"word"},{"arabic":"سِتَّة","transliteration":"sitta","translation_fr":"6 - six","audio_file":null,"item_type":"word"},{"arabic":"سَبْعَة","transliteration":"sabʿa","translation_fr":"7 - sept","audio_file":null,"item_type":"word"},{"arabic":"ثَمَانِيَة","transliteration":"thamāniya","translation_fr":"8 - huit","audio_file":null,"item_type":"word"},{"arabic":"تِسْعَة","transliteration":"tisʿa","translation_fr":"9 - neuf","audio_file":null,"item_type":"word"},{"arabic":"عَشَرَة","transliteration":"ʿashara","translation_fr":"10 - dix","audio_file":null,"item_type":"word"}]',
 '[{"exercise_type":"translate","question":"Comment dit-on ''cinq'' en arabe ?","arabic":null,"options":["خَمْسَة","أَرْبَعَة","سِتَّة","ثَلَاثَة"],"correct_answer":"خَمْسَة"},{"exercise_type":"translate","question":"Quel chiffre est-ce ?","arabic":"عَشَرَة","options":["7","8","9","10"],"correct_answer":"10"}]'),

(8, 'La famille', 'The Family', 'beginner', 'words',
 'Le vocabulaire de la famille en arabe.',
 '[{"arabic":"أَب","transliteration":"ab","translation_fr":"père","audio_file":null,"item_type":"word"},{"arabic":"أُمّ","transliteration":"umm","translation_fr":"mère","audio_file":null,"item_type":"word"},{"arabic":"أَخ","transliteration":"akh","translation_fr":"frère","audio_file":null,"item_type":"word"},{"arabic":"أُخْت","transliteration":"ukht","translation_fr":"sœur","audio_file":null,"item_type":"word"},{"arabic":"عَائِلَة","transliteration":"ʿāʾila","translation_fr":"famille","audio_file":null,"item_type":"word"}]',
 '[{"exercise_type":"translate","question":"Comment dit-on ''sœur'' en arabe ?","arabic":null,"options":["أُخْت","أَخ","أُمّ","أَب"],"correct_answer":"أُخْت"}]'),

(9, 'Au marché : mots de nourriture', 'At the Market: Food Words', 'intermediate', 'words',
 'Vocabulaire pour faire les courses.',
 '[{"arabic":"خُبْز","transliteration":"khubz","translation_fr":"pain","audio_file":null,"item_type":"word"},{"arabic":"لَحْم","transliteration":"laḥm","translation_fr":"viande","audio_file":null,"item_type":"word"},{"arabic":"تُفَّاح","transliteration":"tuffāḥ","translation_fr":"pomme","audio_file":null,"item_type":"word"},{"arabic":"كَمْ الثَّمَن؟","transliteration":"kam ath-thaman?","translation_fr":"Quel est le prix ?","audio_file":null,"item_type":"sentence"}]',
 '[{"exercise_type":"translate","question":"Comment dit-on ''pain'' en arabe ?","arabic":null,"options":["خُبْز","لَحْم","مَاء","تُفَّاح"],"correct_answer":"خُبْز"}]'),

(10, 'Lecture de versets simples', 'Reading Simple Verses', 'intermediate', 'paragraph',
 'Entraînez-vous à lire de courts versets coraniques avec voyelles complètes.',
 '[{"arabic":"قُلْ هُوَ اللَّهُ أَحَدٌ","transliteration":"Qul huwa llāhu aḥad","translation_fr":"Dis : Il est Allah, l''Unique","audio_file":null,"item_type":"sentence"},{"arabic":"اللَّهُ الصَّمَدُ","transliteration":"allāhu ṣ-ṣamad","translation_fr":"Allah, le Seul à être imploré","audio_file":null,"item_type":"sentence"},{"arabic":"لَمْ يَلِدْ وَلَمْ يُولَدْ","transliteration":"lam yalid wa-lam yūlad","translation_fr":"Il n''a pas engendré et n''a pas été engendré","audio_file":null,"item_type":"sentence"},{"arabic":"وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ","transliteration":"wa-lam yakun lahū kufuwan aḥad","translation_fr":"Et nul n''est égal à Lui","audio_file":null,"item_type":"sentence"}]',
 '[{"exercise_type":"translate","question":"Que signifie ''أَحَد'' dans ce contexte ?","arabic":"قُلْ هُوَ اللَّهُ أَحَدٌ","options":["l''Unique","le Puissant","le Miséricordieux","le Créateur"],"correct_answer":"l''Unique"}]');

-- ============================================================
-- SOURATES DU CORAN (les 10 premières + les 10 dernières)
-- ============================================================
INSERT OR IGNORE INTO surahs (id, number, name_ar, name_fr, name_en, transliteration, revelation_type, verses_count, order_revealed, description_fr) VALUES
(1,   1,  'الْفَاتِحَة', 'L''Ouverture (Al-Fatiha)',       'The Opening',         'Al-Fātiḥa',   'meccan',   7,  5,  'La sourate d''ouverture, récitée dans chaque unité de prière. Mère du Livre.'),
(2,   2,  'الْبَقَرَة',  'La Vache (Al-Baqara)',            'The Cow',             'Al-Baqara',   'medinan',  286, 87, 'La plus longue sourate. Contient l''Āyat Al-Kursī (verset 255).'),
(3,   3,  'آلِ عِمْرَان','La Famille d''Imran',             'Family of Imran',     'Āl ʿImrān',   'medinan',  200, 89, 'Parle de la famille de Marie, mère de Jésus, et de la bataille d''Ohod.'),
(4,   4,  'النِّسَاء',   'Les Femmes (An-Nisa)',            'The Women',           'An-Nisāʾ',    'medinan',  176, 92, 'Traite notamment des droits des femmes et des règles successorales.'),
(5,   5,  'الْمَائِدَة', 'La Table Servie (Al-Maida)',      'The Table Spread',    'Al-Māʾida',   'medinan',  120, 112,'La dernière grande sourate révélée. Contient la licéité de certains aliments.'),
(6,   6,  'الْأَنْعَام', 'Les Bestiaux (Al-Anam)',          'The Cattle',          'Al-Anʿām',    'meccan',   165, 55, 'Sourate mecquoise traitant de la foi monothéiste et de l''unicité divine.'),
(7,   7,  'الْأَعْرَاف', 'Les Murailles (Al-Araf)',         'The Heights',         'Al-Aʿrāf',    'meccan',   206, 39, 'Récit des peuples antiques et de leurs prophètes.'),
(112, 112,'الْإِخْلَاص', 'La Pureté de foi (Al-Ikhlas)',   'Sincerity',           'Al-Ikhlāṣ',   'meccan',   4,  22, 'Décrit l''unicité absolue de Dieu. Équivaut à 1/3 du Coran.'),
(113, 113,'الْفَلَق',    'L''Aube (Al-Falaq)',              'The Daybreak',        'Al-Falaq',    'meccan',   5,  20, 'Imploration de la protection divine contre le mal.'),
(114, 114,'النَّاس',     'Les Hommes (An-Nas)',             'The Mankind',         'An-Nās',      'meccan',   6,  21, 'La dernière sourate, supplication contre les souffleurs de maléfices.');

-- ============================================================
-- VERSETS DE LA FATIHA (Sourate 1)
-- ============================================================
INSERT OR IGNORE INTO verses (surah_id, verse_number, arabic_text, translation_fr, translation_en, transliteration, juz, page) VALUES
(1, 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
 'Au nom d''Allah, le Tout Miséricordieux, le Très Miséricordieux',
 'In the name of Allah, the Entirely Merciful, the Especially Merciful',
 'Bismi llāhi r-raḥmāni r-raḥīm', 1, 1),

(1, 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
 'Louange à Allah, Seigneur de l''univers',
 'All praise is due to Allah, Lord of the worlds',
 'Al-ḥamdu li-llāhi rabbi l-ʿālamīn', 1, 1),

(1, 3, 'الرَّحْمَٰنِ الرَّحِيمِ',
 'le Tout Miséricordieux, le Très Miséricordieux',
 'The Entirely Merciful, the Especially Merciful',
 'Ar-raḥmāni r-raḥīm', 1, 1),

(1, 4, 'مَالِكِ يَوْمِ الدِّينِ',
 'Maître du Jour de la rétribution',
 'Sovereign of the Day of Recompense',
 'Māliki yawmi d-dīn', 1, 1),

(1, 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
 'C''est Toi [Seul] que nous adorons, et c''est Toi [Seul] dont nous implorons le secours',
 'It is You we worship and You we ask for help',
 'Iyyāka naʿbudu wa-iyyāka nastaʿīn', 1, 1),

(1, 6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
 'Guide-nous dans le droit chemin',
 'Guide us to the straight path',
 'Ihdinā ṣ-ṣirāṭa l-mustaqīm', 1, 1),

(1, 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
 'le chemin de ceux que Tu as comblés de bienfaits, non pas de ceux qui ont encouru Ta colère, ni des égarés',
 'The path of those upon whom You have bestowed favor, not of those who have evoked Your anger or of those who are astray',
 'Ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā ḍ-ḍāllīn', 1, 1);

-- ============================================================
-- VERSETS DE AL-IKHLAS (Sourate 112)
-- ============================================================
INSERT OR IGNORE INTO verses (surah_id, verse_number, arabic_text, translation_fr, translation_en, transliteration, juz, page) VALUES
(112, 1, 'قُلْ هُوَ اللَّهُ أَحَدٌ',
 'Dis : Il est Allah, l''Unique',
 'Say: He is Allah, the One',
 'Qul huwa llāhu aḥad', 30, 604),

(112, 2, 'اللَّهُ الصَّمَدُ',
 'Allah, le Seul à être imploré dans toute nécessité',
 'Allah, the Eternal Refuge',
 'Allāhu ṣ-ṣamad', 30, 604),

(112, 3, 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
 'Il n''a pas engendré et n''a pas été engendré',
 'He neither begets nor is born',
 'Lam yalid wa-lam yūlad', 30, 604),

(112, 4, 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
 'Et nul n''est comparable à Lui',
 'Nor is there to Him any equivalent',
 'Wa-lam yakun lahū kufuwan aḥad', 30, 604);

-- ============================================================
-- VERSETS DE AL-FALAQ (Sourate 113)
-- ============================================================
INSERT OR IGNORE INTO verses (surah_id, verse_number, arabic_text, translation_fr, translation_en, transliteration, juz, page) VALUES
(113, 1, 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
 'Dis : Je cherche protection auprès du Seigneur de l''aube',
 'Say: I seek refuge in the Lord of daybreak',
 'Qul aʿūdhu bi-rabbi l-falaq', 30, 604),

(113, 2, 'مِن شَرِّ مَا خَلَقَ',
 'contre le mal de ce qu''Il a créé',
 'From the evil of that which He created',
 'Min sharri mā khalaq', 30, 604),

(113, 3, 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
 'et contre le mal de la nuit sombre quand elle s''étend',
 'And from the evil of darkness when it settles',
 'Wa-min sharri ghāsiqin idhā waqab', 30, 604),

(113, 4, 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
 'et contre le mal des souffleuses de nœuds',
 'And from the evil of the blowers in knots',
 'Wa-min sharri n-naffāthāti fī l-ʿuqad', 30, 604),

(113, 5, 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
 'et contre le mal de l''envieux quand il envie',
 'And from the evil of an envier when he envies',
 'Wa-min sharri ḥāsidin idhā ḥasad', 30, 604);

-- ============================================================
-- VERSETS DE AN-NAS (Sourate 114)
-- ============================================================
INSERT OR IGNORE INTO verses (surah_id, verse_number, arabic_text, translation_fr, translation_en, transliteration, juz, page) VALUES
(114, 1, 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
 'Dis : Je cherche protection auprès du Seigneur des hommes',
 'Say: I seek refuge in the Lord of mankind',
 'Qul aʿūdhu bi-rabbi n-nās', 30, 604),

(114, 2, 'مَلِكِ النَّاسِ',
 'le Roi des hommes',
 'The Sovereign of mankind',
 'Maliki n-nās', 30, 604),

(114, 3, 'إِلَٰهِ النَّاسِ',
 'le Dieu des hommes',
 'The God of mankind',
 'Ilāhi n-nās', 30, 604),

(114, 4, 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
 'contre le mal du souffleur de doutes, celui qui se dérobe',
 'From the evil of the retreating whisperer',
 'Min sharri l-waswāsi l-khannās', 30, 604),

(114, 5, 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
 'qui souffle dans les poitrines des hommes',
 'Who whispers in the breasts of mankind',
 'Alladhī yuwaswisu fī ṣudūri n-nās', 30, 604),

(114, 6, 'مِنَ الْجِنَّةِ وَالنَّاسِ',
 'qu''il soit parmi les djinns ou parmi les hommes',
 'From among the jinn and mankind',
 'Mina l-jinnati wa-n-nās', 30, 604);
