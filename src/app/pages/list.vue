<template>
  <div class="book-detail-wrap">
    <div class="book-information">
      <div class="book-img">
        <img src="//qidian.qpic.cn/qdbimg/349573/118447/180">
      </div>
      <div class="book-info ">
        <h1>
          <em>{{bookDetail.name}}</em>
          <span>{{bookDetail.authorName}} 著</span>
        </h1>
        <p class="tag">
          <span class="blue" v-for="tag in bookDetail.tags">{{tag}}</span>
        </p>
        <p class="intro">{{bookDetail.intro}}</p>
      </div>
    </div>

    <div class="content-nav-wrap clearfix">
      <div class="nav-wrap">
        <ul>
          <li :class="{'active-tab': activeTab === 'intro'}" @click="switchTabHandler('intro')"><a href="javascript:">作品信息</a>
          </li>
          <li :class="{'active-tab': activeTab === 'catalog'}" @click="switchTabHandler('catalog')"><a
            href="javascript:">目录</a></li>
        </ul>
      </div>
    </div>

    <div v-if="activeTab === 'intro'" class="book-content-intro-wrap clearfix">
      <div class="left-wrap">
        <div class="book-intro">
          <p>{{bookDetail.desc}}</p>
        </div>
      </div>
      <div class="right-wrap">
        <div class="author-state">
          <div class="author-info">
            <div class="info-wrap">
              <div class="author-photo">
                <img :src="bookDetail.authorImg">
              </div>
              <p class="author-name">{{bookDetail.authorName}}</p>
              <p class="author-intro-desc">{{bookDetail.authorIntro}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'catalog'" class="catalog-content-wrap">
      <div class="volume" v-for="volume in volumes">
        <h3>第{{volume.volumeIndex}}集 {{volume.volumeName}}</h3>
        <ul>
          <li v-for="(chapter, index) in volume.chapters">
            <router-link :to="calcChapterLink(volume, chapter)">
              第{{chapter.resourceInfo.meta.chapter}}章 {{chapter.resourceInfo.meta.chapterName}}<i class="lock-chapter" v-if="chapter._detail.error"></i>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import {onloadBookDetail, onloadChapters, onloadChapterContent} from '../data'

  export default {
    name: 'chapter-list',
    data: function () {
      return {
        bookDetail: {},
        volumes: [],
        activeTab: 'catalog'
      }
    },
    mounted() {
      onloadBookDetail((bookDetail) => {
        this.bookDetail = bookDetail
      });
      onloadChapters((volumes) => {
        var promises = []
        volumes.forEach(v => {
          v.chapters.forEach(c => {
            c._detail = {}
            var promise = onloadChapterContent(c.presentableId)
              .then((chapterDetail) => {
                c._detail = chapterDetail
              })
            promises.push(promise)
          })
        })

        Promise.all(promises).then(()=>{
          this.$forceUpdate()
        })
        this.volumes = volumes
      })
    },

    methods: {
      switchTabHandler: function (tab) {
        this.activeTab = tab;
      },
      calcChapterLink(volume, chapter) {
        return `volume/${volume.volumeIndex}/chapter/${chapter.resourceInfo.meta.chapter}?chapterId=${chapter.presentableId}`;
      }
    }
  }
</script>


<style lang="less" scoped>
  @import "list.less";
</style>
