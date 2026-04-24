package handlers

import (
	"encoding/json"
	"flashcards/models"
	"net/http"
)

func HandleCreateCard() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Question string `json:"question"`
			Answer   string `json:"answer"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		card := models.Card{
			Question: req.Question,
			Answer:   req.Answer,
			Learned:  false,
		}

		if err := card.Create(); err != nil {
			http.Error(w, "Failed to create card: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(card)
	}
}

func HandleGetAllCards() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cards, err := models.GetAllCards()
		if err != nil {
			http.Error(w, "Failed to retrieve cards: "+err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(cards)
	}
}

func HandleUpdateCard() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var card models.Card
		if err := json.NewDecoder(r.Body).Decode(&card); err != nil {
			http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		if err := models.UpdateCard(&card); err != nil {
			http.Error(w, "Failed to update card: "+err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(card)
	}
}

func HandleDeleteCard() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			ID int `json:"id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
			return
		}
		if err := models.DeleteCard(req.ID); err != nil {
			http.Error(w, "Failed to delete card: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}
