use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::DbPath;
use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct Letter {
    pub id: i64,
    pub order_num: i64,
    pub arabic: String,
    pub name_ar: String,
    pub name_fr: String,
    pub name_en: String,
    pub transliteration: String,
    pub pronunciation_fr: String,
    pub isolated_form: String,
    pub initial_form: String,
    pub medial_form: String,
    pub final_form: String,
    pub connects_left: bool,
    pub audio_file: Option<String>,
    pub image_file: Option<String>,
    pub level: String,
    pub description_fr: Option<String>,
    pub description_en: Option<String>,
    pub examples: Vec<LetterExample>,
    pub vowels: Vec<LetterVowel>,
    pub youtube_query: Option<String>,
    pub is_learned: bool,
    pub quiz_score: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LetterExample {
    pub arabic: String,
    pub transliteration: String,
    pub translation_fr: String,
    pub translation_en: String,
    pub position: String, // "initial", "medial", "final", "isolated"
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LetterVowel {
    pub name: String,
    pub arabic: String,
    pub combined: String,
    pub pronunciation: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QuizQuestion {
    pub id: String,
    pub letter_id: i64,
    pub question_type: String,
    pub question: String,
    pub arabic: String,
    pub options: Vec<String>,
    pub correct_answer: String,
}

#[tauri::command]
pub async fn get_all_letters(db_path: State<'_, DbPath>) -> AppResult<Vec<Letter>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    query_letters(&conn, "SELECT l.*, COALESCE(lp.is_learned, 0), lp.quiz_score FROM letters l LEFT JOIN letter_progress lp ON lp.letter_id = l.id AND lp.user_id = 1 ORDER BY l.order_num")
}

#[tauri::command]
pub async fn get_letters_by_level(db_path: State<'_, DbPath>, level: String) -> AppResult<Vec<Letter>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let sql = format!(
        "SELECT l.*, COALESCE(lp.is_learned, 0), lp.quiz_score FROM letters l LEFT JOIN letter_progress lp ON lp.letter_id = l.id AND lp.user_id = 1 WHERE l.level = '{}' ORDER BY l.order_num",
        level
    );
    query_letters(&conn, &sql)
}

#[tauri::command]
pub async fn get_letter_by_id(db_path: State<'_, DbPath>, letter_id: i64) -> AppResult<Letter> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let sql = format!(
        "SELECT l.*, COALESCE(lp.is_learned, 0), lp.quiz_score FROM letters l LEFT JOIN letter_progress lp ON lp.letter_id = l.id AND lp.user_id = 1 WHERE l.id = {}",
        letter_id
    );
    let letters = query_letters(&conn, &sql)?;
    letters.into_iter().next().ok_or_else(|| AppError::NotFound(format!("Lettre {} introuvable", letter_id)))
}

fn query_letters(conn: &Connection, sql: &str) -> AppResult<Vec<Letter>> {
    let mut stmt = conn.prepare(sql).map_err(AppError::from)?;
    let letters = stmt.query_map([], |row| {
        let examples_json: String = row.get::<_, Option<String>>(17)?.unwrap_or_else(|| "[]".to_string());
        let vowels_json: String = row.get::<_, Option<String>>(18)?.unwrap_or_else(|| "[]".to_string());

        Ok((
            row.get::<_, i64>(0)?,   // id
            row.get::<_, i64>(1)?,   // order_num
            row.get::<_, String>(2)?,// arabic
            row.get::<_, String>(3)?,// name_ar
            row.get::<_, String>(4)?,// name_fr
            row.get::<_, String>(5)?,// name_en
            row.get::<_, String>(6)?,// transliteration
            row.get::<_, String>(7)?,// pronunciation_fr
            row.get::<_, String>(8)?,// isolated_form
            row.get::<_, String>(9)?,// initial_form
            row.get::<_, String>(10)?,// medial_form
            row.get::<_, String>(11)?,// final_form
            row.get::<_, bool>(12)?, // connects_left
            row.get::<_, Option<String>>(13)?, // audio_file
            row.get::<_, Option<String>>(14)?, // image_file
            row.get::<_, String>(15)?,// level
            row.get::<_, Option<String>>(16)?, // description_fr
            examples_json,
            vowels_json,
            row.get::<_, Option<String>>(19)?, // youtube_query
            row.get::<_, bool>(20)?, // is_learned
            row.get::<_, Option<f64>>(21)?, // quiz_score
        ))
    }).map_err(AppError::from)?;

    let mut result = Vec::new();
    for letter_data in letters {
        let d = letter_data.map_err(AppError::from)?;
        let examples: Vec<LetterExample> = serde_json::from_str(&d.17).unwrap_or_default();
        let vowels: Vec<LetterVowel> = serde_json::from_str(&d.18).unwrap_or_default();

        result.push(Letter {
            id: d.0, order_num: d.1, arabic: d.2, name_ar: d.3,
            name_fr: d.4, name_en: d.5, transliteration: d.6,
            pronunciation_fr: d.7, isolated_form: d.8, initial_form: d.9,
            medial_form: d.10, final_form: d.11, connects_left: d.12,
            audio_file: d.13, image_file: d.14, level: d.15,
            description_fr: d.16, description_en: None,
            examples, vowels,
            youtube_query: d.19,
            is_learned: d.20, quiz_score: d.21,
        });
    }

    Ok(result)
}

#[tauri::command]
pub async fn mark_letter_learned(
    db_path: State<'_, DbPath>,
    letter_id: i64,
    is_learned: bool,
) -> AppResult<()> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    conn.execute(
        "INSERT INTO letter_progress (user_id, letter_id, is_learned, last_seen)
         VALUES (1, ?1, ?2, datetime('now'))
         ON CONFLICT(user_id, letter_id) DO UPDATE SET
           is_learned = excluded.is_learned,
           last_seen = datetime('now'),
           attempts = attempts + 1",
        params![letter_id, is_learned as i64],
    ).map_err(AppError::from)?;

    // Enregistrer dans le journal d'activité
    conn.execute(
        "INSERT INTO activity_log (user_id, module, action, item_id) VALUES (1, 'letters', 'mark_learned', ?1)",
        params![letter_id],
    ).map_err(AppError::from)?;

    Ok(())
}

#[tauri::command]
pub async fn get_letter_quiz_questions(
    db_path: State<'_, DbPath>,
    letter_ids: Vec<i64>,
    count: Option<usize>,
) -> AppResult<Vec<QuizQuestion>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let count = count.unwrap_or(10).min(letter_ids.len());

    // Récupérer les lettres sélectionnées
    let placeholders: String = letter_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let sql = format!(
        "SELECT id, arabic, name_fr, transliteration FROM letters WHERE id IN ({}) ORDER BY RANDOM() LIMIT {}",
        placeholders, count
    );

    let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;
    // Pour la génération de quiz, on utilise des questions simples
    // Type 1: Quelle est cette lettre arabe ?
    // Type 2: Quelle forme correspond à...
    // Type 3: Translittération

    let mut questions = Vec::new();
    let letter_ids_i64: Vec<i64> = letter_ids.clone();

    // Récupérer 3 lettres distracteurs aléatoires
    let wrong_answers: Vec<(i64, String)> = {
        let mut s = conn.prepare(
            "SELECT id, name_fr FROM letters ORDER BY RANDOM() LIMIT 20"
        ).map_err(AppError::from)?;
        s.query_map([], |row| Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?)))
         .map_err(AppError::from)?
         .filter_map(|r| r.ok())
         .collect()
    };

    let rows: Vec<(i64, String, String, String)> = {
        let params_refs: Vec<&dyn rusqlite::types::ToSql> = letter_ids_i64.iter().map(|x| x as &dyn rusqlite::types::ToSql).collect();
        let mut s2 = conn.prepare(&sql).map_err(AppError::from)?;
        s2.query_map(rusqlite::params_from_iter(params_refs.iter()), |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        }).map_err(AppError::from)?.filter_map(|r| r.ok()).collect()
    };

    for (idx, (id, arabic, name_fr, translit)) in rows.iter().enumerate() {
        // Construire des options de réponse (1 correct + 3 distracteurs)
        let mut options: Vec<String> = wrong_answers.iter()
            .filter(|(wid, _)| wid != id)
            .take(3)
            .map(|(_, n)| n.clone())
            .collect();
        options.push(name_fr.clone());
        // Mélanger
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        let mut hasher = DefaultHasher::new();
        idx.hash(&mut hasher);
        let seed = hasher.finish() as usize;
        for i in (1..options.len()).rev() {
            let j = seed % (i + 1);
            options.swap(i, j);
        }

        questions.push(QuizQuestion {
            id: format!("q_{}_{}", idx, id),
            letter_id: *id,
            question_type: "identify_letter".to_string(),
            question: format!("Quelle est cette lettre arabe ?"),
            arabic: arabic.clone(),
            options,
            correct_answer: name_fr.clone(),
        });
    }

    Ok(questions)
}

#[tauri::command]
pub async fn submit_quiz_answer(
    db_path: State<'_, DbPath>,
    letter_id: i64,
    is_correct: bool,
    score: f64,
) -> AppResult<()> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    conn.execute(
        "INSERT INTO letter_progress (user_id, letter_id, quiz_score, attempts, last_seen)
         VALUES (1, ?1, ?2, 1, datetime('now'))
         ON CONFLICT(user_id, letter_id) DO UPDATE SET
           quiz_score = ?2,
           attempts = attempts + 1,
           last_seen = datetime('now')",
        params![letter_id, score],
    ).map_err(AppError::from)?;

    conn.execute(
        "INSERT INTO activity_log (user_id, module, action, item_id, metadata) VALUES (1, 'letters', 'quiz_answer', ?1, ?2)",
        params![letter_id, serde_json::json!({"correct": is_correct, "score": score}).to_string()],
    ).map_err(AppError::from)?;

    Ok(())
}
