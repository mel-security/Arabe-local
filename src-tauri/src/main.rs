// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod error;

use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, CustomMenuItem};
use log::info;

fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show".to_string(), "Afficher"))
        .add_item(CustomMenuItem::new("quit".to_string(), "Quitter"));

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show" => {
                    if let Some(window) = app.get_window("main") {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            SystemTrayEvent::LeftClick { .. } => {
                if let Some(window) = app.get_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
            }
            _ => {}
        })
        .setup(|app| {
            info!("Arabe Local - Démarrage de l'application");

            // Initialiser la base de données
            let app_dir = app
                .path_resolver()
                .app_data_dir()
                .expect("Impossible de trouver le répertoire de l'application");

            std::fs::create_dir_all(&app_dir)
                .expect("Impossible de créer le répertoire de l'application");

            let db_path = app_dir.join("arabe_local.db");
            info!("Chemin de la base de données: {:?}", db_path);

            database::init_database(&db_path)
                .expect("Impossible d'initialiser la base de données");

            // Stocker le chemin de la DB dans l'état de l'application
            app.manage(database::DbPath(db_path));

            info!("Application prête");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Commandes utilisateur
            commands::user::get_user_profile,
            commands::user::update_user_profile,
            commands::user::get_settings,
            commands::user::update_settings,
            // Commandes lettres
            commands::letters::get_all_letters,
            commands::letters::get_letter_by_id,
            commands::letters::get_letters_by_level,
            commands::letters::mark_letter_learned,
            commands::letters::get_letter_quiz_questions,
            commands::letters::submit_quiz_answer,
            // Commandes mots
            commands::words::get_all_words,
            commands::words::get_words_by_category,
            commands::words::get_words_by_level,
            commands::words::get_word_by_id,
            commands::words::mark_word_learned,
            commands::words::get_word_quiz_questions,
            commands::words::toggle_word_favorite,
            // Commandes lecture
            commands::reading::get_reading_lessons,
            commands::reading::get_lesson_by_id,
            commands::reading::complete_lesson,
            commands::reading::get_reading_quiz,
            // Commandes Coran
            commands::quran::get_all_surahs,
            commands::quran::get_surah_by_id,
            commands::quran::get_verses,
            commands::quran::toggle_verse_favorite,
            commands::quran::get_favorite_verses,
            commands::quran::save_reading_position,
            commands::quran::get_reading_position,
            commands::quran::search_quran,
            // Commandes progression
            commands::progress::get_overall_progress,
            commands::progress::get_module_progress,
            commands::progress::get_recent_activity,
            commands::progress::get_streak,
            // Commandes grammaire
            commands::grammar::get_grammar_categories,
            commands::grammar::get_grammar_rules,
            commands::grammar::mark_grammar_learned,
            // Commandes bootstrap
            commands::bootstrap::check_bootstrap_status,
            commands::bootstrap::run_migration,
            // Commandes LLM / IA
            commands::llm::get_llm_settings,
            commands::llm::update_llm_settings,
            commands::llm::get_chat_sessions,
            commands::llm::create_chat_session,
            commands::llm::delete_chat_session,
            commands::llm::get_chat_messages,
            commands::llm::save_chat_message,
            commands::llm::clear_chat_history,
        ])
        .run(tauri::generate_context!())
        .expect("Erreur lors du démarrage de l'application Tauri");
}
