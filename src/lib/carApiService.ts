/**
 * 🚗 خدمة شاملة لجميع ماركات وفئات السيارات في العالم
 * تتضمن جميع الماركات المعروفة عالمياً مع كامل الفئات والموديلات
 */

// قائمة شاملة بجميع ماركات السيارات المعروفة عالمياً مع فئاتها
const COMPREHENSIVE_CAR_DATABASE = {
  // الماركات اليابانية - Japanese Brands
  Toyota: [
    'Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Land Cruiser', 'Hilux', 'Prado', 
    'Venza', 'Sienna', 'Tacoma', 'Tundra', 'Avalon', 'C-HR', 'Yaris', 'Sequoia', 
    'FJ Cruiser', 'Matrix', 'Vitz', 'Crown', 'Mark X', 'Fortuner', 'Innova', 'Rush',
    'Alphard', 'Vellfire', 'Noah', 'Voxy', 'Estima', 'Previa', 'Wish', 'Verso',
    'Urban Cruiser', 'Veloz', 'Raize', 'Other'
  ],
  Honda: [
    'Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Ridgeline', 'Odyssey',
    'Passport', 'Element', 'City', 'Jazz', 'Vezel', 'Stream', 'Freed', 'StepWGN',
    'Elysion', 'Crosstour', 'Insight', 'CR-Z', 'S2000', 'NSX', 'Prelude', 'Other'
  ],
  Nissan: [
    'Altima', 'Sentra', 'Maxima', 'Rogue', 'Murano', 'Pathfinder', 'Armada', 'GT-R', 
    '370Z', 'Titan', 'Frontier', 'NV200', 'Juke', 'Kicks', 'Leaf', 'Versa',
    'Patrol', 'X-Trail', 'Qashqai', 'Micra', 'Note', 'Tiida', 'Sunny', 'Navara',
    'Elgrand', 'Serena', 'March', 'Cube', 'Quest', 'Xterra', 'Other'
  ],
  Mazda: [
    'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-7', 'CX-9', 'MX-5', 'RX-7', 'RX-8',
    'Tribute', 'B-Series', 'Protege', 'Millenia', '626', 'MPV', 'Premacy',
    'Demio', 'Axela', 'Atenza', 'CX-30', 'MX-30', 'Biante', 'Other'
  ],
  Mitsubishi: [
    'Outlander', 'Eclipse', 'Galant', 'Lancer', 'Mirage', 'Montero', 'Pajero',
    'ASX', 'Colt', 'Grandis', 'L200', 'Triton', 'Delica', 'Chariot', 'Carisma',
    'Space Star', 'Eclipse Cross', 'Outlander Sport', 'i-MiEV', 'Endeavor',
    'Diamante', '3000GT', 'Starion', 'Sigma', 'Magna', 'Verada', 'Challenger', 'Other'
  ],
  Subaru: [
    'Outback', 'Forester', 'Impreza', 'Legacy', 'Ascent', 'Crosstrek', 'WRX',
    'STI', 'Tribeca', 'Baja', 'Justy', 'SVX', 'XT', 'Leone', 'Levorg',
    'XV', 'Exiga', 'Alcyone', 'Sambar', 'Other'
  ],
  Suzuki: [
    'Swift', 'Vitara', 'Jimny', 'Baleno', 'Celerio', 'Ignis', 'SX4', 'Grand Vitara',
    'Kizashi', 'Alto', 'Wagon R', 'Ertiga', 'APV', 'Every', 'Carry', 'Splash',
    'Ciaz', 'S-Cross', 'Forenza', 'Reno', 'XL7', 'Samurai', 'Other'
  ],
  Lexus: [
    'ES', 'IS', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'LC', 'UX', 'RC', 'CT',
    'HS', 'SC', 'LFA', 'GS F', 'IS F', 'RC F', 'LC F', 'LS F', 'Other'
  ],
  Infiniti: [
    'G35', 'G37', 'Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX70', 'QX80', 'M35',
    'M37', 'M45', 'FX35', 'FX37', 'FX45', 'FX50', 'EX35', 'JX35', 'I35', 'Other'
  ],
  Acura: [
    'TLX', 'ILX', 'MDX', 'RDX', 'NSX', 'RL', 'TL', 'TSX', 'RSX', 'Integra',
    'Legend', 'Vigor', 'CL', 'EL', 'SLX', 'ZDX', 'RLX', 'CDX', 'Other'
  ],

  // الماركات الألمانية - German Brands
  BMW: [
    '1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series',
    'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z3', 'Z4', 'Z8', 'i3', 'i8', 'iX',
    'M3', 'M4', 'M5', 'M6', 'M8', 'X3 M', 'X4 M', 'X5 M', 'X6 M', 'Other'
  ],
  'Mercedes-Benz': [
    'A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'G-Class', 'V-Class',
    'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'SL', 'SLC', 'AMG GT',
    'Maybach S-Class', 'EQC', 'EQA', 'EQB', 'EQS', 'EQE', 'Sprinter', 'Metris', 'Other'
  ],
  Audi: [
    'A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8',
    'TT', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'e-tron', 'e-tron GT',
    'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'SQ5', 'SQ7', 'SQ8', 'Other'
  ],
  Volkswagen: [
    'Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'Arteon', 'Beetle', 'Polo',
    'Touareg', 'T-Roc', 'T-Cross', 'Sharan', 'Touran', 'Caddy', 'Crafter',
    'ID.3', 'ID.4', 'ID.Buzz', 'Phaeton', 'Eos', 'Scirocco', 'CC', 'Routan', 'Other'
  ],
  Porsche: [
    '911', 'Cayenne', 'Macan', 'Panamera', 'Boxster', 'Cayman', 'Taycan',
    '918 Spyder', 'Carrera GT', '944', '928', '924', '356', 'Boxter', 'Other'
  ],

  // الماركات الأمريكية - American Brands
  Ford: [
    'F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Bronco',
    'Focus', 'Fiesta', 'Fusion', 'Taurus', 'Ranger', 'Transit', 'EcoSport',
    'Flex', 'C-Max', 'GT', 'Thunderbird', 'Crown Victoria', 'Maverick', 'Other'
  ],
  Chevrolet: [
    'Silverado', 'Camaro', 'Corvette', 'Equinox', 'Tahoe', 'Suburban', 'Traverse',
    'Malibu', 'Impala', 'Cruze', 'Spark', 'Sonic', 'Volt', 'Bolt', 'Colorado',
    'Blazer', 'Trailblazer', 'Express', 'Avalanche', 'S-10', 'Monte Carlo', 'Other'
  ],
  Dodge: [
    'Challenger', 'Charger', 'Durango', 'Journey', 'Grand Caravan', 'Ram 1500',
    'Ram 2500', 'Ram 3500', 'Viper', 'Avenger', 'Caliber', 'Neon', 'Intrepid',
    'Stratus', 'Magnum', 'Nitro', 'Dakota', 'Caravan', 'Other'
  ],
  Hummer: [
    'H1', 'H2', 'H3', 'EV', 'EV Pickup', 'EV SUV', 'Other'
  ],
  Jeep: [
    'Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator',
    'Commander', 'Liberty', 'Patriot', 'CJ-7', 'Wagoneer', 'Grand Wagoneer', 'Other'
  ],
  Cadillac: [
    'Escalade', 'XT4', 'XT5', 'XT6', 'CT4', 'CT5', 'CT6', 'ATS', 'CTS', 'XTS',
    'SRX', 'CTS-V', 'ATS-V', 'ELR', 'Seville', 'DeVille', 'DTS', 'Other'
  ],
  Lincoln: [
    'Navigator', 'Aviator', 'Corsair', 'Nautilus', 'Continental', 'MKZ', 'MKX',
    'MKC', 'MKT', 'MKS', 'Town Car', 'LS', 'Zephyr', 'Blackwood', 'Other'
  ],
  Buick: [
    'Enclave', 'Encore', 'Envision', 'LaCrosse', 'Regal', 'Verano', 'Lucerne',
    'Park Avenue', 'Century', 'LeSabre', 'Riviera', 'Skylark', 'Other'
  ],
  GMC: [
    'Sierra', 'Yukon', 'Acadia', 'Terrain', 'Canyon', 'Savana', 'Denali',
    'Envoy', 'Jimmy', 'Safari', 'Sonoma', 'Syclone', 'Typhoon', 'Other'
  ],
  Chrysler: [
    '300', 'Pacifica', 'Voyager', 'Town & Country', 'Sebring', 'Concorde',
    'LHS', 'New Yorker', 'Fifth Avenue', 'Imperial', 'PT Cruiser', 'Crossfire', 'Other'
  ],

  // الماركات الكورية - Korean Brands
  Hyundai: [
    'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Veloster', 'Ioniq',
    'Genesis', 'Accent', 'Venue', 'Kona', 'Nexo', 'Azera', 'Entourage',
    'Tiburon', 'XG350', 'Veracruz', 'i10', 'i20', 'i30', 'i40', 'ix35',
    'Creta', 'Staria', 'Ioniq 5', 'Ioniq 6', 'Other'
  ],
  Kia: [
    'Forte', 'Optima', 'Sorento', 'Sportage', 'Stinger', 'Telluride', 'Soul',
    'Rio', 'Niro', 'Cadenza', 'K900', 'Sedona', 'Rondo', 'Spectra',
    'Magentis', 'Ceed', 'Picanto', 'Venga', 'Carnival', 'EV6', 'EV9',
    'K5', 'K8', 'Sonet', 'Seltos', 'Carens', 'Other'
  ],
  Genesis: [
    'G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80', 'Coupe', 'Sedan', 'Other'
  ],

  // الماركات الأوروبية الفاخرة - European Luxury Brands
  'Rolls-Royce': [
    'Phantom', 'Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Silver Spur', 'Silver Seraph',
    'Corniche', 'Park Ward', 'Silver Cloud', 'Silver Shadow', 'Other'
  ],
  Bentley: [
    'Continental GT', 'Continental Flying Spur', 'Bentayga', 'Mulsanne',
    'Azure', 'Arnage', 'Brooklands', 'Turbo R', 'Eight', 'Other'
  ],
  Ferrari: [
    '488', 'F8 Tributo', 'Portofino', 'Roma', 'SF90', '812 Superfast', 'LaFerrari',
    'F12berlinetta', '458 Italia', '599 GTB', 'California', 'FF', 'GTC4Lusso',
    'Enzo', 'F40', 'F50', '360 Modena', '550 Maranello', 'Testarossa', 'Other'
  ],
  Lamborghini: [
    'Huracán', 'Aventador', 'Urus', 'Gallardo', 'Murciélago', 'Diablo',
    'Countach', 'Miura', 'Espada', 'Jalpa', 'Silhouette', 'Other'
  ],
  McLaren: [
    '720S', '570S', '600LT', 'P1', 'Senna', 'GT', '650S', 'MP4-12C',
    '540C', '675LT', 'F1', 'Speedtail', 'Artura', '765LT', 'Other'
  ],
  'Aston Martin': [
    'DB11', 'Vantage', 'DBS', 'DBX', 'Rapide', 'Vanquish', 'DB9', 'V8 Vantage',
    'DB7', 'Virage', 'Zagato', 'One-77', 'Valkyrie', 'Other'
  ],
  Maserati: [
    'Ghibli', 'Quattroporte', 'Levante', 'GranTurismo', 'GranCabrio', 'MC20',
    'Spyder', 'Coupe', 'Bora', 'Merak', 'Khamsin', 'Other'
  ],

  // الماركات الفرنسية - French Brands
  Peugeot: [
    '208', '308', '408', '508', '2008', '3008', '5008', 'Partner', 'Expert',
    '206', '207', '307', '407', '607', '1007', '4007', 'RCZ', 'Bipper', 'Other'
  ],
  Renault: [
    'Clio', 'Megane', 'Scenic', 'Kadjar', 'Koleos', 'Captur', 'Talisman',
    'Laguna', 'Fluence', 'Logan', 'Sandero', 'Duster', 'Symbol', 'Kangoo', 'Other'
  ],
  Citroën: [
    'C1', 'C3', 'C4', 'C5', 'C6', 'C-Elysée', 'C-Crosser', 'Berlingo',
    'Picasso', 'Xsara', 'Saxo', 'ZX', 'BX', 'CX', 'DS3', 'DS4', 'DS5', 'Other'
  ],

  // الماركات الإيطالية - Italian Brands
  Fiat: [
    '500', 'Panda', 'Punto', 'Tipo', '500L', '500X', 'Doblo', 'Fiorino',
    'Bravo', 'Stilo', 'Linea', 'Sedici', 'Croma', 'Multipla', 'Barchetta', 'Other'
  ],
  'Alfa Romeo': [
    'Giulia', 'Stelvio', '4C', 'Giulietta', 'MiTo', '159', '147', 'GT',
    'Spider', 'Brera', '156', '166', 'GTV', '155', '164', 'Other'
  ],
  Lancia: [
    'Ypsilon', 'Delta', 'Musa', 'Phedra', 'Thesis', 'Lybra', 'Kappa',
    'Dedra', 'Prisma', 'Thema', 'Beta', 'Stratos', 'Other'
  ],

  // الماركات البريطانية - British Brands
  'Land Rover': [
    'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar',
    'Discovery', 'Discovery Sport', 'Defender', 'Freelander', 'LR2', 'LR3', 'LR4', 'Other'
  ],
  Jaguar: [
    'XE', 'XF', 'XJ', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type', 'XK', 'S-Type',
    'X-Type', 'XJS', 'XJ8', 'XJR', 'XKR', 'Other'
  ],
  'Mini Cooper': [
    'Cooper', 'Cooper S', 'Countryman', 'Clubman', 'Paceman', 'Roadster',
    'Coupe', 'John Cooper Works', 'Electric', 'Other'
  ],

  // الماركات السويدية - Swedish Brands
  Volvo: [
    'XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90', 'C30', 'C70',
    'S40', 'V40', 'V50', 'S80', 'XC70', 'V70', '850', '940', '960', 'Other'
  ],
  Saab: [
    '9-3', '9-5', '900', '9000', '99', '96', '92', '93', '95', 'Other'
  ],

  // الماركات الروسية - Russian Brands
  Lada: [
    'Vesta', 'XRAY', 'Largus', 'Granta', 'Kalina', 'Priora', 'Samara',
    '2107', '2106', '2105', 'Niva', 'Other'
  ],
  GAZ: [
    'Volga', 'Sobol', 'GAZelle', 'Next', '3110', '31105', '2410', '24', 'Other'
  ],

  // الماركات الصينية - Chinese Brands
  MG: [
    'GT', 'RX5', 'RX8', 'ZS', 'HS', 'One', '5', '6', 'Whale', 'Hector', 
    'Marvel R', 'Cyberster', 'Other'
  ],
  Changan: [
    'CS35 Plus', 'CS75 Plus', 'CS85', 'CS95', 'Eado Plus', 'Alsvin', 'UNI-K', 
    'UNI-T', 'UNI-V', 'Hunter', 'Other'
  ],
  Haval: [
    'H6', 'Jolion', 'H9', 'Dargo', 'H2', 'H6 GT', 'Julian', 'Other'
  ],
  Geely: [
    'Emgrand', 'Coolray', 'Atlas', 'Tugella', 'Monjaro', 'Okavango', 'Starray',
    'Geometry C', 'Galaxy', 'Mingyu', 'GC9', 'LC', 'MK', 'CK', 'Other'
  ],
  Chery: [
    'Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 3', 'Arrizo 5', 
    'Arrizo 6', 'QQ', 'A3', 'A5', 'E3', 'E5', 'X1', 'Fulwin', 'Other'
  ],
  BYD: [
    'Tang', 'Song', 'Qin', 'Han', 'Yuan', 'e2', 'e3', 'F3', 'G3', 'S6', 'Seal', 'Dolphin', 'Atto 3', 'Other'
  ],
  'GAC Motor': [
    'GS3', 'GS4', 'GS5', 'GS8', 'GA4', 'GA6', 'GA8', 'Empow', 'Emkoo', 'Emzoom', 'Other'
  ],
  Tank: [
    '300', '500', '700', 'Other'
  ],
  Jetour: [
    'X70', 'X70 Plus', 'X90', 'X90 Plus', 'Dashing', 'T2', 'Other'
  ],
  Hongqi: [
    'H5', 'H9', 'HS5', 'HS7', 'E-HS9', 'Oslong', 'H7', 'BQ', 'Other'
  ],
  Exeed: [
    'TXL', 'VX', 'LX', 'RX', 'Other'
  ],
  Bestune: [
    'T77', 'T99', 'B70', 'T33', 'Other'
  ],
  'Great Wall': [
    'Poer', 'Wingle 5', 'Wingle 7', 'Coolbear', 'Florid', 'Other'
  ],
  JAC: [
    'J7', 'S3', 'JS4', 'JS6', 'T8', 'Other'
  ],
  BAIC: [
    'BJ40', 'BJ80', 'X35', 'X55', 'X7', 'EU5', 'Other'
  ],

  // الماركات الهندية - Indian Brands
  Tata: [
    'Nano', 'Indica', 'Indigo', 'Safari', 'Sumo', 'Xenon', 'Aria', 'Zest',
    'Bolt', 'Tiago', 'Tigor', 'Nexon', 'Hexa', 'Harrier', 'Altroz', 'Other'
  ],
  Mahindra: [
    'Scorpio', 'XUV500', 'XUV300', 'Bolero', 'Thar', 'KUV100', 'TUV300',
    'Marazzo', 'XUV700', 'Alturas G4', 'Other'
  ],
  
  // الماركات الإيرانية - Iranian Brands
  'Iran Khodro': [
    'Samand', 'Peugeot 405', 'Peugeot 206', 'Peugeot Pars', 'Dena', 'Runna', 'Other'
  ],
  Saipa: [
    'Pride', 'Tiba', '111', '131', 'Quick', 'Saina', 'Other'
  ],

  // الماركات الماليزية - Malaysian Brands
  Proton: [
    'Saga', 'Wira', 'Satria', 'Waja', 'Gen-2', 'Persona', 'Exora', 'Preve',
    'Suprima S', 'Iriz', 'X50', 'X70', 'Other'
  ],
  Perodua: [
    'Kancil', 'Kelisa', 'Kenari', 'Myvi', 'Viva', 'Alza', 'Axia', 'Bezza', 'Aruz', 'Other'
  ],

  // السيارات الكهربائية الحديثة - Modern Electric Brands
  Tesla: [
    'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Semi', 'Other'
  ],
  Rivian: [
    'R1T', 'R1S', 'EDV', 'Other'
  ],
  Lucid: [
    'Air Dream', 'Air Pure', 'Air Touring', 'Air Grand Touring', 'Gravity', 'Other'
  ],
  Fisker: [
    'Karma', 'Ocean', 'Alaska', 'Ronin', 'Other'
  ],
  Polestar: [
    '1', '2', '3', '4', '5', 'Other'
  ],
  NIO: [
    'ES8', 'ES6', 'EC6', 'ET7', 'ET5', 'EQS', 'EQE', 'Other'
  ],

  // ماركات كلاسيكية أمريكية - Classic American Brands
  Mercury: [
    'Grand Marquis', 'Sable', 'Mountaineer', 'Milan', 'Mariner', 'Cougar',
    'Mystique', 'Tracer', 'Topaz', 'Lynx', 'Other'
  ],
  Saturn: [
    'S-Series', 'L-Series', 'Ion', 'Vue', 'Relay', 'Outlook', 'Aura', 'Sky', 'Other'
  ],
  Oldsmobile: [
    'Cutlass', 'Delta 88', 'Ninety-Eight', 'Aurora', 'Intrigue', 'Alero',
    'Bravada', 'Silhouette', 'Other'
  ],
  Pontiac: [
    'GTO', 'Firebird', 'Trans Am', 'Grand Prix', 'Bonneville', 'Grand Am', 
    'Sunfire', 'Vibe', 'G6', 'G8', 'Solstice', 'Aztek', 'Montana', 'Other'
  ],

  // ماركات أسترالية - Australian Brands
  Holden: [
    'Commodore', 'Calais', 'Statesman', 'Caprice', 'Ute', 'Colorado', 
    'Cruze', 'Barina', 'Astra', 'Captiva', 'Other'
  ],

  // ماركات رومانية - Romanian Brands
  Dacia: [
    'Logan', 'Sandero', 'Duster', 'Lodgy', 'Dokker', '1310', 'Solenza', 'Spring', 'Other'
  ],

  // ماركات تشيكية - Czech Brands
  Skoda: [
    'Octavia', 'Superb', 'Fabia', 'Rapid', 'Kodiaq', 'Karoq', 'Kamiq', 'Scala',
    'Citigo', 'Yeti', 'Roomster', 'Felicia', 'Other'
  ],

  // ماركات إسبانية - Spanish Brands
  Seat: [
    'Leon', 'Ibiza', 'Arona', 'Ateca', 'Tarraco', 'Alhambra', 'Altea', 'Toledo',
    'Cordoba', 'Marbella', 'Other'
  ]
} as const;

export interface CarMake {
  Make_ID: number;
  Make_Name: string;
}

export interface CarModel {
  Model_ID: number;
  Model_Name: string;
  Make_ID: number;
}

/**
 * 🚗 جلب جميع ماركات السيارات المعروفة عالمياً
 * يتضمن أكثر من 80 ماركة مع جميع الفئات والموديلات
 */
export async function getCarMakes(): Promise<CarMake[]> {
  try {
    // تحويل قاعدة البيانات الشاملة إلى تنسيق المطلوب
    const makes = Object.keys(COMPREHENSIVE_CAR_DATABASE).map((makeName, index) => ({
      Make_ID: index + 1,
      Make_Name: makeName
    }));
    
    console.log(`✅ تم تحميل ${makes.length} ماركة سيارة من جميع أنحاء العالم`);
    return makes;
  } catch (error) {
    console.error("خطأ في جلب ماركات السيارات:", error);
    return [];
  }
}

/**
 * 🏎️ جلب جميع فئات وموديلات ماركة معينة
 * @param makeName اسم الماركة (مثل "Toyota" أو "BMW")
 */
export async function getCarModels(makeName: string): Promise<CarModel[]> {
  if (!makeName) return [];

  try {
    const models = COMPREHENSIVE_CAR_DATABASE[makeName as keyof typeof COMPREHENSIVE_CAR_DATABASE];
    
    if (!models) {
      console.warn(`⚠️ لم يتم العثور على فئات للماركة: ${makeName}`);
      return [];
    }

    // تحويل الفئات إلى التنسيق المطلوب
    const makeId = Object.keys(COMPREHENSIVE_CAR_DATABASE).indexOf(makeName) + 1;
    const formattedModels = models.map((modelName, index) => ({
      Model_ID: (makeId * 1000) + index + 1,
      Model_Name: modelName,
      Make_ID: makeId
    }));

    console.log(`✅ تم تحميل ${formattedModels.length} فئة للماركة ${makeName}`);
    return formattedModels;
  } catch (error) {
    console.error(`خطأ في جلب فئات الماركة ${makeName}:`, error);
    return [];
  }
}
