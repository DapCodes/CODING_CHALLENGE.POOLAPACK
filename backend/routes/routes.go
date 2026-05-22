package routes

import (
	"net/http"

	"backendsiswa/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to Student & Regional Management REST API",
			"status":  "healthy",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP"})
	})

	api := r.Group("/api")
	{
		kabupatens := api.Group("/kabupatens")
		{
			kabupatens.GET("", controllers.GetKabupatens)
			kabupatens.GET("/:id", controllers.GetKabupatenByID)
			kabupatens.POST("", controllers.CreateKabupaten)
			kabupatens.PUT("/:id", controllers.UpdateKabupaten)
			kabupatens.DELETE("/:id", controllers.DeleteKabupaten)
		}
	}

	return r
}
