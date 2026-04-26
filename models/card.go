package models

import (
	"context"
)

type Card struct {
	ID       int    `json:"id"`
	DeckID   int    `json:"deck_id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Learned  bool   `json:"learned"`
}

// CRUD operations

func (c *Card) Create() error {
	if conn == nil {
		return DatabaseNilError
	}

	err := conn.QueryRow(context.Background(), "INSERT INTO cards (question, answer, deck_id) VALUES ($1, $2, $3) RETURNING id, learned", c.Question, c.Answer, c.DeckID).Scan(&c.ID, &c.Learned)
	return err
}

func GetAllCards(deckID int) ([]Card, error) {
	if conn == nil {
		return nil, DatabaseNilError
	}

	rows, err := conn.Query(context.Background(), "SELECT id, question, answer, learned FROM cards WHERE deck_id = $1 ORDER BY id", deckID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cards := make([]Card, 0)
	for rows.Next() {
		var c Card
		if err := rows.Scan(&c.ID, &c.Question, &c.Answer, &c.Learned); err != nil {
			return nil, err
		}
		c.DeckID = deckID
		cards = append(cards, c)
	}
	return cards, nil
}

func UpdateCard(id int, deckID int) (*Card, error) {
	if conn == nil {
		return nil, DatabaseNilError
	}

	var c Card
	err := conn.QueryRow(context.Background(), "UPDATE cards SET learned = NOT learned WHERE id=$1 AND deck_id=$2 RETURNING *", id, deckID).Scan(&c.ID, &c.DeckID, &c.Question, &c.Answer, &c.Learned)
	return &c, err
}

func DeleteCard(id int, deckID int) error {
	if conn == nil {
		return DatabaseNilError
	}

	_, err := conn.Exec(context.Background(), "DELETE FROM cards WHERE id=$1 AND deck_id=$2", id, deckID)
	return err
}
