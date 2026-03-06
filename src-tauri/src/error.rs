use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
pub enum AppError {
    #[error("Erreur de base de données: {0}")]
    Database(String),

    #[error("Enregistrement non trouvé: {0}")]
    NotFound(String),

    #[error("Paramètre invalide: {0}")]
    InvalidParam(String),

    #[error("Erreur d'entrée/sortie: {0}")]
    Io(String),

    #[error("Erreur de sérialisation: {0}")]
    Serialization(String),
}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Database(e.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Serialization(e.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
