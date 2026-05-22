package controllers

import (
	"net/http"

	"backendsiswa/config"
	"backendsiswa/models"

	"github.com/gin-gonic/gin"
)

func GetKabupatens(c *gin.Context) {
	var kabupatens []models.Kabupaten
	if err := config.DB.Find(&kabupatens).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, kabupatens)
}

func GetKabupatenByID(c *gin.Context) {
	id := c.Param("id")
	var kabupaten models.Kabupaten

	if err := config.DB.First(&kabupaten, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kabupaten not found"})
		return
	}

	c.JSON(http.StatusOK, kabupaten)
}

func CreateKabupaten(c *gin.Context) {
	var input models.Kabupaten
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	kabupaten := models.Kabupaten{Nama: input.Nama}
	if err := config.DB.Create(&kabupaten).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, kabupaten)
}

func UpdateKabupaten(c *gin.Context) {
	id := c.Param("id")
	var kabupaten models.Kabupaten

	if err := config.DB.First(&kabupaten, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kabupaten not found"})
		return
	}

	var input models.Kabupaten
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Model(&kabupaten).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, kabupaten)
}

func DeleteKabupaten(c *gin.Context) {
	id := c.Param("id")
	var kabupaten models.Kabupaten

	if err := config.DB.First(&kabupaten, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kabupaten not found"})
		return
	}

	var kecamatanCount int64
	config.DB.Model(&models.Kecamatan{}).Where("id_kota_kabupaten = ?", id).Count(&kecamatanCount)
	if kecamatanCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete Kabupaten because it is referenced by one or more Kecamatans"})
		return
	}

	if err := config.DB.Delete(&kabupaten).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kabupaten deleted successfully"})
}
