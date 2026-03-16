use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::database::DbPath;
use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct GrammarCategory {
    pub id: i64,
    pub slug: String,
    pub name_fr: String,
    pub name_en: String,
    pub icon: String,
    pub order_num: i64,
    pub description_fr: Option<String>,
    pub description_en: Option<String>,
    pub rule_count: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GrammarRule {
    pub id: i64,
    pub category_id: i64,
    pub order_num: i64,
    pub title_fr: String,
    pub title_en: String,
    pub level: String,
    pub content_json: String,
    pub exercises_json: String,
    pub is_learned: bool,
    pub quiz_score: Option<f64>,
}

#[tauri::command]
pub async fn get_grammar_categories(
    db_path: State<'_, DbPath>,
) -> AppResult<Vec<GrammarCategory>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let mut stmt = conn
        .prepare(
            "SELECT gc.id, gc.slug, gc.name_fr, gc.name_en, gc.icon, gc.order_num,
                    gc.description_fr, gc.description_en,
                    (SELECT COUNT(*) FROM grammar_rules gr WHERE gr.category_id = gc.id) as rule_count
             FROM grammar_categories gc
             ORDER BY gc.order_num",
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

    let categories = stmt
        .query_map([], |row| {
            Ok(GrammarCategory {
                id: row.get(0)?,
                slug: row.get(1)?,
                name_fr: row.get(2)?,
                name_en: row.get(3)?,
                icon: row.get(4)?,
                order_num: row.get(5)?,
                description_fr: row.get(6)?,
                description_en: row.get(7)?,
                rule_count: row.get(8)?,
            })
        })
        .map_err(|e| AppError::Database(e.to_string()))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(categories)
}

#[tauri::command]
pub async fn get_grammar_rules(
    db_path: State<'_, DbPath>,
    category_slug: String,
) -> AppResult<Vec<GrammarRule>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    let mut stmt = conn
        .prepare(
            "SELECT gr.id, gr.category_id, gr.order_num, gr.title_fr, gr.title_en,
                    gr.level, gr.content_json, gr.exercises_json,
                    COALESCE(gp.is_learned, 0) as is_learned,
                    gp.quiz_score
             FROM grammar_rules gr
             JOIN grammar_categories gc ON gc.id = gr.category_id
             LEFT JOIN grammar_progress gp ON gp.rule_id = gr.id AND gp.user_id = 1
             WHERE gc.slug = ?1
             ORDER BY gr.order_num",
        )
        .map_err(|e| AppError::Database(e.to_string()))?;

    let rules = stmt
        .query_map([&category_slug], |row| {
            Ok(GrammarRule {
                id: row.get(0)?,
                category_id: row.get(1)?,
                order_num: row.get(2)?,
                title_fr: row.get(3)?,
                title_en: row.get(4)?,
                level: row.get(5)?,
                content_json: row.get(6)?,
                exercises_json: row.get(7)?,
                is_learned: row.get::<_, i64>(8)? != 0,
                quiz_score: row.get(9)?,
            })
        })
        .map_err(|e| AppError::Database(e.to_string()))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(rules)
}

#[tauri::command]
pub async fn mark_grammar_learned(
    db_path: State<'_, DbPath>,
    rule_id: i64,
    is_learned: bool,
) -> AppResult<()> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;
    conn.execute(
        "INSERT INTO grammar_progress (user_id, rule_id, is_learned, last_seen)
         VALUES (1, ?1, ?2, datetime('now'))
         ON CONFLICT(user_id, rule_id) DO UPDATE SET
             is_learned = ?2,
             last_seen = datetime('now')",
        rusqlite::params![rule_id, is_learned as i64],
    )
    .map_err(|e| AppError::Database(e.to_string()))?;

    Ok(())
}
