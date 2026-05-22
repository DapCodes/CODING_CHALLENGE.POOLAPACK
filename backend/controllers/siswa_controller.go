package controllers

import (
	"net/http"

	"backendsiswa/config"
	"backendsiswa/models"

	"github.com/gin-gonic/gin"
)

func GetSiswas(c *gin.Context) {
	var siswas []models.Siswa
	if err := config.DB.Preload("Kabupaten").Preload("Kecamatan").Find(&siswas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, siswas)
}

func GetSiswaByID(c *gin.Context) {
	id := c.Param("id")
	var siswa models.Siswa

	if err := config.DB.Preload("Kabupaten").Preload("Kecamatan").First(&siswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Siswa not found"})
		return
	}

	c.JSON(http.StatusOK, siswa)
}

func CreateSiswa(c *gin.Context) {
	var input models.Siswa
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}


	var kabupaten models.Kabupaten
	if err := config.DB.First(&kabupaten, input.KabupatenID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id_kota_kabupaten. Kabupaten does not exist."})
		return
	}


	var kecamatan models.Kecamatan
	if err := config.DB.First(&kecamatan, input.KecamatanID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id_kecamatan. Kecamatan does not exist."})
		return
	}


	if kecamatan.KabupatenID != input.KabupatenID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Data inconsistency: The selected Kecamatan does not belong to the selected Kabupaten.",
		})
		return
	}

	siswa := models.Siswa{
		NamaSiswa:   input.NamaSiswa,
		KabupatenID: input.KabupatenID,
		KecamatanID: input.KecamatanID,
		Alamat:      input.Alamat,
	}

	if err := config.DB.Create(&siswa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	config.DB.Preload("Kabupaten").Preload("Kecamatan").First(&siswa, siswa.ID)
	c.JSON(http.StatusCreated, siswa)
}

func UpdateSiswa(c *gin.Context) {
	id := c.Param("id")
	var siswa models.Siswa

	if err := config.DB.First(&siswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Siswa not found"})
		return
	}

	var input models.Siswa
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	targetKabupatenID := siswa.KabupatenID
	if input.KabupatenID != 0 {
		targetKabupatenID = input.KabupatenID
		var kabupaten models.Kabupaten
		if err := config.DB.First(&kabupaten, targetKabupatenID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id_kota_kabupaten. Kabupaten does not exist."})
			return
		}
	}

	targetKecamatanID := siswa.KecamatanID
	if input.KecamatanID != 0 {
		targetKecamatanID = input.KecamatanID
		var kecamatan models.Kecamatan
		if err := config.DB.First(&kecamatan, targetKecamatanID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id_kecamatan. Kecamatan does not exist."})
			return
		}
	}

	if input.KabupatenID != 0 || input.KecamatanID != 0 {
		var kecamatan models.Kecamatan
		config.DB.First(&kecamatan, targetKecamatanID)
		if kecamatan.KabupatenID != targetKabupatenID {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Data inconsistency: The selected Kecamatan does not belong to the selected Kabupaten.",
			})
			return
		}
	}

	if err := config.DB.Model(&siswa).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	config.DB.Preload("Kabupaten").Preload("Kecamatan").First(&siswa, siswa.ID)
	c.JSON(http.StatusOK, siswa)
}

func DeleteSiswa(c *gin.Context) {
	id := c.Param("id")
	var siswa models.Siswa

	if err := config.DB.First(&siswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Siswa not found"})
		return
	}

	if err := config.DB.Delete(&siswa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Siswa deleted successfully"})
}
