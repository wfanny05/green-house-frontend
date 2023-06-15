<template>
  <a-layout>
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
      <div class="logo" />
      <a-menu  v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" theme="dark" mode="inline">
        <a-sub-menu v-for="(item, index) in menu" :key="`${index}`">
          <template #icon>
            <component :is="item.icon" />
          </template>
          <template #title>{{ item.title }}</template>
          <a-menu-item v-for="(child, index2) in item.children" :key="`${index}-${index2}`">
            <RouterLink :to="child.path as string">{{ child.title }}</RouterLink>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout class="main-layout">
      <a-layout-header class="main-header">
        <menu-unfold-outlined
          v-if="collapsed"
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
      </a-layout-header>
      <div class="page-title">
        <a-breadcrumb>
          <a-breadcrumb-item v-for="item in pageTitle" :key="item">{{ item }}</a-breadcrumb-item>
        </a-breadcrumb>
        <h1><span v-if="backUrl" class="back" @click="back"><arrow-left-outlined />返回</span> {{ pageTitle[pageTitle.length - 1] }}</h1>
      </div>
      <a-layout-content class="main-layout-content">
        <div class="main-layout-content-inner">
          <Suspense><slot></slot></Suspense>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script lang="ts">
import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue';
import { defineComponent, ref, onMounted, watch, provide } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router'

interface menuItem {
  title: string;
  icon?: string;
  path?: string;
  children?: menuItem[];
}

export default defineComponent({
  components: {
    RouterLink,
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    AppstoreOutlined,
    ArrowLeftOutlined
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const menu: menuItem[] = [
      {
        title: '大棚管理',
        icon: 'AppstoreOutlined',
        children: [
          {
            title: '大棚列表',
            path: '/green-house'
          },
          {
            title: '​​环境信息',
            path: '/env-info'
          }
        ]
      },
      {
        title: '​种子管理',
        icon: 'AppstoreOutlined',
        children: [
          {
            title: '种子列表',
            path: '/seed-list'
          },
          {
            title: '​​图集管理',
            path: '/seed-gallery'
          }
        ]
      },
      {
        title: '​作物管理',
        icon: 'AppstoreOutlined',
        children: [
          // {
          //   title: '实时信息',
          //   path: '/plant-latest'
          // },
          {
            title: '作物列表',
            path: '/plant-list'
          },
          // {
          //   title: '灌溉记录',
          //   path: '/plant-irrigation'
          // },
          // {
          //   title: '施肥记录',
          //   path: '/plant-fertilize'
          // },
          // {
          //   title: '农药记录',
          //   path: '/plant-pesticide'
          // },
          // {
          //   title: '病虫害记录',
          //   path: '/plant-disease'
          // },
        ]
      },
      {
        title: '​设备管理',
        icon: 'AppstoreOutlined',
        children: [
          {
            title: '传感器列表',
            path: '/sensor-list'
          },
        ]
      }
    ]
    let selectedKeys = ref<string[]>([])
    let openKeys = ref<string[]>([])
    let pageTitle = ref<string[]>([])
    let backUrl = ref<string>('')

    const back = () => {
      // console.log(backUrl.value)
      router.push({
        path: backUrl.value
      })
    }

    onMounted(() => {

    })

    provide('pageTitlePush', (title: string, url: string) => {
      pageTitle.value[2] = title
      backUrl.value = url
    })

    watch(() => route.path, (newValue, oldValue) => {
      console.log(newValue, '新的路由')
      console.log(oldValue, '旧的路由')
      const path = newValue
      pageTitle.value = []
      backUrl.value = ''
      menu.forEach((item, index) => {
        const children = item.children || []
        children.forEach((child, index2) => {
          if (path.indexOf(child.path as string) > -1) {            
            if (!openKeys.value[0]) {
              openKeys.value = [`${index}`]
            }
            if (!selectedKeys.value[0]) {
              selectedKeys.value = [`${index }-${index2}`]
            }
            // console.log(openKeys.value, selectedKeys.value)
            pageTitle.value[0] = item.title
            pageTitle.value[1] = child.title
          }
        })
      })
    })

    return {
      selectedKeys,
      openKeys,
      collapsed: ref<boolean>(false),
      menu,
      pageTitle,
      back,
      backUrl
    };
  },
});
</script>

<style scoped>
.main-layout {
  max-height: 100vh;
}
.page-title {
  background: #fff;
  padding: 16px 24px 0;
  margin-top: 2px;
}
.main-header {
  background: #fff;
  padding: 0;
  display: flex;
  justify-content: space-between;
}

.main-layout-content{
  height: calc(100vh - 136px);
  overflow: auto;
}

.main-layout-content-inner {
  margin: 24px 16px;
  padding: 24px;
  background: #fff;
  min-height: calc(100% - 48px);
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
}
.back {
  cursor: pointer;
  margin-right: 16px;
}
</style>
