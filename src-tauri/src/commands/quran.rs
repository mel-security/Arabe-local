use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::database::DbPath;
use crate::error::{AppError, AppResult};

#[derive(Debug, Serialize, Deserialize)]
pub struct Surah {
    pub id: i64,
    pub number: i64,
    pub name_ar: String,
    pub name_fr: String,
    pub name_en: String,
    pub transliteration: String,
    pub revelation_type: String,
    pub verses_count: i64,
    pub order_revealed: Option<i64>,
    pub audio_file: Option<String>,
    pub description_fr: Option<String>,
    pub last_read_verse: Option<i64>,
    pub is_completed: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Verse {
    pub id: i64,
    pub surah_id: i64,
    pub verse_number: i64,
    pub arabic_text: String,
    pub translation_fr: String,
    pub translation_en: String,
    pub transliteration: Option<String>,
    pub audio_file: Option<String>,
    pub juz: Option<i64>,
    pub page: Option<i64>,
    pub is_favorite: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FavoriteVerse {
    pub verse: Verse,
    pub surah_name_fr: String,
    pub surah_number: i64,
    pub note: Option<String>,
    pub saved_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadingPosition {
    pub surah_id: i64,
    pub verse_number: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub verse: Verse,
    pub surah_name_fr: String,
    pub surah_number: i64,
}

#[tauri::command]
pub async fn get_all_surahs(db_path: State<'_, DbPath>) -> AppResult<Vec<Surah>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let mut stmt = conn.prepare(
        "SELECT s.id, s.number, s.name_ar, s.name_fr, s.name_en, s.transliteration,
                s.revelation_type, s.verses_count, s.order_revealed, s.audio_file,
                s.description_fr, qp.last_verse, COALESCE(qp.is_completed, 0)
         FROM surahs s
         LEFT JOIN quran_progress qp ON qp.surah_id = s.id AND qp.user_id = 1
         ORDER BY s.number"
    ).map_err(AppError::from)?;

    let surahs = stmt.query_map([], |row| {
        Ok(Surah {
            id: row.get(0)?,
            number: row.get(1)?,
            name_ar: row.get(2)?,
            name_fr: row.get(3)?,
            name_en: row.get(4)?,
            transliteration: row.get(5)?,
            revelation_type: row.get(6)?,
            verses_count: row.get(7)?,
            order_revealed: row.get(8)?,
            audio_file: row.get(9)?,
            description_fr: row.get(10)?,
            last_read_verse: row.get(11)?,
            is_completed: row.get::<_, i64>(12).map(|v| v != 0)?,
        })
    }).map_err(AppError::from)?;

    Ok(surahs.filter_map(|r| r.ok()).collect())
}

#[tauri::command]
pub async fn get_surah_by_id(db_path: State<'_, DbPath>, surah_id: i64) -> AppResult<Surah> {
    let surahs = get_all_surahs(db_path).await?;
    surahs.into_iter()
        .find(|s| s.id == surah_id)
        .ok_or_else(|| AppError::NotFound(format!("Sourate {} introuvable", surah_id)))
}

#[tauri::command]
pub async fn get_verses(
    db_path: State<'_, DbPath>,
    surah_id: i64,
    from_verse: Option<i64>,
    to_verse: Option<i64>,
) -> AppResult<Vec<Verse>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let filter = match (from_verse, to_verse) {
        (Some(from), Some(to)) => format!("AND v.verse_number BETWEEN {} AND {}", from, to),
        (Some(from), None) => format!("AND v.verse_number >= {}", from),
        (None, Some(to)) => format!("AND v.verse_number <= {}", to),
        _ => String::new(),
    };

    let sql = format!(
        "SELECT v.id, v.surah_id, v.verse_number, v.arabic_text, v.translation_fr, v.translation_en,
                v.transliteration, v.audio_file, v.juz, v.page,
                COALESCE(vf.id IS NOT NULL, 0) as is_favorite
         FROM verses v
         LEFT JOIN verse_favorites vf ON vf.verse_id = v.id AND vf.user_id = 1
         WHERE v.surah_id = {} {}
         ORDER BY v.verse_number",
        surah_id, filter
    );

    let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;
    let verses = stmt.query_map([], |row| {
        Ok(Verse {
            id: row.get(0)?,
            surah_id: row.get(1)?,
            verse_number: row.get(2)?,
            arabic_text: row.get(3)?,
            translation_fr: row.get(4)?,
            translation_en: row.get(5)?,
            transliteration: row.get(6)?,
            audio_file: row.get(7)?,
            juz: row.get(8)?,
            page: row.get(9)?,
            is_favorite: row.get::<_, i64>(10).map(|v| v != 0)?,
        })
    }).map_err(AppError::from)?;

    Ok(verses.filter_map(|r| r.ok()).collect())
}

#[tauri::command]
pub async fn toggle_verse_favorite(
    db_path: State<'_, DbPath>,
    verse_id: i64,
    note: Option<String>,
) -> AppResult<bool> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM verse_favorites WHERE user_id = 1 AND verse_id = ?1)",
        params![verse_id],
        |row| row.get(0),
    ).unwrap_or(false);

    if exists {
        conn.execute(
            "DELETE FROM verse_favorites WHERE user_id = 1 AND verse_id = ?1",
            params![verse_id],
        ).map_err(AppError::from)?;
        Ok(false)
    } else {
        conn.execute(
            "INSERT INTO verse_favorites (user_id, verse_id, note) VALUES (1, ?1, ?2)",
            params![verse_id, note],
        ).map_err(AppError::from)?;
        Ok(true)
    }
}

#[tauri::command]
pub async fn get_favorite_verses(db_path: State<'_, DbPath>) -> AppResult<Vec<FavoriteVerse>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let mut stmt = conn.prepare(
        "SELECT v.id, v.surah_id, v.verse_number, v.arabic_text, v.translation_fr, v.translation_en,
                v.transliteration, v.audio_file, v.juz, v.page, 1 as is_favorite,
                s.name_fr, s.number, vf.note, vf.created_at
         FROM verse_favorites vf
         JOIN verses v ON v.id = vf.verse_id
         JOIN surahs s ON s.id = v.surah_id
         WHERE vf.user_id = 1
         ORDER BY vf.created_at DESC"
    ).map_err(AppError::from)?;

    let results = stmt.query_map([], |row| {
        Ok(FavoriteVerse {
            verse: Verse {
                id: row.get(0)?,
                surah_id: row.get(1)?,
                verse_number: row.get(2)?,
                arabic_text: row.get(3)?,
                translation_fr: row.get(4)?,
                translation_en: row.get(5)?,
                transliteration: row.get(6)?,
                audio_file: row.get(7)?,
                juz: row.get(8)?,
                page: row.get(9)?,
                is_favorite: true,
            },
            surah_name_fr: row.get(11)?,
            surah_number: row.get(12)?,
            note: row.get(13)?,
            saved_at: row.get(14)?,
        })
    }).map_err(AppError::from)?;

    Ok(results.filter_map(|r| r.ok()).collect())
}

#[tauri::command]
pub async fn save_reading_position(
    db_path: State<'_, DbPath>,
    surah_id: i64,
    verse_number: i64,
) -> AppResult<()> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    conn.execute(
        "INSERT INTO quran_progress (user_id, surah_id, last_verse, updated_at)
         VALUES (1, ?1, ?2, datetime('now'))
         ON CONFLICT(user_id, surah_id) DO UPDATE SET
           last_verse = excluded.last_verse,
           updated_at = datetime('now')",
        params![surah_id, verse_number],
    ).map_err(AppError::from)?;

    Ok(())
}

#[tauri::command]
pub async fn get_reading_position(
    db_path: State<'_, DbPath>,
) -> AppResult<Option<ReadingPosition>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let result = conn.query_row(
        "SELECT surah_id, last_verse FROM quran_progress WHERE user_id = 1 ORDER BY updated_at DESC LIMIT 1",
        [],
        |row| Ok(ReadingPosition {
            surah_id: row.get(0)?,
            verse_number: row.get(1)?,
        }),
    );

    match result {
        Ok(pos) => Ok(Some(pos)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(AppError::from(e)),
    }
}

#[tauri::command]
pub async fn search_quran(
    db_path: State<'_, DbPath>,
    query: String,
    language: String,
) -> AppResult<Vec<SearchResult>> {
    let conn = Connection::open(&db_path.0).map_err(AppError::from)?;

    let search_field = if language == "ar" { "v.arabic_text" } else if language == "en" { "v.translation_en" } else { "v.translation_fr" };
    let sql = format!(
        "SELECT v.id, v.surah_id, v.verse_number, v.arabic_text, v.translation_fr, v.translation_en,
                v.transliteration, v.audio_file, v.juz, v.page,
                COALESCE(vf.id IS NOT NULL, 0) as is_favorite,
                s.name_fr, s.number
         FROM verses v
         JOIN surahs s ON s.id = v.surah_id
         LEFT JOIN verse_favorites vf ON vf.verse_id = v.id AND vf.user_id = 1
         WHERE {} LIKE '%{}%'
         LIMIT 50",
        search_field, query.replace('\'', "''")
    );

    let mut stmt = conn.prepare(&sql).map_err(AppError::from)?;
    let results = stmt.query_map([], |row| {
        Ok(SearchResult {
            verse: Verse {
                id: row.get(0)?,
                surah_id: row.get(1)?,
                verse_number: row.get(2)?,
                arabic_text: row.get(3)?,
                translation_fr: row.get(4)?,
                translation_en: row.get(5)?,
                transliteration: row.get(6)?,
                audio_file: row.get(7)?,
                juz: row.get(8)?,
                page: row.get(9)?,
                is_favorite: row.get::<_, i64>(10).map(|v| v != 0)?,
            },
            surah_name_fr: row.get(11)?,
            surah_number: row.get(12)?,
        })
    }).map_err(AppError::from)?;

    Ok(results.filter_map(|r| r.ok()).collect())
}
