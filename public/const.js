/*
 * @Author: jiajing
 * @Date: 2025-06-24 13:40:20
 * @LastEditTime: 2025-08-21 10:50:38
 * @LastEditors: jiajing
 * @Description: 常量文件
 */
import { DecalType } from '../src/components/Decal/DecalManager';

let model2 = {
  ID: "64c86500ea8c5e40486a5126",
  Name: "FullView-AE",
  Type: "gltf",
  Url: "/Upload/Model/FullScene_withLights_AE_cell.gltf",
};

let model0 = {
  ID: "64c86500ea8c5e40486a5126",
  Name: "混凝土管",
  TotalPinYin: "hunningtuguan",
  FirstPinYin: "hntgpsgdxsdhdagw",
  Type: "gltf",
  Url: "/Upload/Model/0803001.gltf",
  AddTime: "0001-01-01 00:00:00",
  Thumbnail: "",
  id: "64c86500ea8c5e40486a5126",
  title: "混凝土管",
  icon: "model",
  cornerText: "gltf",
  spatialInfo: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
  },
  desOri: {
    rotation: {
      x: -1.1096432562347212,
      y: 0.3652560335628141,
      z: 0.6232681309163246,
    },
    position: {
      x: 4.601170512555177,
      y: 8.287282614652103,
      z: 3.9491111375106236,
    },
  },
};
let model11 = {
  ID: "64c86500ea8c5e40486a5121",
  Name: "闪电",
  CategoryID: "",
  CategoryName: "",
  TotalPinYin: "shandian",
  FirstPinYin: "shandian",
  Type: "gltf",
  Url: "/Upload/Model/lightSingle.gltf",
  AddTime: "0001-01-01 00:00:00",
  id: "64c86500ea8c5e40486a5121",
  src: null,
  title: "闪电",
  icon: "model",
  cornerText: "gltf",
  spatialInfo: {
    position: { x: -1.5, y: 1.1, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
  },
};
let model4 = {
  ID: "64c86500ea8c5e40486a5126",
  Name: "cgz44",
  Type: "gltf",
  Url: "/Upload/Model/gltf/cgz44.gltf",
};
let model1 = {
  ID: "64c86500ea8c5e40486a5126",
  Name: "1fbx",
  Type: "fbx",
  Url: "/Upload/Model/FullScene_LP.fbx",
};
export const model5 = {
  id: "64c86500ea8c5e40486a5450",
  fileId: "64c86500ea8c5e40486a5450",
  Name: "FullScene_S0624",
  format: "gltf",
  // url: "/Upload/Model/Fullscene_0711_2/Fullscene_0711_2_2_textGeo2.gltf",
  url: "/public/Upload/Model/FullScene_0721_TextGeo2/FullScene_0721_TextGeo2.gltf",
  size: 507904, // 496KB
  checksum: "1234567890",
};

export const model6 = {
  id: "64c86500ea8c5e40486a5450",
  fileId: "64c86500ea8c5e40486a5450",
  Name: "Fullscene0807",
  format: "gltf",
  url: "/public/Upload/Model/Fullscene0807_03/Fullscene0807.gltf",
  size: 507904, // 496KB
  checksum: "1234567890",
};

export const model7 = {
  id: "64c86500ea8c5e40486a5450",
  fileId: "64c86500ea8c5e40486a5450",
  Name: "Fullscene0807",
  format: "gltf",
  // url: "/public/Upload/Model/Fullscene_0818_GISsensor_updated/Fullscene_0818_GISsensor_updated.gltf",
  url: "/public/Upload/Model/Fullscene_0819_2/Fullscene_0819_2.gltf",
  size: 507904, // 496KB
  checksum: "1234567890",
};

let model58 = {
  ID: "64c86500ea8c5e40486a5450",
  Name: "Fullscene_0704_4_withsensor_006",
  Type: "gltf",
  Url: "/Upload/Model/Fullscene_0704_4_withsensor_006/Fullscene_0704_4_withsensor_006.gltf",
};

//断路器内部结构模型
let modelDlqCell = {
  ID: "64c56",
  Name: "dlq_cell",
  Type: "gltf",
  Url: "/Upload/Model/dlq_cell/dlq_cell.gltf",
};

//变压器内部结构模型
let modelByqCell = {
  ID: "64c56",
  Name: "dlq_cell",
  Type: "gltf",
  Url: "/Upload/Model/byq_cell/byq_cell.gltf",
};

// 新增：模型列表
const modelList = [
  { key: "model5", name: "FullScene_S0624", data: model5 },
  { key: "model58", name: "Fullscene_0704_4_withsensor_006", data: model58 },
  // { key: "model0", name: "混凝土管", data: model0 },
  // { key: "model4", name: "cgz44", data: model4 },
  // { key: "model1", name: "1fbx", data: model1 },
  // { key: "model11", name: "闪电", data: model11 },
  // 以后可以继续添加更多模型
];

window.alarmModelName = ["GIS_112_CB_LOD2001"];

window.hexLabelConfig0 = {
  show: true,
  children: {
    Cylinder004: {
      labelText: "T",
      bgUrl: "/images/hexagon_yellow.png",
      iconUrl: "/images/ico5_yellow.png",
      cameraView: {
        position: [-12.857499748059467, 6.730824121863444, 6.076799846769185],
        target: [-1.79627520990842, 5.182487247760858, 0.8063868669801976],
      },
    },
    Cube073: {
      labelText: "K",
      bgUrl: "/images/hexagon_blue.png",
      iconUrl: "/images/ico5_blue.png",
      cameraView: {
        position: [1.1037157853769597, 7.668372360933126, 53.90501985316904],
        target: [3.211953212368542, 6.735105279273711, 52.89208206344865],
      },
    },
    GIS001: {
      labelText: "G",
      bgUrl: "/images/hexagon_green.png",
      iconUrl: "/images/ico5_green.png",
      cameraView: {
        position: [-4.953807732786544, 5.299479758305155, 53.17836830285102],
        target: [-1.3797470392872144, 3.1309350962044706, 45.1197032531048],
      },
    },
  },
};
const dpr = window.devicePixelRatio || 1;
const hexLabelConfigObj = {
  width: 1,
  height: 2,
  canvasWidth: 256 * dpr,
  canvasHeight: 512 * dpr,
  labelFont: 56 * dpr + "px 微软雅黑",
  labelPosition: { x: 128 * dpr, y: 86 * dpr },
  bgUrl: "/images/hexLabel.png",
  // bgUrl: "/hexagon_yellow.png",
  iconUrl: "",
};
// 定义模型的hexLableConfig
window.hexLabelConfig = {
  show: true,
  offset: 1,
  children: {
    Cylinder004: {
      ...hexLabelConfigObj,
      labelText: "变压器",
      cameraView: {
        position: [-14.929865706364996, 5.596048015901818, -7.5069730959887355],
        target: [9.286665422334817, 3.4127784975637385, -14.586662050248488],
      },
      onFlyEnd: () => {
        console.log("变压器飞行完成 onFlyEnd");
      },
    },
    网格008_1: {
      ...hexLabelConfigObj,
      labelText: "开关柜",
      cameraView: {
        position: [4.938267055586142, 4.857151961564782, 12.695473731650315],
        target: [23.062228965371965, 0.42236467878111816, -0.5038133310872035],
      },
      onFlyEnd: () => {
        console.log("开关柜飞行完成 onFlyEnd");
      },
    },
    GIS_145_CT: {
      ...hexLabelConfigObj,
      labelText: "GIS",
      cameraView: {
        position: [-9.198085924467374, 5.274124682769429, 7.6643548639427745],
        target: [12.165505965843284, -9.492942795876552, -9.430422966155275],
      },
    },
    cableSupport: {
      ...hexLabelConfigObj,
      labelText: "电缆",
      cameraView: {
        position: [-18.97369493996125, 6.172547660038498, 4.618424198207727],
        target: [7.972063806262051, 0.5527106374234082, -0.8338538591030793],
      },
      onFlyEnd: () => {
        console.log("电缆飞行完成 onFlyEnd");
      },
    },
  },
};

// window.defaultView = {
//     "position": [-43.150454844505134,26.944177006173646,25.58653579015051],
//     "target": [9.880016854664527,4.79589779012814,28.409002153466517]
// }

// window.defaultView = {
//   position: [-19.115624600331685, 8.330830963944805, -6.356377175233778],
//   target: [4.36597777336893, 6.0771996064027585, -24.13228615572874],
// };

window.defaultView = {
  position: [-15.30881672535003, 9.148295524771655, 13.58818312613249],
  target: [-2.8214629417629786, 2.2927503999860614, 3.6493685567894656],
};

//变压器超声
// window.defaultView={
//   "position": [
//       0.10885830307913591,
//       1.9585651658536323,
//       -8.47316901075782
//   ],
//   "target": [
//       0.2557101153749471,
//       1.7624233163899308,
//       -12.389984458803683
//   ]
// }

//kaiguanguiweizhi
// window.defaultView = {
//   "position": [
//       10.343105773673612,
//       1.959067965250763,
//       -0.5280482747439185
//   ],
//   "target": [
//       -2.369666953014479,
//       0.013671403633451455,
//       0.5804763881001483
//   ]
// }

// window.defaultView = {
//   "position": [
//       10.168886369682454,
//       2.9562627315384975,
//       1.2431174458000367
//   ],
//   "target": [
//       3.921594986065272,
//       0.09392164260295557,
//       -8.124775713919606
//   ]
// }

// infoBoardConfig
window.infoBoardConfig = {
  offset: { x: -120, y: 0 },
  modelOffsets: {
    "sensor-wh": { x: -150, y: -150 },
    260: { x: -100, y: -50 },
    261: { x: -100, y: -50 },
    240: { x: -50, y: -50 },
    83: { x: 150, y: 200 },
    // 242: { x: -100, y: 10 },
    // ...
  },
  // svg: {
  //     width: '100vw',
  //     height: '100vh',
  //     zIndex: 1,
  //     position: 'absolute',
  //     left: '0',
  //     top: '0'
  // },
  line: {
    stroke: "#09a7f5",
    strokeWidth: 0.5,
    // dashArray: '5,5'
  },
  showLine: true,

  modelShowLine: {
    // 261: false,
    // 240: false,
    // 123: false,         // id为123的模型不显示连线
    Cylinder004: false, // name为"设备A"的模型显示连线
  },
  // dotSelector: '.circle-dot',
  // autoCreateSVG: true
};

//报警设备模型名称
window.alarmModelName = ["GIS_112_CB001"];

window.gisModelNames = [
  // "GIS_112_CB_LOD2002",
  // "GIS_103_DS_LOD2015",
  // "GIS_103_DS_LOD2001",
  "GIS_113_M005",
  "GIS_145_M_LOD2002",
  "GIS_145_M_LOD2001",
  "GIS_103_M005",
  "GIS_113_M002",
  "GIS_103_M004",
  "GIS_112_CB_LOD2001",
  "GIS_112_CT_LOD2001",
  "GIS_112_Spacer001",
  "GIS_112_Tube700_LOD2001",
  "GIS_112_DS_LOD2002",
  "GIS_112_CB003",
  "GIS_112_M004",
  "GIS_112_DS_Tube_LOD2001",
  "GIS_112_Support004",
  "GIS_112_DS_LOD2001",
  "GIS_112_ES_LOD2001",
  "GIS_112_ES_LOD2002",
  "GIS_112_ES_LOD2003",
  "GIS_112_LCP_LOD2",
  "GIS_112_Spacer002",
  "GIS_112_Spacer003",
  "GIS_112_Tube375_LOD2001",
  "GIS_113_CB_LOD2001",
  "GIS_113_CT_LOD2001",
  "GIS_113_Spacer001",
  "GIS_113_Tube700_LOD2003",
  "GIS_113_DS_LOD2001",
  "GIS_113_CB002",
  "GIS_113_M001",
  "GIS_113_DS_Tube_LOD2001",
  "GIS_113_Support001",
  "GIS_113_DS_LOD2002",
  "GIS_113_ES_LOD2001",
  "GIS_113_ES_LOD2002",
  "GIS_113_ES_LOD2003",
  "GIS_113_LCP_LOD2002",
  "GIS_113_Spacer002",
  "GIS_113_Spacer003",
  "GIS_113_Tube700_LOD2004",
  "GIS_145_CB_LOD2001",
  "GIS_145_CT_LOD2001",
  "GIS_145_Spacer006",
  "GIS_112_Tube_LOD2001",
  "GIS_145_DS_LOD2001",
  "GIS_145_CB001",
  "GIS_145_M_LOD2003",
  "GIS_145_DS_Tube_LOD2001",
  "GIS_145_Support001",
  "GIS_145_ES_LOD2001",
  "GIS_145_LCP_LOD2002",
  "GIS_145_Spacer005",
  "GIS_145_Spacer003",
  "GIS_112_DS_LOD2004",
  "GIS_145_M_LOD2004",
  "GIS_103_CB_LOD2003",
  "GIS_103_CT_LOD2003",
  "GIS_103_Spacer007",
  "GIS_103_CSETube_LOD2003",
  "GIS_103_DS_LOD2003",
  "GIS_103_CB002",
  "GIS_103_M001",
  "GIS_103_DS_Tube_LOD2003",
  "GIS_103_DS_LOD2006",
  "GIS_103_ES_LOD2007",
  "GIS_103_ES_LOD2008",
  "GIS_103_ES_LOD2009",
  "GIS_103_LCP_LOD2003",
  "GIS_103_Spacer008",
  "GIS_103_Spacer009",
  "GIS_103_Support002",
  "GIS_103_CSE_LOD2003",
  "GIS_104_CB_LOD2001",
  "GIS_104_CT_LOD2001",
  "GIS_104_Spacer001",
  "GIS_104_CSETube_LOD2001",
  "GIS_104_DS_LOD2001",
  "GIS_104_CB001",
  "GIS_104_M001",
  "GIS_104_DS_Tube_LOD2001",
  "GIS_104_DS_LOD2002",
  "GIS_104_ES_LOD2001",
  "GIS_104_ES_LOD2002",
  "GIS_104_ES_LOD2003",
  "GIS_104_LCP_LOD2002",
  "GIS_104_Spacer002",
  "GIS_104_Spacer003",
  "GIS_104_Support002",
  "GIS_104_CSE_LOD2002",
  "middle_poly_GIS_Tube",
  "middle_poly_GIS_Tube001",
];

// 新增：分区配置
window.zoneConfig = {
  zones: [
    {
      name: "GIS",
      // prefix: "GIS_",
      models: gisModelNames,
    },
    {
      name: "KGG",
      prefix: "pPlane",
    },
  ],
  nearDistance: 12,
  farDistance: 30,
  minCameraDistance: 2,
};

window.focusModelNames = [
  "Cube047_1",
  "Cube075_1",
  "Cube032_1",
  "Cube970_1",
  "Cube055_1",
  "Cube042_1",
  "网格*",
  "GIS_145_LCP_LOD2_1",
  "GIS_112_LCP_LOD2_2",
  "GIS_103_LCP_LOD2_2",
  "GIS_113_LCP_LOD2_1",
  "GIS_104_LCP_LOD2_1",
];

//定义标签的字体样式
const labelFontStyle = {
  propertyStyle: {
    size: "48px",
    weight: "500",
    color: "#fff"
  },
  valueStyle: {
    size: "48px",
    weight: "500",
    color: "#FFE732"
  },
  unitStyle: {
    size: "48px",
    weight: "normal",
    color: "rgba(255,255,255,0.65)"
  },
  separatorStyle: {
    color: "#fff"
  }
}

export const deviceLabels = [
  {
    id: 'sensor-1',
    targetModelName: 'Mesh2018_1', // 自动定位到名为 'Sensor' 的模型上方
    width: 0.9,
    height: 0.9,
    bgUrl: '/images/deviceNameplate.png',
    // iconUrl: '/icons/defaultIcon.svg',
    labelList: [
      {
        property: "V:",
        value: "35",
        unit: "KV",
        labelPosition: { x: 45, y: 60 },
        ...labelFontStyle,
      },
      {
        property: "I:",
        value: "1650",
        unit: "A",
        labelPosition: { x: 45, y: 115 },
        ...labelFontStyle,
      },
    ],
    onClick: (labelId, event) => {
      console.log(`设备 ${labelId} 被点击`, event);
    }
  },
  {
    id: 'sensor-2',
    targetModelName: 'Cube058_1', // 自动定位到名为 'Cube058_1' 的模型上方
    width: 0.9,
    height: 0.9,
    bgUrl: '/images/deviceNameplate.png',
    // iconUrl: '/icons/defaultIcon.svg',
    labelList: [

      {
        property: "V:",
        value: "35",
        unit: "KV",
        labelPosition: { x: 45, y: 60 },
        ...labelFontStyle,
      },
      {
        property: "I:",
        value: "1650",
        unit: "A",
        labelPosition: { x: 45, y: 115 },
        ...labelFontStyle,
      },
    ],
    onClick: (labelId, event) => {
      console.log(`设备 ${labelId} 被点击`, event);
    },
  },
];

export const decalConfigs = [
  // 文字贴花
  {
    id: 'text_decal_1',
    type: DecalType.TEXT,
    modelName: '网格008_4',
    options: {
      text: '10.1A',
      textConfig: {
        font: '8px Arial',
        color: '#2EFF58',
        backgroundColor: 'rgba(99,90,79,0.65)',
        padding: 15,
        textureScale: 2
      },
      debug: true,
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      decalSize: { x: 0.078, y: 0.047, z: 0.14 },
      positionOffset: { x: 0, y: -1.124, z: 0.002 }
    }
  },

  // 电流表贴花
  {
    id: 'ammeter_decal_1',
    type: DecalType.AMMETER,
    modelName: '网格008_3',
    options: {
      ammeterConfig: {
        bgUrl: '/images/ammeterNoPointer.jpg',
        value: 10,
        min: 0,
        max: 200,
        pointerColor: 'black',
        pointerWidth: 8,
        textureSize: 512,
        pointerLengthRatio: 0.9,
        angleStart: -100,
        angleEnd: 10,
        centerOffsetX: 75,
        centerOffsetY: 80
      },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      decalSize: { x: 0.11, y: 0.11, z: 0.8 },
      positionOffset: { x: 0, y: -1.12, z: -0.092 }
    }
  },

  // 开关贴花
  {
    id: 'switch_decal_1',
    type: DecalType.SWITCH,
    modelName: '网格008_6',
    options: {
      switchConfig: {
        state: 1,
        states: 2
      },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      decalSize: { x: 0.052, y: 0.048, z: 0.8 },
      positionOffset: { x: 0, y: -1.1232, z: 0.038 }
    }
  },

  // 信号灯贴花
  {
    id: 'signal_lamp_decal_1',
    type: DecalType.SIGNAL_LAMP,
    modelName: '网格008_6',
    options: {
      signalLampConfig: {
        color: 'green',
        glow: true
      },
      rotation: { x: 0, y: -Math.PI / 2, z: 0 },
      decalSize: { x: 0.032, y: 0.032, z: 2.8 },
      positionOffset: { x: 0, y: -1.0287, z: 0.0015 }
    }
  }
];
