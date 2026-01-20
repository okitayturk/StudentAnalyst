export interface HighSchool {
  id: string;
  city: string;
  schoolName: string;
  type: 'Fen Lisesi' | 'Anadolu Lisesi' | 'Sosyal Bilimler' | 'Anadolu İmam Hatip' | 'Mesleki ve Teknik';
  language: string; // İngilizce, Almanca, Fransızca etc.
  score: number;
  percentile: number;
  quota: number;
}

const cities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", 
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", 
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", 
  "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", 
  "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", 
  "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", 
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", 
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

// Gerçek Veriler (Örneklem)
const realSchools: Record<string, Array<{name: string, type: string, lang: string, score: number, p: number}>> = {
  "İstanbul": [
    { name: "Galatasaray Lisesi", type: "Anadolu Lisesi", lang: "Fransızca", score: 500.00, p: 0.01 },
    { name: "İstanbul Erkek Lisesi", type: "Anadolu Lisesi", lang: "Almanca", score: 497.42, p: 0.04 },
    { name: "Kabataş Erkek Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 495.10, p: 0.08 },
    { name: "Kabataş Erkek Lisesi", type: "Anadolu Lisesi", lang: "Almanca", score: 494.50, p: 0.10 },
    { name: "Cağaloğlu Anadolu Lisesi", type: "Anadolu Lisesi", lang: "Almanca", score: 488.20, p: 0.26 },
    { name: "Çapa Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 485.50, p: 0.38 },
    { name: "Hüseyin Avni Sözen Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 482.10, p: 0.45 },
    { name: "Kadıköy Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 478.90, p: 0.65 },
    { name: "Sakıp Sabancı Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 475.60, p: 0.92 },
    { name: "Beşiktaş Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 472.40, p: 1.20 },
    { name: "Vefa Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 468.80, p: 1.55 },
    { name: "Pertevniyal Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 465.20, p: 1.95 },
    { name: "Şehit Münir Alkan Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 462.50, p: 2.15 },
    { name: "Haydarpaşa Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 460.10, p: 2.45 },
    { name: "Burak Bora Anadolu Lisesi", type: "Anadolu Lisesi", lang: "Fransızca", score: 458.50, p: 2.80 },
    { name: "Kartal Anadolu İmam Hatip Lisesi", type: "Anadolu İmam Hatip", lang: "İngilizce", score: 480.50, p: 0.55 },
    { name: "Kadıköy Anadolu İmam Hatip Lisesi", type: "Anadolu İmam Hatip", lang: "İngilizce", score: 465.00, p: 1.90 }
  ],
  "Ankara": [
    { name: "Ankara Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 494.50, p: 0.09 },
    { name: "Atatürk Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 485.20, p: 0.35 },
    { name: "Gazi Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 478.10, p: 0.72 },
    { name: "Ankara Pursaklar Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 475.50, p: 0.95 },
    { name: "Cumhuriyet Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 472.30, p: 1.15 },
    { name: "Mehmet Emin Resulzade Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 468.90, p: 1.45 },
    { name: "Dr. Binnaz Ege - Dr. Rıdvan Ege Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 465.40, p: 1.80 },
    { name: "Hacı Ömer Tarman Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 460.20, p: 2.30 },
    { name: "Betül Can Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 455.10, p: 2.90 },
    { name: "Ankara Anadolu Lisesi", type: "Anadolu Lisesi", lang: "Almanca", score: 450.50, p: 3.50 },
    { name: "Nermin Mehmet Çekiç Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 448.20, p: 3.90 },
    { name: "Ayrancı Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 445.50, p: 4.50 },
    { name: "Yenimahalle Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 462.10, p: 2.10 },
    { name: "Tevfik İleri Anadolu İmam Hatip Lisesi", type: "Anadolu İmam Hatip", lang: "İngilizce", score: 458.00, p: 2.60 }
  ],
  "İzmir": [
     { name: "İzmir Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 493.50, p: 0.12 },
     { name: "Bornova Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 478.20, p: 0.75 },
     { name: "Bornova Anadolu Lisesi", type: "Anadolu Lisesi", lang: "Almanca", score: 476.50, p: 0.85 },
     { name: "İzmir Atatürk Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 475.10, p: 0.98 },
     { name: "Buca İnci-Özer Tırnaklı Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 472.80, p: 1.18 },
     { name: "Karşıyaka Cihat Kora Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 465.50, p: 1.85 },
     { name: "İzmir Kız Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 455.20, p: 2.95 },
     { name: "Konak Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 450.10, p: 3.60 }
  ],
  "Bursa": [
     { name: "Tofaş Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 485.50, p: 0.35 },
     { name: "Bursa Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 470.20, p: 1.35 },
     { name: "Nilüfer İMKB Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 475.80, p: 0.90 },
     { name: "Ahmet Erdem Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 462.50, p: 2.10 },
     { name: "Bursa Erkek Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 455.00, p: 2.90 }
  ],
  "Antalya": [
      { name: "Yusuf Ziya Öner Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 482.50, p: 0.42 },
      { name: "Antalya Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 472.10, p: 1.22 },
      { name: "Adem Tolunay Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 468.50, p: 1.55 },
      { name: "Dr. İlhami Tankut Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 458.20, p: 2.65 }
  ],
  "Adana": [
      { name: "Adana Fen Lisesi", type: "Fen Lisesi", lang: "İngilizce", score: 484.50, p: 0.40 },
      { name: "Adana Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 465.20, p: 1.95 },
      { name: "Çukurova Toroslar Anadolu Lisesi", type: "Anadolu Lisesi", lang: "İngilizce", score: 452.80, p: 3.25 }
  ]
};

const generateHighSchoolData = (): HighSchool[] => {
    const data: HighSchool[] = [];
    let idCounter = 1;

    // Büyük şehir tanımları (Daha fazla okul üretmek için)
    const metropolis = ["İstanbul", "Ankara", "İzmir"];
    const largeCities = ["Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin", "Diyarbakır"];
    const midCities = ["Kayseri", "Samsun", "Balıkesir", "Aydın", "Denizli", "Sakarya", "Manisa", "Hatay", "Tekirdağ", "Eskişehir", "Trabzon", "Şanlıurfa", "Van"];

    cities.forEach(city => {
        // 1. Önce Gerçek Okulları Ekle (Varsa)
        if (realSchools[city]) {
            realSchools[city].forEach(school => {
                data.push({
                    id: (idCounter++).toString(),
                    city: city,
                    schoolName: school.name,
                    type: school.type as any,
                    language: school.lang,
                    score: school.score,
                    percentile: school.p,
                    quota: Math.floor(Math.random() * 60) + 90
                });
            });
        }

        // 2. Simülasyon Okulları Ekle (Şehrin büyüklüğüne göre sayı değişir)
        let schoolMultiplier = 1;
        if (metropolis.includes(city)) schoolMultiplier = 6;
        else if (largeCities.includes(city)) schoolMultiplier = 3.5;
        else if (midCities.includes(city)) schoolMultiplier = 2;

        // a) Fen Lisesi (Eğer gerçek listede yoksa veya ek olarak)
        // Büyük şehirlerde birden fazla Fen Lisesi olur.
        const fenCount = Math.ceil(schoolMultiplier * 0.5); 
        for(let i=0; i<fenCount; i++) {
             // Gerçek listede zaten "X Fen Lisesi" varsa tekrar eklememeye çalış (basit kontrol)
             const exists = data.some(d => d.city === city && d.schoolName.includes(`${city} Fen Lisesi`));
             if (i === 0 && exists) continue;

             const suffix = i === 0 ? "" : ` ${i+1}.`;
             data.push({
                id: (idCounter++).toString(),
                city: city,
                schoolName: `${city} Fen Lisesi${suffix}`,
                type: 'Fen Lisesi',
                language: 'İngilizce',
                score: 460 + (Math.random() * 30) - (i * 10), // Puan biraz düşerek gider
                percentile: parseFloat((0.8 + (Math.random() * 1.5) + (i * 0.5)).toFixed(2)),
                quota: 120
            });
        }

        // b) Anadolu Liseleri
        const anadoluCount = Math.ceil(8 * schoolMultiplier);
        for(let i=1; i<=anadoluCount; i++) {
            // Puan Skalası: 300 - 460 arası
            const baseScore = 460 - (i * (160 / anadoluCount)) + (Math.random() * 10);
            const limitedScore = Math.max(300, Math.min(490, baseScore));
            
            // Yüzdelik ters orantı: 490 -> %0.5, 300 -> %40
            const p = parseFloat(((500 - limitedScore) / 4).toFixed(2));

            // Gerçekçi isimler için numara yerine semt ismi varmış gibi davranalım
            // Veya sadece "X Anadolu Lisesi" formatını koruyalım
            const nameSuffix = metropolis.includes(city) ? `${i}. Bölge` : `${i}`;

            data.push({
                id: (idCounter++).toString(),
                city: city,
                schoolName: `${city} Anadolu Lisesi (${nameSuffix})`, 
                type: 'Anadolu Lisesi',
                language: Math.random() > 0.9 ? 'Almanca' : 'İngilizce',
                score: parseFloat(limitedScore.toFixed(3)),
                percentile: p,
                quota: 90 + Math.floor(Math.random() * 150)
            });
        }

        // c) Sosyal Bilimler
        const sosCount = Math.ceil(schoolMultiplier * 0.4);
        for(let i=1; i<=sosCount; i++) {
            const suffix = sosCount > 1 ? ` ${i}` : "";
            data.push({
                id: (idCounter++).toString(),
                city: city,
                schoolName: `${city} Sosyal Bilimler Lisesi${suffix}`,
                type: 'Sosyal Bilimler',
                language: 'İngilizce',
                score: 360 + Math.random() * 80,
                percentile: parseFloat((10 + Math.random() * 10).toFixed(2)),
                quota: 90
            });
        }

        // d) İmam Hatip
        const imamCount = Math.ceil(4 * schoolMultiplier);
        for(let i=1; i<=imamCount; i++) {
            const score = 250 + Math.random() * 210; // Geniş aralık, bazıları çok yüksek (proje) bazıları düşük
            data.push({
                id: (idCounter++).toString(),
                city: city,
                schoolName: `${city} Anadolu İmam Hatip Lisesi ${i}`,
                type: 'Anadolu İmam Hatip',
                language: Math.random() > 0.8 ? 'Arapça' : 'İngilizce',
                score: parseFloat(score.toFixed(3)),
                percentile: parseFloat(((500 - score) / 3.5).toFixed(2)),
                quota: 60 + Math.floor(Math.random() * 60)
            });
        }

         // e) Mesleki
         const meslekCount = Math.ceil(5 * schoolMultiplier);
         for(let i=1; i<=meslekCount; i++) {
             const score = 200 + Math.random() * 180;
             data.push({
                 id: (idCounter++).toString(),
                 city: city,
                 schoolName: `${city} Mesleki ve Teknik Anadolu Lisesi ${i}`,
                 type: 'Mesleki ve Teknik',
                 language: 'İngilizce',
                 score: parseFloat(score.toFixed(3)),
                 percentile: parseFloat(((500 - score) / 2.5).toFixed(2)),
                 quota: 120
             });
         }
    });

    return data.sort((a, b) => b.score - a.score);
}

export const highSchoolData = generateHighSchoolData();