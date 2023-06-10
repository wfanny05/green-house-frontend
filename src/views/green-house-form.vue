<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed, inject } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue';
import {
  HomeOutlined,
  SettingFilled,
  SmileOutlined,
  SyncOutlined,
  LoadingOutlined,
} from '@ant-design/icons-vue';

const router = useRouter()
const route = useRoute()

interface FormState { 
  greenHouseCode: string
  greenhouseName: string
  PersonName: string
  PersonTel: string
  Institution: string
  Region: string
  Note: string
}

async function greenHouseGet() : Promise<FormState>{
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/get',
    data: {
      id: route.query.id
    }
  })
  console.log('greenHouseAdd', res)
  return res.data?.data?.data || {}
}

async function greenHouseAdd() {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/add',
    data: {
      item: {
        ...formState
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
      id: route.query.id,
      item: {
        ...formState
      }
    }
  })
  console.log('greenHouseUpdate', res)
}


const formRef = ref<FormInstance>();
const formState = reactive<FormState>({
  greenHouseCode: '',
  greenhouseName: '',
  PersonName: '',
  PersonTel: '',
  Institution: '',
  Region: '',
  Note: '',
});
const onFinish = async (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  if(route.query.id) {
    await greenHouseUpdate()
     message.success('更新成功！');
  } else {
    await greenHouseAdd()
    message.success('新增成功！');
  }
};

const goBack = () => {
  router.push({
    path: '/green-house',
  })
}

const pageTitlePush = inject('pageTitlePush') as (title: string, url: string) => void
const title = `${route.query.id ? '编辑': '新增'}大棚`
pageTitlePush(title, '/green-house')
console.log('route', route.query.id)

if(route.query.id) {
  const res = await greenHouseGet()
  Object.keys(res).forEach((key: string) => {
    formState[key] = res[key]
  })
}

onBeforeMount(async () => {

})
</script>

<template>
  <div class="green-house-form">
    <a-form
      ref="formRef"
      name="advanced_search"
      class="ant-advanced-search-form"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      :model="formState"
      @finish="onFinish"
    >
      <a-form-item
        name="greenHouseCode"
        label="大棚编号"
        :rules="[{ required: true, message: '请输入大棚编号!' }]"
      >
        <a-input v-model:value="formState.greenHouseCode" placeholder=""></a-input>
      </a-form-item>
      <a-form-item
        name="greenhouseName"
        label="大棚名称"
        :rules="[{ required: true, message: '请输入大棚名称!' }]"
      >
        <a-input v-model:value="formState.greenhouseName" placeholder=""></a-input>
      </a-form-item>
      <a-form-item
        name="PersonName"
        label="负责人"
        :rules="[{ required: true, message: '请输入负责人!' }]"
      >
        <a-input v-model:value="formState.PersonName" placeholder=""></a-input>
      </a-form-item>
      <a-form-item
        name="PersonTel"
        label="负责人电话"
        :rules="[{ required: true, message: '请输入负责人电话!' }]"
      >
        <a-input v-model:value="formState.PersonTel" placeholder=""></a-input>
      </a-form-item>
      <a-form-item
        name="Institution"
        label="所属机构"
      >
        <a-input v-model:value="formState.Institution" placeholder=""></a-input>
      </a-form-item>
      <a-form-item
        name="Region"
        label="大棚地址"
      >
        <a-textarea v-model:value="formState.Region" />
      </a-form-item>
      <a-form-item
        name="Note"
        label="备注"
      >
        <a-textarea v-model:value="formState.Note" />
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
        <a-button type="primary" html-type="submit">提交</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
.green-house-form {
  width: 700px;
  margin: 0 auto;
}
</style>

