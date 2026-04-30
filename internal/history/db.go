package history

import (
	"database/sql"
	"fmt"
	"path/filepath"

	"github.com/lazy-ytdlp/lazy-ytdlp/internal/utils"
	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	conn *sql.DB
}

// NewDB initializes the history database.
func NewDB() (*DB, error) {
	dataDir, err := utils.GetDataDir()
	if err != nil {
		return nil, err
	}

	dbPath := filepath.Join(dataDir, "history.db")
	conn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db := &DB{conn: conn}
	if err := db.init(); err != nil {
		return nil, err
	}

	return db, nil
}

func (db *DB) init() error {
	query := `
	CREATE TABLE IF NOT EXISTS history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		url TEXT,
		title TEXT,
		output_path TEXT,
		status TEXT,
		start_time DATETIME,
		end_time DATETIME,
		file_size INTEGER,
		format TEXT,
		profile TEXT,
		error TEXT
	);`
	_, err := db.conn.Exec(query)
	return err
}

func (db *DB) Close() error {
	return db.conn.Close()
}

// AddRecord adds a new history record.
func (db *DB) AddRecord(r *HistoryRecord) error {
	query := `
	INSERT INTO history (url, title, output_path, status, start_time, end_time, file_size, format, profile, error)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
	res, err := db.conn.Exec(query, r.URL, r.Title, r.OutputPath, r.Status, r.StartTime, r.EndTime, r.FileSize, r.Format, r.Profile, r.Error)
	if err != nil {
		return err
	}
	r.ID, _ = res.LastInsertId()
	return nil
}

// ListRecords returns a list of history records.
func (db *DB) ListRecords(search string) ([]HistoryRecord, error) {
	query := `SELECT id, url, title, output_path, status, start_time, end_time, file_size, format, profile, error FROM history`
	var rows *sql.Rows
	var err error

	if search != "" {
		query += ` WHERE title LIKE ? OR url LIKE ? ORDER BY end_time DESC`
		rows, err = db.conn.Query(query, "%"+search+"%", "%"+search+"%")
	} else {
		query += ` ORDER BY end_time DESC`
		rows, err = db.conn.Query(query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []HistoryRecord
	for rows.Next() {
		var r HistoryRecord
		err := rows.Scan(&r.ID, &r.URL, &r.Title, &r.OutputPath, &r.Status, &r.StartTime, &r.EndTime, &r.FileSize, &r.Format, &r.Profile, &r.Error)
		if err != nil {
			return nil, err
		}
		records = append(records, r)
	}
	return records, nil
}

// DeleteRecord deletes a record by ID.
func (db *DB) DeleteRecord(id int64) error {
	_, err := db.conn.Exec("DELETE FROM history WHERE id = ?", id)
	return err
}

// ClearHistory deletes all records.
func (db *DB) ClearHistory() error {
	_, err := db.conn.Exec("DELETE FROM history")
	return err
}
