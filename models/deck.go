package models

import "context"

type Deck struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func (d *Deck) Create() error {
	return conn.QueryRow(context.Background(), "INSERT INTO decks (name) VALUES ($1) RETURNING id", d.Name).Scan(&d.ID)
}

func GetAllDecks() ([]Deck, error) {
	rows, err := conn.Query(context.Background(), "SELECT id, name FROM decks")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	decks := make([]Deck, 0)
	for rows.Next() {
		var d Deck
		if err := rows.Scan(&d.ID, &d.Name); err != nil {
			return nil, err
		}
		decks = append(decks, d)
	}

	return decks, nil
}

func DeleteDeck(id int) error {
	_, err := conn.Exec(context.Background(), "DELETE FROM decks WHERE id = $1", id)
	return err
}
