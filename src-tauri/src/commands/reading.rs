use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::DbPath;
use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadingLesson {
    pub id: i64,
    pub order_num: i64,
    pub title_fr: String,
    pub title_en: String,
    pub level: String,
    pub lesson_type: String,
    pub content: Vec<ContentItem>,
    pub exercises: Vec<Exercise>,
    pub audio_file: Option<String>,
    pub description_fr: Option<String>,
    pub is_completed: bool,
    pub quiz_score: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContentItem {
    pub arabic: String,
    pub transliteration: Option<String>,
    pub translation_fr: Option<String>,
    pub audio_file: Option<String>,
    pub item_type: String, // "letter", "syllable", "word", "sentence"
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Exercise {
    pub exercise_type: String,
    pub question: String,
    pub arabic: Option<String>,
    pub options: Vec<String>,
    pub correct_answer: String,
}

#[tauri::command]
pub async fn get_reading_lessons(db_path: State<'_, DbPath>) -> AppResult<Vec<ReadingLesson>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let mut stmt = conn.prepare(
        "SELECT rl.id, rl.order_num, rl.title_fr, rl.title_en, rl.level, rl.type,
                rl.content_json, rl.exercises_json, rl.audio_file, rl.description_fr,
                COALESCE(rp.is_completed, 0), rp.quiz_score
         FROM reading_lessons rl
         LEFT JOIN reading_progress rp ON rp.lesson_id = rl.id AND rp.user_id = 1
         ORDER BY rl.order_num"
    ).map_err(AppError::from)?;

    let lessons = stmt.query_map([], |row| {
        let content_json: String = row.get::<_, Option<String>>(6)?.unwrap_or_else(|| "[]".to_string());
        let exercises_json: String = row.get::<_, Option<String>>(7)?.unwrap_or_else(|| "[]".to_string());

        Ok((
            row.get::<_, i64>(0)?,
            row.get::<_, i64>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, String>(5)?,
            content_json,
            exercises_json,
            row.get::<_, Option<String>>(8)?,
            row.get::<_, Option<String>>(9)?,
            row.get::<_, bool>(10)?,
            row.get::<_, Option<f64>>(11)?,
        ))
    }).map_err(AppError::from)?;

    let mut result = Vec::new();
    for lesson_data in lessons {
        let d = lesson_data.map_err(AppError::from)?;
        let content: Vec<ContentItem> = serde_json::from_str(&d.6).unwrap_or_default();
        let exercises: Vec<Exercise> = serde_json::from_str(&d.7).unwrap_or_default();

        result.push(ReadingLesson {
            id: d.0, order_num: d.1, title_fr: d.2, title_en: d.3,
            level: d.4, lesson_type: d.5, content, exercises,
            audio_file: d.8, description_fr: d.9,
            is_completed: d.10, quiz_score: d.11,
        });
    }

    Ok(result)
}

#[tauri::command]
pub async fn get_lesson_by_id(db_path: State<'_, DbPath>, lesson_id: i64) -> AppResult<ReadingLesson> {
    let lessons = get_reading_lessons(db_path).await?;
    lessons.into_iter()
        .find(|l| l.id == lesson_id)
        .ok_or_else(|| AppError::NotFound(format!("Leçon {} introuvable", lesson_id)))
}

#[tauri::command]
pub async fn complete_lesson(
    db_path: State<'_, DbPath>,
    lesson_id: i64,
    score: Option<f64>,
) -> AppResult<()> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    conn.execute(
        "INSERT INTO reading_progress (user_id, lesson_id, is_completed, quiz_score, completed_at, attempts)
         VALUES (1, ?1, 1, ?2, datetime('now'), 1)
         ON CONFLICT(user_id, lesson_id) DO UPDATE SET
           is_completed = 1,
           quiz_score = COALESCE(excluded.quiz_score, quiz_score),
           completed_at = datetime('now'),
           attempts = attempts + 1",
        params![lesson_id, score],
    ).map_err(AppError::from)?;

    conn.execute(
        "INSERT INTO activity_log (user_id, module, action, item_id) VALUES (1, 'reading', 'complete_lesson', ?1)",
        params![lesson_id],
    ).map_err(AppError::from)?;

    Ok(())
}

#[tauri::command]
pub async fn get_reading_quiz(
    db_path: State<'_, DbPath>,
    lesson_id: i64,
) -> AppResult<Vec<Exercise>> {
    let lesson = get_lesson_by_id(db_path, lesson_id).await?;
    Ok(lesson.exercises)
}
