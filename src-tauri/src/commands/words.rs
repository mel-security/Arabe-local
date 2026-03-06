use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::DbPath;
use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct VocabularyCategory {
    pub id: i64,
    pub slug: String,
    pub name_fr: String,
    pub name_en: String,
    pub icon: String,
    pub color: String,
    pub order_num: i64,
    pub word_count: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VocabularyWord {
    pub id: i64,
    pub arabic: String,
    pub transliteration: String,
    pub translation_fr: String,
    pub translation_en: String,
    pub category_id: Option<i64>,
    pub category_slug: Option<String>,
    pub level: String,
    pub audio_file: Option<String>,
    pub image_file: Option<String>,
    pub example_ar: Option<String>,
    pub example_fr: Option<String>,
    pub example_en: Option<String>,
    pub gender: Option<String>,
    pub plural_ar: Option<String>,
    pub root_ar: Option<String>,
    pub is_learned: bool,
    pub is_favorite: bool,
    pub quiz_score: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WordQuizQuestion {
    pub id: String,
    pub word_id: i64,
    pub question_type: String,
    pub question_fr: String,
    pub arabic: String,
    pub options: Vec<String>,
    pub correct_answer: String,
}

#[tauri::command]
pub async fn get_all_words(db_path: State<'_, DbPath>) -> AppResult<Vec<VocabularyWord>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    query_words(&conn, "SELECT w.*, c.slug, COALESCE(wp.is_learned, 0), COALESCE(wp.is_favorite, 0), wp.quiz_score FROM vocabulary_words w LEFT JOIN vocabulary_categories c ON c.id = w.category_id LEFT JOIN word_progress wp ON wp.word_id = w.id AND wp.user_id = 1 ORDER BY w.id")
}

#[tauri::command]
pub async fn get_words_by_category(db_path: State<'_, DbPath>, category_slug: String) -> AppResult<Vec<VocabularyWord>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let sql = format!(
        "SELECT w.*, c.slug, COALESCE(wp.is_learned, 0), COALESCE(wp.is_favorite, 0), wp.quiz_score FROM vocabulary_words w LEFT JOIN vocabulary_categories c ON c.id = w.category_id LEFT JOIN word_progress wp ON wp.word_id = w.id AND wp.user_id = 1 WHERE c.slug = '{}' ORDER BY w.id",
        category_slug
    );
    query_words(&conn, &sql)
}

#[tauri::command]
pub async fn get_words_by_level(db_path: State<'_, DbPath>, level: String) -> AppResult<Vec<VocabularyWord>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let sql = format!(
        "SELECT w.*, c.slug, COALESCE(wp.is_learned, 0), COALESCE(wp.is_favorite, 0), wp.quiz_score FROM vocabulary_words w LEFT JOIN vocabulary_categories c ON c.id = w.category_id LEFT JOIN word_progress wp ON wp.word_id = w.id AND wp.user_id = 1 WHERE w.level = '{}' ORDER BY w.id",
        level
    );
    query_words(&conn, &sql)
}

#[tauri::command]
pub async fn get_word_by_id(db_path: State<'_, DbPath>, word_id: i64) -> AppResult<VocabularyWord> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let sql = format!(
        "SELECT w.*, c.slug, COALESCE(wp.is_learned, 0), COALESCE(wp.is_favorite, 0), wp.quiz_score FROM vocabulary_words w LEFT JOIN vocabulary_categories c ON c.id = w.category_id LEFT JOIN word_progress wp ON wp.word_id = w.id AND wp.user_id = 1 WHERE w.id = {}",
        word_id
    );
    let words = query_words(&conn, &sql)?;
    words.into_iter().next().ok_or_else(|| AppError::NotFound(format!("Mot {} introuvable", word_id)))
}

fn query_words(conn: &Connection, sql: &str) -> AppResult<Vec<VocabularyWord>> {
    let mut stmt = conn.prepare(sql).map_err(AppError::from)?;
    let words = stmt.query_map([], |row| {
        Ok(VocabularyWord {
            id: row.get(0)?,
            arabic: row.get(1)?,
            transliteration: row.get(2)?,
            translation_fr: row.get(3)?,
            translation_en: row.get(4)?,
            category_id: row.get(5)?,
            level: row.get(6)?,
            audio_file: row.get(7)?,
            image_file: row.get(8)?,
            example_ar: row.get(9)?,
            example_fr: row.get(10)?,
            example_en: row.get(11)?,
            gender: row.get(12)?,
            plural_ar: row.get(13)?,
            root_ar: row.get(14)?,
            category_slug: row.get(17)?,
            is_learned: row.get::<_, i64>(18).map(|v| v != 0)?,
            is_favorite: row.get::<_, i64>(19).map(|v| v != 0)?,
            quiz_score: row.get(20)?,
        })
    }).map_err(AppError::from)?;

    Ok(words.filter_map(|r| r.ok()).collect())
}

#[tauri::command]
pub async fn mark_word_learned(
    db_path: State<'_, DbPath>,
    word_id: i64,
    is_learned: bool,
) -> AppResult<()> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    conn.execute(
        "INSERT INTO word_progress (user_id, word_id, is_learned, last_seen)
         VALUES (1, ?1, ?2, datetime('now'))
         ON CONFLICT(user_id, word_id) DO UPDATE SET
           is_learned = excluded.is_learned,
           last_seen = datetime('now'),
           attempts = attempts + 1",
        params![word_id, is_learned as i64],
    ).map_err(AppError::from)?;

    Ok(())
}

#[tauri::command]
pub async fn toggle_word_favorite(
    db_path: State<'_, DbPath>,
    word_id: i64,
) -> AppResult<bool> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    // Vérifier l'état actuel
    let current: i64 = conn.query_row(
        "SELECT COALESCE(is_favorite, 0) FROM word_progress WHERE user_id = 1 AND word_id = ?1",
        params![word_id],
        |row| row.get(0),
    ).unwrap_or(0);

    let new_state = if current == 0 { 1i64 } else { 0i64 };

    conn.execute(
        "INSERT INTO word_progress (user_id, word_id, is_favorite)
         VALUES (1, ?1, ?2)
         ON CONFLICT(user_id, word_id) DO UPDATE SET is_favorite = excluded.is_favorite",
        params![word_id, new_state],
    ).map_err(AppError::from)?;

    Ok(new_state == 1)
}

#[tauri::command]
pub async fn get_word_quiz_questions(
    db_path: State<'_, DbPath>,
    category_slug: Option<String>,
    level: Option<String>,
    count: Option<usize>,
) -> AppResult<Vec<WordQuizQuestion>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let count = count.unwrap_or(10);

    let filter = match (&category_slug, &level) {
        (Some(cat), _) => format!("WHERE c.slug = '{}'", cat),
        (_, Some(lvl)) => format!("WHERE w.level = '{}'", lvl),
        _ => String::new(),
    };

    let sql = format!(
        "SELECT w.id, w.arabic, w.translation_fr, w.transliteration FROM vocabulary_words w LEFT JOIN vocabulary_categories c ON c.id = w.category_id {} ORDER BY RANDOM() LIMIT {}",
        filter, count
    );

    let all_translations: Vec<String> = {
        let mut s = conn.prepare("SELECT translation_fr FROM vocabulary_words ORDER BY RANDOM() LIMIT 30").map_err(AppError::from)?;
        s.query_map([], |row| row.get::<_, String>(0))
         .map_err(AppError::from)?.filter_map(|r| r.ok()).collect()
    };

    let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;
    let rows: Vec<(i64, String, String, String)> = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
    }).map_err(AppError::from)?.filter_map(|r| r.ok()).collect();

    let mut questions = Vec::new();
    for (idx, (id, arabic, trans_fr, translit)) in rows.iter().enumerate() {
        let mut options: Vec<String> = all_translations.iter()
            .filter(|t| t.as_str() != trans_fr.as_str())
            .take(3)
            .cloned()
            .collect();
        options.push(trans_fr.clone());
        // Simple shuffle basé sur index
        let seed = idx * 7 + 3;
        for i in (1..options.len()).rev() {
            let j = seed % (i + 1);
            options.swap(i, j);
        }

        questions.push(WordQuizQuestion {
            id: format!("wq_{}_{}", idx, id),
            word_id: *id,
            question_type: "translate_to_fr".to_string(),
            question_fr: "Quelle est la traduction de ce mot ?".to_string(),
            arabic: arabic.clone(),
            options,
            correct_answer: trans_fr.clone(),
        });
    }

    Ok(questions)
}
