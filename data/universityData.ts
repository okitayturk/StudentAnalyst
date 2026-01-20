export interface UniversityProgram {
  id: string;
  city: string;
  university: string;
  department: string;
  type: 'Devlet' | 'Vakıf' | 'Kıbrıs' | 'Yurtdışı';
  score: number;
  rank: number;
  quota: number;
}

// --- Data Lists ---

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

const universities = [
  { name: "Boğaziçi Üniversitesi", city: "İstanbul", type: "Devlet" },
  { name: "Orta Doğu Teknik Üniversitesi", city: "Ankara", type: "Devlet" },
  { name: "İstanbul Teknik Üniversitesi", city: "İstanbul", type: "Devlet" },
  { name: "Hacettepe Üniversitesi", city: "Ankara", type: "Devlet" },
  { name: "Ankara Üniversitesi", city: "Ankara", type: "Devlet" },
  { name: "İstanbul Üniversitesi", city: "İstanbul", type: "Devlet" },
  { name: "Ege Üniversitesi", city: "İzmir", type: "Devlet" },
  { name: "Gazi Üniversitesi", city: "Ankara", type: "Devlet" },
  { name: "Dokuz Eylül Üniversitesi", city: "İzmir", type: "Devlet" },
  { name: "Marmara Üniversitesi", city: "İstanbul", type: "Devlet" },
  { name: "Yıldız Teknik Üniversitesi", city: "İstanbul", type: "Devlet" },
  { name: "Anadolu Üniversitesi", city: "Eskişehir", type: "Devlet" },
  { name: "Akdeniz Üniversitesi", city: "Antalya", type: "Devlet" },
  { name: "Çukurova Üniversitesi", city: "Adana", type: "Devlet" },
  { name: "Sakarya Üniversitesi", city: "Sakarya", type: "Devlet" },
  { name: "Kocaeli Üniversitesi", city: "Kocaeli", type: "Devlet" },
  { name: "Erciyes Üniversitesi", city: "Kayseri", type: "Devlet" },
  { name: "Karadeniz Teknik Üniversitesi", city: "Trabzon", type: "Devlet" },
  { name: "Selçuk Üniversitesi", city: "Konya", type: "Devlet" },
  { name: "Uludağ Üniversitesi", city: "Bursa", type: "Devlet" },
  { name: "Ondokuz Mayıs Üniversitesi", city: "Samsun", type: "Devlet" },
  { name: "İnönü Üniversitesi", city: "Malatya", type: "Devlet" },
  { name: "Atatürk Üniversitesi", city: "Erzurum", type: "Devlet" },
  { name: "Süleyman Demirel Üniversitesi", city: "Isparta", type: "Devlet" },
  { name: "Pamukkale Üniversitesi", city: "Denizli", type: "Devlet" },
  { name: "Muğla Sıtkı Koçman Üniversitesi", city: "Muğla", type: "Devlet" },
  { name: "Çanakkale Onsekiz Mart Üni.", city: "Çanakkale", type: "Devlet" },
  { name: "Mersin Üniversitesi", city: "Mersin", type: "Devlet" },
  { name: "Trakya Üniversitesi", city: "Edirne", type: "Devlet" },
  { name: "Eskişehir Osmangazi Üniversitesi", city: "Eskişehir", type: "Devlet" },
  { name: "Bolu Abant İzzet Baysal Üni.", city: "Bolu", type: "Devlet" },
  { name: "Adnan Menderes Üniversitesi", city: "Aydın", type: "Devlet" },
  { name: "Afyon Kocatepe Üniversitesi", city: "Afyonkarahisar", type: "Devlet" },
  { name: "Balıkesir Üniversitesi", city: "Balıkesir", type: "Devlet" },
  { name: "Celal Bayar Üniversitesi", city: "Manisa", type: "Devlet" },
  { name: "Dumlupınar Üniversitesi", city: "Kütahya", type: "Devlet" },
  { name: "Dicle Üniversitesi", city: "Diyarbakır", type: "Devlet" },
  { name: "Fırat Üniversitesi", city: "Elazığ", type: "Devlet" },
  { name: "Gaziantep Üniversitesi", city: "Gaziantep", type: "Devlet" },
  { name: "Gebze Teknik Üniversitesi", city: "Kocaeli", type: "Devlet" },
  { name: "İzmir Yüksek Teknoloji Enstitüsü", city: "İzmir", type: "Devlet" },
  { name: "Abdullah Gül Üniversitesi", city: "Kayseri", type: "Devlet" },
  { name: "Türk-Alman Üniversitesi", city: "İstanbul", type: "Devlet" },
  { name: "Sağlık Bilimleri Üniversitesi", city: "İstanbul", type: "Devlet" },
  { name: "Mimar Sinan Güzel Sanatlar Üni.", city: "İstanbul", type: "Devlet" },
  { name: "Galatasaray Üniversitesi", city: "İstanbul", type: "Devlet" },
  { name: "İstanbul Medeniyet Üniversitesi", city: "İstanbul", type: "Devlet" },
  
  // Vakıf Üniversiteleri
  { name: "Koç Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Sabancı Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Bilkent Üniversitesi", city: "Ankara", type: "Vakıf" },
  { name: "Özyeğin Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Yeditepe Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Bahçeşehir Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Bilgi Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Başkent Üniversitesi", city: "Ankara", type: "Vakıf" },
  { name: "TOBB Ekonomi ve Teknoloji Üni.", city: "Ankara", type: "Vakıf" },
  { name: "İzmir Ekonomi Üniversitesi", city: "İzmir", type: "Vakıf" },
  { name: "Acıbadem Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Medipol Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Aydın Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Nişantaşı Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Gelişim Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Kültür Üniversitesi", city: "İstanbul", type: "Vakıf" },
  { name: "Atılım Üniversitesi", city: "Ankara", type: "Vakıf" },
  { name: "Çankaya Üniversitesi", city: "Ankara", type: "Vakıf" },
  { name: "Yaşar Üniversitesi", city: "İzmir", type: "Vakıf" },

  // Kıbrıs
  { name: "Yakın Doğu Üniversitesi", city: "Lefkoşa", type: "Kıbrıs" },
  { name: "Doğu Akdeniz Üniversitesi", city: "Gazimağusa", type: "Kıbrıs" },
  { name: "Uluslararası Kıbrıs Üniversitesi", city: "Lefkoşa", type: "Kıbrıs" },
  { name: "Girne Amerikan Üniversitesi", city: "Girne", type: "Kıbrıs" }
];

const departments = [
  { name: "Tıp Fakültesi", baseScore: 490, range: 60 },
  { name: "Diş Hekimliği", baseScore: 450, range: 50 },
  { name: "Eczacılık", baseScore: 430, range: 50 },
  { name: "Bilgisayar Mühendisliği", baseScore: 300, range: 250 }, // Wide range
  { name: "Yazılım Mühendisliği", baseScore: 290, range: 240 },
  { name: "Elektrik-Elektronik Mühendisliği", baseScore: 290, range: 240 },
  { name: "Endüstri Mühendisliği", baseScore: 280, range: 240 },
  { name: "Makine Mühendisliği", baseScore: 270, range: 230 },
  { name: "İnşaat Mühendisliği", baseScore: 260, range: 200 },
  { name: "Hukuk Fakültesi", baseScore: 380, range: 100 },
  { name: "Psikoloji", baseScore: 320, range: 120 },
  { name: "Mimarlık", baseScore: 300, range: 150 },
  { name: "Hemşirelik", baseScore: 280, range: 100 },
  { name: "Beslenme ve Diyetetik", baseScore: 270, range: 100 },
  { name: "Fizyoterapi ve Rehabilitasyon", baseScore: 260, range: 100 },
  { name: "İlköğretim Matematik Öğretmenliği", baseScore: 340, range: 100 },
  { name: "İngilizce Öğretmenliği", baseScore: 350, range: 110 },
  { name: "Özel Eğitim Öğretmenliği", baseScore: 330, range: 80 },
  { name: "Sınıf Öğretmenliği", baseScore: 310, range: 80 },
  { name: "Okul Öncesi Öğretmenliği", baseScore: 320, range: 80 },
  { name: "Rehberlik ve Psikolojik Danışmanlık", baseScore: 310, range: 90 },
  { name: "Yönetim Bilişim Sistemleri", baseScore: 280, range: 150 },
  { name: "İşletme", baseScore: 230, range: 250 },
  { name: "İktisat", baseScore: 230, range: 250 },
  { name: "Siyaset Bilimi ve Kamu Yönetimi", baseScore: 240, range: 200 },
  { name: "Uluslararası İlişkiler", baseScore: 240, range: 200 },
  { name: "Gastronomi ve Mutfak Sanatları", baseScore: 300, range: 120 },
  { name: "Havacılık ve Uzay Mühendisliği", baseScore: 450, range: 90 },
  { name: "Pilotaj", baseScore: 480, range: 60 },
  { name: "Veteriner Fakültesi", baseScore: 300, range: 80 },
  { name: "İlahiyat", baseScore: 280, range: 100 }
];

// --- Generator Function ---

const generateData = (): UniversityProgram[] => {
  const data: UniversityProgram[] = [];
  let idCounter = 1;

  universities.forEach(uni => {
    // Determine number of departments for this university based on type
    // State universities usually have more departments
    const deptCount = uni.type === 'Devlet' ? 25 : 15;
    
    // Shuffle departments to assign random ones
    const shuffledDepts = [...departments].sort(() => 0.5 - Math.random());
    const selectedDepts = shuffledDepts.slice(0, deptCount);

    selectedDepts.forEach(dept => {
        // Calculate score based on university prestige (mock logic)
        // Big city state universities and top foundation universities get a boost
        let scoreBoost = 0;
        if (["Boğaziçi Üniversitesi", "Orta Doğu Teknik Üniversitesi", "İstanbul Teknik Üniversitesi", "Koç Üniversitesi", "Bilkent Üniversitesi", "Sabancı Üniversitesi", "Galatasaray Üniversitesi", "Hacettepe Üniversitesi"].includes(uni.name)) {
            scoreBoost = 80 + Math.random() * 40;
        } else if (["İstanbul", "Ankara", "İzmir"].includes(uni.city)) {
            scoreBoost = 40 + Math.random() * 30;
        } else {
            scoreBoost = Math.random() * 20;
        }

        // Add variety for foundation universities (Scholarship types)
        if (uni.type === 'Vakıf' || uni.type === 'Kıbrıs') {
             // Burslu
             let finalScore = dept.baseScore + dept.range * 0.8 + scoreBoost;
             if(finalScore > 560) finalScore = 560;
             data.push({
                 id: (idCounter++).toString(),
                 city: uni.city,
                 university: uni.name,
                 department: `${dept.name} (Burslu)`,
                 type: uni.type as any,
                 score: finalScore,
                 rank: Math.floor(500000 / (finalScore / 10)), // Mock rank logic
                 quota: Math.floor(Math.random() * 10) + 5
             });

             // %50 İndirimli / Ücretli
             finalScore = dept.baseScore + (Math.random() * 50);
             data.push({
                id: (idCounter++).toString(),
                city: uni.city,
                university: uni.name,
                department: `${dept.name} (%50 İndirimli)`,
                type: uni.type as any,
                score: finalScore,
                rank: Math.floor(800000 / (finalScore / 10)),
                quota: Math.floor(Math.random() * 50) + 20
            });

        } else {
            // Devlet
            let finalScore = dept.baseScore + (Math.random() * dept.range) + scoreBoost;
            if(finalScore > 560) finalScore = 560;
            
            data.push({
                id: (idCounter++).toString(),
                city: uni.city,
                university: uni.name,
                department: dept.name,
                type: 'Devlet',
                score: finalScore,
                rank: Math.floor(600000 / (finalScore / 10)),
                quota: Math.floor(Math.random() * 80) + 40
            });

            // İkinci Öğretim (Some departments)
            if (Math.random() > 0.7 && !dept.name.includes("Tıp") && !dept.name.includes("Diş")) {
                data.push({
                    id: (idCounter++).toString(),
                    city: uni.city,
                    university: uni.name,
                    department: `${dept.name} (İÖ)`,
                    type: 'Devlet',
                    score: finalScore - 30,
                    rank: Math.floor(600000 / ((finalScore - 30) / 10)),
                    quota: Math.floor(Math.random() * 60) + 30
                });
            }
        }
    });
  });

  return data.sort((a, b) => b.score - a.score);
};

export const universityData = generateData();