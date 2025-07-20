const fs = require('fs');
const path = require('path');

// CSV 파싱 함수
const parseCSV = (csv) => {
  const lines = csv.toString().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    if (values.length !== headers.length) return null;
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  }).filter(Boolean);
  return data;
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

// 지역 코드 매핑
const cultureToRegionCode = {
  '카리브 해': '카리', '멕시코만': '멕시', '영국': '영국', '네덜란드': '플랑',
  '독일': '독일', '스칸디나비아': '북유', '포르투갈': '포르', '에스파냐': '스페',
  '이탈리아': '이탈', '북아프리카': '이집', '비잔틴': '그리', '오스만 투르크': '터키',
  '서아프리카': '서아', '동아프리카': '동아', '인도': '인도', '아랍': '아랍',
  '인도네시아': '인네', '인도차이나': '인차', '중국': '중국', '한국': '조선', '일본': '일본',
};

// 1. 도시 정보 CSV 읽기
const cityCSVPath = path.join(__dirname, 'src', 'data', '대항해시대4-도시정보.csv');
const cityCSV = fs.readFileSync(cityCSVPath, 'utf8');
const cityDataRaw = parseCSV(cityCSV);

const cities = cityDataRaw.map(city => ({
  name: city['도시명'],
  culture: city['문화권'],
  region_code: cultureToRegionCode[city['문화권']] || '',
  coordinates: parseCoordinates(city['좌표']),
  development: parseInt(city['발전도'], 10) || 0,
  military: parseInt(city['무장도'], 10) || 0,
  specialties: city['특산품'] ? city['특산품'].split(' ').filter(Boolean) : [],
  type: city['타입'],
  has_tavern: city['선술집'] === 'O',
  has_shipyard: city['조선소'] === 'O',
}));

// 2. 시세표 CSV 읽기
const priceCSVPath = path.join(__dirname, 'src', 'data', '대항해시대4-Pk-시세표.csv');
const priceCSV = fs.readFileSync(priceCSVPath, 'utf8');
const priceDataRaw = parseCSV(priceCSV);

const items = [];
const categories = new Set();
let currentCategory = '';

priceDataRaw.forEach(row => {
  if (row['품목'] && !row['카리']) { // 카테고리 행
    currentCategory = row['품목'];
    categories.add(currentCategory);
  } else if (row['품목']) { // 품목 데이터 행
    const prices = {};
    Object.keys(row).forEach(key => {
      if (key !== '품목' && key !== '카테고리' && row[key]) {
        prices[key] = parseInt(row[key], 10);
      }
    });
    items.push({
      name: row['품목'],
      category: currentCategory,
      prices: prices,
    });
  }
});

// 3. 최종 데이터베이스 객체 생성
const tradeDatabase = {
  metadata: {
    title: "대항해시대4 PK 통합 교역 데이터베이스 (재생성)",
    description: "도시정보, 시세표, 지역 매핑을 포함한 완전한 교역 데이터",
    version: "1.1",
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

// 4. JSON 파일로 저장
const outputPath = path.join(__dirname, 'src', 'data', 'trade_database.json');
fs.writeFileSync(outputPath, JSON.stringify(tradeDatabase, null, 2), 'utf8');

console.log(`✅ trade_database.json 파일이 성공적으로 생성되었습니다. 총 ${cities.length}개의 도시, ${items.length}개의 아이템이 포함되었습니다.`); 