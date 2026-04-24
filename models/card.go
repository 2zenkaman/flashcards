package models

import (
	"context"
)

type Card struct {
	ID       int    `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Learned  bool   `json:"learned"`
}

// CRUD operations

func (c *Card) Create() error {
	if conn == nil {
		return DatabaseNilError
	}

	err := conn.QueryRow(context.Background(), "INSERT INTO cards (question, answer) VALUES ($1, $2) RETURNING id, learned;", c.Question, c.Answer).Scan(&c.ID, &c.Learned)
	return err
}

func GetAllCards() ([]Card, error) {
	if conn == nil {
		return nil, DatabaseNilError
	}

	rows, err := conn.Query(context.Background(), "SELECT id, question, answer, learned FROM cards")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []Card
	for rows.Next() {
		var c Card
		if err := rows.Scan(&c.ID, &c.Question, &c.Answer, &c.Learned); err != nil {
			return nil, err
		}
		cards = append(cards, c)
	}
	return cards, nil
}

func UpdateCard(c *Card) error {
	if conn == nil {
		return DatabaseNilError
	}

	err := conn.QueryRow(context.Background(), "UPDATE cards SET question=$1, answer=$2, learned=$3 WHERE id=$4 RETURNING question, answer, learned", c.Question, c.Answer, c.Learned, c.ID).Scan(&c.Question, &c.Answer, &c.Learned)
	return err
}

func DeleteCard(id int) error {
	if conn == nil {
		return DatabaseNilError
	}

	_, err := conn.Exec(context.Background(), "DELETE FROM cards WHERE id=$1", id)
	return err
}
