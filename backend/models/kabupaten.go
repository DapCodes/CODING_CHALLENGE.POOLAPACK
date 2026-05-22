package models

type Kabupaten struct {
	ID   uint   `gorm:"primaryKey;column:id_kota_kabupaten;autoIncrement" json:"id_kota_kabupaten"`
	Nama string `gorm:"column:nama;type:varchar(255);not null" json:"nama" binding:"required"`
}
