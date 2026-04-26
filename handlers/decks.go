package handlers

import (
	"flashcards/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleCreateDeck() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req struct {
			Name string `json:"name"`
		}

		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body request"})
			return
		}

		deck := models.Deck{Name: req.Name}
		if err := deck.Create(); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create deck"})
			return
		}

		ctx.JSON(http.StatusCreated, deck)
	}
}

func HandleGetAllDecks() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		decks, err := models.GetAllDecks()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get decks"})
			return
		}

		ctx.JSON(http.StatusOK, decks)
	}
}
