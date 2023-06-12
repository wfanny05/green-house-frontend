import Mock from 'mockjs'
import axiosInstance from './axios-instance'

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
      url: 'http://localhost:6166/green-house/add',
      data: {
        item
      }
    })
  },
  envInfo: async () => {
    const item = {
      GreenhouseCode: 51,
      RecordDate: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      AirTemp: Mock.Random.integer(0, 40),
      AirHumidity: Mock.Random.integer(0, 100),
      SoilTemp: Mock.Random.integer(0, 40),
      SoilHumidity: Mock.Random.integer(0, 100),
      CarbonDioxideLevel: Mock.Random.integer(500, 800),
      Illuminance: Mock.Random.integer(100, 2000),
    }
    // console.log(11, item)
    const res = await axiosInstance({
      method: 'post',
      url: 'http://localhost:6166/env-info/add',
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
      Pictures: 1, // 图片集id
      Measures: Mock.Random.cparagraph(8), // 技术措施
      Note: Mock.Random.cparagraph(6),
    }
    // console.log(11, item)
    const res = await axiosInstance({
      method: 'post',
      url: 'http://localhost:6166/seed/add',
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
      url: 'http://localhost:6166/seed-gallery/add',
      data: {
        item
      }
    })
  },
}

export const dataFill = (count: number, name: string) => {
  for (let index = 0; index < count; index++) {
    mockFuncs[name]()
  }
}