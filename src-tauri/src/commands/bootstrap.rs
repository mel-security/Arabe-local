use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::database::DbPath;
use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct BootstrapStatus {
    pub is_first_launch: bool,
    pub schema_version: i64,
    pub has_user: bool,
    pub letters_count: i64,
    pub words_count: i64,
    pub grammar_ready: bool,
}

#[tauri::command]
pub async fn check_bootstrap_status(
    db_path: State<'_, DbPath>,
) -> AppResult<BootstrapStatus> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let has_user = conn
        .query_row("SELECT COUNT(*) FROM users", [], |row| row.get::<_, i64>(0))
        .unwrap_or(0) > 0;

    let letters_count = conn
        .query_row("SELECT COUNT(*) FROM letters", [], |row| row.get::<_, i64>(0))
        .unwrap_or(0);

    let words_count = conn
        .query_row("SELECT COUNT(*) FROM vocabulary_words", [], |row| row.get::<_, i64>(0))
        .unwrap_or(0);

    let grammar_ready = conn
        .query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='grammar_categories'",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(0) > 0;

    let schema_version = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(0);

    Ok(BootstrapStatus {
        is_first_launch: !has_user,
        schema_version,
        has_user,
        letters_count,
        words_count,
        grammar_ready,
    })
}

#[tauri::command]
pub async fn run_migration(
    db_path: State<'_, DbPath>,
    migration_sql: String,
) -> AppResult<()> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    conn.execute_batch(&migration_sql)
        .map_err(|e| AppError::Database(e.to_string()))?;
    Ok(())
}
