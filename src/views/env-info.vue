<script setup lang="ts">
import axiosInstance from '../utils/axios-instance'

async function greenHouseAdd() {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/add',
    data: {
      item: {
        Category: '蔬菜类',
        PlantName: '番茄55',
        Stage: '2', // 1 萌发期；2 幼苗期；3 生长期；4 开花期；5 结果期
      }
    }
  })
  console.log('greenHouseAdd', res)
}

async function greenHouseUpdate() {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/update',
    data: {
      id: 2,
      item: {
        Category: '蔬菜类',
        PlantName: '番茄22222277',
        Stage: '2', // 1 萌发期；2 幼苗期；3 生长期；4 开花期；5 结果期
      }
    }
  })
  console.log('greenHouseUpdate', res)
}

async function greenHouseDelete() {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/del',
    data: {
      id: 1
    }
  })
  console.log('greenHouseDelete' ,res)
}

const greenHouseQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/page',
    data: {
      pageNo: 1,
      pageSize: 10
    }
  })
  console.log('greenHouseQuery', res)
}
</script>

<template>
  <div>
    <h1>9999999</h1>
    <a-button @click="greenHouseAdd">Add</a-button>
    <a-button @click="greenHouseDelete">Delete</a-button>
    <a-button @click="greenHouseUpdate">Update</a-button>
    <a-button @click="greenHouseQuery">Query</a-button>
  </div>
</template>

