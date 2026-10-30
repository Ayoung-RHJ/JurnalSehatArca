/* Ayat and hadith about health, strength, food, rest and fasting.
   Arabic Quran text: Tanzil Quran Simple. Indonesian Quran meaning: Kemenag RI.
   Hadith Arabic: the collections' own text (fawazahmed0/hadith-api), checked against the numbers below.
   Review list: dalil-review.md */
const DALIL = [
 {
  "k": "q",
  "tags": [
   "sehat"
  ],
  "ar": "وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ ۛ وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
  "idn": "…dan janganlah kamu jatuhkan (diri sendiri) ke dalam kebinasaan dengan tangan sendiri, dan berbuat baiklah. Sungguh, Allah menyukai orang-orang yang berbuat baik.",
  "en": "…and do not throw yourselves into ruin with your own hands, and do good. Indeed, Allah loves those who do good.",
  "src": "QS. Al-Baqarah [2]: 195 (sebagian)",
  "id": "d1"
 },
 {
  "k": "q",
  "tags": [
   "makan"
  ],
  "ar": "وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا ۚ إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ",
  "idn": "…makan dan minumlah, tetapi jangan berlebihan! Sesungguhnya, Allah tidak menyukai orang yang berlebih-lebihan.",
  "en": "…eat and drink, but do not be excessive. Indeed, He does not like those who are excessive.",
  "src": "QS. Al-A’raf [7]: 31 (sebagian)",
  "id": "d2"
 },
 {
  "k": "q",
  "tags": [
   "makan"
  ],
  "ar": "يَا أَيُّهَا النَّاسُ كُلُوا مِمَّا فِي الْأَرْضِ حَلَالًا طَيِّبًا وَلَا تَتَّبِعُوا خُطُوَاتِ الشَّيْطَانِ",
  "idn": "Wahai manusia! Makanlah dari (makanan) yang halal dan baik yang terdapat di bumi, dan janganlah kamu mengikuti langkah-langkah setan.",
  "en": "O people, eat of what is lawful and good on the earth, and do not follow the footsteps of Satan.",
  "src": "QS. Al-Baqarah [2]: 168 (sebagian)",
  "id": "d3"
 },
 {
  "k": "q",
  "tags": [
   "puasa",
   "ramadan"
  ],
  "ar": "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
  "idn": "Wahai orang-orang yang beriman! Diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang sebelum kamu agar kamu bertakwa.",
  "en": "O you who believe, fasting is prescribed for you as it was prescribed for those before you, so that you may become mindful of Allah.",
  "src": "QS. Al-Baqarah [2]: 183",
  "id": "d4"
 },
 {
  "k": "q",
  "tags": [
   "puasa"
  ],
  "ar": "وَأَنْ تَصُومُوا خَيْرٌ لَكُمْ ۖ إِنْ كُنْتُمْ تَعْلَمُونَ",
  "idn": "…dan puasamu itu lebih baik bagimu jika kamu mengetahui.",
  "en": "…and fasting is better for you, if only you knew.",
  "src": "QS. Al-Baqarah [2]: 184 (sebagian)",
  "id": "d5"
 },
 {
  "k": "q",
  "tags": [
   "puasa",
   "ramadan"
  ],
  "ar": "يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ",
  "idn": "…Allah menghendaki kemudahan bagimu, dan tidak menghendaki kesukaran bagimu.",
  "en": "…Allah wants ease for you, and does not want hardship for you.",
  "src": "QS. Al-Baqarah [2]: 185 (sebagian)",
  "id": "d6"
 },
 {
  "k": "q",
  "tags": [
   "kuat"
  ],
  "ar": "وَأَعِدُّوا لَهُمْ مَا اسْتَطَعْتُمْ مِنْ قُوَّةٍ",
  "idn": "Dan persiapkanlah dengan segala kemampuan untuk menghadapi mereka dengan kekuatan yang kamu miliki…",
  "en": "And prepare against them whatever strength you are able to…",
  "src": "QS. Al-Anfal [8]: 60 (sebagian)",
  "id": "d7"
 },
 {
  "k": "q",
  "tags": [
   "kuat"
  ],
  "ar": "إِنَّ خَيْرَ مَنِ اسْتَأْجَرْتَ الْقَوِيُّ الْأَمِينُ",
  "idn": "…sesungguhnya orang paling baik yang engkau ambil sebagai pekerja (pada kita) ialah orang yang kuat dan dapat dipercaya.",
  "en": "…indeed, the best one you can hire is the strong and the trustworthy.",
  "src": "QS. Al-Qasas [28]: 26 (sebagian)",
  "id": "d8"
 },
 {
  "k": "q",
  "tags": [
   "kuat"
  ],
  "ar": "قَالَ إِنَّ اللَّهَ اصْطَفَاهُ عَلَيْكُمْ وَزَادَهُ بَسْطَةً فِي الْعِلْمِ وَالْجِسْمِ",
  "idn": "…(Nabi) menjawab, “Allah telah memilihnya (menjadi raja) kamu dan memberikan kelebihan ilmu dan fisik.”",
  "en": "…He said, “Allah has chosen him over you and increased him abundantly in knowledge and in body.”",
  "src": "QS. Al-Baqarah [2]: 247 (sebagian)",
  "id": "d9"
 },
 {
  "k": "q",
  "tags": [
   "gerak"
  ],
  "ar": "هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِنْ رِزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ",
  "idn": "Dialah yang menjadikan bumi untuk kamu yang mudah dijelajahi, maka jelajahilah di segala penjurunya dan makanlah sebagian dari rezeki-Nya. Dan hanya kepada-Nyalah kamu (kembali setelah) dibangkitkan.",
  "en": "It is He who made the earth easy for you, so walk through its paths and eat of His provision. And to Him is the resurrection.",
  "src": "QS. Al-Mulk [67]: 15",
  "id": "d10"
 },
 {
  "k": "q",
  "tags": [
   "syukur"
  ],
  "ar": "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
  "idn": "Dan (ingatlah) ketika Tuhanmu memaklumkan, “Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu…”",
  "en": "And remember when your Lord proclaimed, “If you are grateful, I will surely give you more…”",
  "src": "QS. Ibrahim [14]: 7 (sebagian)",
  "id": "d11"
 },
 {
  "k": "q",
  "tags": [
   "syukur"
  ],
  "ar": "وَإِنْ تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا",
  "idn": "Dan jika kamu menghitung nikmat Allah, niscaya kamu tidak akan mampu menghitungnya…",
  "en": "And if you count the blessings of Allah, you could not number them…",
  "src": "QS. An-Nahl [16]: 18 (sebagian)",
  "id": "d12"
 },
 {
  "k": "q",
  "tags": [
   "istirahat"
  ],
  "ar": "وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا",
  "idn": "dan Kami menjadikan tidurmu untuk istirahat.",
  "en": "And We made your sleep for rest.",
  "src": "QS. An-Naba’ [78]: 9",
  "id": "d13"
 },
 {
  "k": "q",
  "tags": [
   "makan"
  ],
  "ar": "كُلُوا مِنْ طَيِّبَاتِ مَا رَزَقْنَاكُمْ وَلَا تَطْغَوْا فِيهِ",
  "idn": "Makanlah dari rezeki yang baik-baik yang telah Kami berikan kepadamu, dan janganlah melampaui batas…",
  "en": "Eat of the good things We have provided for you, and do not transgress in it…",
  "src": "QS. Taha [20]: 81 (sebagian)",
  "id": "d14"
 },
 {
  "k": "q",
  "tags": [
   "semangat"
  ],
  "ar": "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنْفُسِهِمْ",
  "idn": "…Sesungguhnya Allah tidak mengubah keadaan suatu kaum sebelum mereka mengubah keadaan diri mereka sendiri…",
  "en": "…Indeed, Allah will not change the condition of a people until they change what is in themselves…",
  "src": "QS. Ar-Ra’d [13]: 11 (sebagian)",
  "id": "d15"
 },
 {
  "k": "q",
  "tags": [
   "semangat"
  ],
  "ar": "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
  "idn": "Maka sesungguhnya bersama kesulitan ada kemudahan, sesungguhnya bersama kesulitan ada kemudahan.",
  "en": "For indeed, with hardship comes ease. Indeed, with hardship comes ease.",
  "src": "QS. Al-Insyirah [94]: 5–6",
  "id": "d16"
 },
 {
  "k": "q",
  "tags": [
   "istirahat",
   "semangat"
  ],
  "ar": "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
  "idn": "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya…",
  "en": "Allah does not burden a soul beyond what it can bear…",
  "src": "QS. Al-Baqarah [2]: 286 (sebagian)",
  "id": "d17"
 },
 {
  "k": "q",
  "tags": [
   "sehat"
  ],
  "ar": "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ",
  "idn": "dan apabila aku sakit, Dialah yang menyembuhkan aku.",
  "en": "And when I am ill, it is He who cures me.",
  "src": "QS. Asy-Syu’ara’ [26]: 80",
  "id": "d18"
 },
 {
  "k": "h",
  "tags": [
   "kuat"
  ],
  "ar": "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ وَفِي كُلٍّ خَيْرٌ",
  "idn": "Mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah, dan pada keduanya ada kebaikan.",
  "en": "The strong believer is better and more beloved to Allah than the weak believer, and in both there is good.",
  "src": "HR. Muslim no. 2664 (sebagian)",
  "who": "n",
  "id": "d19"
 },
 {
  "k": "h",
  "tags": [
   "sehat"
  ],
  "ar": "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ، الصِّحَّةُ وَالْفَرَاغُ",
  "idn": "Dua nikmat yang banyak manusia tertipu di dalamnya: kesehatan dan waktu luang.",
  "en": "Two blessings that many people waste: health and free time.",
  "src": "HR. Bukhari no. 6412",
  "who": "n",
  "id": "d20"
 },
 {
  "k": "h",
  "tags": [
   "istirahat",
   "sehat"
  ],
  "ar": "فَإِنَّ لِجَسَدِكَ عَلَيْكَ حَقًّا",
  "idn": "Sesungguhnya tubuhmu punya hak atasmu.",
  "en": "Indeed, your body has a right over you.",
  "src": "HR. Bukhari no. 1975 (sebagian)",
  "who": "n",
  "id": "d21"
 },
 {
  "k": "h",
  "tags": [
   "makan"
  ],
  "ar": "مَا مَلأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ بِحَسْبِ ابْنِ آدَمَ أُكُلاَتٌ يُقِمْنَ صُلْبَهُ فَإِنْ كَانَ لاَ مَحَالَةَ فَثُلُثٌ لِطَعَامِهِ وَثُلُثٌ لِشَرَابِهِ وَثُلُثٌ لِنَفَسِهِ",
  "idn": "Tidaklah anak Adam memenuhi wadah yang lebih buruk daripada perutnya. Cukuplah bagi anak Adam beberapa suap yang menegakkan punggungnya. Jika harus lebih, maka sepertiga untuk makanannya, sepertiga untuk minumannya, dan sepertiga untuk napasnya.",
  "en": "No human fills a vessel worse than his stomach. A few bites to keep his back straight are enough. If he must eat more, then a third for food, a third for drink and a third for breath.",
  "src": "HR. Tirmidzi no. 2380, hasan shahih",
  "who": "n",
  "id": "d22"
 },
 {
  "k": "h",
  "tags": [
   "syukur"
  ],
  "ar": "مَنْ أَصْبَحَ مِنْكُمْ آمِنًا فِي سِرْبِهِ مُعَافًى فِي جَسَدِهِ عِنْدَهُ قُوتُ يَوْمِهِ فَكَأَنَّمَا حِيزَتْ لَهُ الدُّنْيَا",
  "idn": "Barang siapa di pagi hari merasa aman di tempat tinggalnya, sehat badannya, dan memiliki makanan untuk hari itu, seakan-akan dunia telah dikumpulkan untuknya.",
  "en": "Whoever wakes up safe at home, healthy in body and with food for the day, it is as if the whole world has been gathered for him.",
  "src": "HR. Tirmidzi no. 2346, hasan",
  "who": "n",
  "id": "d23"
 },
 {
  "k": "h",
  "tags": [
   "puasa",
   "mon",
   "thu"
  ],
  "ar": "تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ",
  "idn": "Amal-amal diperlihatkan (kepada Allah) pada hari Senin dan Kamis, maka aku suka amalku diperlihatkan saat aku sedang berpuasa.",
  "en": "Deeds are presented on Mondays and Thursdays, and I love that my deeds are presented while I am fasting.",
  "src": "HR. Tirmidzi no. 747, dishahihkan Al-Albani",
  "who": "n",
  "id": "d24"
 },
 {
  "k": "h",
  "tags": [
   "arafah"
  ],
  "ar": "صِيَامُ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ",
  "idn": "Puasa hari Arafah, aku berharap kepada Allah agar menghapus (dosa) setahun sebelumnya dan setahun sesudahnya.",
  "en": "Fasting the day of Arafah, I hope Allah will expiate the year before it and the year after it.",
  "src": "HR. Muslim no. 1162 (sebagian)",
  "who": "n",
  "id": "d25"
 },
 {
  "k": "h",
  "tags": [
   "asyura",
   "tasua"
  ],
  "ar": "وَصِيَامُ يَوْمِ عَاشُورَاءَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ",
  "idn": "Puasa hari Asyura, aku berharap kepada Allah agar menghapus (dosa) setahun sebelumnya.",
  "en": "Fasting the day of Ashura, I hope Allah will expiate the year before it.",
  "src": "HR. Muslim no. 1162 (sebagian)",
  "who": "n",
  "id": "d26"
 },
 {
  "k": "h",
  "tags": [
   "syawal"
  ],
  "ar": "مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ",
  "idn": "Barang siapa berpuasa Ramadan lalu mengikutinya dengan enam hari di bulan Syawal, maka seperti puasa setahun penuh.",
  "en": "Whoever fasts Ramadan and follows it with six days of Shawwal, it is like fasting the whole year.",
  "src": "HR. Muslim no. 1164",
  "who": "n",
  "id": "d27"
 },
 {
  "k": "h",
  "tags": [
   "puasa"
  ],
  "ar": "الصِّيَامُ جُنَّةٌ",
  "idn": "Puasa adalah perisai.",
  "en": "Fasting is a shield.",
  "src": "HR. Bukhari no. 1894 (sebagian)",
  "who": "n",
  "id": "d28"
 },
 {
  "k": "h",
  "tags": [
   "ramadan"
  ],
  "ar": "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
  "idn": "Barang siapa berpuasa Ramadan karena iman dan mengharap pahala, diampuni dosa-dosanya yang telah lalu.",
  "en": "Whoever fasts Ramadan out of faith and hoping for reward, his past sins are forgiven.",
  "src": "HR. Bukhari no. 1901 (sebagian)",
  "who": "n",
  "id": "d29"
 },
 {
  "k": "h",
  "tags": [
   "bidh"
  ],
  "ar": "إِذَا صُمْتَ مِنَ الشَّهْرِ ثَلاَثَةَ أَيَّامٍ فَصُمْ ثَلاَثَ عَشْرَةَ وَأَرْبَعَ عَشْرَةَ وَخَمْسَ عَشْرَةَ",
  "idn": "Jika engkau berpuasa tiga hari dalam sebulan, berpuasalah pada tanggal 13, 14, dan 15.",
  "en": "If you fast three days of the month, fast the 13th, 14th and 15th.",
  "src": "HR. Tirmidzi no. 761, hasan",
  "who": "n",
  "id": "d30"
 },
 {
  "k": "h",
  "tags": [
   "puasa",
   "ramadan"
  ],
  "ar": "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً",
  "idn": "Makan sahurlah kalian, karena dalam sahur ada keberkahan.",
  "en": "Eat sahur, for in sahur there is blessing.",
  "src": "HR. Bukhari no. 1923",
  "who": "n",
  "id": "d31"
 },
 {
  "k": "h",
  "tags": [
   "puasa"
  ],
  "ar": "لاَ يَزَالُ النَّاسُ بِخَيْرٍ مَا عَجَّلُوا الْفِطْرَ",
  "idn": "Manusia senantiasa dalam kebaikan selama mereka menyegerakan berbuka.",
  "en": "People will remain in goodness as long as they hasten to break the fast.",
  "src": "HR. Bukhari no. 1957",
  "who": "n",
  "id": "d32"
 },
 {
  "k": "h",
  "tags": [
   "gerak"
  ],
  "ar": "فَسَابَقْتُهُ فَسَبَقْتُهُ عَلَى رِجْلَىَّ فَلَمَّا حَمَلْتُ اللَّحْمَ سَابَقْتُهُ فَسَبَقَنِي فَقَالَ: هَذِهِ بِتِلْكَ السَّبْقَةِ",
  "idn": "Aisyah berkata: Aku berlomba lari dengan Nabi ﷺ dan aku mengalahkannya. Ketika badanku sudah lebih berisi, aku berlomba lagi dan beliau mengalahkanku. Beliau bersabda, “Ini untuk membalas kekalahan yang dulu.”",
  "en": "Aisha said: I raced the Prophet ﷺ and beat him. Later, when I had put on weight, we raced again and he beat me. He said, “This makes up for that one.”",
  "src": "HR. Abu Dawud no. 2578, shahih",
  "who": "a",
  "id": "d33"
 },
 {
  "k": "h",
  "tags": [
   "istiqamah",
   "gerak"
  ],
  "ar": "وَأَنَّ أَحَبَّ الأَعْمَالِ أَدْوَمُهَا إِلَى اللَّهِ، وَإِنْ قَلَّ",
  "idn": "Amalan yang paling dicintai Allah adalah yang paling rutin, walaupun sedikit.",
  "en": "The deeds most beloved to Allah are the most regular, even if small.",
  "src": "HR. Bukhari no. 6464 (sebagian)",
  "who": "n",
  "id": "d34"
 },
 {
  "k": "h",
  "tags": [
   "sehat"
  ],
  "ar": "مَا أَنْزَلَ اللَّهُ دَاءً إِلاَّ أَنْزَلَ لَهُ شِفَاءً",
  "idn": "Tidaklah Allah menurunkan suatu penyakit kecuali Dia turunkan pula obatnya.",
  "en": "Allah has not sent down any disease without also sending down its cure.",
  "src": "HR. Bukhari no. 5678",
  "who": "n",
  "id": "d35"
 },
 {
  "k": "h",
  "tags": [
   "kuat"
  ],
  "ar": "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
  "idn": "Orang kuat bukanlah yang pandai bergulat, tetapi orang kuat adalah yang mampu menguasai dirinya ketika marah.",
  "en": "The strong one is not the good wrestler; the strong one is he who controls himself when angry.",
  "src": "HR. Bukhari no. 6114",
  "who": "n",
  "id": "d36"
 },
 {
  "k": "h",
  "tags": [
   "bersih"
  ],
  "ar": "الطُّهُورُ شَطْرُ الإِيمَانِ",
  "idn": "Bersuci adalah separuh dari iman.",
  "en": "Purity is half of faith.",
  "src": "HR. Muslim no. 223 (sebagian)",
  "who": "n",
  "id": "d37"
 }
];
