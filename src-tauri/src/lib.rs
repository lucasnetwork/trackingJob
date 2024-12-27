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
        },
        Migration{
            version:2,
            description: "create_tracking_table",
            sql:"CREATE TABLE tracking_history (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NULL, 
            formatted_time TEXT NULL, start_time TIMESTAMP, end_time TIMESTAMP, history_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             );
           ",
            kind: MigrationKind::Up
        },
        Migration {
            version: 3,
            description: "enable_foreign_keys",
            sql: "PRAGMA foreign_keys = ON;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_foreign_key_to_tracking_table",
            sql: "
                PRAGMA foreign_keys=off;
                CREATE TABLE tracking_history_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    description TEXT NULL,
                    formatted_time TEXT NULL,
                    start_time TIMESTAMP,
                    end_time TIMESTAMP,
                    history_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (history_id) REFERENCES history(id) ON DELETE RESTRICT ON UPDATE CASCADE
                );
                INSERT INTO tracking_history_new (id, description, formatted_time, start_time, end_time, history_id, created_at, updated_at)
                SELECT id, description, formatted_time, start_time, end_time, history_id, created_at, updated_at FROM tracking_history;
                DROP TABLE tracking_history;
                ALTER TABLE tracking_history_new RENAME TO tracking_history;
                PRAGMA foreign_keys=on;
            ",
            kind: MigrationKind::Up,
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
