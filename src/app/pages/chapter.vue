<template>
  <div class="book-chapter-wrap" :class="['theme-'+setting.activeTheme]">
    <div class="chapter-content-wrap">
      <div class="book-intro-wrap">
        <router-link to="/" class="book-name">{{bookDetail.name}}</router-link>
        <span class="book-author" v-show="bookDetail.authorName">{{bookDetail.authorName}}著</span>
      </div>
      <div class="book-text-box" ref="bookText">
        <div class="book-text-wrap" v-for="chapterItem in chapters">
          <div class="main-text-wrap">
            <div class="text-head">
              <a class="book-mark" href="javascript:" title="书签"></a>
              <h3>第{{chapterItem.volume}}集 {{chapterItem.volumeName}} <i>·</i> 第{{chapterItem.chapter}}章
                {{chapterItem.chapterName}}</h3>
              <div class="text-info">
                <router-link to="/" class="text-info-item book-name">{{bookDetail.name}}</router-link>
                <span class="text-info-item">{{bookDetail.authorName}} 著</span>
                <span class="text-info-item update-time">2007.05.22 21:42</span>
              </div>
            </div>
            <div class="chapter-text"
                 v-if="chapterItem.content"
                 :style="{fontSize: setting.fontSizeVal+'px'}"
                 v-html="chapterItem.content"></div>
            <div class="chapter-error-text" v-else>
              {{chapterItem.errorInfo.desc}}
              <span class="error-btn" @click="errorHandler(chapterItem)">{{chapterItem.errorInfo.tip}}</span>
            </div>
          </div>
        </div>
        <div class="loading-spinner" v-show=loadingChapter></div>
      </div>
    </div>
    <div class="float-wrap">
      <div ref="leftBar" class="lf-bar-list">
        <ul>
          <li class="tool-item" @click="showToolBar('catalogList')" :class="{active:activeBarName==='catalogList'}">
            <i class="book-catalog-list"></i>
            <span>目录</span>
          </li>
          <li class="tool-item" @click="showToolBar('setting')" :class="{active:activeBarName==='setting'}">
            <i class="book-read-setting"></i>
            <span>设置</span>
          </li>
          <li class="tool-item" @click="scrollToTopHandler" v-if="showScrollTop">
            <i class="scroll-top-icon"></i>
            <span>回到顶部</span>
          </li>
        </ul>

        <div class="chapter-read-setting panel-wrap" v-show="activeBarName==='setting'">
          <a class="close-panel" href="javascript:" @click="cancelSettingHandler"></a>
          <div class="panel-box">
            <h4 class="lang">设置</h4>
            <div class="setting-list-wrap">
              <ul>
                <li class="theme-list">
                  <i>阅读主题</i>
                  <span @click="changeThemeHandler(index)"
                        :class="['theme-'+index,{active: setting.activeTheme===index}]"
                        v-for="index in themeList"></span>
                </li>
                <li class="font-size"><i>字体大小</i>
                  <div>
                    <span class="prev" @click="changeFontSizeHandler(-2)"><em class="">A-</em></span><b></b>
                    <span class="lang">{{setting.fontSizeVal}}</span><b></b>
                    <span class="next" @click="changeFontSizeHandler(2)"><em class="">A+</em></span>
                  </div>
                </li>
              </ul>
              <div class="btn-wrap dib-wrap">
                <div class="chapter-setting-btn red-btn" @click="saveSettingHandler">保存</div>
                <div class="chapter-setting-btn grey-btn" @click="cancelSettingHandler">取消</div>
              </div>
            </div>
          </div>
        </div>

        <div class="chapter-catalog-list panel-wrap" v-show="activeBarName==='catalogList'">
          <a class="close-panel" href="javascript:" @click="cancelSettingHandler"></a>
          <div class="panel-box">
            <div class="panel-list-wrap catalog-scroll-wrap" :style="{maxHeight: catalogMaxHeight+'px'}">
              <div class="catalog-list-wrap">
                <template v-for="volume in volumes">
                  <h3 @click="toggleVolumeListHandler(volume)">
                    <i>
                      <span class="volume-title">{{volume.volumeName}}</span>
                      <div class="btm-arrow" :class="{'top-arrow': volume.show}"></div>
                    </i>
                  </h3>
                  <div class="volume-list" v-show="volume.show">
                    <ul>
                      <li
                        :class="{on: chapter._id===readProcess._id}"
                        v-for="(chapter,index) in volume.chapters">
                        <a href="javascript:;" @click="gotoChapterHandler(volume, chapter)">
                          第{{chapter.resourceInfo.meta.chapter}}章 {{chapter.resourceInfo.meta.chapterName}}
                          <i class="lock-chapter" v-if="chapter._detail && chapter._detail.error"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    onloadBookDetail,
    onloadChapters,
    onloadChapterContent
  } from '../data'

  export default {
    name: 'book-chapter',
    data: function () {
      var setting = localStorage.getItem('readingSetting');
      try {
        setting = JSON.parse(setting)
      } catch (e) {
        setting = {}
      }
      setting = Object.assign({
        fontSizeVal: 18,
        activeTheme: 0,
      }, setting)
      return {
        readProcess: this.$route.params,
        bookDetail: {},
        themeList: [0, 1, 2, 3, 4],
        activeBarName: '',
        setting: setting,
        chapters: [],
        catalogMaxHeight: 230,
        volumes: [],
        lazyOffsetHeight: window.innerHeight + 100,
        showScrollTop: false,
        loadingChapter: false
      }
    },

    watch: {
      $route(newRoute, oldRoute) {
        this.initView(newRoute)
      }
    },
    mounted() {
      onloadBookDetail((bookDetail) => {
        this.bookDetail = bookDetail
      });
      this.initView(this.$route)
      this.loadChapters()
      this.calcMaxHeight()
      this.scrollHandler()

      this._resizeHandler = this.calcMaxHeight.bind(this)
      this._scrollHandler = this.scrollHandler.bind(this)
      window.addEventListener('resize', this._resizeHandler)
      window.addEventListener('scroll', this._scrollHandler)
    },
    beforeDestroy() {
      window.removeEventListener('resize', this._resizeHandler)
      window.removeEventListener('scroll', this._scrollHandler)
    },
    methods: {
      initView(route) {
        var params = route.params
        this.readProcess = params
        this.readProcess._id = `${params.volumeIndex}_${params.chapterIndex}`
        var presentableId = route.query.chapterId;
        if (!presentableId) {
          return;
        }

        this.chapters = [];
        this.renderChapterContent(presentableId)
      },
      renderChapterContent(presentableId, disabledCache) {
        this.loadingChapter = true
        onloadChapterContent(presentableId, disabledCache)
          .then(chapter => {
            if (chapter.error) {
              chapter.errorInfo = window.FreelogApp.getErrorInfo(chapter.error);
            }

            var findChapterIndex = this.chapters.findIndex(chapter => {
              return chapter.presentableId === presentableId
            })
            if (findChapterIndex !== -1) {
              this.chapters.splice(findChapterIndex, 1, chapter)
            } else {
              this.chapters.push(chapter)
            }
          })
          .catch((err) => {
          })
          .finally(() => {
            this.loadingChapter = false
          })
      },
      loadChapters() {
        var readProcess = this.readProcess
        onloadChapters((volumes) => {
          volumes.forEach(volume => {
            volume.show = (readProcess.volumeIndex == volume.volumeIndex);
            volume.chapters.forEach(chapter => {
              chapter._id = `${volume.volumeIndex}_${chapter.resourceInfo.meta.chapter}`
            })
          });

          this.volumes = volumes
        })
      },
      calcMaxHeight() {
        this.catalogMaxHeight = window.innerHeight - 100;
      },
      lazyLoader(rect) {
        var chapters = this.chapters;
        if (!this.loadEnd && rect.bottom <= this.lazyOffsetHeight && !this.loadingChapter && chapters.length) {
          var chapter = chapters[chapters.length - 1];
          var currentVolumeIndex = chapter.volume
          var nextChapterIndex = chapter.chapter + 1
          var volume = this.volumes.find(v => {
            if (v.volumeIndex == currentVolumeIndex) {
              return v;
            }
          });
          var nextChapter
          if (volume.chapters.length >= nextChapterIndex) {
            nextChapter = volume.chapters.find((c) => {
              if (c.resourceInfo.meta.chapter == nextChapterIndex) {
                return c;
              }
            });
          } else {
            var nextVolume = this.volumes[currentVolumeIndex]
            if (nextVolume && nextVolume.chapters && nextVolume.chapters.length) {
              nextChapter = nextVolume.chapters[0]
            }
          }
          if (nextChapter) {
            this.renderChapterContent(nextChapter.presentableId)
          } else {
            this.loadEnd = true
          }
        }
      },
      scrollHandler() {
        var rect = this.$refs.bookText.getBoundingClientRect()
        if (rect.top > 0) {
          this.$refs.leftBar.style.top = rect.top + 'px'
          this.showScrollTop = false
        } else if (!this.showScrollTop) {
          this.$refs.leftBar.style.top = 0
          this.showScrollTop = true
        }
        this.lazyLoader(rect)
      },
      toggleVolumeListHandler(volume) {
        volume.show = !volume.show
      },
      showToolBar(barName) {
        this.activeBarName = barName
        switch (barName) {
          case 'catalogList':
            break;
          case 'setting':
            this.backupSetting = Object.assign({}, this.setting);
            break;
        }
      },
      hideToolBar() {
        this.activeBarName = ''
      },
      changeThemeHandler(index) {
        this.setting.activeTheme = index;
      },
      changeFontSizeHandler(diff) {
        var fontSize = this.setting.fontSizeVal + diff;
        if (fontSize <= 48 && fontSize >= 12) {
          this.setting.fontSizeVal = fontSize;
        }
      },
      cancelSettingHandler() {
        if (this.backupSetting) {
          this.setting = this.backupSetting
        }
        this.backupSetting = null
        this.hideToolBar()
      },
      saveSettingHandler() {
        localStorage.setItem('readingSetting', JSON.stringify(this.setting))
        this.hideToolBar()
      },
      gotoChapterHandler(volume, chapter) {
        this.hideToolBar()
        this.$router.push({
          path: `/volume/${volume.volumeIndex}/chapter/${chapter.resourceInfo.meta.chapter}`,
          query: {
            chapterId: chapter.presentableId
          }
        })
      },
      scrollToTopHandler() {
        window.scrollTo(0, 0)
      },
      errorHandler(chapter) {
        var presentable = chapter.error.data.data.presentableInfo
        var contract = chapter.error.data.data.contract;
        var contractState = contract && contract.status

        window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', {
          response: chapter.error,
          callback: () => {
            this.renderChapterContent(presentable.targetId, true)
          }
        })
      }
    }
  }
</script>


<style lang="less" scoped>
  @import "chapter.less";
</style>
