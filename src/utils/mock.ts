import Mock from 'mockjs'
import axiosInstance from './axios-instance'
import * as dayjs from 'dayjs'

export const mockFuncs : { [key :string] : Function } = {
  greenHouse: async () => {
    const item = {
      greenHouseCode: Mock.Random.string('number', 6),
      greenhouseName: Mock.Random.ctitle(6),
      PersonName: Mock.Random.cname(),
      PersonTel: Mock.Random.string('number', 11),
      Region: Mock.Random.region(),
      Institution: Mock.Random.ctitle(),
    }
    // console.log(11, item)
    const res = await axiosInstance({
      method: 'post',
      url: '/green-house/add',
      data: {
        item
      }
    })
  },
  envInfo: async (params: object = {}) => {
    const item = {
      GreenhouseCode: 54,
      RecordDate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      AirTemp: Mock.Random.integer(10, 30),
      AirHumidity: Mock.Random.integer(50, 70),
      SoilTemp: Mock.Random.integer(10, 30),
      SoilHumidity: Mock.Random.integer(50, 70),
      CarbonDioxideLevel: Mock.Random.integer(600, 800),
      Illuminance: Mock.Random.integer(20000, 40000),
      ...params
    }
    // console.log(11, item)
    const res = await axiosInstance({
      method: 'post',
      url: '/env-info/add',
      data: {
        item
      }
    })
  },
  seed: async () => {
    const item = {
      PlantName: Mock.Random.ctitle(6),
      Category: Mock.Random.ctitle(4),
      Supplier: Mock.Random.ctitle(6),
      SupplierTel: Mock.Random.string('number', 11),
      Pictures: '', // 图集id
      Measures: Mock.Random.cparagraph(8), // 技术措施
      Note: Mock.Random.cparagraph(6),
    }
    // console.log(11, item)
    const res = await axiosInstance({
      method: 'post',
      url: '/seed/add',
      data: {
        item
      }
    })
  },
  seedGallery: async () => {
    const item = {
      PictureName: Mock.Random.ctitle(4),
      PictureDescription: Mock.Random.csentence(10, 20),
    }
    // console.log(11, item)
    const res = await axiosInstance({
      method: 'post',
      url: '/seed-gallery/add',
      data: {
        item
      }
    })
  },
  plant: async () => {
    const item = {
      PlantName: Mock.Random.ctitle(6),
      GreenhouseCode: 54, // 大棚id
      PlantCode: 10, // 种子id
      Area_m2: Mock.Random.string('number', 3), 
      PlantedDate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'), // 播种时间
      Days: Mock.Random.integer(0, 100), // 生长天数
      PlantStatus: '1', // 生长状态: 1 萌发期；2 幼苗期；3 生长期；4 开花期；5 结果期
      HarvestDate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'), // 收获时间
      Output: Mock.Random.string('number', 4), // 产量
    }
    // console.log(11, item)
    const res = await axiosInstance({
      method: 'post',
      url: '/plant/add',
      data: {
        item
      }
    })
  },
  sensor: async (action = 'add', _data = {}) => {  
    const data = {}

    if(_data.id) {
      data.id = _data.id
      data.item = _data.item
    } else {
      const item = {
        SensorCode: Mock.Random.string('string', 6), 
        SensorName: Mock.Random.ctitle(6),
        GreenhouseCode: 54, // 大棚id
        SensorType: '1', // 1 光照度传感器；2 二氧化碳传感器；3 空气温度传感器； 4 土壤温度传感器；5 空气湿度传感器；6 土壤湿度传感器
        Volume: Mock.Random.integer(0, 50), // 测量值
        FloorVolume: Mock.Random.integer(0, 50), // 上限值
        CeilingVolume: Mock.Random.integer(0, 50), // 下限值
        Note: Mock.Random.csentence(10, 20),
      }
      data.item = item
    }
    // console.log(11, item)
    const res = await axiosInstance({
      method: 'post',
      url: '/sensor/' + action,
      data
    })
  },
}

export const dataFill = (count: number, name: string) => {
  for (let index = 0; index < count; index++) {
    mockFuncs[name]()
  }
}

export const mockEnvData = async (hourTotal: number = 24) => {
  const start = dayjs('2023-05-08 02:00:00')
  for (let index = 0; index < hourTotal; index++) {
    const RecordDate = start.add(index+1, 'hour').format('YYYY-MM-DD HH:mm:ss') 
    console.log('RecordDate', RecordDate)
    await mockFuncs.envInfo({
      RecordDate
    })
  }
}

export const seedWarn = async (id, Volume) => {
  mockFuncs.sensor('update', {
    id,
    item: {
      Volume,
      Warning: Mock.Random.csentence(10, 20),
    }
  })
}