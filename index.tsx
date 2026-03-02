
import { ProjectionType, LightSourceType } from './types';

export enum SurfaceType {
  CYLINDER = '圓柱 (Cylinder)',
  TRANSVERSE_CYLINDER = '橫圓柱 (Transverse Cylinder)',
  CONE = '圓錐 (Cone)',
  PLANE = '平面 (Plane)',
  PSEUDO = '偽圓柱 (Pseudocylindrical)',
  COMPROMISE = '折衷 (Compromise)'
}

export enum ProjectionCategory {
  CYLINDRICAL = '圓柱投影系列',
  CONIC = '圓錐投影系列',
  AZIMUTHAL = '方位投影系列 (平面)',
  PSEUDO = '等積 / 偽圓柱系列',
  COMPROMISE = '折衷 / 綜合系列'
}

interface ProjectionConfig {
  description: string;
  category: ProjectionCategory;
  property: string;
  defaultScale: number;
  surfaceType: SurfaceType;
  lightSourceType: LightSourceType;
  tangentDescription: string;
  defaultRotation: [number, number, number];
}

// 國家名稱中文化映射表 (精選主要國家)
export const COUNTRY_CN_MAP: Record<string, string> = {
  "Taiwan": "台灣",
  "China": "中國",
  "United States of America": "美國",
  "Russia": "俄羅斯",
  "Canada": "加拿大",
  "Brazil": "巴西",
  "Australia": "澳洲",
  "India": "印度",
  "Japan": "日本",
  "Greenland": "格陵蘭",
  "Antarctica": "南極洲",
  "Argentina": "阿根廷",
  "Chile": "智利",
  "South Africa": "南非",
  "Egypt": "埃及",
  "France": "法國",
  "Germany": "德國",
  "United Kingdom": "英國",
  "Italy": "義大利",
  "Spain": "西班牙",
  "Norway": "挪威",
  "Sweden": "瑞典",
  "Finland": "芬蘭",
  "Iceland": "冰島",
  "Mexico": "墨西哥",
  "Indonesia": "印尼",
  "Saudi Arabia": "沙烏地阿拉伯",
  "Mongolia": "蒙古",
  "Kazakhstan": "哈薩克",
  "Algeria": "阿爾及利亞",
  "Sudan": "蘇丹",
  "Libya": "利比亞",
  "Dem. Rep. Congo": "剛果民主共和國",
  "Peru": "秘魯",
  "Colombia": "哥倫比亞"
};

export const PROJECTION_CONFIGS: Record<ProjectionType, ProjectionConfig> = {
  // --- CYLINDRICAL ---
  [ProjectionType.MERCATOR]: {
    description: "標準航海地圖。等角投影，經緯線垂直相交，適合導航但高緯度面積嚴重誇大。",
    category: ProjectionCategory.CYLINDRICAL,
    property: "等角 (Conformal)",
    defaultScale: 100,
    surfaceType: SurfaceType.CYLINDER,
    lightSourceType: LightSourceType.CENTER,
    tangentDescription: "切線：赤道 (Equator)",
    defaultRotation: [0, 0, 0]
  },
  [ProjectionType.TRANSVERSE_MERCATOR]: {
    description: "圓柱橫躺的麥卡托投影。適合南北狹長的區域（如台灣、智利）。",
    category: ProjectionCategory.CYLINDRICAL,
    property: "等角 (Conformal)",
    defaultScale: 100,
    surfaceType: SurfaceType.TRANSVERSE_CYLINDER,
    lightSourceType: LightSourceType.CENTER,
    tangentDescription: "切線：中央經線 (Central Meridian)",
    defaultRotation: [-121, 0, 0]
  },
  [ProjectionType.EQUIRECTANGULAR]: {
    description: "最簡單的方格投影，經緯線等距，經線長度與赤道等長。",
    category: ProjectionCategory.CYLINDRICAL,
    property: "等距 (Equidistant)",
    defaultScale: 120,
    surfaceType: SurfaceType.CYLINDER,
    lightSourceType: LightSourceType.SURFACE,
    tangentDescription: "切線：赤道 (Equator)",
    defaultRotation: [0, 0, 0]
  },
  [ProjectionType.GALL_PETERS]: {
    description: "圓柱等積投影。與麥卡托相反，它精確呈現了各大洲的面積比例，但導致低緯度地區形狀被垂直拉長。",
    category: ProjectionCategory.CYLINDRICAL,
    property: "等積 (Equal-Area)",
    defaultScale: 120,
    surfaceType: SurfaceType.CYLINDER,
    lightSourceType: LightSourceType.SURFACE,
    tangentDescription: "標準緯線：南北緯 45度",
    defaultRotation: [0, 0, 0]
  },

  // --- CONIC ---
  [ProjectionType.CONIC_EQUIDISTANT]: {
    description: "紙型為圓錐，罩在地球上方。適合中緯度且東西走向的國家（如中國、美國）。",
    category: ProjectionCategory.CONIC,
    property: "等距 (Equidistant)",
    defaultScale: 100,
    surfaceType: SurfaceType.CONE,
    lightSourceType: LightSourceType.CENTER,
    tangentDescription: "切線：標準緯線 (Standard Parallels)",
    defaultRotation: [0, 0, 0]
  },

  // --- AZIMUTHAL ---
  [ProjectionType.ORTHOGRAPHIC]: {
    description: "從外太空無限遠處觀看。視線平行，具備球體立體感。",
    category: ProjectionCategory.AZIMUTHAL,
    property: "透視 (Perspective)",
    defaultScale: 200,
    surfaceType: SurfaceType.PLANE,
    lightSourceType: LightSourceType.INFINITY,
    tangentDescription: "切點：地圖中心點 (Center Point)",
    defaultRotation: [0, 0, 0]
  },
  [ProjectionType.GNOMONIC]: {
    description: "光源位於球心。所有大圓（最短路徑）皆為直線，極具教學價值。",
    category: ProjectionCategory.AZIMUTHAL,
    property: "心射 (Gnomonic)",
    defaultScale: 150,
    surfaceType: SurfaceType.PLANE,
    lightSourceType: LightSourceType.CENTER,
    tangentDescription: "切點：地圖中心點 (Center Point)",
    defaultRotation: [0, 0, 0]
  },
  [ProjectionType.AZIMUTHAL_EQUAL_AREA]: {
    description: "保存面積比例的方位投影，常用於呈現兩極區域。",
    category: ProjectionCategory.AZIMUTHAL,
    property: "等積 (Equal-Area)",
    defaultScale: 150,
    surfaceType: SurfaceType.PLANE,
    lightSourceType: LightSourceType.SURFACE,
    tangentDescription: "切點：地圖中心點 (Center Point)",
    defaultRotation: [0, 0, 0]
  },

  // --- PSEUDO / EQUAL AREA ---
  [ProjectionType.MOLLWEIDE]: {
    description: "橢圓形偽圓柱投影，全球面積比例正確，常於分佈圖中使用。",
    category: ProjectionCategory.PSEUDO,
    property: "等積 (Equal-Area)",
    defaultScale: 130,
    surfaceType: SurfaceType.PSEUDO,
    lightSourceType: LightSourceType.SURFACE,
    tangentDescription: "標準緯線：南北緯 40度44分",
    defaultRotation: [0, 0, 0]
  },
  [ProjectionType.SINUSOIDAL]: {
    description: "所有緯線均為直線且長度正確，經線則為正弦曲線。面積守恆，中央經線與赤道無變形。",
    category: ProjectionCategory.PSEUDO,
    property: "等積 (Equal-Area)",
    defaultScale: 130,
    surfaceType: SurfaceType.PSEUDO,
    lightSourceType: LightSourceType.SURFACE,
    tangentDescription: "中央經線與所有緯線皆無變形",
    defaultRotation: [0, 0, 0]
  },

  // --- COMPROMISE ---
  [ProjectionType.ROBINSON]: {
    description: "由 Arthur H. Robinson 於 1963 年設計，旨在創造視覺上更令人愉悅的世界地圖。它並非等積也不是等角，而是折衷了各項變形。",
    category: ProjectionCategory.COMPROMISE,
    property: "折衷 (Compromise)",
    defaultScale: 130,
    surfaceType: SurfaceType.COMPROMISE,
    lightSourceType: LightSourceType.SURFACE,
    tangentDescription: "無單一特定切線，採數值擬合實現",
    defaultRotation: [0, 0, 0]
  },
};

export const WORLD_TOPOJSON_URL = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';
