# freelog-alpha-reader

> A freelog widget

## Build Setup

``` bash
# install dependencies
npm install

# serve at localhost:9001
npm run dev

# build for production with minification
npm run build
```


## config
package.json中freelogConfig字段可配置freelog资源相关的配置数据。


## usage

### 书籍简介
* 格式：json
* 内容：
```json
{
  "bookPoster": "书籍封面图资源Id",
  "authorImg": "作者头像图片资源Id",
  "name":"书名",
  "authorName":"作者名",
  "tags": ["书籍标签名"],
  "intro":"书籍简介",
  "desc":"书籍描述",
  "authorIntro":"作者介绍"
}
```


### 章节内容
* 格式： html
* 内容：

```html
<div>
 <p>　　　　</p><p>　　时则深冬，大雪过后，整个炎京城都披上了一层银装。炎京城极大，可容纳人口数百万，而掌控东域三郡的‘镇东王’秦德的府邸便是在这炎京城。</p><p>　　镇东王府邸占地极广，正门日间夜间都是大大敞开，府邸正门宽广无比，足够六七人并行入内。</p><p>　
</div>
```

* meta

```json
{
  "volume":1,
  "chapter":1,
  "volumeName":"章名",
  "chapterName":"节名"
}
```

### presentable打tags
章节内容的presentable需打tags `chapter`以及表示``${meta.volume}``-``${meta.chapter}``
