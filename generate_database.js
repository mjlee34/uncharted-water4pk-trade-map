const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// CSV 파싱 함수 (papaparse 사용)
const parseCSV = (csvString) => {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => header.replace(/\s+|\uFEFF/g, ''),
    transform: (value) => value.trim()
  });
  return result.data;
};

// 위도/경도 문자열을 숫자로 변환
const parseCoordinates = (coordStr) => {
  if (!coordStr) return { lat: 0, lng: 0, display: '' };
  const match = coordStr.match(/(북|남)(\d+)\s*(동|서)(\d+)/);
  if (!match) return { lat: 0, lng: 0, display: coordStr };

  let lat = parseInt(match[2], 10);
  let lng = parseInt(match[4], 10);

  if (match[1] === '남') lat = -lat;
  if (match[3] === '서') lng = -lng;

  return { lat, lng, display: coordStr };
};

// 시세표 헤더와 도시 문화권을 매핑합니다.
// 도시정보 CSV의 '문화권' -> 시세표 CSV의 '헤더'
const cultureToPriceHeader = {
  '카리브': '카리', '멕시코': '멕시', '영국': '영국', '플랑드르': '플랑',
  '독일': '독일', '북유럽': '북유', '포르투갈': '포르', '에스파냐': '스페',
  '이탈리아': '이탈', '북아프리카': '이집', '그리스': '그리', '터키': '터키',
  '서아프리카': '서아', '동아프리카': '동아', '인도': '인도', '아랍': '아랍',
  '인도네시아': '인네', '인도차이나': '인차', '중국': '중국', '조선': '조선', '일본': '일본',
  '': '' // 문화권이 없는 도시들을 위한 기본값
};

// 문화권이 없는 도시의 문화권을 이름으로 추론하는 함수
const inferCulture = (cityName) => {
  const cityCultureMap = {
    '브리스틀': '영국', '브뤼주': '플랑드르', '낭트': '플랑드르', '뤼베크': '독일',
    '오슬로': '북유럽', '리가': '북유럽', '베르겐': '북유럽', '코펜하겐': '북유럽',
    '세비야': '에스파냐', '리스본': '포르투갈', '바르셀로나': '에스파냐', '제노바': '이탈리아',
    '피사': '이탈리아', '나폴리': '이탈리아', '베네치아': '이탈리아', '라구사': '이탈리아',
    '시라쿠사': '이탈리아', '마르세이유': '이탈리아', '알렉산드리아': '북아프리카', '트리폴리': '북아프리카',
    '알제': '북아프리카', '튀니스': '북아프리카', '아테네': '그리스', '이스탄불': '터키',
    '카파': '터키', '타나': '터키', '트레비존드': '터키', '산죠르제': '서아프리카',
    '루안다': '서아프리카', '소팔라': '동아프리카', '모잠비크': '동아프리카',
    '몸바사': '동아프리카', '아덴': '아랍', '무스카트': '아랍', '호르무즈': '아랍',
    '바스라': '아랍', '디우': '인도', '고어': '인도', '캘리컷': '인도',
    '실론': '인도', '아바': '인도차이나', '말라카': '인도네시아', '팔렘방': '인도네시아',
    '반자르마신': '인도네시아', '테르나테': '인도네시아', '마카오': '중국', '취안저우': '중국',
    '한양': '조선', '나가사키': '일본', '오사카': '일본', '산토도밍고': '카리브',
    '아바나': '카리브', '자메이카': '카리브', '산후안': '카리브', '메리다': '멕시코',
    '베라크루스': '멕시코', '과테말라': '멕시코',
  };
  return cityCultureMap[cityName] || '';
};

// --- 데이터 처리 시작 ---

// 문화권 정보가 누락된 도시들을 위한 수동 매핑
const manualCultureMap = {
  '산토도밍고': '카리브',
  '타마타브': '동아프리카',
  '리우데자네이루': '카리브',
  '부에노스아이레스': '카리브',
  '하바나': '카리브',
  '베라크루스': '카리브',
  '메리다': '카리브',
  '자메이카': '카리브',
  '산티아고': '카리브',
  '파나마': '카리브',
  '카옌': '카리브',
  '페르남부쿠': '카리브',
  '말라카': '인도네시아',
  '기아딘': '인도차이나',
  '마카오': '중국',
  '바타비아': '인도네시아',
  '아친': '인도네시아',
  '반자르마신': '인도네시아',
  '수라바야': '인도네시아',
  '테르나테': '인도네시아',
  '암보이나': '인도네시아',
  '딜리': '인도네시아',
  // 누락도시 유추 추가
  '세우타': '스페인',
  '마데이라': '포르투갈',
  '라스팔마스': '스페인',
  '발렌시아': '스페인',
  '크레타': '그리스',
  '키프로스': '그리스',
  '베이루트': '아랍',
  '베르데': '서아프리카',
  '르완다[12]': '동아프리카',
  '시에라리온': '서아프리카',
  '상투메': '서아프리카',
  '마다가스카르': '동아프리카',
  '케이프타운': '동아프리카',
  '모가디슈': '동아프리카',
  '소코트라': '아랍',
  '고아': '인도',
  '세이론': '인도',
  '캘커타': '인도',
  '아바[14]': '인도차이나',
  '마드라스': '인도',
  '마술리파트남[15]': '인도',
  '브루네이': '인도네시아',
  '마닐라': '인도차이나',
  '마카사르': '인도네시아',
  '메나도': '인도네시아',
  '기주': '중국',
  '천주': '중국',
  '나하': '일본',
  '트루히요[18]': '카리브',
  '포르투벨류[19]': '카리브',
  '말라카이보': '카리브',
  '테르나테[16]': '인도네시아',
  '수라비아': '인도네시아'
};

// --- 데이터 처리 시작 ---

// 1. 도시 정보 처리
const cityCSVPath = path.join(__dirname, 'uncharted-waters-trade-map', 'src', 'data', '대항해시대4-도시정보.csv');
const cityData = {};
const cityCSV = fs.readFileSync(cityCSVPath, 'utf8');
const cityRows = parseCSV(cityCSV);

const missingCultureCities = [];
cityRows.forEach(row => {
  let culture = manualCultureMap[row['도시명']] || inferCulture(row['도시명']) || row['문화권'] || '';
  if (!culture || culture.trim() === '') {
    missingCultureCities.push(row['도시명']);
  }
  const city = {
    name: row['도시명'],
    culture,
    coordinates: parseCoordinates(row['좌표']),
    development: parseInt(String(row['발전']).replace(/,/g, ''), 10) || 0,
    military: parseInt(String(row['무장']).replace(/,/g, ''), 10) || 0,
    specialties: row['특산물'] ? String(row['특산물']).split(/,|\s+/).map(s => s.trim().replace(/[()]/g, '')).filter(Boolean) : [],
    type: row['기타'],
  };
  cityData[row['도시명']] = city;
});
if (missingCultureCities.length > 0) {
  console.warn('[문화권 누락 도시]', missingCultureCities.join(', '));
}


// 2. 시세표 처리
const priceCSVPath = path.join(__dirname, 'uncharted-waters-trade-map', 'src', 'data', '대항해시대4-Pk-시세표.csv');
const priceCSV = fs.readFileSync(priceCSVPath, 'utf8');
const priceDataRaw = parseCSV(priceCSV);

const items = [];
const categories = new Set();
let currentCategory = '';

const priceHeaders = Object.keys(priceDataRaw[0] || {});
const categoryHeader = priceHeaders[0]; // '지역'
const itemHeader = priceHeaders[1];     // '' (품목명)

// 시세표 헤더를 미리 매핑해둡니다. (e.g. '카리' -> '카리')
const priceHeaderMap = {};
priceHeaders.slice(2, -3).forEach(h => priceHeaderMap[h] = h);

priceDataRaw.forEach((row) => {
  // 카테고리 업데이트 (e.g. '식료품', '조미료')
  if (row[categoryHeader]) {
    currentCategory = row[categoryHeader];
    categories.add(currentCategory);
  }

  const itemName = row[itemHeader];
  if (itemName) {
    const prices = {};
    // cultureToPriceHeader의 값(시세표 헤더)을 기준으로 가격을 매핑
        Object.entries(cultureToPriceHeader).forEach(([culture, headerKey]) => {
      if (headerKey && row[headerKey] && !isNaN(parseInt(row[headerKey], 10))) {
        // 최종 DB에는 culture 이름으로 가격 저장
        prices[culture] = parseInt(row[headerKey], 10);
      }
    });

    items.push({
      name: itemName,
      category: currentCategory,
      prices: prices,
    });
  }
});

// 3. 최종 데이터베이스 객체 생성
const cities = Object.values(cityData);
const tradeDatabase = {
  metadata: {
    title: "대항해시대4 PK 통합 교역 데이터베이스",
    description: "도시정보, 시세표, 지역 매핑을 포함한 완전한 교역 데이터",
    version: "2.0",
    created: new Date().toISOString()
  },
  regions: {
    "카리": { "name": "카리브해", "display": "신대륙" }, "멕시": { "name": "멕시코", "display": "신대륙" },
    "영국": { "name": "영국", "display": "북해" }, "플랑": { "name": "플랑드르", "display": "북해" },
    "독일": { "name": "독일", "display": "북해" }, "북유": { "name": "북유럽", "display": "북해" },
    "포르": { "name": "포르투갈", "display": "지중해" }, "스페": { "name": "스페인", "display": "지중해" },
    "이탈": { "name": "이탈리아", "display": "지중해" }, "이집": { "name": "이집트", "display": "지중해" },
    "그리": { "name": "그리스", "display": "지중해" }, "터키": { "name": "터키", "display": "지중해" },
    "서아": { "name": "서아프리카", "display": "아프리카" }, "동아": { "name": "동아프리카", "display": "아프리카" },
    "인도": { "name": "인도", "display": "인도양" }, "아랍": { "name": "아랍", "display": "인도양" },
    "인네": { "name": "인도네시아", "display": "동남아시아" }, "인차": { "name": "인도차이나", "display": "동남아시아" },
    "중국": { "name": "중국", "display": "동아시아" }, "조선": { "name": "조선", "display": "동아시아" },
    "일본": { "name": "일본", "display": "동아시아" }
  },
  categories: Array.from(categories),
  cities,
  items,
};

// 4. 파일 저장
const outputPath = path.join(__dirname, 'uncharted-waters-trade-map', 'src', 'data', 'trade_database.json');
fs.writeFileSync(outputPath, JSON.stringify(tradeDatabase, null, 2), 'utf8');

console.log(`✅ 데이터베이스가 성공적으로 생성되었습니다. (${outputPath})`);