use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::DbPath;
use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserProfile {
    pub id: i64,
    pub name: String,
    pub level: String,
    pub language: String,
    pub theme: String,
    pub font_size: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProfileInput {
    pub name: Option<String>,
    pub level: Option<String>,
    pub language: Option<String>,
    pub theme: Option<String>,
    pub font_size: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub notifications: bool,
    pub auto_play_audio: bool,
    pub show_transliteration: bool,
    pub show_translation: bool,
    pub quiz_questions_count: i64,
    pub daily_goal: i64,
}

#[tauri::command]
pub async fn get_user_profile(db_path: State<'_, DbPath>) -> AppResult<UserProfile> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let profile = conn.query_row(
        "SELECT id, name, level, language, theme, font_size, created_at, updated_at FROM users LIMIT 1",
        [],
        |row| Ok(UserProfile {
            id: row.get(0)?,
            name: row.get(1)?,
            level: row.get(2)?,
            language: row.get(3)?,
            theme: row.get(4)?,
            font_size: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        }),
    ).map_err(|_| AppError::NotFound("Profil utilisateur introuvable".to_string()))?;

    Ok(profile)
}

#[tauri::command]
pub async fn update_user_profile(
    db_path: State<'_, DbPath>,
    input: UpdateProfileInput,
) -> AppResult<UserProfile> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    if let Some(name) = &input.name {
        conn.execute(
            "UPDATE users SET name = ?1, updated_at = datetime('now') WHERE id = 1",
            params![name],
        ).map_err(AppError::from)?;
    }
    if let Some(level) = &input.level {
        conn.execute(
            "UPDATE users SET level = ?1, updated_at = datetime('now') WHERE id = 1",
            params![level],
        ).map_err(AppError::from)?;
    }
    if let Some(language) = &input.language {
        conn.execute(
            "UPDATE users SET language = ?1, updated_at = datetime('now') WHERE id = 1",
            params![language],
        ).map_err(AppError::from)?;
    }
    if let Some(theme) = &input.theme {
        conn.execute(
            "UPDATE users SET theme = ?1, updated_at = datetime('now') WHERE id = 1",
            params![theme],
        ).map_err(AppError::from)?;
    }
    if let Some(font_size) = &input.font_size {
        conn.execute(
            "UPDATE users SET font_size = ?1, updated_at = datetime('now') WHERE id = 1",
            params![font_size],
        ).map_err(AppError::from)?;
    }

    get_user_profile(db_path).await
}

#[tauri::command]
pub async fn get_settings(db_path: State<'_, DbPath>) -> AppResult<AppSettings> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let get_setting = |key: &str, default: &str| -> String {
        conn.query_row(
            "SELECT value FROM settings WHERE key = ?1",
            params![key],
            |row| row.get::<_, String>(0),
        ).unwrap_or_else(|_| default.to_string())
    };

    Ok(AppSettings {
        notifications: get_setting("notifications", "true") == "true",
        auto_play_audio: get_setting("auto_play_audio", "false") == "true",
        show_transliteration: get_setting("show_transliteration", "true") == "true",
        show_translation: get_setting("show_translation", "true") == "true",
        quiz_questions_count: get_setting("quiz_questions_count", "10").parse().unwrap_or(10),
        daily_goal: get_setting("daily_goal", "15").parse().unwrap_or(15),
    })
}

#[tauri::command]
pub async fn update_settings(
    db_path: State<'_, DbPath>,
    key: String,
    value: String,
) -> AppResult<()> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    conn.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?1, ?2, datetime('now'))",
        params![key, value],
    ).map_err(AppError::from)?;

    Ok(())
}
