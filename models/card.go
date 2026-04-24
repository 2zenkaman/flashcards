package models

type Card struct {
	ID       int    `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Learned  bool   `json:"learned"`
}
