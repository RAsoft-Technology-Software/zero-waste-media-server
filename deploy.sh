#!/bin/bash

# Backend dizinine gidin
cd /zero_waste_gpt/zero-waste-media-server

# Projeyi güncelle
echo "Web Güncelleniyor..."
git pull


# Backend bağımlılıklarını yükle
echo "Backend bağımlılıkları yükleniyor..."
npm install

# Projeyi build et
echo "Web build ediliyor..."
npm run build


# PM2 ile backend'i başlat
echo "Backend PM2 ile başlatılıyor..."
pm2 start dist/index.js --name media

# PM2'nin arka planda çalışmasını sağla
pm2 startup
pm2 save

echo "Backend başarıyla dağıtıldı."
