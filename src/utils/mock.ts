import Mock from 'mockjs'
import axiosInstance from './axios-instance'

export const mockFuncs : { [key :string] : Function } = {
  greenHouse: async () => {
    const item = {
      greenHouseCode: Mock.Random.string('number', 6),
      greenhouseName: Mock.Random.ctitle(),
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
  }
}

export const dataFill = (count: number, name: string) => {
  for (let index = 0; index < count; index++) {
    mockFuncs[name]()
  }
}