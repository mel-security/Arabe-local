use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::DbPath;
use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct OverallProgress {
    pub letters_total: i64,
    pub letters_learned: i64,
    pub words_total: i64,
    pub words_learned: i64,
    pub reading_total: i64,
    pub reading_completed: i64,
    pub quran_surahs_started: i64,
    pub quran_surahs_completed: i64,
    pub total_percent: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModuleProgress {
    pub module: String,
    pub total: i64,
    pub completed: i64,
    pub percent: f64,
    pub last_activity: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActivityItem {
    pub module: String,
    pub action: String,
    pub item_id: Option<i64>,
    pub created_at: String,
    pub label: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreakInfo {
    pub current_streak: i64,
    pub longest_streak: i64,
    pub last_activity_date: Option<String>,
    pub today_done: bool,
}

#[tauri::command]
pub async fn get_overall_progress(db_path: State<'_, DbPath>) -> AppResult<OverallProgress> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let letters_total: i64 = conn.query_row("SELECT COUNT(*) FROM letters", [], |r| r.get(0)).unwrap_or(0);
    let letters_learned: i64 = conn.query_row("SELECT COUNT(*) FROM letter_progress WHERE user_id = 1 AND is_learned = 1", [], |r| r.get(0)).unwrap_or(0);
    let words_total: i64 = conn.query_row("SELECT COUNT(*) FROM vocabulary_words", [], |r| r.get(0)).unwrap_or(0);
    let words_learned: i64 = conn.query_row("SELECT COUNT(*) FROM word_progress WHERE user_id = 1 AND is_learned = 1", [], |r| r.get(0)).unwrap_or(0);
    let reading_total: i64 = conn.query_row("SELECT COUNT(*) FROM reading_lessons", [], |r| r.get(0)).unwrap_or(0);
    let reading_completed: i64 = conn.query_row("SELECT COUNT(*) FROM reading_progress WHERE user_id = 1 AND is_completed = 1", [], |r| r.get(0)).unwrap_or(0);
    let quran_started: i64 = conn.query_row("SELECT COUNT(*) FROM quran_progress WHERE user_id = 1", [], |r| r.get(0)).unwrap_or(0);
    let quran_completed: i64 = conn.query_row("SELECT COUNT(*) FROM quran_progress WHERE user_id = 1 AND is_completed = 1", [], |r| r.get(0)).unwrap_or(0);

    let total_items = letters_total + words_total + reading_total;
    let total_done = letters_learned + words_learned + reading_completed;
    let total_percent = if total_items > 0 {
        (total_done as f64 / total_items as f64) * 100.0
    } else {
        0.0
    };

    Ok(OverallProgress {
        letters_total,
        letters_learned,
        words_total,
        words_learned,
        reading_total,
        reading_completed,
        quran_surahs_started: quran_started,
        quran_surahs_completed: quran_completed,
        total_percent,
    })
}

#[tauri::command]
pub async fn get_module_progress(
    db_path: State<'_, DbPath>,
    module: String,
) -> AppResult<ModuleProgress> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let (total, completed) = match module.as_str() {
        "letters" => {
            let t: i64 = conn.query_row("SELECT COUNT(*) FROM letters", [], |r| r.get(0)).unwrap_or(0);
            let c: i64 = conn.query_row("SELECT COUNT(*) FROM letter_progress WHERE user_id = 1 AND is_learned = 1", [], |r| r.get(0)).unwrap_or(0);
            (t, c)
        }
        "words" => {
            let t: i64 = conn.query_row("SELECT COUNT(*) FROM vocabulary_words", [], |r| r.get(0)).unwrap_or(0);
            let c: i64 = conn.query_row("SELECT COUNT(*) FROM word_progress WHERE user_id = 1 AND is_learned = 1", [], |r| r.get(0)).unwrap_or(0);
            (t, c)
        }
        "reading" => {
            let t: i64 = conn.query_row("SELECT COUNT(*) FROM reading_lessons", [], |r| r.get(0)).unwrap_or(0);
            let c: i64 = conn.query_row("SELECT COUNT(*) FROM reading_progress WHERE user_id = 1 AND is_completed = 1", [], |r| r.get(0)).unwrap_or(0);
            (t, c)
        }
        "quran" => {
            let t: i64 = conn.query_row("SELECT COUNT(*) FROM surahs", [], |r| r.get(0)).unwrap_or(114);
            let c: i64 = conn.query_row("SELECT COUNT(*) FROM quran_progress WHERE user_id = 1 AND is_completed = 1", [], |r| r.get(0)).unwrap_or(0);
            (t, c)
        }
        _ => (0, 0),
    };

    let last_activity: Option<String> = conn.query_row(
        "SELECT created_at FROM activity_log WHERE user_id = 1 AND module = ?1 ORDER BY created_at DESC LIMIT 1",
        rusqlite::params![module],
        |r| r.get(0),
    ).ok();

    let percent = if total > 0 { (completed as f64 / total as f64) * 100.0 } else { 0.0 };

    Ok(ModuleProgress { module, total, completed, percent, last_activity })
}

#[tauri::command]
pub async fn get_recent_activity(
    db_path: State<'_, DbPath>,
    limit: Option<i64>,
) -> AppResult<Vec<ActivityItem>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let limit = limit.unwrap_or(20);

    let mut stmt = conn.prepare(&format!(
        "SELECT module, action, item_id, created_at FROM activity_log WHERE user_id = 1 ORDER BY created_at DESC LIMIT {}",
        limit
    )).map_err(AppError::from)?;

    let items = stmt.query_map([], |row| {
        let module: String = row.get(0)?;
        let action: String = row.get(1)?;
        let label = format!("{} - {}", module, action);
        Ok(ActivityItem {
            module,
            action,
            item_id: row.get(2)?,
            created_at: row.get(3)?,
            label,
        })
    }).map_err(AppError::from)?;

    Ok(items.filter_map(|r| r.ok()).collect())
}

#[tauri::command]
pub async fn get_streak(db_path: State<'_, DbPath>) -> AppResult<StreakInfo> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let last_date: Option<String> = conn.query_row(
        "SELECT DATE(created_at) FROM activity_log WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1",
        [],
        |r| r.get(0),
    ).ok();

    let today_done: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM activity_log WHERE user_id = 1 AND DATE(created_at) = DATE('now'))",
        [],
        |r| r.get(0),
    ).unwrap_or(false);

    // Calcul simplifié du streak (jours consécutifs)
    let current_streak: i64 = conn.query_row(
        "WITH RECURSIVE dates AS (
           SELECT DATE('now') as d, 0 as streak
           UNION ALL
           SELECT DATE(d, '-1 day'), streak + 1
           FROM dates
           WHERE EXISTS (
             SELECT 1 FROM activity_log
             WHERE user_id = 1 AND DATE(created_at) = DATE(d, '-1 day')
           ) AND streak < 365
         )
         SELECT MAX(streak) FROM dates",
        [],
        |r| r.get(0),
    ).unwrap_or(0);

    Ok(StreakInfo {
        current_streak,
        longest_streak: current_streak, // Simplifié pour le MVP
        last_activity_date: last_date,
        today_done,
    })
}
