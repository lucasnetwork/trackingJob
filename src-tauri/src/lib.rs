// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_sql::{ Migration, MigrationKind};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration{
            version:1,
            description: "create_initial_tables",
            sql:"CREATE TABLE history (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NULL, 
            formatted_time TEXT NULL, start_time TIMESTAMP, end_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             );",
            kind: MigrationKind::Up
        }
    ];
    let mut db = "sqlite:production.db";
    
  if cfg!(dev) {
    db = "sqlite:development.db";
  }
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().add_migrations(db, migrations).build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
