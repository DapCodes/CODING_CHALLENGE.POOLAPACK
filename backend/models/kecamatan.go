package models

type Kecamatan struct {
	ID          uint       `gorm:"primaryKey;column:id_kecamatan;autoIncrement" json:"id_kecamatan"`
	Nama        string     `gorm:"column:nama;type:varchar(255);not null" json:"nama" binding:"required"`
	KabupatenID uint       `gorm:"column:id_kota_kabupaten;not null" json:"id_kota_kabupaten" binding:"required"`
	Kabupaten   *Kabupaten `gorm:"foreignKey:KabupatenID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"kabupaten,omitempty"`
}
