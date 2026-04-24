package models

import "context"

type Card struct {
	ID       int    `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Learned  bool   `json:"learned"`
}

type NewCardRequest struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

// CRUD operations

func (c *Card) Create() error {
	_, err := conn.Exec(context.Background(), "INSERT INTO cards (question, answer, learned) VALUES ($1, $2, $3)", c.Question, c.Answer, c.Learned)
	return err
}

func GetAllCards() ([]Card, error) {
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
	_, err := conn.Exec(context.Background(), "UPDATE cards SET question=$1, answer=$2, learned=$3 WHERE id=$4", c.Question, c.Answer, c.Learned, c.ID)
	return err
}

func DeleteCard(id int) error {
	_, err := conn.Exec(context.Background(), "DELETE FROM cards WHERE id=$1", id)
	return err
}
