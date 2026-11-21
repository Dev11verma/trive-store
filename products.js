// TRIVÉ Complete Product Catalog & Global State
const PRODUCTS = [
  {
    id: 'deal-01',
    name: "You Can't Please Everyone // Acid Wash Hoodie",
    price: 1799,
    originalPrice: 2499,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'UH62',
    tag: 'Deal for the Day',
    desc: '300 GSM Heavyweight Cotton with lived-in acid wash finish. Oversized streetwear drape featuring dropped shoulders, roomy hood, and high-definition archival back screen print.',
    colors: [
      { name: 'Washed Mineral Grey', hex: '#2b2b2e', images: ['assets/Hoodie%20acid/Grey.jpg', 'assets/Hoodie%20acid/grey%20b.jpg'] },
      { name: 'Washed Indigo Blue', hex: '#263447', images: ['assets/Hoodie%20acid/blue.jpg', 'assets/Hoodie%20acid/blue%20b.jpg'] },
      { name: 'Archival Maroon', hex: '#472228', images: ['assets/Hoodie%20acid/brown.jpg', 'assets/Hoodie%20acid/brown%20b.jpg'] },
      { name: 'Forest Bottle Green', hex: '#1e382b', images: ['assets/Hoodie%20acid/green.jpg', 'assets/Hoodie%20acid/green%20b.jpg'] }
    ]
  },
  {
    id: 'karan-arjun-01',
    name: 'Karan Arjun // Heavy Hoodie',
    price: 1799,
    originalPrice: 2499,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-KA-01',
    tag: 'Karan Arjun // Heavywear',
    desc: 'Heavyweight archival dark streetwear hoodie with high-definition custom graphics.',
    colors: [
      { name: 'White/Cream', hex: '#ffffff', images: ['assets/karan%20Arjun/Screenshot%202026-11-13%20163032.png', 'assets/karan%20Arjun/Screenshot%202026-11-13%20163020.png'] },
      { name: 'Graphic Off-White', hex: '#f4f4f5', images: ['assets/karan%20Arjun/Screenshot%202026-11-13%20163032.png', 'assets/karan%20Arjun/Screenshot%202026-11-13%20163020.png'] }
    ]
  },
    {
    id: 'doom-01',
    name: 'Marvel Doomsday // Heavy Hoodie',
    price: 1799,
    originalPrice: 2499,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-DOOM-01',
    tag: 'Drop 01 // Archival Heavywear',
    desc: 'Heavyweight oversized streetwear hoodie featuring bold graphic typography and archival front/back artwork across three colorways.',
    colors: [
      { name: 'Black', hex: '#18181b', images: ['assets/DOOMSDAY/Back_2_c_2.jpg', 'assets/DOOMSDAY/Front_1_c_2.jpg'] },
      { name: 'Navy Blue', hex: '#1e293b', images: ['assets/DOOMSDAY/Back_2_c_1.jpg', 'assets/DOOMSDAY/Front_1_c_3.jpg'] },
      { name: 'off-White', hex: '#c5ca9e', images: ['assets/DOOMSDAY/Back_3_c_2.png', 'assets/DOOMSDAY/Front_3_c_1.png'] },
      { name: 'White', hex: '#f8fafc', images: ['assets/DOOMSDAY/default.jpg', 'assets/DOOMSDAY/Front_1_c_1.jpg'] },
    ]
  },
  {
    id: 'deadpool-crop-01',
    name: 'Deadpool "Do I Look Like I Care?" // Cropped Hoodie',
    price: 1799,
    originalPrice: 2499,
    gender: 'women',
    category: 'hoodie',
    sku: 'TRV-DP-CROP-01',
    tag: 'Drop 01 // Graphic Fleece',
    desc: 'Black cropped hoodie with statement front graphic print and playful back graphic detailing.',
    colors: [
      { name: 'Black', hex: '#18181b', images: ['assets/DEAD%20POOL/Front_1_c_2.jpg', 'assets/DEAD%20POOL/Back_2_c_2.jpg'] }
    ]
  },
  {
    id: 'spiderman-miles-zip-01',
    name: 'Spider-Man Miles Morales // Zip-Up Hoodie',
    price: 1799,
    originalPrice: 2499,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-SM-ZIP-01',
    tag: 'Drop 01 // Archival Zipwear',
    desc: 'Black zip-up hoodie featuring dual front chest graphics and a full archival Spider-Man Miles Morales back print.',
    colors: [
      { name: 'Black', hex: '#18181b', images: ['assets/SPIDER%20MAN/Back_3_c_2.jpg', 'assets/SPIDER%20MAN/Right_Pocket_2_c_2.jpg', 'assets/SPIDER%20MAN/Left_Pocket_1_c_2.jpg'] }
    ]
  },
  {
    id: 'parth-hoodie-01',
    name: 'Parth Collection // Archival Hoodie',
    price: 2199,
    originalPrice: 2899,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-PRT-01',
    tag: 'Parth Collection // Archival Hoodie',
    desc: 'Premium fleece archival hoodie engineered with relaxed boxy fit and vibrant colorways.',
    colors: [
      { name: 'White', hex: '#f4f4f5', images: ['assets/Parth/Screenshot%202026-11-13%20162937.png', 'assets/Parth/Screenshot%202026-11-13%20162855.png'] },
      { name: 'Ice Blue', hex: '#7dd3fc', images: ['assets/Parth/Screenshot%202026-11-13%20163004.png', 'assets/Parth/Screenshot%202026-11-13%20162933.png'] },
      { name: 'Mint Green', hex: '#43d692', images: ['assets/Parth/Screenshot%202026-11-13%20163000.png', 'assets/Parth/Screenshot%202026-11-13%20162929.png'] },
      { name: 'Dusty Rose / Coral', hex: '#d97706', images: ['assets/Parth/Screenshot%202026-11-13%20162956.png', 'assets/Parth/Screenshot%202026-11-13%20162925.png'] },
      { name: 'Lavender / Lilac', hex: '#a78bfa', images: ['assets/Parth/Screenshot%202026-11-13%20162952.png', 'assets/Parth/Screenshot%202026-11-13%20162921.png'] },
      { name: 'Soft Pink', hex: '#f472b6', images: ['assets/Parth/Screenshot%202026-11-13%20162948.png', 'assets/Parth/Screenshot%202026-11-13%20162915.png'] },
      { name: 'Grey', hex: '#38393a', images: ['assets/Parth/Screenshot%202026-11-13%20162944.png', 'assets/Parth/Screenshot%202026-11-13%20162907.png'] }
    ]
  },
  {
    id: 'trive-bhairav-collection-hoodie',
    name: 'TRIVÉ Bhairav Collection Heavyweight Hoodie',
    price: 1799,
    originalPrice: 2599,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-BHR-01',
    tag: 'Archival Drop',
    desc: 'Heavyweight 400 GSM archival dark streetwear hoodie featuring the signature Bhairav graphic print on the back and minimal chest emblem. Engineered with a relaxed boxy fit, double-layered hood, and premium cotton fleece.',
    colors: [
      { name: 'Black', hex: '#121212', images: ['assets/Bharav%20collection/Back_2_c_2.jpg', 'assets/Bharav%20collection/Front_1_c_2.jpg'] },
      { name: 'Navy Blue', hex: '#1b263b', images: ['assets/Bharav%20collection/Back_2_c_3.jpg', 'assets/Bharav%20collection/Front_1_c_3.jpg'] },
      { name: 'Off-White', hex: '#f5f2eb', images: ['assets/Bharav%20collection/Back_2_c_61.jpg', 'assets/Bharav%20collection/Front_1_c_61.jpg'] },
      { name: 'White', hex: '#ffffff', images: ['assets/Bharav%20collection/Back_2_c_1.jpg', 'assets/Bharav%20collection/Front_1_c_1.jpg'] }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'biker-hoodie-01',
    name: 'Hypersport Biker Riding Hoodie',
    price: 2199,
    originalPrice: 2899,
    gender: 'men',
    category: 'hoodie',
    sku: 'TRV-BIKE-01',
    tag: 'Riding Armor // Heavy Fleece',
    desc: '380 GSM Heavy Thermal Fleece built for long-distance motorcycle touring. Features reinforced elbow panels, high-wind structured hood, and reflective archival back graphics.',
    colors: [
      { name: 'Onyx Black', hex: '#141416', images: ['assets/hoodies/black%20back.png', 'assets/hoodies/black%20front.png'] },
      { name: 'Kawasaki Green', hex: '#1e382b', images: ['assets/hoodies/green%20back.png', 'assets/hoodies/green%20front.png'] },
      { name: 'Touring Blue', hex: '#263447', images: ['assets/hoodies/blue%20back.png', 'assets/hoodies/blue%20front.png'] },
      { name: 'Chalk White', hex: '#e4e4e7', images: ['assets/hoodies/white%20back.png', 'assets/hoodies/white%20front.png'] }
    ]
  },
  {
    id: 'mohmaya-tee-01',
    name: 'Mohmaya // Oversized Tee',
    price: 1199,
    originalPrice: 1799,
    gender: 'unisex',
    category: 't-shirt',
    sku: 'TRV-MHM-01',
    tag: 'Mohmaya // Oversized',
    desc: '240 GSM super combed cotton with bio-wash finish and dropped shoulders.',
    colors: [
      { name: 'Charcoal', hex: '#27272a', images: ['assets/mohmaya/Screenshot%202026-11-13%20163104.png', 'assets/mohmaya/Screenshot%202026-11-13%20163122.png'] },
      { name: 'Off-White', hex: '#f4f4f5', images: ['assets/mohmaya/Screenshot%202026-11-13%20163115.png', 'assets/mohmaya/Screenshot%202026-11-13%20163134.png'] },
      { name: 'Navy Blue', hex: '#263447', images: ['assets/mohmaya/Screenshot%202026-11-13%20163107.png', 'assets/mohmaya/Screenshot%202026-11-13%20163128.png'] }
    ]
  },
  {
    id: 'spiritual-gangster-01',
    name: 'Spiritual Gangster // Graphic Tee',
    price: 1299,
    originalPrice: 1899,
    gender: 'unisex',
    category: 't-shirt',
    sku: 'TRV-SPG-01',
    tag: 'Spiritual Gangster // Graphic Tee',
    desc: 'Heavyweight graphic tee with high-definition chest and back print.',
    colors: [
      { name: 'Charcoal', hex: '#27272a', images: ['assets/Spiritual-Gangster/Screenshot%202026-11-13%20162631.png', 'assets/Spiritual-Gangster/Screenshot%202026-11-13%20162609.png'] },
      { name: 'Navy Blue', hex: '#263447', images: ['assets/Spiritual-Gangster/Screenshot%202026-11-13%20162652.png', 'assets/Spiritual-Gangster/Screenshot%202026-11-13%20162619.png'] },
      { name: 'Light Grey', hex: '#d4d4d8', images: ['assets/Spiritual-Gangster/Screenshot%202026-11-13%20162711.png', 'assets/Spiritual-Gangster/Screenshot%202026-11-13%20162627.png'] }
    ]
  },
  {
    id: 'calm-a-sutra-01',
    name: 'Calm-A-Sutra // Heavy Tee',
    price: 1199,
    originalPrice: 1799,
    gender: 'unisex',
    category: 't-shirt',
    sku: 'TRV-CALM-01',
    tag: 'Calm-A-Sutra // Heavy Tee',
    desc: 'Luxurious 240 GSM cotton tee featuring expressive minimal streetwear branding.',
    colors: [
      { name: 'Charcoal', hex: '#27272a', images: ['assets/Calm-A-Sutra/Screenshot%202026-11-13%20163146.png', 'assets/Calm-A-Sutra/Screenshot%202026-11-13%20163159.png'] },
      { name: 'Navy Blue', hex: '#263447', images: ['assets/Calm-A-Sutra/Screenshot%202026-11-13%20163153.png', 'assets/Calm-A-Sutra/Screenshot%202026-11-13%20163205.png'] }
    ]
  },
{
    id: 'tee-01',
    name: 'Born to Reign // Legacy Edition Tee',
    price: 1299,
    originalPrice: 1999,
    gender: 'unisex',
    category: 't-shirt',
    sku: 'TRV-TEE-01',
    tag: 'Legacy Edition // 240 GSM',
    desc: "240 GSM Super Combed Cotton with Bio-Wash. Oversized boxy fit featuring the iconic Skeleton King 'Born to Reign' back print. Bio-washed and pre-shrunk.",
    colors: [
      { name: 'Vintage Washed Black', hex: '#141416', images: ['assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162035.png', 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20161951.png'] },
      { name: 'Deep Burgundy', hex: '#4a1525', images: ['assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162044.png', 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162006.png'] },
      { name: 'Washed Indigo', hex: '#19273c', images: ['assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162057.png', 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162307.png'] },
      { name: 'Forest Green', hex: '#1e382b', images: ['assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162104.png', 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162026.png'] },
      { name: 'Vintage Olive', hex: '#3b4d3c', images: ['assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162112.png', 'assets/LEGENCY%20EDITION/Screenshot%202026-11-12%20162017.png'] }
    ]
  },
  {
    id: 'tee-02',
    name: 'Sub-Zero Oversized Tee',
    price: 1399,
    originalPrice: 1999,
    gender: 'women',
    category: 't-shirt',
    sku: 'TRV-TEE-W01',
    tag: 'Coming Soon // Drop 03',
    desc: '260 GSM Ultra-Soft Biowashed Cotton. Clean dropped silhouette crafted for contemporary street drape.',
    colors: [{ name: 'Chalk White', hex: '#e4e4e7', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
  {
    id: 'shirt-01',
    name: 'Tactical Boxy Overshirt',
    price: 1899,
    originalPrice: 2499,
    gender: 'men',
    category: 'shirt',
    sku: 'TRV-SHT-01',
    tag: 'Coming Soon // Drop 03',
    desc: 'Heavyweight Cotton Twill. Relaxed Cuban collar with twin chest cargo pockets and matte tonal buttons.',
    colors: [{ name: 'Dark Slate', hex: '#1f2937', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
  {
    id: 'shirt-02',
    name: 'Archival Drape Resort Shirt',
    price: 1799,
    originalPrice: 2399,
    gender: 'women',
    category: 'shirt',
    sku: 'TRV-SHT-W01',
    tag: 'Coming Soon // Drop 03',
    desc: 'Rayon-Tencel blended relaxed resort shirt with minimal collar geometry and tailored vented side hems.',
    colors: [{ name: 'Natural Ecru', hex: '#d6d3d1', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
  {
    id: 'lower-01',
    name: 'Heavy Terry Archival Sweatpants',
    price: 1699,
    originalPrice: 2299,
    gender: 'men',
    category: 'lower',
    sku: 'TRV-LOW-01',
    tag: 'Coming Soon // Drop 03',
    desc: '380 GSM Heavy French Terry with extended contrast drawstrings, deep zip pockets, and straight ankle cuffs.',
    colors: [{ name: 'Washed Charcoal', hex: '#27272a', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
  {
    id: 'lower-02',
    name: 'Wide-Leg Minimalist Track Pant',
    price: 1699,
    originalPrice: 2299,
    gender: 'women',
    category: 'lower',
    sku: 'TRV-LOW-W01',
    tag: 'Coming Soon // Drop 03',
    desc: 'High-waisted wide-leg straight trousers with concealed drawstrings and breathable structure.',
    colors: [{ name: 'Obsidian Black', hex: '#09090b', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
  {
    id: 'drop-porsche-01',
    name: 'Need Money For Porsche // Heavy Hoodie',
    price: 2299,
    originalPrice: 2999,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-DRP-01',
    tag: 'Coming Soon // Drop 03',
    desc: '380 GSM Heavy Thermal Fleece. Features minimalist chest crest branding and high-definition "Need Money For Porsche" archival back graphics.',
    colors: [{ name: 'Chalk White', hex: '#e4e4e7', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
  {
    id: 'drop-boss-02',
    name: 'Success & Power // Heavyweight Hoodie',
    price: 2299,
    originalPrice: 2999,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-DRP-02',
    tag: 'Coming Soon // Drop 03',
    desc: '380 GSM Jet Black French Terry. Detailed gold-ring hand graphic on the chest and high-contrast expressive portrait back print.',
    colors: [{ name: 'Onyx Black', hex: '#141416', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
  {
    id: 'drop-spider-03',
    name: 'Miles Morales Archival // Hoodie',
    price: 2399,
    originalPrice: 3099,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-DRP-03',
    tag: 'Coming Soon // Drop 03',
    desc: 'Heavyweight biowashed fleece with custom spider web chest embroidery and archival Spider-Man comic layout back print.',
    colors: [{ name: 'Off-White', hex: '#f4f4f5', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
  {
    id: 'drop-crosshair-04',
    name: 'Crosshair Underground // Heavy Hoodie',
    price: 2199,
    originalPrice: 2899,
    gender: 'unisex',
    category: 'hoodie',
    sku: 'TRV-DRP-04',
    tag: 'Coming Soon // Drop 03',
    desc: '380 GSM premium fleece featuring a precise red target chest hit and distressed collage back graphic.',
    colors: [{ name: 'Chalk White', hex: '#e4e4e7', images: ['assets/soonnn.png', 'assets/soonnn.png'] }]
  },
];
