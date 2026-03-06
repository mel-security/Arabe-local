use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::DbPath;
use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LLMSettings {
    pub id: i64,
    pub provider: String,
    pub model_name: String,
    pub base_url: String,
    pub temperature: f64,
    pub max_tokens: i64,
    pub context_size: i64,
    pub system_language: String,
    pub tutor_mode: bool,
    pub streaming: bool,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LLMSettingsInput {
    pub provider: Option<String>,
    pub model_name: Option<String>,
    pub base_url: Option<String>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<i64>,
    pub context_size: Option<i64>,
    pub system_language: Option<String>,
    pub tutor_mode: Option<bool>,
    pub streaming: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatSession {
    pub id: i64,
    pub user_id: i64,
    pub title: String,
    pub mode: String,
    pub context_ref: Option<String>,
    pub context_id: Option<i64>,
    pub message_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub id: i64,
    pub session_id: i64,
    pub role: String,
    pub content: String,
    pub tokens_used: Option<i64>,
    pub model_used: Option<String>,
    pub created_at: String,
}

fn get_conn(db_path: &State<DbPath>) -> Result<Connection, AppError> {
    Connection::open(&db_path.0).map_err(AppError::Database)
}

#[tauri::command]
pub fn get_llm_settings(db_path: State<DbPath>) -> Result<LLMSettings, AppError> {
    let conn = get_conn(&db_path)?;
    let settings = conn.query_row(
        "SELECT id, provider, model_name, base_url, temperature, max_tokens, context_size, system_language, tutor_mode, streaming, updated_at FROM llm_settings WHERE id = 1",
        [],
        |row| Ok(LLMSettings {
            id: row.get(0)?,
            provider: row.get(1)?,
            model_name: row.get(2)?,
            base_url: row.get(3)?,
            temperature: row.get(4)?,
            max_tokens: row.get(5)?,
            context_size: row.get(6)?,
            system_language: row.get(7)?,
            tutor_mode: row.get::<_, i64>(8)? != 0,
            streaming: row.get::<_, i64>(9)? != 0,
            updated_at: row.get(10)?,
        }),
    ).map_err(AppError::Database)?;
    Ok(settings)
}

#[tauri::command]
pub fn update_llm_settings(
    input: LLMSettingsInput,
    db_path: State<DbPath>,
) -> Result<LLMSettings, AppError> {
    let conn = get_conn(&db_path)?;

    if let Some(ref v) = input.provider {
        conn.execute("UPDATE llm_settings SET provider = ?1, updated_at = datetime('now') WHERE id = 1", params![v]).map_err(AppError::Database)?;
    }
    if let Some(ref v) = input.model_name {
        conn.execute("UPDATE llm_settings SET model_name = ?1, updated_at = datetime('now') WHERE id = 1", params![v]).map_err(AppError::Database)?;
    }
    if let Some(ref v) = input.base_url {
        conn.execute("UPDATE llm_settings SET base_url = ?1, updated_at = datetime('now') WHERE id = 1", params![v]).map_err(AppError::Database)?;
    }
    if let Some(v) = input.temperature {
        conn.execute("UPDATE llm_settings SET temperature = ?1, updated_at = datetime('now') WHERE id = 1", params![v]).map_err(AppError::Database)?;
    }
    if let Some(v) = input.max_tokens {
        conn.execute("UPDATE llm_settings SET max_tokens = ?1, updated_at = datetime('now') WHERE id = 1", params![v]).map_err(AppError::Database)?;
    }
    if let Some(v) = input.context_size {
        conn.execute("UPDATE llm_settings SET context_size = ?1, updated_at = datetime('now') WHERE id = 1", params![v]).map_err(AppError::Database)?;
    }
    if let Some(ref v) = input.system_language {
        conn.execute("UPDATE llm_settings SET system_language = ?1, updated_at = datetime('now') WHERE id = 1", params![v]).map_err(AppError::Database)?;
    }
    if let Some(v) = input.tutor_mode {
        conn.execute("UPDATE llm_settings SET tutor_mode = ?1, updated_at = datetime('now') WHERE id = 1", params![v as i64]).map_err(AppError::Database)?;
    }
    if let Some(v) = input.streaming {
        conn.execute("UPDATE llm_settings SET streaming = ?1, updated_at = datetime('now') WHERE id = 1", params![v as i64]).map_err(AppError::Database)?;
    }

    get_llm_settings(db_path)
}

#[tauri::command]
pub fn get_chat_sessions(
    limit: Option<i64>,
    db_path: State<DbPath>,
) -> Result<Vec<ChatSession>, AppError> {
    let conn = get_conn(&db_path)?;
    let limit = limit.unwrap_or(20);
    let mut stmt = conn.prepare(
        "SELECT id, user_id, title, mode, context_ref, context_id, message_count, created_at, updated_at
         FROM chat_sessions WHERE user_id = 1
         ORDER BY updated_at DESC LIMIT ?1",
    ).map_err(AppError::Database)?;

    let sessions = stmt.query_map(params![limit], |row| {
        Ok(ChatSession {
            id: row.get(0)?,
            user_id: row.get(1)?,
            title: row.get(2)?,
            mode: row.get(3)?,
            context_ref: row.get(4)?,
            context_id: row.get(5)?,
            message_count: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    }).map_err(AppError::Database)?
    .filter_map(|r| r.ok())
    .collect();

    Ok(sessions)
}

#[tauri::command]
pub fn create_chat_session(
    title: String,
    mode: String,
    db_path: State<DbPath>,
) -> Result<ChatSession, AppError> {
    let conn = get_conn(&db_path)?;
    conn.execute(
        "INSERT INTO chat_sessions (user_id, title, mode) VALUES (1, ?1, ?2)",
        params![title, mode],
    ).map_err(AppError::Database)?;

    let id = conn.last_insert_rowid();
    let session = conn.query_row(
        "SELECT id, user_id, title, mode, context_ref, context_id, message_count, created_at, updated_at FROM chat_sessions WHERE id = ?1",
        params![id],
        |row| Ok(ChatSession {
            id: row.get(0)?,
            user_id: row.get(1)?,
            title: row.get(2)?,
            mode: row.get(3)?,
            context_ref: row.get(4)?,
            context_id: row.get(5)?,
            message_count: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        }),
    ).map_err(AppError::Database)?;

    Ok(session)
}

#[tauri::command]
pub fn delete_chat_session(
    session_id: i64,
    db_path: State<DbPath>,
) -> Result<(), AppError> {
    let conn = get_conn(&db_path)?;
    conn.execute("DELETE FROM chat_sessions WHERE id = ?1 AND user_id = 1", params![session_id])
        .map_err(AppError::Database)?;
    Ok(())
}

#[tauri::command]
pub fn get_chat_messages(
    session_id: i64,
    db_path: State<DbPath>,
) -> Result<Vec<ChatMessage>, AppError> {
    let conn = get_conn(&db_path)?;
    let mut stmt = conn.prepare(
        "SELECT id, session_id, role, content, tokens_used, model_used, created_at
         FROM chat_messages WHERE session_id = ?1
         ORDER BY created_at ASC",
    ).map_err(AppError::Database)?;

    let messages = stmt.query_map(params![session_id], |row| {
        Ok(ChatMessage {
            id: row.get(0)?,
            session_id: row.get(1)?,
            role: row.get(2)?,
            content: row.get(3)?,
            tokens_used: row.get(4)?,
            model_used: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(AppError::Database)?
    .filter_map(|r| r.ok())
    .collect();

    Ok(messages)
}

#[tauri::command]
pub fn save_chat_message(
    session_id: i64,
    role: String,
    content: String,
    model_used: Option<String>,
    db_path: State<DbPath>,
) -> Result<ChatMessage, AppError> {
    let conn = get_conn(&db_path)?;

    conn.execute(
        "INSERT INTO chat_messages (session_id, role, content, model_used) VALUES (?1, ?2, ?3, ?4)",
        params![session_id, role, content, model_used],
    ).map_err(AppError::Database)?;

    let id = conn.last_insert_rowid();

    // Update session message count and updated_at
    conn.execute(
        "UPDATE chat_sessions SET message_count = message_count + 1, updated_at = datetime('now') WHERE id = ?1",
        params![session_id],
    ).map_err(AppError::Database)?;

    let msg = conn.query_row(
        "SELECT id, session_id, role, content, tokens_used, model_used, created_at FROM chat_messages WHERE id = ?1",
        params![id],
        |row| Ok(ChatMessage {
            id: row.get(0)?,
            session_id: row.get(1)?,
            role: row.get(2)?,
            content: row.get(3)?,
            tokens_used: row.get(4)?,
            model_used: row.get(5)?,
            created_at: row.get(6)?,
        }),
    ).map_err(AppError::Database)?;

    Ok(msg)
}

#[tauri::command]
pub fn clear_chat_history(db_path: State<DbPath>) -> Result<(), AppError> {
    let conn = get_conn(&db_path)?;
    conn.execute("DELETE FROM chat_sessions WHERE user_id = 1", [])
        .map_err(AppError::Database)?;
    Ok(())
}
