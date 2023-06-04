<script setup lang="ts">
import axiosInstance from '../utils/axios-instance'

const get = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/page',
    data: {
      pageNo: 1,
      pageSize: 10
    }
  })
  console.log(res)
}

get()
</script>

<template>
  <main>
    <h1>88888888</h1>
  </main>
</template>

