package models

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

var conn *pgxpool.Pool

func InitDB() error {
	var err error
	conn, err = pgxpool.New(context.Background(), "postgres://postgres:1234@localhost:5432/flashcards_db")
	if err != nil {
		return err
	}
	return nil
}
